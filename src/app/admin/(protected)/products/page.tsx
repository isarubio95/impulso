import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { deleteProduct } from './actions';
import ConfirmSubmit from './ConfirmSubmit';

const PAGE_SIZE = 10;

// helper para mostrar Decimals de Prisma como precio
function isPrismaDecimal(v: unknown): v is Prisma.Decimal {
  return !!v && typeof (v as Prisma.Decimal).toNumber === 'function';
}

const toMoney = (v: unknown) =>
  (
    typeof v === 'number'
      ? v
      : typeof v === 'string'
      ? Number(v)
      : isPrismaDecimal(v)
      ? v.toNumber()
      : Number(v)
  ).toFixed(2);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const sp = (await searchParams) ?? {};

  const q =
    typeof sp.q === 'string'
      ? sp.q
      : Array.isArray(sp.q)
      ? sp.q[0] ?? ''
      : '';

  const pageStr =
    typeof sp.page === 'string'
      ? sp.page
      : Array.isArray(sp.page)
      ? sp.page[0] ?? '1'
      : '1';

  const page = Math.max(1, parseInt(pageStr || '1', 10));

  // Tipado explícito para que TS no se queje con OR/mode
  const mode: Prisma.QueryMode = 'insensitive';
  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode } },
          { slug: { contains: q, mode } },
          { desc: { contains: q, mode } },
          { longDesc: { contains: q, mode } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        slug: true,
        name: true,
        price: true, // Prisma.Decimal
        isActive: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <form className="flex-1 max-w-sm">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o slug…"
            className="w-full rounded-md border border-stone-400 px-3 py-2 text-sm"
          />
        </form>
        <Link
          href="/admin/products/new"
          className="px-3 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-sm"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 border-b">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.slug} className="border-b last:border-0">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{toMoney(p.price)} €</td>
                <td className="p-3">{p.isActive ? 'Activo' : 'Oculto'}</td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/products/${p.slug}`}
                    className="px-2 py-1 rounded border text-stone-700 hover:bg-stone-50 mr-2"
                  >
                    Editar
                  </Link>

                  <form
                    action={async () => {
                      'use server';
                      await deleteProduct(p.slug);
                    }}
                    className="inline"
                  >
                    <ConfirmSubmit
                      message={`¿Eliminar "${p.name}"?`}
                      className="px-2 py-1 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Borrar
                    </ConfirmSubmit>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-600">Total: {total}</span>
        <div className="flex gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const n = i + 1;
            const href = `/admin/products?${new URLSearchParams({
              q,
              page: String(n),
            })}`;
            const active = n === page;
            return (
              <a
                key={n}
                href={href}
                className={`px-3 py-1 rounded border ${
                  active ? 'bg-stone-100' : 'hover:bg-stone-50'
                }`}
              >
                {n}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
