import Image from 'next/image'
import HeroImg from '@/assets/img/hero-image.png'
import LogoHero from '@/assets/img/logo-hero.png'
import CTA from '../components/CTA'
import { FaShoppingBag } from 'react-icons/fa'

export default function Hero() {
  return (
    <section
      className="h-[80vh] overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #ffffff 80%, #E7E5E4 100%)' }}
    >
      {/* Contenedor principal: mantiene altura completa */}
      <div className="container sm:px-10 max-w-3xl mx-auto h-full grid grid-cols-1 sm:grid-cols-2 gap-18 px-4 items-stretch">
        
        {/* Bloque texto + CTA con logo de fondo */}
        <div className="order-2 w-full h-full sm:order-1 flex items-center justify-center">
          <div className="relative isolate w-fit max-w-lg text-center flex flex-col items-center sm:items-start justify-center">
            {/* Logo como fondo del bloque, centrado y detrás del texto */}
            <Image
              src={LogoHero}
              alt="Logotipo de Impulso"
              priority
              className="pointer-events-none select-none absolute inset-0 m-auto opacity-8 -z-10 object-contain"
              sizes="(max-width: 640px) 90vw, 40vw"
            />

            <div className="z-10 flex flex-col items-center gap-6">
              <h1 className="text-5xl font-semibold text-rose-800">IMPULSO</h1>
              <p className="text-xl font-medium text-stone-700">
                Centro de Bienestar en Logroño
              </p>
              <div className="w-fit">
                <CTA
                  href="/tienda"
                  texto="Ir a la tienda"
                  icono={<FaShoppingBag className="w-4 h-4 text-rose-50" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Imagen derecha con borde inferior */}
        <div className="order-1 sm:order-2 hidden sm:flex h-full items-center">
          <div className="relative h-[70%] min-h-[420px] w-full flex border-b-2 border-rose-700">
            <Image
              src={HeroImg}
              alt="Mujer sonriendo con manzana"
              fill
              className=" object-contain drop-shadow-sm"
              priority
              sizes="(max-width: 1024px) 50vw, 600px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
