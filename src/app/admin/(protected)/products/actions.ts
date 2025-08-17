'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { Prisma } from '@prisma/client';
import { slugify } from '@/lib/slug';
import path from 'path';
import { writeFile, mkdir, unlink, stat, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';

// ===== Límite de subida (ajusta si quieres) =====
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

// ===== Validación (sin nulls) =====
const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  price: z.coerce.number().positive(),
  desc: z.string().min(5),
  longDesc: z.string().optional(),
  imageUrl: z.string().optional(),
  composition: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
const PartialProductSchema = ProductSchema.partial();

// ===== Rutas de imagen =====
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'img'); // raíz /img
const PUBLIC_PREFIX = '/assets/img';
const DEFAULT_IMAGE_NAME = 'product.png';
const DEFAULT_IMAGE_URL = `${PUBLIC_PREFIX}/${DEFAULT_IMAGE_NAME}`;

// ===== Helpers de fichero =====
function getExtFromFile(file: File): string {
  const fromName = path.parse(file.name ?? '').ext.replace(/^\./, '').toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  return map[file.type] ?? 'png';
}
function safeBaseFromOriginal(file: File): string {
  const base = path.parse(file.name ?? '').name;
  const sanitized = slugify(base);
  return sanitized || 'image';
}
async function ensureUniqueFilename(dir: string, base: string, ext: string): Promise<string> {
  let name = `${base}.${ext}`;
  let i = 2;
  while (true) {
    try {
      await access(path.join(dir, name), fsConstants.F_OK);
      name = `${base}-${i++}.${ext}`; // existe -> siguiente
    } catch {
      return name; // no existe
    }
  }
}
async function saveProductImage(file: File): Promise<string> {
  if (!file || file.size === 0) return '';
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = getExtFromFile(file);
  const base = safeBaseFromOriginal(file);
  const filename = await ensureUniqueFilename(UPLOAD_DIR, base, ext);
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `${PUBLIC_PREFIX}/${filename}`;
}
async function deleteImageByUrl(url?: string | null) {
  if (!url) return;
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  if (url === DEFAULT_IMAGE_URL) return;
  const rel = url.replace(/^\//, '');
  const abs = path.join(process.cwd(), 'public', rel);
  try {
    await stat(abs);
    await unlink(abs);
  } catch {
    /* no-op */
  }
}

// ===== Composición (ingredientes) =====
const IngredientOutSchema = z.object({
  nombre: z.string().min(1),
  cantidad: z.string().optional().default(''),
});
const CompositionOutArraySchema = z.array(IngredientOutSchema);

/** Normaliza cualquier formato a {nombre, cantidad}[] */
function parseCompositionFromString(s?: string) {
  if (s === undefined) return undefined; // update: no tocar
  const t = s.trim();
  if (t === '') return [];
  let parsed: any;
  try {
    parsed = JSON.parse(t);
  } catch {
    throw new Error('composition no es JSON válido');
  }
  const candidate =
    Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.ingredients)
      ? parsed.ingredients
      : Array.isArray(parsed?.ingredientes)
      ? parsed.ingredientes
      : Array.isArray(parsed?.composicion)
      ? parsed.composicion
      : [];
  const mapped = (candidate as any[]).map((x) => ({
    nombre: String(x?.nombre ?? x?.name ?? x?.ingrediente ?? '').trim(),
    cantidad: String(x?.cantidad ?? x?.amount ?? '').trim(),
  }))
  .filter((x) => x.nombre !== '');
  return CompositionOutArraySchema.parse(mapped);
}

// ===== Slug único =====
async function ensureUniqueSlug(base: string, ignoreSlug?: string): Promise<string> {
  let candidate = slugify(base);
  if (!candidate) candidate = 'producto';
  let i = 2;
  while (true) {
    const exists = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!exists || (ignoreSlug && exists.slug === ignoreSlug)) return candidate;
    candidate = `${slugify(base)}-${i++}`;
  }
}

