'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { Prisma } from '@prisma/client';
import { slugify } from '@/lib/slug';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ===== Límite de subida =====
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

// ===== Imagen por defecto (local opcional) =====
const DEFAULT_IMAGE_URL = '/assets/img/product.png';

// ===== Supabase Storage (server) =====
const SUPABASE_PRODUCTS_BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET ?? 'products';

// ⚠️ No crear el cliente en top-level. Hazlo perezoso y valida envs.
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE; // SOLO servidor
  if (!url || !serviceRole) {
    throw new Error(
      'Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE'
    );
  }
  _supabaseAdmin = createClient(url, serviceRole, { auth: { persistSession: false } });
  return _supabaseAdmin;
}

function getExtFromMime(mime?: string): string {
  if (!mime) return 'png';
  const m = mime.toLowerCase();
  if (m.includes('jpeg')) return 'jpg';
  if (m.includes('png')) return 'png';
  if (m.includes('webp')) return 'webp';
  if (m.includes('gif')) return 'gif';
  if (m.includes('avif')) return 'avif';
  return 'png';
}

function getObjectPathFromPublicUrl(url: string): string | null {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SUPABASE_PRODUCTS_BUCKET}/`;
  return url && base && url.startsWith(base) ? url.slice(base.length) : null;
}

async function uploadProductImageToSupabase(
  file: File,
  opts: { folder?: string; filenameBase?: string }
): Promise<{ publicUrl: string; objectPath: string }> {
  const supabase = getSupabaseAdmin();

  const folder = (opts.folder ?? 'products').replace(/^\/+|\/+$/g, '');
  const base = (opts.filenameBase ?? 'image').toLowerCase().replace(/[^a-z0-9-_]/g, '') || 'image';
  const ext =
    (file.name?.includes('.') && file.name.split('.').pop()?.toLowerCase()) ||
    getExtFromMime(file.type);

  const objectPath = `${folder}/${base}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase
    .storage
    .from(SUPABASE_PRODUCTS_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type || `image/${ext}`,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(SUPABASE_PRODUCTS_BUCKET).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, objectPath };
}

async function deleteSupabaseImageByPublicUrl(url?: string | null) {
  if (!url || url === DEFAULT_IMAGE_URL) return;
  const path = getObjectPathFromPublicUrl(url);
  if (!path) return;
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(SUPABASE_PRODUCTS_BUCKET).remove([path]);
}

// ===== Composición (ingredientes) =====
const IngredientOutSchema = z.object({
  nombre: z.string().min(1),
  cantidad: z.string().optional().default(''),
});
const CompositionOutArraySchema = z.array(IngredientOutSchema);

type RawComposition = {
  nombre?: string;
  name?: string;
  ingrediente?: string;
  cantidad?: string;
  amount?: string;
};

function parseCompositionFromString(s?: string) {
  if (s === undefined) return undefined;
  const t = s.trim();
  if (t === '') return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(t);
  } catch {
    throw new Error('composition no es JSON válido');
  }
  const candidate =
    Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { ingredients?: unknown[] })?.ingredients)
      ? (parsed as { ingredients: unknown[] }).ingredients
      : Array.isArray((parsed as { ingredientes?: unknown[] })?.ingredientes)
      ? (parsed as { ingredientes: unknown[] }).ingredientes
      : Array.isArray((parsed as { composicion?: unknown[] })?.composicion)
      ? (parsed as { composicion: unknown[] }).composicion
      : [];

  const mapped = (candidate as RawComposition[])
    .map((x) => ({
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
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!exists || (ignoreSlug && exists.slug === ignoreSlug)) return candidate;
    candidate = `${slugify(base)}-${i++}`;
  }
}

// ===== Revalidación de páginas públicas =====
function revalidateProductPages(newSlug: string, prevSlug?: string) {
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
  revalidatePath('/', 'layout');
  for (const p of toRevalidate) revalidatePath(p);
}

// ===== Helpers FormData =====
function pickFields(fd: FormData) {
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
      const { publicUrl } = await uploadProductImageToSupabase(imageFile, {
        folder: 'products',
        filenameBase: finalSlug,
      });
      imageUrl = publicUrl;
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
      const { publicUrl } = await uploadProductImageToSupabase(imageFile, {
        folder: 'products',
        filenameBase: slugify(newSlug ?? current.slug),
      });
      newImageUrl = publicUrl;
    }

    await prisma.product.update({
      where: { slug },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(newSlug !== undefined && { slug: newSlug }),
        ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
        ...(data.desc !== undefined && { desc: data.desc }),
        ...(data.longDesc !== undefined && { longDesc: data.longDesc }),

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
      // borrar antigua si era pública del bucket
      await deleteSupabaseImageByPublicUrl(current.imageUrl);
    }

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
  await deleteSupabaseImageByPublicUrl(current?.imageUrl);
  revalidateProductPages(slug);
}
