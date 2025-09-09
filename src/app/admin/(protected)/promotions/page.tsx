export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { deletePromotion } from './actions';
import type { Prisma } from '@prisma/client'; // 👈 solo tipado

function isPrismaDecimal(v: unknown): v is Prisma.Decimal {
  return !!v && typeof (v as Prisma.Decimal).toNumber === 'function';
}

function toMoney(v: unknown) {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string'
      ? Number(v)
      : isPrismaDecimal(v)
      ? v.toNumber()
      : Number(v);
  return isNaN(n) ? '' : n.toFixed(2);
}

export default async function PromotionsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      promotions: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  return (
    <section className="max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <h1 className="text-xl font-semibold">Promociones</h1>

      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 border-b">
            <tr>
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Promocionado</th>
              <th className="text-left p-3">Precio antiguo</th>
              <th className="text-left p-3">Precio nuevo</th>
              <th className="text-right p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const promo = p.promotions[0] ?? null;

              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                  </td>

                  <td className="p-3">
                    {promo ? (
                      <span className="text-emerald-700">Sí</span>
                    ) : (
                      <span className="text-stone-500">No</span>
                    )}
                  </td>

                  <td className="p-3">
                    {promo?.priceOld != null ? `${toMoney(promo.priceOld)} €` : '-'}
                  </td>

                  <td className="p-3">
                    {promo?.priceNew != null ? `${toMoney(promo.priceNew)} €` : '-'}
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/admin/promotions/${p.id}`}
                      className={
                        promo
                          ? "inline-flex px-3 py-2 rounded-md border text-sm hover:bg-stone-50"
                          : "inline-flex px-3 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700"
                      }
                    >
                      {promo ? 'Editar' : 'Promocionar'}
                    </Link>

                    {promo && (
                      <form
                        action={async () => {
                          'use server';
                          await deletePromotion(p.id);
                        }}
                        className="inline"
                      >
                        <button
                          type="submit"
                          className="inline-flex px-3 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm"
                        >
                          Quitar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
