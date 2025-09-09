import Link from 'next/link'
import { prisma } from '@/lib/db'
import ConfirmSubmit from '../products/ConfirmSubmit'
import { deleteTreatment, toggleTreatmentPromoted } from './actions'
import PromoteCheckbox from './PromoteCheckbox'

export const runtime = 'nodejs'

// --- Wrapper de server action que devuelve void ---
async function deleteAction(formData: FormData): Promise<void> {
  'use server'
  const res = await deleteTreatment(formData)
  if (!res.ok) throw new Error(res.error)
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
        active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function fmt(dt: Date) {
  return new Date(dt).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

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
    select: {
      id: true,
      slug: true,
      title: true,
      isActive: true,
      promoted: true, // 👈 añadimos promoted
      updatedAt: true,
    },
  })

  return (
    <section className="max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tratamientos</h1>
        <Link
          href="/admin/treatments/new"
          className="inline-flex px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
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
        <button className="px-3 py-2 rounded-md border text-sm hover:bg-stone-50">
          Buscar
        </button>
      </form>

      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 border-b">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Promocionado</th>{/* 👈 nueva columna */}
              <th className="text-left p-3">Actualizado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b align-middle">
                <td className="p-3 font-medium">{t.title}</td>
                <td className="p-3 text-stone-600">{t.slug}</td>
                <td className="p-3">
                  <StatusBadge active={t.isActive} />
                </td>

                {/* Checkbox que llama a la server action al cambiar */}
                <td className="p-3">
                  <PromoteCheckbox
                    id={t.id}
                    defaultChecked={t.promoted}
                    action={toggleTreatmentPromoted}
                  />
                </td>

                <td className="p-3 text-stone-500">{fmt(t.updatedAt)}</td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    className="inline-flex px-3 py-2 rounded-md border text-sm hover:bg-stone-50"
                    href={`/admin/treatments/${t.id}`}
                  >
                    Editar
                  </Link>

                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmSubmit
                      message={`¿Eliminar "${t.title}"?`}
                      className="px-3 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      Borrar
                    </ConfirmSubmit>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-stone-500">
                  No hay tratamientos todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500">Máximo 4 tratamientos promocionados.</p>
    </section>
  )
}
