'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import path from 'path';
import { mkdir, writeFile, unlink, stat, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { Prisma } from '@prisma/client';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

// ===== Zod: números vacíos -> undefined =====
const zNumOpt = z.preprocess(
  v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.coerce.number().min(0).optional()
);

const PromotionFormSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1, 'El título es obligatorio'),
  blurb: z.string().optional(),
  priceNew: zNumOpt,
  priceOld: zNumOpt,
  imageUrl: z.string().optional(),     // ruta deseada si no sube nueva o para forzar destino
  imageAlt: z.string().optional(),
  ctaUrl: z.string().optional(),
  startsAt: z.string().optional(),     // <input type="datetime-local">
  endsAt: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  priority: z.preprocess(
    v => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.coerce.number().int().optional()
  ),
});

// ===== Ficheros =====
const PUBLIC_PREFIX = '/assets/img';
const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const UPLOAD_DIR = path.join(PUBLIC_ROOT, 'assets', 'img'); // por defecto
const DEFAULT_IMAGE_URL = `${PUBLIC_PREFIX}/product.png`;

function extFrom(file: File) {
  const n = path.parse(file.name ?? '').ext.replace(/^\./, '').toLowerCase();
  if (n) return n;
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  return map[file.type] ?? 'png';
}

function baseFromFilename(name?: string) {
  const b = path.parse(name ?? '').name;
  return (b || 'image').replace(/[^a-z0-9-_.]/gi, '').toLowerCase();
}

async function ensureUniqueFilename(dirAbs: string, base: string, ext: string) {
  let filename = `${base}.${ext}`, i = 2;
  while (true) {
    const candidate = path.join(dirAbs, filename);
    try {
      await access(candidate, fsConstants.F_OK);
      filename = `${base}-${i++}.${ext}`;
    } catch {
      return filename;
    }
  }
}

/**
 * Guarda el archivo EXACTAMENTE en la URL pública indicada si no existe aún.
 * Soporta subdirectorios dentro de /assets/img (ej: /assets/img/promos/home-hero.png)
 * Si ya existe, devuelve null para que el caller use un nombre único alternativo.
 */
