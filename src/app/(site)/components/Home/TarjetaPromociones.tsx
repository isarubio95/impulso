import Image, { StaticImageData } from 'next/image'
import CTA from '../CTA'
import { div } from 'framer-motion/client'

type PromocionesProps = {
  imagen: StaticImageData
  alt: string
  titulo: string
  producto: string
  descripcion: string
  precioNuevo: number
  precioAntiguo: number
}

export default function TarjetaPromociones({
  imagen,
  alt,
  titulo,
  producto,
  descripcion,
  precioNuevo,
  precioAntiguo,
}: PromocionesProps) {
  return (
    <div className='bg-stone-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300'>
      <div className="bg-white rounded-xl h-full flex flex-col">
        {/* Cabecera imagen (altura fija) */}
        <div className="bg-[radial-gradient(ellipse_at_center,_theme(colors.stone.100)_20%,_theme(colors.stone.200)_70%)]
          w-full h-42 p-4 rounded-tl-xl rounded-tr-xl flex items-center justify-center">
          <Image src={imagen} alt={alt} className="object-contain max-h-full w-auto drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]" />
        </div>
      </div>
      <div className='bg-white rounded-2xl text-center'>
        {/* Contenido (crece para rellenar) */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h2 className="text-lg font-bold text-rose-800">{titulo}</h2>

          {/* Descripción con alto fijo (3 líneas aprox) */}
          <div>
            <p className="flex justify-center items-center text-sm text-stone-700 leading-5 min-h-[3.75rem] max-h-[3.75rem] overflow-hidden">
              {descripcion}
            </p>
          </div>
          
          {/* Precios pegados al fondo */}
          <div className="flex justify-center gap-2 items-baseline mt-auto">
            <span className="text-rose-900 text-lg font-bold">{precioNuevo.toFixed(2)} €</span>
            <span className="line-through text-sm text-stone-400">{precioAntiguo.toFixed(2)} €</span>
          </div>

          <div className="pt-1.5 flex w-full mx-auto">
            <CTA href={`/tienda/${producto}`} texto="Ver más" />
          </div>
        </div>
      </div>
    </div> 
  )
}
