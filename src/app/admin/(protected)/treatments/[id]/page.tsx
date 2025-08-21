// src/app/admin/(protected)/treatments/[id]/page.tsx
import { prisma } from '@/lib/db'
import { upsertTreatment, deleteTreatment } from '../actions'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

type Params = { id: string }

async function saveAction(formData: FormData): Promise<void> {
  'use server'
  const res = await upsertTreatment(formData)
  if (!res.ok) throw new Error(res.error)
  redirect(`/admin/treatments/${res.id}`)
}

async function deleteAction(formData: FormData): Promise<void> {
  'use server'
  const res = await deleteTreatment(formData)
  if (!res.ok) throw new Error(res.error)
  redirect('/admin/treatments')
}

export default async function TreatmentEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const isNew = id === 'new'

  const treatment = isNew
    ? null
    : await prisma.treatment.findUnique({
        where: { id },
        select: {
          id: true,
          slug: true,
          title: true,
          desc: true,
          longDesc: true,
          imageUrl: true,
          imageAlt: true,
          composition: true,
          isActive: true,
        },
      })

  return (
    <section className="flex flex-col items-center max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">
        {isNew ? 'Nuevo tratamiento' : `Editar: ${treatment?.title ?? ''}`}
      </h1>

      <form action={saveAction} className="space-y-4 max-w-2xl w-full">
        {!isNew && <input type="hidden" name="id" defaultValue={treatment?.id} />}

        <div className="grid gap-2">
          <label className="text-sm font-medium">Slug</label>
          <input name="slug" required defaultValue={treatment?.slug ?? ''} className="border rounded-md px-3 py-2 text-sm" placeholder="presoterapia" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Título</label>
          <input name="title" required defaultValue={treatment?.title ?? ''} className="border rounded-md px-3 py-2 text-sm" placeholder="Presoterapia" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Resumen (desc)</label>
          <input name="desc" required defaultValue={treatment?.desc ?? ''} className="border rounded-md px-3 py-2 text-sm" placeholder="Descripción corta…" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Descripción larga</label>
          <textarea name="longDesc" defaultValue={treatment?.longDesc ?? ''} className="border rounded-md px-3 py-2 text-sm min-h-28" placeholder="Texto largo…" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Imagen (URL)</label>
          <input name="imageUrl" type="url" defaultValue={treatment?.imageUrl ?? ''} className="border rounded-md px-3 py-2 text-sm" placeholder="https://…" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Alt de la imagen</label>
          <input name="imageAlt" defaultValue={treatment?.imageAlt ?? ''} className="border rounded-md px-3 py-2 text-sm" placeholder="Persona recibiendo presoterapia" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Composición (JSON)</label>
          <textarea
            name="composition"
            defaultValue={JSON.stringify(treatment?.composition ?? [], null, 2)}
            className="border rounded-md px-3 py-2 text-sm min-h-36 font-mono"
            placeholder='[{"nombre":"Duración","cantidad":"30 min"}]'
          />
          <p className="text-xs text-stone-500">
            Formato: lista de objetos con <code>nombre</code> y <code>cantidad</code>.
          </p>
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={treatment?.isActive ?? true} className="size-4" />
          <span className="text-sm">Activo</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">
            Guardar
          </button>

          {!isNew && (
            <form action={deleteAction}>
              <input type="hidden" name="id" defaultValue={treatment?.id} />
              <button type="submit" className="px-3 py-2 rounded-md border border-red-600 text-red-600 text-sm">
                Borrar
              </button>
            </form>
          )}
        </div>
      </form>
    </section>
  )
}