// ===== Revalidación de páginas públicas =====
function revalidateProductPages(newSlug: string, prevSlug?: string) {
  // Ajusta estas rutas a tu tienda si usas otras (p. ej. solo '/tienda')
  const listPaths = ['/productos', '/tienda'];
  const toRevalidate = new Set<string>([
    '/admin/products',
    ...listPaths,
    `/productos/${newSlug}`,
    `/tienda/${newSlug}`,
  ]);
  if (prevSlug && prevSlug !== newSlug) {
    toRevalidate.add(`/productos/${prevSlug}`);
    toRevalidate.add(`/tienda/${prevSlug}`);
  }

  // Si quieres ir a lo seguro, puedes descomentar esta línea para invalidar todo el layout:
  revalidatePath('/', 'layout');

  for (const p of toRevalidate) revalidatePath(p);
}

// ===== Helpers FormData =====
function pickFields(fd: FormData) {
  // Si imageUrl es '', lo dejamos undefined para NO sobreescribir la actual
  const rawImageUrl = fd.get('imageUrl');
  const imageUrl =
    typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' ? rawImageUrl : undefined;

  return {
    name: String(fd.get('name') ?? ''),
    slug: String(fd.get('slug') ?? ''),
    price: String(fd.get('price') ?? ''),
    desc: String(fd.get('desc') ?? ''),
    longDesc: String(fd.get('longDesc') ?? ''),
    imageUrl,
    composition: String(fd.get('composition') ?? ''),
    isActive: String(fd.get('isActive') ?? 'false'),
  };
}

// ===== Actions =====
export async function createProduct(formData: FormData) {
  await requireAdmin();
  try {
    const fields = pickFields(formData);
    const data = ProductSchema.parse(fields);

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > MAX_UPLOAD_BYTES) {
      const mb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      throw new Error(`La imagen supera el límite de ${mb}MB`);
    }

    const baseSlug = data.slug && data.slug.trim() !== '' ? data.slug : data.name;
    const finalSlug = await ensureUniqueSlug(baseSlug);

    let imageUrl = data.imageUrl ?? DEFAULT_IMAGE_URL;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveProductImage(imageFile);
    }

    await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        price: new Prisma.Decimal(data.price),
        desc: data.desc,
        longDesc: data.longDesc ?? '',
        imageUrl,
        composition: parseCompositionFromString(data.composition) ?? [],
        isActive: data.isActive ?? true,
      },
    });

    // 👇 invalida páginas públicas (listados + detalle)
    revalidateProductPages(finalSlug);
  } catch (err) {
    console.error('createProduct error:', err);
    throw err;
  }
}

export async function updateProduct(slug: string, formData: FormData) {
  await requireAdmin();
  try {
    const current = await prisma.product.findUnique({ where: { slug } });
    if (!current) throw new Error('Producto no encontrado');

    const fields = pickFields(formData);
    const data = PartialProductSchema.parse(fields);

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > MAX_UPLOAD_BYTES) {
      const mb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      throw new Error(`La imagen supera el límite de ${mb}MB`);
    }

    // Posible cambio de slug
    let newSlug: string | undefined;
    if (data.slug !== undefined) {
      const base = data.slug.trim() === '' ? (data.name ?? current.name) : data.slug;
      const cand = slugify(base);
      if (cand !== slug) {
        newSlug = await ensureUniqueSlug(cand, slug);
      }
    }

    // Imagen nueva (si se sube)
    let newImageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      newImageUrl = await saveProductImage(imageFile);
    }

    await prisma.product.update({
      where: { slug },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(newSlug !== undefined && { slug: newSlug }),
        ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.longDesc !== undefined && { longDesc: data.longDesc }),

        // Solo tocar imageUrl si hay nueva imagen o si se envió una imageUrl NO vacía
        ...(newImageUrl !== undefined && { imageUrl: newImageUrl }),
        ...(data.imageUrl !== undefined &&
          data.imageUrl.trim() !== '' &&
          newImageUrl === undefined && { imageUrl: data.imageUrl }),

        ...(data.composition !== undefined && {
          composition: parseCompositionFromString(data.composition),
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    if (newImageUrl) {
      await deleteImageByUrl(current.imageUrl);
    }

    // 👇 invalida páginas públicas (lista + detalle viejo/nuevo slug)
    revalidateProductPages(newSlug ?? slug, slug);
  } catch (err) {
    console.error('updateProduct error:', err);
    throw err;
  }
}

export async function deleteProduct(slug: string) {
  await requireAdmin();
  const current = await prisma.product.findUnique({ where: { slug } });
  await prisma.product.delete({ where: { slug } });
  await deleteImageByUrl(current?.imageUrl);

  // 👇 invalida listados y la página del producto borrado
  revalidateProductPages(slug);
}
