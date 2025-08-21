import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import AddToCartButton from "../components/cart/AddToCartButton";

type TarjetaProductoProps = {
  slug: string;
  nombre: string;
  precio: number;
  img: string | StaticImageData;
  descripcion?: string;
  className?: string;
};

export default function TarjetaProducto({
  slug,
  nombre,
  precio,
  img,
  descripcion,
  className = "",
}: TarjetaProductoProps) {
  const precioFmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(precio);

  return (
    <div className={`flex h-full flex-col rounded-xl bg-white shadow-md ring-1 ring-black/10 hover:shadow-lg transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${className}`}>
      
      {/* Imagen */}
      <Link href={`/tienda/${slug}`} 
        className="bg-[radial-gradient(ellipse_at_center,_theme(colors.stone.50)_20%,_theme(colors.stone.200)_70%)]
          relative block aspect-square max-h-[220px] overflow-hidden rounded-t-xl">
        <Image
          src={img}
          alt={nombre}
          fill
          sizes="(min-width: 1024px) 250px, (min-width: 768px) 33vw, 50vw"
          className="object-contain drop-shadow-[2px_2px_5px_rgba(0,0,0,0.15)] p-6"
        />
      </Link>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-3 py-4 px-5">
        <h3 className="text-base font-semibold text-stone-800 text-center line-clamp-2" itemProp="name">
          {nombre}
        </h3>

        {descripcion && (
          <p className="text-sm text-stone-600 line-clamp-2" itemProp="description">
            {descripcion}
          </p>
        )}

        <p
          className="text-base text-emerald-700"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="priceCurrency" content="EUR" />
          <span itemProp="price" content={String(precio)}>
            {precioFmt}
          </span>
        </p>

        {/* Empuja el botón al fondo */}
        <div className="mt-auto">
          <AddToCartButton
            id={slug}
            name={nombre}
            price={precio}
            image={typeof img === "string" ? img : img.src}
            qty={1}
          />
        </div>
      </div>
    </div>
  );
}
