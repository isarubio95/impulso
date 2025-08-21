// src/app/admin/(protected)/treatments/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export default async function TreatmentsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? ''

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { desc: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  } satisfies NonNullable<Parameters<typeof prisma.treatment.findMany>[0]>['where']

  const items = await prisma.treatment.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, slug: true, title: true, isActive: true, updatedAt: true },
  })

  return (
    <section className="max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Tratamientos</h1>
        <Link href="/admin/treatments/new" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">
          Nuevo tratamiento
        </Link>
      </div>

      <form className="flex items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título, slug…"
          className="border rounded-md px-3 py-2 text-sm"
        />
        <button className="px-3 py-2 rounded-md border text-sm">Buscar</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Título</th>
              <th className="py-2 pr-3">Slug</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3">Actualizado</th>
              <th className="py-2 pr-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 pr-3">{t.title}</td>
                <td className="py-2 pr-3 text-stone-600">{t.slug}</td>
                <td className="py-2 pr-3">{t.isActive ? 'Activo' : 'Inactivo'}</td>
                <td className="py-2 pr-3 text-stone-500">{new Date(t.updatedAt).toLocaleString()}</td>
                <td className="py-2 pr-3">
                  <Link className="text-sky-700 hover:underline" href={`/admin/treatments/${t.id}`}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="py-8 text-center text-stone-500" colSpan={5}>
                  No hay tratamientos todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
