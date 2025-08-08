import Image, { StaticImageData } from 'next/image'
import CTA from '@/components/CTA'

type PromocionesProps = {
  imagen: StaticImageData
  alt: string
  titulo: string
  descripcion: string
  precioNuevo: number
  precioAntiguo: number
}

export default function TarjetaPromociones({
  imagen,
  alt,
  titulo,
  descripcion,
  precioNuevo,
  precioAntiguo,
}: PromocionesProps) {
  return (
    <div className="bg-white rounded-xl shadow-xl sm:shadow-md hover:shadow-xl transition-shadow duration-300 text-center space-y-4">
        <div className="bg-stone-200 w-full h-40 p-4 rounded-tl-xl rounded-tr-xl flex items-center justify-center">
        <Image
            src={imagen}
            alt={alt}
            className="object-contain max-h-full w-auto"
        />
        </div>
        <div className='px-4 pb-4 flex flex-col gap-2'>
        <h2 className="text-lg font-bold text-rose-800">{titulo}</h2>
        <p className="text-sm text-stone-700">{descripcion}</p>
        <div className="flex justify-center gap-2 items-baseline">
            <span className="text-rose-900 text-lg font-bold">
            {precioNuevo.toFixed(2)} €
            </span>
            <span className="line-through text-sm text-stone-400">
            {precioAntiguo.toFixed(2)} €
            </span>
        </div>
        <div className='pt-1'>
            <CTA texto="VER MÁS"/>
        </div>
        </div>
      
    </div>
  )
}
