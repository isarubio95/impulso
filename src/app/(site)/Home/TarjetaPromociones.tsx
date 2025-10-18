import Image from 'next/image'
import CTA from '../components/CTA'

type PromocionesProps = {
  imagen: string
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
  descripcion,
  precioNuevo,
  precioAntiguo,
  producto,
}: PromocionesProps) {
  return (
    // 1. Contenedor principal: ahora es la propia tarjeta.
    //    Le añadimos h-full para que ocupe la altura de su padre y flex flex-col para organizar el contenido.
    <div className='bg-white rounded-2xl ring-1 ring-black/10 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col'>
      
      {/* Cabecera imagen (altura fija) */}
      <div className="bg-[radial-gradient(ellipse_at_center,_theme(colors.stone.100)_20%,_theme(colors.stone.200)_70%)] w-full h-44 p-5 rounded-t-xl flex items-center justify-center shrink-0">
        <Image
          src={imagen}
          alt={alt}
          width={500}
          height={500}
          className="object-contain max-h-full w-auto drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
        />
      </div>

      {/* 2. Contenido principal que crece */}
      {/* Añadimos flex-grow para que esta sección ocupe todo el espacio vertical sobrante. */}
      <div className="p-4 flex flex-col text-center flex-grow">
        <h2 className="text-lg font-bold text-rose-800">{titulo}</h2>
        <p className="text-sm text-stone-700 leading-5 mt-2">
          {descripcion}
        </p>

        {/* 3. Contenedor para precios y botón */}
        {/* Añadimos mt-auto para empujar este bloque al fondo de la tarjeta. ¡Esta es la magia! ✨ */}
        <div className="mt-auto pt-4">
          <div className="flex justify-center gap-2 items-baseline">
            <span className="text-emerald-600 text-lg font-semibold">{precioNuevo.toFixed(2)} €</span>
            <span className="line-through text-sm text-stone-400">{precioAntiguo.toFixed(2)} €</span>
          </div>

          <div className="pt-3 flex w-full mx-auto">
            <CTA href={`/tienda/${producto}`} texto="Ver más" />
          </div>
        </div>
      </div>
    </div>
  )
}