'use client'

import { useEffect, useState } from 'react'
import TarjetaPromociones from '@/components/Home/TarjetaPromociones'
import Product from '@/assets/img/product.png'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const productos = [
  { id: 1, img: Product, alt: 'Suplemento 01', nombre: 'Suplemento alimentación 01', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 19.99, precioAntiguo: 24.99 },
  { id: 2, img: Product, alt: 'Suplemento 02', nombre: 'Suplemento alimentación 02', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 17.49, precioAntiguo: 22.99 },
  { id: 3, img: Product, alt: 'Suplemento 03', nombre: 'Suplemento alimentación 03', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 15.99, precioAntiguo: 19.99 },
  { id: 4, img: Product, alt: 'Suplemento 04', nombre: 'Suplemento alimentación 04', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 12.99, precioAntiguo: 16.99 },
  { id: 5, img: Product, alt: 'Suplemento 05', nombre: 'Suplemento alimentación 05', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 13.49, precioAntiguo: 17.49 },
  { id: 6, img: Product, alt: 'Suplemento 06', nombre: 'Suplemento alimentación 06', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 14.25, precioAntiguo: 18.00 },
  { id: 7, img: Product, alt: 'Suplemento 07', nombre: 'Suplemento alimentación 07', descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', precioNuevo: 11.99, precioAntiguo: 15.49 },
];

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
              width: `${(productos.length * 100) / cardsToShow}%`,
              transform: `translateX(-${(100 / productos.length) * startIndex}%)`,
            }}
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="px-1.5 sm:px-2"
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
      <a href="/tratamientos" className="text-sm text-sky-600 hover:underline">ver más tratamientos</a>
    </section>
  )
}
