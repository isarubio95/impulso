'use client'

import { useEffect, useState } from 'react'
import TarjetaPromociones from '@/components/TarjetaPromociones'
import Product from '@/assets/img/product.png'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const productos = [
  {
    id: 1,
    img: Product,
    alt: 'Suplemento 01',
    nombre: 'Suplemento alimentación 01',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 19.99,
    precioAntiguo: 24.99,
  },
  {
    id: 2,
    img: Product,
    alt: 'Suplemento 02',
    nombre: 'Suplemento alimentación 02',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 17.49,
    precioAntiguo: 22.99,
  },
  {
    id: 3,
    img: Product,
    alt: 'Suplemento 03',
    nombre: 'Suplemento alimentación 03',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 15.99,
    precioAntiguo: 19.99,
  },
  {
    id: 4,
    img: Product,
    alt: 'Suplemento 04',
    nombre: 'Suplemento alimentación 04',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 12.99,
    precioAntiguo: 16.99,
  },
  {
    id: 5,
    img: Product,
    alt: 'Suplemento 04',
    nombre: 'Suplemento alimentación 04',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 12.99,
    precioAntiguo: 16.99,
  },
  {
    id: 6,
    img: Product,
    alt: 'Suplemento 04',
    nombre: 'Suplemento alimentación 04',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 12.99,
    precioAntiguo: 16.99,
  },
  {
    id: 7,
    img: Product,
    alt: 'Suplemento 04',
    nombre: 'Suplemento alimentación 04',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    precioNuevo: 12.99,
    precioAntiguo: 16.99,
  },
]

export default function Promociones() {
  const [cardsToShow, setCardsToShow] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const updateCardsToShow = () => {
      setCardsToShow(window.innerWidth >= 768 ? 3 : 1)
    }
    updateCardsToShow()
    window.addEventListener('resize', updateCardsToShow)
    return () => window.removeEventListener('resize', updateCardsToShow)
  }, [])

  const totalPages = Math.ceil(productos.length / cardsToShow)
  const startIndex = currentPage * cardsToShow

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  return (
    <section className="bg-rose-50 py-20 md:px-20 lg:px-30 flex flex-col items-center gap-6">
      {/* Controles y Carrusel */}
      <div className="flex justify-center items-center gap-4 w-full max-w-6xl">
        <button
            aria-label="Anterior"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`p-2 h-fit transition ${
                currentPage === 0
                ? 'opacity-30 pointer-events-none'
                : 'cursor-pointer hover:scale-105'
            }`}
        >
          <FaChevronLeft className="text-3xl text-stone-600 drop-shadow-md hover:drop-shadow-lg hover:text-rose-900 transition" />
        </button>

        <div className="overflow-x-hidden w-full pb-8 -mb-2">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${(productos.length * 100) / cardsToShow}%`,
              transform: `translateX(-${(100 / productos.length) * startIndex}%)`,
            }}
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="px-2"
                style={{
                  flex: `0 0 ${100 / productos.length}%`,
                  maxWidth: `${100 / productos.length}%`,
                }}
              >
                <TarjetaPromociones
                  imagen={producto.img}
                  alt={producto.alt}
                  titulo={producto.nombre}
                  descripcion={producto.descripcion}
                  precioNuevo={producto.precioNuevo}
                  precioAntiguo={producto.precioAntiguo}
                />
              </div>
            ))}
          </div>
        </div>

        <button
            aria-label="Siguiente"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className={`p-2 h-fit transition ${
            currentPage >= totalPages - 1
            ? 'opacity-30 pointer-events-none'
            : 'cursor-pointer hover:scale-105'
        }`}
        >
            <FaChevronRight className="text-3xl text-stone-600 drop-shadow-md hover:drop-shadow-lg hover:text-rose-900 transition" />
        </button>
      </div>

      {/* Bullets */}
      <div className="flex gap-2">
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
    </section>
  )
}
