export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { deletePromotion } from './actions';
import type { Prisma } from '@prisma/client'; // 👈 solo tipado
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

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
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Promociones</h1>
        <p className="text-stone-600">Gestiona las promociones activas de tus productos.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-stone-800 font-medium border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Producto</th>
                <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap">Precio antiguo</th>
                <th className="px-6 py-4 whitespace-nowrap">Precio nuevo</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const promo = p.promotions[0] ?? null;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-stone-800">
                      {p.name}
                    </td>

                    <td className="px-6 py-4">
                      {promo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                          Sin promoción
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {promo?.priceOld != null ? `${toMoney(promo.priceOld)} €` : '-'}
                    </td>

                    <td className="px-6 py-4 font-medium text-stone-800">
                      {promo?.priceNew != null ? `${toMoney(promo.priceNew)} €` : '-'}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {promo ? (
                          <>
                            <Link
                              href={`/admin/promotions/${p.id}`}
                              className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                              title="Editar promoción"
                            >
                              <FiEdit className="w-5 h-5" />
                            </Link>

                            <form
                              action={async () => {
                                'use server';
                                await deletePromotion(p.id);
                              }}
                              className="inline-flex"
                            >
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                                title="Eliminar promoción"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </form>
                          </>
                        ) : (
                          <Link
                            href={`/admin/promotions/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-full hover:bg-stone-800 transition-colors shadow-sm"
                            title="Crear promoción"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                            Promocionar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
