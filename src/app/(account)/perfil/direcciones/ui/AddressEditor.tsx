'use client'

import { useState, useTransition } from 'react'

type AddressForm = {
  id?: string
  fullName: string
  phone?: string
  line1: string
  line2?: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault?: boolean
}

export default function AddressEditor({
  action,
  initial,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>
  initial?: AddressForm
}) {
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await action(fd)
      if (!res?.ok) setErr(res?.error ?? 'No se pudo guardar')
      else e.currentTarget.reset()
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {initial?.id && <input type="hidden" name="id" defaultValue={initial.id} />}

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">Nombre completo</label>
        <input
          name="fullName"
          required
          defaultValue={initial?.fullName}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">Teléfono</label>
        <input
          name="phone"
          defaultValue={initial?.phone}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1 md:col-span-2">
        <label className="text-xs text-stone-600">Dirección (línea 1)</label>
        <input
          name="line1"
          required
          defaultValue={initial?.line1}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1 md:col-span-2">
        <label className="text-xs text-stone-600">Dirección (línea 2)</label>
        <input
          name="line2"
          defaultValue={initial?.line2}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">Ciudad</label>
        <input
          name="city"
          required
          defaultValue={initial?.city}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">Provincia</label>
        <input
          name="province"
          required
          defaultValue={initial?.province}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">Código Postal</label>
        <input
          name="postalCode"
          required
          defaultValue={initial?.postalCode}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs text-stone-600">País</label>
        <input
          name="country"
          defaultValue={initial?.country ?? 'ES'}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={initial?.isDefault}
          className="h-4 w-4 accent-emerald-600"
        />
        <span className="text-sm">Usar como dirección predeterminada</span>
      </label>

      {err && <p className="text-rose-700 text-sm md:col-span-2">{err}</p>}

      <div className="md:col-span-2">
        <button
          disabled={pending}
          className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60"
        >
          {pending ? 'Guardando…' : (initial?.id ? 'Guardar cambios' : 'Añadir dirección')}
        </button>
      </div>
    </form>
  )
}
