'use client'

import { useRef, useTransition, useState } from 'react'

type Props = {
  id: string
  defaultChecked: boolean
  // server action: (FormData) => Promise<{ ok: boolean; error?: string }>
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>
}

export default function PromoteCheckbox({ id, defaultChecked, action }: Props) {
  const [checked, setChecked] = useState(defaultChecked)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    // optimista
    setChecked(next)

    const fd = new FormData()
    fd.append('id', id)
    fd.append('nextValue', String(next))

    startTransition(async () => {
      const res = await action(fd)
      if (!res.ok) {
        // Revertir y avisar
        setChecked(!next)
        // Puedes usar un toast; dejo alert por simplicidad
        alert(res.error ?? 'No se pudo cambiar la promoción')
      }
    })
  }

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        ref={inputRef}
        type="checkbox"
        className="h-4 w-4 accent-emerald-600"
        checked={checked}
        disabled={isPending}
        onChange={onChange}
      />
      <span className="text-xs text-stone-600">
        {checked ? 'Sí' : 'No'}
      </span>
    </label>
  )
}
