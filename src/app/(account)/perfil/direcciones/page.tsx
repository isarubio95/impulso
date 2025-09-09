import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import AddressEditor from './ui/AddressEditor'
import { deleteAddress, setDefaultAddress, upsertAddress } from './actions'

export const runtime = 'nodejs'

// ===== Wrappers para <form action={...}> (deben devolver void) =====
async function setDefaultAction(formData: FormData): Promise<void> {
  'use server'
  const res = await setDefaultAddress(formData)
  if (!res.ok) throw new Error(res.error ?? 'No se pudo marcar por defecto')
}

async function deleteAddressAction(formData: FormData): Promise<void> {
  'use server'
  const res = await deleteAddress(formData)
  if (!res.ok) throw new Error(res.error ?? 'No se pudo borrar la dirección')
}

export default async function DireccionesPage() {
  const me = await requireUser()

  const addresses = await prisma.address.findMany({
    where: { userId: me.id },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  })

  return (
    <section className="max-w-3xl mx-auto px-4 py-8 text-stone-700 space-y-6">
      <h1 className="text-xl font-semibold">Mis direcciones</h1>

      {/* Crear nueva */}
      <div className="border rounded-md p-4 bg-white">
        <h2 className="font-medium mb-3">Añadir nueva dirección</h2>
        <AddressEditor action={upsertAddress} />
      </div>

      {/* Listado */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <p className="text-sm text-stone-500">Aún no tienes direcciones guardadas.</p>
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="border rounded-md p-4 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {a.fullName}{' '}
                    {a.isDefault && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-stone-600">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''} — {a.postalCode} {a.city} ({a.province}) ·{' '}
                    {a.country}
                  </div>
                  {a.phone && <div className="text-sm text-stone-600 mt-1">Tel: {a.phone}</div>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Marcar por defecto */}
                  {!a.isDefault && (
                    <form action={setDefaultAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-stone-50">
                        Marcar por defecto
                      </button>
                    </form>
                  )}

                  {/* Editar inline */}
                  <details className="group">
                    <summary className="px-3 py-1.5 text-sm rounded-md border hover:bg-stone-50 cursor-pointer list-none">
                      Editar
                    </summary>
                    <div className="mt-3">
                      <AddressEditor
                        action={upsertAddress}
                        initial={{
                          id: a.id,
                          fullName: a.fullName,
                          phone: a.phone ?? '',
                          line1: a.line1,
                          line2: a.line2 ?? '',
                          city: a.city,
                          province: a.province,
                          postalCode: a.postalCode,
                          country: a.country,
                          isDefault: a.isDefault,
                        }}
                      />
                    </div>
                  </details>

                  {/* Borrar */}
                  <form
                    action={deleteAddressAction}
                    onSubmit={(e) => {
                      if (!confirm('¿Eliminar esta dirección?')) e.preventDefault()
                    }}
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <button className="px-3 py-1.5 text-sm rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50">
                      Borrar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
