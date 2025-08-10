import Image, { StaticImageData } from "next/image"
import Link from "next/link"

type TarjetaProductoProps = {
  slug: string
  nombre: string
  precio: number
  img: string | StaticImageData
  descripcion?: string
  className?: string
}

export default function TarjetaProducto({
  slug,
  nombre,
  precio,
  img,
  descripcion,
  className = ""
}: TarjetaProductoProps) {
  const precioFmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(precio)

  return (
    <Link
      href={`/tienda/${slug}`}
      aria-label={`${nombre} por ${precioFmt}`}
      className={`group flex flex-col gap-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:scale-[1.02] transition-transform duration-300 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${className}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="aspect-square mb-2 relative overflow-hidden rounded-lg bg-stone-100">
        <Image
          src={img}
          alt={nombre}
          fill
          sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, 50vw"
          className="object-contain drop-shadow-[2px_2px_5px_rgba(0,0,0,0.15)] p-4 transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <h3 className="text-md mb-0 text-stone-800 line-clamp-2" itemProp="name">
        {nombre}
      </h3>

      {descripcion && (
        <p className="text-sm text-stone-600 line-clamp-2" itemProp="description">
          {descripcion}
        </p>
      )}

      <p
        className="text-sm text-emerald-700"
        itemProp="offers"
        itemScope
        itemType="https://schema.org/Offer"
      >
        <span itemProp="priceCurrency" content="EUR" />
        <span itemProp="price" content={String(precio)}>
          {precioFmt}
        </span>
      </p>
    </Link>
  )
}
