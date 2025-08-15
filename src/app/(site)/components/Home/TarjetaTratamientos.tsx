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

export default function TarjetaTratamiento({ slug, imagen, alt, titulo, descripcion, color } : TratamientosProps) {
    const bgClass = bgMap[color] ?? 'bg-green-100' // fallback
    return (
      <Link href={`tratamientos/${slug}`}>
        <div className={`${bgClass} p-6 rounded-xl shadow-sm hover:shadow-md hover:scale-101 transition-all duration-300 relative cursor-pointer`}>
            <h3 className="text-lg font-semibold text-stone-700 mb-2">{titulo}</h3>
            <p className="text-sm text-stone-600">{descripcion}</p>
            <Image
                src={imagen}
                alt={alt}
                fill
                className="p-3 object-contain max-h-full w-auto opacity-10"
            />
        </div>
      </Link>
    )
}