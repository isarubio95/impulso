'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-admin';
import { slugify } from '@/lib/slug';
import path from 'path';
import { access, mkdir, stat, unlink, writeFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';

// ===== Límite subida =====
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

// ===== Validación =====
const TreatmentSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(2),
  desc: z.string().min(1),
  longDesc: z.string().min(1),
  imageUrl: z.string().min(1),
  imageAlt: z.string().min(1),
  composition: z.string().optional(), // JSON string; se parsea a Json
  price: z.union([z.string(), z.number()]).optional(),
  isActive: z.coerce.boolean().optional(),
  promoted: z.coerce.boolean().optional(),
});
const PartialTreatmentSchema = TreatmentSchema.partial();

// ===== Imagen: rutas/guardado =====
const PUBLIC_PREFIX = '/assets/img';
const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const UPLOAD_DIR = path.join(PUBLIC_ROOT, 'assets', 'img');
const DEFAULT_IMAGE_NAME = 'product.png';
const DEFAULT_IMAGE_URL = `${PUBLIC_PREFIX}/${DEFAULT_IMAGE_NAME}`;

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
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await access(path.join(dir, name), fsConstants.F_OK);
      name = `${base}-${i++}.${ext}`;
    } catch {
      return name;
    }
  }
}
async function saveTreatmentImage(file: File): Promise<string> {
  if (!file || file.size === 0) return '';
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = getExtFromFile(file);
  const base = safeBaseFromOriginal(file);
  const filename = await ensureUniqueFilename(UPLOAD_DIR, base, ext);
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
  return `${PUBLIC_PREFIX}/${filename}`;
}
async function saveImageAtUrl(file: File, targetPublicUrl: string): Promise<string | null> {
  if (!targetPublicUrl.startsWith(PUBLIC_PREFIX)) {
    throw new Error('Ruta de imagen fuera de /assets/img');
  }
  const rel = targetPublicUrl.replace(/^\//, '');
  const parsed = path.parse(rel);
  const dirAbs = path.join(PUBLIC_ROOT, parsed.dir);
  await mkdir(dirAbs, { recursive: true });

  const ext = (parsed.ext.replace(/^\./, '') || getExtFromFile(file)).toLowerCase();
  const cleanName = (parsed.name || 'image').replace(/[^a-z0-9-_.]/gi, '').toLowerCase();
  const filename = `${cleanName}.${ext}`;
  const absPath = path.join(dirAbs, filename);

  try {
    await access(absPath, fsConstants.F_OK);
    return null;
  } catch {
    await writeFile(absPath, Buffer.from(await file.arrayBuffer()));
    return `/${path.join(parsed.dir, filename).replace(/\\/g, '/')}`;
  }
}
async function deleteImageByUrl(url?: string | null) {
  if (!url) return;
  if (!url.startsWith(PUBLIC_PREFIX)) return;
  if (url === DEFAULT_IMAGE_URL) return;
  const rel = url.replace(/^\//, '');
  const abs = path.join(PUBLIC_ROOT, rel);
  try {
    await stat(abs);
    await unlink(abs);
  } catch { /* no-op */ }
}

// ===== composition =====
const IngredientOutSchema = z.object({
  nombre: z.string().min(1),
  cantidad: z.string().optional().default(''),
});
const CompositionOutArraySchema = z.array(IngredientOutSchema);

type RawComposition = {
  nombre?: unknown; name?: unknown; ingrediente?: unknown;
  cantidad?: unknown; amount?: unknown;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function toStr(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function parseCompositionFromString(s?: string) {
  if (s === undefined) return undefined; // update: no tocar
  const t = s.trim();
  if (t === '') return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(t);
  } catch {
    throw new Error('composition no es JSON válido');
  }

  let candidate: unknown[] = [];
  if (Array.isArray(parsed)) {
    candidate = parsed;
  } else if (isObject(parsed)) {
    const arr =
      Array.isArray(parsed.ingredients) ? parsed.ingredients :
      Array.isArray(parsed.ingredientes) ? parsed.ingredientes :
      Array.isArray(parsed.composicion) ? parsed.composicion : [];
    candidate = arr as unknown[];
  }

  const mapped = candidate
    .map((x): { nombre: string; cantidad?: string } => {
      if (!isObject(x)) return { nombre: '' };
      const nombre = toStr(x.nombre ?? x.name ?? x.ingrediente).trim();
      const cantidad = toStr(x.cantidad ?? x.amount).trim();
      return { nombre, cantidad };
    })
    .filter((x) => x.nombre !== '');

  return CompositionOutArraySchema.parse(mapped);
}

// ===== Slug y revalidación =====
async function ensureUniqueSlug(base: string, ignoreSlug?: string): Promise<string> {
  let candidate = slugify(base);
  if (!candidate) candidate = 'tratamiento';
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.treatment.findUnique({ where: { slug: candidate } });
    if (!exists || (ignoreSlug && exists.slug === ignoreSlug)) return candidate;
    candidate = `${slugify(base)}-${i++}`;
  }
}
function revalidateTreatmentPages(newSlug: string, prevSlug?: string) {
  revalidatePath('/admin/treatments');
  if (prevSlug && prevSlug !== newSlug) revalidatePath(`/admin/treatments/${prevSlug}`);
  revalidatePath('/'); // para “promoted”
}

// ===== helpers =====
function normalizeDecimal(v?: string | number) {
  if (v === undefined) return undefined;
  const s = String(v).replace(',', '.').trim();
  if (s === '') return undefined;
  if (Number.isNaN(Number(s))) return undefined;
  return new Prisma.Decimal(s);
}
function pickFields(fd: FormData) {
  const rawImageUrl = fd.get('imageUrl');
  const imageUrl = typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' ? rawImageUrl : undefined;

  return {
    id: String(fd.get('id') ?? ''),
    slug: String(fd.get('slug') ?? ''),
    title: String(fd.get('title') ?? ''),
    desc: String(fd.get('desc') ?? ''),
    longDesc: String(fd.get('longDesc') ?? ''),
    imageUrl,
    imageAlt: String(fd.get('imageAlt') ?? ''),
    composition: String(fd.get('composition') ?? ''),
    price: (fd.get('price') as string) ?? '',
    isActive: String(fd.get('isActive') ?? 'false'),
    promoted: String(fd.get('promoted') ?? 'false'),
  };
}

/** Toggle `promoted` con límite 4 */
export async function toggleTreatmentPromoted(
  formData: FormData
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const id = formData.get('id') as string;
  const nextValue = formData.get('nextValue') === 'true';
  if (!id) return { ok: false, error: 'Falta el id del tratamiento.' };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.treatment.findUnique({
        where: { id }, select: { promoted: true, slug: true },
      });
      if (!current) throw new Error('Tratamiento no encontrado.');

      if (nextValue === false) {
        const updated = await tx.treatment.update({
          where: { id }, data: { promoted: false }, select: { slug: true },
        });
        return { ok: true as const, slug: updated.slug };
      }

      const count = await tx.treatment.count({ where: { promoted: true, NOT: { id } } });
      if (count >= 4) {
        return { ok: false as const, error: 'Solo se pueden promocionar 4 tratamientos como máximo.' };
      }

      const updated = await tx.treatment.update({
        where: { id }, data: { promoted: true }, select: { slug: true },
      });
      return { ok: true as const, slug: updated.slug };
    });

    revalidatePath('/admin/treatments');
    revalidatePath('/');
    return result;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al actualizar promoción.';
    return { ok: false, error: msg };
  }
}

