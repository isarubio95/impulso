'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TarjetaPromociones from './TarjetaPromociones'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import placeholder from '@/assets/img/product.png'

type ApiPromo = {
  id: string
  title: string
  blurb?: string | null
  priceNew?: string | number | null
  priceOld?: string | number | null
  ctaUrl?: string | null
  product?: { slug: string; name: string; imageUrl?: string | null } | null // <- opcional
}

export default function Promociones() {
  const [cardsToShow, setCardsToShow] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)
  const [promos, setPromos] = useState<ApiPromo[]>([])

  useEffect(() => {
    const updateCardsToShow = () => {
      setCardsToShow(window.innerWidth >= 768 ? 3 : 1)
    }
    updateCardsToShow()
    window.addEventListener('resize', updateCardsToShow)
    return () => window.removeEventListener('resize', updateCardsToShow)
  }, [])

  useEffect(() => {
    fetch('/api/promotions?includeProduct=1', { cache: 'no-store' })
      .then(r => r.json())
      .then(setPromos)
      .catch(() => setPromos([]))
  }, [])

  const totalPages = Math.ceil(promos.length / cardsToShow)
  const startIndex = currentPage * cardsToShow

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  return (
    <section className="bg-rose-50 py-20 pl-2.5 pr-0 sm:px-2 sm:pr-2 flex flex-col items-center gap-8">
      {/* Controles y Carrusel */}
      <div className="flex justify-center items-center gap-4 w-full max-w-5xl">
        <button
            aria-label="Anterior"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`hidden sm:flex p-2 h-fit lg:mr-4 transition ${
                currentPage === 0
                ? 'opacity-30 pointer-events-none'
                : 'cursor-pointer hover:scale-105'
            }`}
        >
          <FaChevronLeft className="text-3xl text-stone-600 drop-shadow-md hover:drop-shadow-lg hover:text-rose-900 transition" />
        </button>

        <div className="scrollbar-hide overflow-x-auto sm:overflow-hidden w-full pb-8 -mb-8 rounded-2xl scroll-smooth pr-8 sm:pr-0">
          <div
            className="flex w-fit sm:w-full sm:transition-transform sm:duration-500 ease-in-out"
            style={{
              width: `${(promos.length * 100) / cardsToShow}%`,
              transform: `translateX(-${(100 / promos.length) * startIndex}%)`,
            }}
          >
            {promos.map((promo) => {
              const slug = promo.product?.slug || (promo.ctaUrl?.startsWith('/tienda/') ? promo.ctaUrl.split('/').pop()! : '')
              const imagen = promo.product?.imageUrl ?? (typeof placeholder === 'string' ? placeholder : placeholder.src)

              return (
                <div key={promo.id} className="px-1.5 sm:px-2.5" style={{ flex: `0 0 ${100 / Math.max(promos.length,1)}%`, maxWidth: `${100 / Math.max(promos.length,1)}%` }}>
                  <TarjetaPromociones
                    imagen={imagen}
                    alt={promo.title}
                    titulo={promo.title}
                    producto={slug}
                    descripcion={promo.blurb || ''}
                    precioNuevo={promo.priceNew ? Number(promo.priceNew) : 0}
                    precioAntiguo={promo.priceOld ? Number(promo.priceOld) : 0}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <button
            aria-label="Siguiente"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className={`hidden sm:flex p-2 lg:ml-4 h-fit transition ${
            currentPage >= totalPages - 1
            ? 'opacity-30 pointer-events-none'
            : 'cursor-pointer hover:scale-105'
        }`}
        >
            <FaChevronRight className="text-3xl text-stone-600 drop-shadow-md hover:drop-shadow-lg hover:text-rose-900 transition" />
        </button>
      </div>

      {/* Bullets */}
      <div className="hidden sm:flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentPage
                ? 'bg-rose-600'
                : 'bg-stone-300 hover:bg-stone-400'
            }`}
            aria-label={`Ir a página ${i + 1}`}
          />
        ))}
      </div>

      {/* Ver más */}
      <Link
        href="/tienda" 
        className="text-sm text-sky-600 hover:underline"
      >
        Ver más productos
      </Link>
    </section>
  )
}
