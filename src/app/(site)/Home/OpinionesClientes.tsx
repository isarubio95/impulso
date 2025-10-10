'use client'

import { useEffect, useState } from 'react'
import OpinionCliente from './OpinionCliente'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const opiniones = [
  { id: 1, nombre: 'Noelia Pinillos Ortiz', texto: 'El trato ha sido excelente desde el primer momento. Muy recomendable, volveré sin duda.' },
  { id: 2, nombre: 'Isaías Rubio Hernández', texto: 'Servicio muy profesional y ambiente muy agradable. Me he sentido como en casa.' },
  { id: 3, nombre: 'Marta González Rivera', texto: 'Llevaba tiempo buscando un sitio así. Me han ayudado muchísimo, gracias por todo.' },
  { id: 4, nombre: 'Luis Fernández Soler', texto: 'Atención personalizada y muy cercana. Todo muy limpio y bien cuidado.' },
  { id: 5, nombre: 'Clara Muñoz Sanz', texto: 'Increíble experiencia, el equipo transmite mucha confianza y profesionalidad.' },
  { id: 6, nombre: 'Javier Ortega Ruiz', texto: 'He probado varios sitios y este ha sido, sin duda, el mejor. Muy contento con el resultado.' },
  { id: 7, nombre: 'Elena Navarro Díaz', texto: 'Un 10 en todos los aspectos. Lo recomiendo a todo el mundo que busque calidad y buen trato.' },
]

export default function OpinionesClientes() {
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

  const totalPages = Math.ceil(opiniones.length / cardsToShow)
  const startIndex = currentPage * cardsToShow

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  return (
    <section className="bg-stone-100 py-20 pl-2.5 pr-0 sm:px-2 sm:pr-2 lg:px-30 flex flex-col items-center gap-8">
      <h2 className="text-2xl pl-2 pr-2.5 text-center font-semibold text-stone-800 border-b border-rose-300 pb-2">
        Opiniones de nuestros clientes
      </h2>

      {/* Carrusel con controles */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 w-full max-w-5xl">

        {/* Flecha izquierda */}
        <button
          aria-label="Anterior"
          onClick={handlePrev}
          disabled={currentPage === 0}
          className={`hidden sm:flex p-2 h-fit lg:mr-4 transition ${
            currentPage === 0 ? 'opacity-30 pointer-events-none' : 'cursor-pointer hover:scale-105'
          }`}
        >
          <FaChevronLeft className="text-3xl text-stone-600 drop-shadow-md hover:text-rose-900 transition" />
        </button>

        {/* Carrusel */}
        <div className="scrollbar-hide overflow-x-auto sm:overflow-hidden w-full pb-8 -mb-8 rounded-2xl scroll-smooth pr-8 sm:pr-0">
          <div
            className="flex w-fit sm:w-full sm:transition-transform sm:duration-500 ease-in-out"
            style={{
              width: `${(opiniones.length * 100) / cardsToShow}%`,
              transform: `translateX(-${(100 / opiniones.length) * startIndex}%)`,
            }}
          >
            {opiniones.map((opinion) => (
              <div
                key={opinion.id}
                className="px-2"
                style={{
                  flex: `0 0 ${100 / opiniones.length}%`,
                  maxWidth: `${100 / opiniones.length}%`,
                }}
              >
                <OpinionCliente nombre={opinion.nombre} texto={opinion.texto} />
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha */}
        <button
          aria-label="Siguiente"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className={`hidden sm:flex p-2 lg:ml-4 h-fit transition ${
            currentPage >= totalPages - 1 ? 'opacity-30 pointer-events-none' : 'cursor-pointer hover:scale-105'
          }`}
        >
          <FaChevronRight className="text-3xl text-stone-600 drop-shadow-md hover:text-rose-900 transition" />
        </button>
      </div>
    </section>
  )
}
