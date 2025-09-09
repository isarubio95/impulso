// src/app/(shop)/checkout/ui/AddressQuickForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertAddress } from '@/app/(account)/perfil/direcciones/actions'

type UpsertAddressResult =
  | { ok: true }
  | { ok: false; error: string }

export default function AddressQuickForm() {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // marcar por defecto si no viene marcado (primera vez)
    if (!fd.get('isDefault')) fd.set('isDefault', 'on')

    setErr(null)
    start(async () => {
      const res = (await upsertAddress(fd)) as UpsertAddressResult

      if (!res.ok) {
        setErr(res.error ?? 'No se pudo guardar')
        return
      }

      // ok
      e.currentTarget.reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="px-3 py-1.5 border rounded-md text-sm"
      >
        {open ? 'Cerrar' : 'Añadir dirección'}
      </button>

      {open && (
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="grid gap-1 md:col-span-2">
            <label className="text-xs opacity-70">Nombre completo</label>
            <input name="fullName" required className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs opacity-70">Teléfono</label>
            <input name="phone" className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1 md:col-span-2">
            <label className="text-xs opacity-70">Dirección (línea 1)</label>
            <input name="line1" required className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1 md:col-span-2">
            <label className="text-xs opacity-70">Dirección (línea 2)</label>
            <input name="line2" className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs opacity-70">Ciudad</label>
            <input name="city" required className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs opacity-70">Provincia</label>
            <input name="province" required className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs opacity-70">Código Postal</label>
            <input name="postalCode" required className="border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs opacity-70">País</label>
            <input name="country" defaultValue="ES" className="border rounded-md px-3 py-2 text-sm" />
          </div>

          {err && <p className="text-rose-600 text-sm md:col-span-2">{err}</p>}

          <div className="md:col-span-2">
            <button
              className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60"
              disabled={pending}
            >
              {pending ? 'Guardando…' : 'Guardar dirección'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
