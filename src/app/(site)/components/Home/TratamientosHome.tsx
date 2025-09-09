'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CTA from '../CTA'
import presoterapia from '@/assets/img/presoterapia.png'
import terapeuta from '@/assets/img/terapeuta.png'
import TarjetaTratamientos from './TarjetaTratamientos'

type ApiTreatment = {
  slug: string
  title: string
  desc: string | null
  imageAlt: string | null
  imageUrl: string | null
}

const colorCycle = ['green', 'pink', 'red', 'green'] as const
type Color = (typeof colorCycle)[number]

export default function TratamientosHome() {
  const [items, setItems] = useState<ApiTreatment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/treatments/promoted', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiTreatment[] = await res.json()
        if (!cancelled) setItems(data)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) setError('No se pudieron cargar los tratamientos.')
        console.error('Error cargando tratamientos:', msg)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="py-16 px-4 flex flex-col items-center gap-8 bg-white">
      {/* Título */}
      <h2 className="text-center text-2xl font-semibold text-stone-800 border-b border-rose-300 pb-2">
        Nuestros Tratamientos
      </h2>

      {/* Grid tratamientos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
        {items === null && !error && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-stone-100 animate-pulse" />
            ))}
          </>
        )}

        {error && (
          <div className="col-span-full text-center text-sm text-rose-700">{error}</div>
        )}

        {items?.length === 0 && !error && (
          <div className="col-span-full text-center text-sm text-stone-500">
            Próximamente añadiremos tratamientos destacados.
          </div>
        )}

        {items?.map((t, index) => {
          const color: Color = colorCycle[index % colorCycle.length]
          return (
            <TarjetaTratamientos
              key={t.slug}
              slug={t.slug}
              titulo={t.title}
              descripcion={t.desc ?? ''}
              alt={t.imageAlt ?? t.title}
              // Si tu Tarjeta acepta URL, cámbialo por: imagenUrl={t.imageUrl ?? ''}
              imagen={presoterapia}
              color={color}
            />
          )
        })}
      </div>

      {/* Ver más */}
      <Link href="/tienda" className="text-sm text-sky-600 hover:underline">
        Ver más productos
      </Link>

      {/* Citas personalizadas */}
      <div className="flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow duration-300 max-w-3xl mt-4 bg-rose-100 rounded-xl pb-0 p-6 shadow-sm">
        <Image
          src={terapeuta}
          alt="Cita personalizada"
          className="rounded-lg w-40 h-auto object-cover"
        />
        <div className="pb-6">
          <h3 className="font-semibold text-lg text-stone-700 mb-2">Citas Personalizadas</h3>
          <p className="text-sm text-stone-600 mb-4">
            En Impulso, hacemos una pequeña entrevista previa para valorar tus objetivos y
            ofrecerte un plan de tratamientos. Ofrecemos atención personalizada en función de tus
            necesidades desde el primer contacto.
          </p>
          <div className="w-fit">
            <CTA href="/citas" texto="Ver más" />
          </div>
        </div>
      </div>
    </section>
  )
}
