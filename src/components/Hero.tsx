import Image from 'next/image'
import HeroImg from '@/assets/img/hero-image.png'
import LogoHero from '@/assets/img/logo-hero.png'
import CTA from '@/components/CTA'
import { FaShoppingBag } from 'react-icons/fa'

export default function Hero() {
  return (
    <section className="h-[80vh] flex justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 50%, #E7E5E4 100%)'
      }}
    >
      <div className="w-full h-full flex justify-center items-center gap-10">
        
        {/* Texto */}
        <div className='w-1/2 h-full flex flex-col items-end'>
          <div className="w-fit h-full py-16 flex items-end text-center relative">
            <Image
                src={LogoHero}
                alt="Logotipo de la empresa"
                className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
                quality={100}
            />
            <div className='space-y-6'>
              <h1 className="text-4xl font-bold text-rose-800">IMPULSO</h1>
              <p className="text-xl font-medium text-stone-700">
                Centro de Bienestar en Logroño
              </p>
              <CTA texto="Ir a la tienda" icono={<FaShoppingBag className="w-4 h-4 text-rose-50" />} />
            </div>        
          </div>
        </div>
        
        {/* Imagen */}
        <div className="hidden sm:flex w-1/2 sm:pl-10 md:pl-16 h-full items-end justify-start">
          <div className="relative h-[80%] w-full">
            <Image
              src={HeroImg}
              alt="Mujer sonriendo con manzana"
              fill
              className="object-left-bottom object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