// ===== CREATE / UPDATE / DELETE =====
export async function upsertTreatment(formData: FormData): Promise<
  | { ok: true; id: string }
  | { ok: false; error: string }
> {
  await requireAdmin();
  try {
    const fields = pickFields(formData);
    const isUpdate = !!fields.id && fields.id !== '';

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > MAX_UPLOAD_BYTES) {
      const mb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
      throw new Error(`La imagen supera el límite de ${mb}MB`);
    }

    if (!isUpdate) {
      // ---------- CREATE ----------
      const createInput = {
        ...fields,
        imageUrl: fields.imageUrl ?? DEFAULT_IMAGE_URL,
      };
      const data = TreatmentSchema.parse(createInput);

      const baseSlug = data.slug && data.slug.trim() !== '' ? data.slug : data.title;
      const finalSlug = await ensureUniqueSlug(baseSlug);

      // Imagen
      let imageUrl = data.imageUrl;
      if (imageFile && imageFile.size > 0) {
        if (data.imageUrl && data.imageUrl.startsWith(PUBLIC_PREFIX)) {
          const savedAtRequested = await saveImageAtUrl(imageFile, data.imageUrl);
          imageUrl = savedAtRequested ?? (await saveTreatmentImage(imageFile));
        } else {
          imageUrl = await saveTreatmentImage(imageFile);
        }
      }

      // Crear con control de “promoted”
      const created = await prisma.$transaction(async (tx) => {
        if (data.promoted === true) {
          const already = await tx.treatment.count({ where: { promoted: true } });
          if (already >= 4) throw new Error('Máximo 4 tratamientos promocionados.');
        }

        return tx.treatment.create({
          data: {
            slug: finalSlug,
            title: data.title,
            desc: data.desc,
            longDesc: data.longDesc,
            imageUrl,
            imageAlt: data.imageAlt,
            composition: parseCompositionFromString(data.composition) ?? undefined,
            price: normalizeDecimal(data.price),
            isActive: data.isActive ?? true,
            promoted: data.promoted ?? false,
          },
          select: { id: true, slug: true },
        });
      });

      revalidateTreatmentPages(created.slug);
      return { ok: true, id: created.id };
    } else {
      // ---------- UPDATE ----------
      const current = await prisma.treatment.findUnique({ where: { id: fields.id } });
      if (!current) throw new Error('Tratamiento no encontrado');

      const data = PartialTreatmentSchema.parse(fields);

      // Posible cambio de slug
      let newSlug: string | undefined;
      if (data.slug !== undefined) {
        const base = data.slug.trim() === '' ? (data.title ?? current.title) : data.slug;
        const cand = slugify(base);
        if (cand !== current.slug) newSlug = await ensureUniqueSlug(cand, current.slug);
      }

      // Imagen nueva (si se sube)
      let newImageUrl: string | undefined;
      if (imageFile && imageFile.size > 0) {
        if (data.imageUrl && data.imageUrl.startsWith(PUBLIC_PREFIX)) {
          const savedAtRequested = await saveImageAtUrl(imageFile, data.imageUrl);
          newImageUrl = savedAtRequested ?? (await saveTreatmentImage(imageFile));
        } else {
          newImageUrl = await saveTreatmentImage(imageFile);
        }
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (data.promoted === true && current.promoted === false) {
          const already = await tx.treatment.count({
            where: { promoted: true, NOT: { id: current.id } },
          });
          if (already >= 4) throw new Error('Máximo 4 tratamientos promocionados.');
        }

        const res = await tx.treatment.update({
          where: { id: fields.id },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(newSlug !== undefined && { slug: newSlug }),
            ...(data.desc !== undefined && { desc: data.desc }),
            ...(data.longDesc !== undefined && { longDesc: data.longDesc }),
            ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),

            ...(newImageUrl !== undefined && { imageUrl: newImageUrl }),
            ...(data.imageUrl !== undefined &&
              data.imageUrl.trim() !== '' &&
              newImageUrl === undefined && { imageUrl: data.imageUrl }),

            ...(data.composition !== undefined && {
              composition: parseCompositionFromString(data.composition),
            }),
            ...(data.price !== undefined && { price: normalizeDecimal(data.price) }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.promoted !== undefined && { promoted: data.promoted }),
          },
          select: { id: true, slug: true, imageUrl: true },
        });
        return res;
      });

      if (newImageUrl && current.imageUrl && current.imageUrl !== newImageUrl) {
        await deleteImageByUrl(current.imageUrl);
      }

      revalidateTreatmentPages(updated.slug, current.slug);
      return { ok: true, id: updated.id };
    }
  } catch (err: unknown) {
    console.error('upsertTreatment error:', err);
    return { ok: false, error: 'unexpected_error' };
  }
}

export async function deleteTreatment(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const id = String(formData.get('id') ?? '');
    if (!id) return { ok: false, error: 'validation_error' };

    const current = await prisma.treatment.findUnique({ where: { id } });
    await prisma.treatment.delete({ where: { id } });
    await deleteImageByUrl(current?.imageUrl);

    revalidateTreatmentPages(current?.slug ?? '');
    return { ok: true };
  } catch (err: unknown) {
    console.error('deleteTreatment error:', err);
    return { ok: false, error: 'unexpected_error' };
  }
}
