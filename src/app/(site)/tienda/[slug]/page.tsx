import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import ProductPlaceholder from "@/assets/img/product.png";
import { absUrl } from "@/lib/abs-url";
import AddToCartButton from "@/app/(site)/components/cart/AddToCartButton";

type Params = { slug: string };

type CompositionItem = {
  nombre: string;
  cantidad: string;
};

type ApiProduct = {
  slug: string;
  name: string;
  desc: string;
  longDesc: string;
  price: string | number;
  imageUrl?: string | null;
  composition?: CompositionItem[];
};

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const url = await absUrl(`/api/products/${slug}`);
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return { title: "Producto no encontrado | Impulso" };
  const p = (await r.json()) as ApiProduct;
  return { title: `${p.name} | Impulso`, description: String(p.desc).slice(0, 150) };
}

export default async function ProductoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const url = await absUrl(`/api/products/${slug}`);
  const res = await fetch(url, { cache: 'no-store' });

  if (res.status === 404) {
    return (
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold text-stone-800 inline-block border-b border-rose-300 pb-2">Producto no encontrado</h1>
          <Link href="/tienda" className="text-sm text-sky-600 hover:underline">Volver a la tienda</Link>
        </div>
      </section>
    );
  }

  const producto = (await res.json()) as ApiProduct;

  const imgSrc = producto.imageUrl && producto.imageUrl.trim() !== ''
    ? producto.imageUrl
    : ProductPlaceholder;

  // Asegura string para el carrito (Next static image -> usa .src)
  const imageForCart: string =
    typeof imgSrc === 'string' ? imgSrc : (imgSrc as StaticImageData).src;

  return (
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-top gap-8">
        <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
          <Image
            src={imgSrc}
            alt={producto.name}
            fill
            className="object-contain p-6 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-stone-800 inline-block">{producto.name}</h1>
          <p className="text-stone-600">{producto.longDesc}</p>

          {Array.isArray(producto.composition) && producto.composition.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mt-3 mb-1.5">Composición</h2>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 mt-1">
                {producto.composition.map((it: CompositionItem, i: number) => (
                  <li key={i}>
                    <span className="font-medium">{it.nombre}</span> — {it.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-lg text-emerald-700 mt-3">{Number(producto.price).toFixed(2)} €</p>

          <AddToCartButton
            id={slug}
            name={producto.name}
            price={Number(producto.price)}
            image={imageForCart}
            qty={1}
          />

          <Link href="/tienda" className="text-sm text-sky-700 hover:underline mt-4">Volver a la tienda</Link>
        </div>
      </div>
    </section>
  );
}
