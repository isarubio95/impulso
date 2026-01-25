import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { deleteProduct } from './actions';
import ConfirmSubmit from './ConfirmSubmit';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

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
    <div className="p-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Productos</h1>
          <p className="text-stone-600">Gestión del catálogo de productos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar productos..."
              className="w-full sm:w-64 rounded-full border border-stone-300 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-stone-200 focus:border-stone-400 outline-none transition-all text-stone-900 placeholder:text-stone-400"
            />
          </form>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nuevo</span>
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-stone-800 font-medium border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Nombre</th>
                <th className="px-6 py-4 whitespace-nowrap">Precio</th>
                <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((p) => (
                <tr key={p.slug} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800">{p.name}</td>
                  <td className="px-6 py-4">{toMoney(p.price)} €</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                      {p.isActive ? 'Activo' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/products/${p.slug}`}
                        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                        title="Editar producto"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>

                      <form
                        action={async () => {
                          'use server';
                          await deleteProduct(p.slug);
                        }}
                        className="inline-flex"
                      >
                        <ConfirmSubmit
                          message={`¿Eliminar "${p.name}"?`}
                          className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/30">
          <span className="text-xs text-stone-500">Mostrando {items.length} de {total} resultados</span>
          <div className="flex gap-1">
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
                  className={`min-w-[2rem] h-8 flex items-center justify-center text-xs rounded-md transition-colors ${
                    active 
                      ? 'bg-stone-900 text-white font-medium' 
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {n}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
