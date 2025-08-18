export const runtime = 'nodejs';

import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { upsertPromotion, deletePromotion } from '../actions';

type Params = { params: { productId: string } };

function isPrismaDecimal(v: unknown): v is Prisma.Decimal {
  return !!v && typeof (v as Prisma.Decimal).toNumber === 'function';
}

function toMoney(v: unknown) {                         
  const n =
    typeof v === 'number'
      ? v
      : isPrismaDecimal(v)
      ? v.toNumber()
      : Number(v);
  return isNaN(n) ? '' : n.toFixed(2);
}

function toInputDateTimeLocal(d?: Date | null) {
  if (!d) return '';
  const iso = new Date(d).toISOString();
  return iso.slice(0, 16); // YYYY-MM-DDTHH:MM
}

export default async function PromotionEditPage({ params }: Params) {
  const { productId } = params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      name: true,
      desc: true,
      price: true,
      imageUrl: true,
      promotions: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-blue-600">Producto no encontrado.</p>
        <Link href="/admin/promotions" className="inline-flex px-3 py-2 rounded-md border">
          Volver
        </Link>
      </section>
    );
  }

  const promo = product.promotions[0] ?? null;

  // Defaults si no hay promo (precarga desde el producto)
  const defTitle = promo?.title ?? product.name;
  const defBlurb = promo?.blurb ?? product.desc;
  const defPriceOld = promo?.priceOld ?? product.price;
  const defImageUrl = promo?.imageUrl ?? product.imageUrl ?? '/assets/img/product.png';
  const defImageAlt = promo?.imageAlt ?? product.name;
  const defCta = promo?.ctaUrl ?? `/tienda/${product.slug}`;
  const defStarts = toInputDateTimeLocal(promo?.startsAt);
  const defEnds = toInputDateTimeLocal(promo?.endsAt);
  const defActive = promo?.isActive ?? true;
  const defPriority = promo?.priority ?? 10;

  return (
    <section className="flex flex-col w-full space-y-6 text-stone-700 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between mx-auto">
        <h1 className="text-xl font-semibold">
          {promo ? `Editar promoción: ${product.name}` : `Promocionar: ${product.name}`}
        </h1>
        <Link href="/admin/promotions" className="text-sm text-blue-700 underline cursor-pointer">
          Volver al listado
        </Link>
      </div>

      {/* FORM PRINCIPAL (crear/actualizar) */}
      <form action={upsertPromotion} className="space-y-4 max-w-2xl mx-auto w-full">
        <input type="hidden" name="productId" value={product.id} />

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">Título</span>
            <input
              name="title"
              defaultValue={defTitle}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Descripción corta</span>
            <input
              name="blurb"
              defaultValue={defBlurb ?? ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Precio nuevo (€)</span>
            <input
              name="priceNew"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toMoney(promo?.priceNew)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Precio anterior (€)</span>
            <input
              name="priceOld"
              type="number"
              step="0.01"
              min="0"
              defaultValue={toMoney(defPriceOld)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>

        {/* Imagen: ruta actual + preview + input de archivo */}
        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-sm mb-1">Imagen (ruta actual)</span>
            <input
              name="imageUrl"
              defaultValue={defImageUrl}
              readOnly
              className="w-full rounded-md border px-3 py-2 text-sm bg-stone-50"
            />
          </label>
          <img
            src={defImageUrl}
            alt={defImageAlt}
            className="w-16 h-16 object-contain border rounded-md bg-white justify-self-end"
          />
        </div>

        <label className="block">
          <span className="block text-sm mb-1">Subir nueva imagen</span>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <p className="text-xs text-stone-500 mt-1">Máx. 5MB (se valida al guardar).</p>
        </label>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">Alt imagen</span>
            <input
              name="imageAlt"
              defaultValue={defImageAlt ?? ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">CTA URL</span>
            <input
              name="ctaUrl"
              defaultValue={defCta ?? ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Inicio</span>
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={defStarts}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Fin</span>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={defEnds}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <span className="text-sm">Prioridad</span>
            <input
              name="priority"
              type="number"
              step="1"
              min="0"
              defaultValue={defPriority}
              className="w-20 rounded-md border px-2 py-1 text-sm"
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input name="isActive" type="checkbox" value="true" defaultChecked={defActive} />
            <span className="text-sm">Activa</span>
          </label>

          <button
            type="submit"
            className="ml-auto px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700"
          >
            {promo ? 'Guardar cambios' : 'Crear promoción'}
          </button>
        </div>
      </form>

      {/* FORM BORRAR (fuera del form principal para evitar anidado) */}
      {promo && (
        <form
          action={deletePromotion.bind(null, product.id)}
          className="max-w-2xl mx-auto w-full"
        >
          <button
            type="submit"
            className="px-4 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm"
          >
            Eliminar promoción
          </button>
        </form>
      )}
    </section>
  );
}
