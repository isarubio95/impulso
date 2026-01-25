import Link from 'next/link'
import { prisma } from '@/lib/db'
import ConfirmSubmit from '../products/ConfirmSubmit'
import { deleteTreatment, toggleTreatmentPromoted } from './actions'
import PromoteCheckbox from './PromoteCheckbox'
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi'

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
    <div className="p-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Tratamientos</h1>
          <p className="text-stone-600">Gestión del catálogo de tratamientos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar tratamientos..."
              className="w-full sm:w-64 rounded-full border border-stone-300 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-stone-200 focus:border-stone-400 outline-none transition-all"
            />
          </form>
          <Link
            href="/admin/treatments/new"
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
                <th className="px-6 py-4 whitespace-nowrap">Título</th>
                <th className="px-6 py-4 whitespace-nowrap">Slug</th>
                <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap">Promocionado</th>
                <th className="px-6 py-4 whitespace-nowrap">Actualizado</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800">{t.title}</td>
                  <td className="px-6 py-4 text-stone-500">{t.slug}</td>
                  <td className="px-6 py-4">
                    <StatusBadge active={t.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <PromoteCheckbox
                      id={t.id}
                      defaultChecked={t.promoted}
                      action={toggleTreatmentPromoted}
                    />
                  </td>
                  <td className="px-6 py-4 text-stone-500">{fmt(t.updatedAt)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/treatments/${t.id}`}
                        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                        title="Editar tratamiento"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>

                      <form action={deleteAction} className="inline-flex">
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmSubmit
                          message={`¿Eliminar "${t.title}"?`}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No se encontraron tratamientos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/30 text-xs text-stone-500">
            Máximo 4 tratamientos promocionados.
        </div>
      </div>
    </div>
  )
}
