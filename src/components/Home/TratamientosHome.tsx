'use client'

import Image from 'next/image'
import Link from 'next/link'
import CTA from '@/components/CTA'
import presoterapia from '@/assets/img/presoterapia.png'
import terapeuta from '@/assets/img/terapeuta.png'
import TarjetaTratamientos from '@/components/Home/TarjetaTratamientos'

const tratamientos = [ 
  { 
    slug: 'presoterapia',
    titulo: 'Presoterapia', 
    alt: 'Terapeuta aplicando presoterapia a un paciente', 
    descripcion: 'Lorem ipsum dolor sit amet consectetur. Fermentum arcu ultricies facilisi ultrices suscipit.', 
    color: 'green' 
  },
  { 
    slug: 'masaje-paihuen',
    titulo: 'Masaje Paihuen', 
    alt: 'Masaje Paihuen', 
    descripcion: 'Lorem ipsum dolor sit amet consectetur. Fermentum arcu ultricies facilisi ultrices suscipit.', 
    color: 'pink' 
  },
  { 
    slug: 'tratamiento-facial',
    titulo: 'Tratamiento Facial', 
    alt: 'Tratamiento Facial', 
    descripcion: 'Lorem ipsum dolor sit amet consectetur. Fermentum arcu ultricies facilisi ultrices suscipit.', 
    color: 'red' 
  },
  { 
    slug: 'radiofrecuencia-448k-bono-4-sesiones',
    titulo: 'Radiofrecuencia 448k bono 4 sesiones', 
    alt: 'Radiofrecuencia 448k', 
    descripcion: 'Lorem ipsum dolor sit amet consectetur. Fermentum arcu ultricies facilisi ultrices suscipit.', 
    color: 'green' 
  }
]


export default function TratamientosHome() {
  return (
    <section className="py-16 px-4 flex flex-col items-center gap-8 bg-white">
      {/* Título */}
      <h2 className="text-center text-2xl font-semibold text-stone-800 border-b border-rose-300 pb-2">Nuestros Tratamientos</h2>

      {/* Grid tratamientos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
        
        {tratamientos.map((tarjeta, index) => (
          <TarjetaTratamientos 
            slug={tarjeta.slug}
            key={index}
            titulo = {tarjeta.titulo} 
            descripcion={tarjeta.descripcion}
            alt = {tarjeta.alt}
            imagen = {presoterapia}
            color = {tarjeta.color}
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

      {/* Citas personalizadas */}
      <div className="flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow duration-300 max-w-3xl mt-4 bg-rose-100 rounded-xl pb-0 p-6 shadow-sm">
        <Image src={terapeuta} alt="Cita personalizada" className="rounded-lg w-40 h-auto object-cover" />
        <div className='pb-6'>
          <h3 className="font-semibold text-lg text-stone-700 mb-2">Citas Personalizadas</h3>
          <p className="text-sm text-stone-600 mb-4">
            En Impulso, hacemos una pequeña entrevista previa para valorar tus objetivos y ofrecerte un plan de tratamientos. Ofrecemos atención personalizada en función de tus necesidades desde el primer contacto.
          </p>
          <div className='w-fit'>
            <CTA href='/citas' texto="Ver más"/>
          </div>
        </div>
      </div>
    </section>
  )
}
