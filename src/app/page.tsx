import Image from 'next/image'
import HeroImg from '@/assets/img/hero-image.png'
import CTA from '@/components/CTA'
import { FaShoppingBag } from 'react-icons/fa'

export default function HomePage() {
  return (
    <section className="bg-stone-50 py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-8">
        
        {/* Texto */}
        <div className="text-center md:text-left space-y-6">
          <h1 className="text-4xl font-bold text-rose-600">IMPULSO</h1>
          <p className="text-xl font-medium text-stone-700">
            Centro de Bienestar en Logroño
          </p>
          <CTA texto="Ir a la tienda" icono={<FaShoppingBag className="w-4 h-4 text-rose-50" />} />
        </div>

        {/* Imagen */}
        <div className="relative w-full h-80 md:h-[400px]">
          <Image
            src={HeroImg}
            alt="Mujer sonriendo con manzana"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
}
