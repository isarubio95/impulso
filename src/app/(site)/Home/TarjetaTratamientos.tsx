import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

type TratamientosProps = {
  slug: string
  imagen: StaticImageData
  alt: string
  titulo: string
  descripcion: string
  color: string
}

const bgMap: Record<string, string> = {
  green: 'bg-green-100',
  pink:  'bg-pink-100',
  red:   'bg-red-100',
}

export default function TarjetaTratamiento({
  slug, imagen, alt, titulo, descripcion, color
}: TratamientosProps) {
  const bgClass = bgMap[color] ?? 'bg-green-100'

  return (
    <Link href={`/tratamientos/${slug}`} className="flex h-full">
      <div
        className={[
          'relative w-full flex h-full rounded-2xl shadow-sm hover:shadow-md', bgClass,
          'py-6 px-10 transition-transform duration-300 hover:scale-[1.01]',
          'min-h-[180px] md:min-h-[200px] lg:min-h-[220px] flex flex-col'
        ].join(' ')}
      >
        {/* Imagen decorativa de fondo */}
        <Image
          src={imagen}
          alt={alt}
          fill
          className="absolute p-4 w-full h-full object-contain opacity-10 pointer-events-none select-none"
        />

        {/* Contenido por encima de la imagen */}
        <div className="flex flex-col justify-center h-full">
          <h3 className="text-lg font-semibold text-stone-700 mb-2 line-clamp-2">
            {titulo}
          </h3>
          <p className="text-sm text-stone-600 line-clamp-3">
            {descripcion}
          </p>
        </div>

      </div>
    </Link>
  )
}