async function saveImageAtUrl(file: File, targetPublicUrl: string) {
  if (!targetPublicUrl.startsWith(PUBLIC_PREFIX)) {
    throw new Error('Ruta de imagen fuera de /assets/img');
  }

  // targetPublicUrl -> ruta relativa dentro de /public
  const rel = targetPublicUrl.replace(/^\//, ''); // assets/img/...
  const parsed = path.parse(rel);
  const dirAbs = path.join(PUBLIC_ROOT, parsed.dir); // /public/assets/img[/sub]
  const ext = (parsed.ext.replace(/^\./, '') || extFrom(file)).toLowerCase();
  const cleanName = (parsed.name || 'image').replace(/[^a-z0-9-_.]/gi, '').toLowerCase();
  const filename = `${cleanName}.${ext}`;
  const absPath = path.join(dirAbs, filename);

  await mkdir(dirAbs, { recursive: true });

  try {
    await access(absPath, fsConstants.F_OK); // ya existe
    return null as string | null;
  } catch {
    await writeFile(absPath, Buffer.from(await file.arrayBuffer()));
    return `/${path.join(parsed.dir, filename).replace(/\\/g, '/')}`;
  }
}

/**
 * Guarda el archivo usando su nombre REAL como base
 * (p. ej. banner_octubre.png -> /assets/img/banner_octubre.png),
 * evitando colisiones con sufijos -2, -3, ...
 * Soporta solo el directorio base /assets/img (sin subcarpetas).
 */
async function saveImageWithOriginalName(file: File) {
  if (!file || file.size === 0) return '';
  await mkdir(UPLOAD_DIR, { recursive: true });

  const base = baseFromFilename(file.name);
  const ext = extFrom(file);
  const filename = await ensureUniqueFilename(UPLOAD_DIR, base, ext);

  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return `${PUBLIC_PREFIX}/${filename}`;
}

async function deleteByUrl(url?: string | null) {
  if (!url || !url.startsWith(PUBLIC_PREFIX) || url === DEFAULT_IMAGE_URL) return;
  const abs = path.join(PUBLIC_ROOT, url.replace(/^\//, ''));
  try {
    await stat(abs);
    await unlink(abs);
  } catch {}
}

// Date helper
function toDate(v?: string) {
  const t = (v ?? '').trim();
  if (!t) return undefined;
  const d = new Date(t);
  return isNaN(+d) ? undefined : d;
}

function revalidatePromos(productId: string) {
  revalidatePath('/admin/promotions');
  revalidateTag('promotions');
  revalidateTag(`promotion:${productId}`);
}

// ========== CREATE / UPDATE (upsert por productId) ==========
export async function upsertPromotion(formData: FormData) {
  await requireAdmin();

  const file = formData.get('image') as File | null;
  if (file && file.size > MAX_UPLOAD_BYTES) {
    throw new Error('La imagen supera 5MB');
  }

  const data = PromotionFormSchema.parse(Object.fromEntries(formData));

  const existing = await prisma.promotion.findFirst({
    where: { productId: data.productId },
  });

  // Cargamos el producto para precargar valores por defecto en "create"
  const baseProduct = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { id: true, slug: true, name: true, desc: true, price: true, imageUrl: true },
  });

  // imagen base
  let imageUrl =
    data.imageUrl ||
    existing?.imageUrl ||
    baseProduct?.imageUrl ||
    DEFAULT_IMAGE_URL;

  // === NUEVA LÓGICA DE GUARDADO ===
  if (file && file.size > 0) {
    // 1) Si el usuario ha indicado una ruta en imageUrl, intentamos guardar EXACTAMENTE ahí si no existe
    if (data.imageUrl && data.imageUrl.startsWith(PUBLIC_PREFIX)) {
      const savedAtRequested = await saveImageAtUrl(file, data.imageUrl);
      if (savedAtRequested) {
        imageUrl = savedAtRequested;
      } else {
        // 2) Si ya existía esa ruta/archivo, guardamos usando el nombre REAL del archivo subido
        //    en /assets/img, evitando colisiones (-2, -3, ...)
        imageUrl = await saveImageWithOriginalName(file);
      }
    } else {
      // 3) Sin ruta previa → usamos el nombre REAL del archivo subido
      imageUrl = await saveImageWithOriginalName(file);
    }
  }

  // fechas -> Date | null
  const startsAt: Date | null = toDate(data.startsAt) ?? null;
  const endsAt: Date | null = toDate(data.endsAt) ?? null;

  if (!existing) {
    // CREATE con valores precargados desde el producto
    const createData: Prisma.PromotionUncheckedCreateInput = {
      productId: data.productId,
      title: data.title || baseProduct?.name || 'Promoción',
      blurb: (data.blurb ?? baseProduct?.desc) ?? null,
      priceNew: data.priceNew != null ? new Prisma.Decimal(data.priceNew) : null,
      priceOld:
        data.priceOld != null
          ? new Prisma.Decimal(data.priceOld)
          : baseProduct?.price
          ? new Prisma.Decimal(baseProduct.price as Prisma.Decimal)
          : null,
      imageUrl,
      imageAlt: (data.imageAlt ?? baseProduct?.name) ?? null,
      ctaUrl: (data.ctaUrl ?? (baseProduct ? `/tienda/${baseProduct.slug}` : undefined)) ?? null,
      startsAt,
      endsAt,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 10, // por defecto 10
    };

    await prisma.promotion.create({ data: createData });
  } else {
    // UPDATE
    const prevImageUrl = existing.imageUrl;

    const updateData: Prisma.PromotionUpdateInput = {
      title: data.title ?? existing.title,
      blurb: (data.blurb ?? null),
      priceNew: data.priceNew != null ? new Prisma.Decimal(data.priceNew) : null,
      priceOld: data.priceOld != null ? new Prisma.Decimal(data.priceOld) : null,
      imageUrl,
      imageAlt: (data.imageAlt ?? null),
      ctaUrl: (data.ctaUrl ?? null),
      startsAt,
      endsAt,
      isActive: data.isActive ?? existing.isActive,
      priority: data.priority ?? existing.priority,
    };

    await prisma.promotion.update({
      where: { id: existing.id },
      data: updateData,
    });

    // si hemos subido archivo nuevo y la url previa era distinta, borramos la anterior
    if (file && file.size > 0 && prevImageUrl && prevImageUrl !== imageUrl) {
      await deleteByUrl(prevImageUrl);
    }
  }

  revalidatePromos(data.productId);
}

// ========== DELETE ==========
export async function deletePromotion(productId: string) {
  await requireAdmin();
  const existing = await prisma.promotion.findFirst({ where: { productId } });
  if (!existing) return;

  await prisma.promotion.delete({ where: { id: existing.id } });
  await deleteByUrl(existing.imageUrl);

  revalidatePromos(productId);
}
