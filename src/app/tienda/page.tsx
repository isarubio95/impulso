import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tienda | Impulso Estética",
  description: "Explora nuestros productos y promociones",
};

const productos = [
  { slug: "suplemento-01", nombre: "Suplemento 01", precio: 19.99, img: "/product.png" },
  { slug: "suplemento-02", nombre: "Suplemento 02", precio: 17.49, img: "/product.png" },
  { slug: "crema-hidratante", nombre: "Crema Hidratante", precio: 15.99, img: "/product.png" },
];

export default function TiendaPage() {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-stone-800">Tienda</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map((p) => (
          <Link
            key={p.slug}
            href={`/tienda/${p.slug}`}
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition p-4"
          >
            <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-stone-100">
              <Image src={p.img} alt={p.nombre} fill className="object-contain p-4" />
            </div>
            <h3 className="text-sm font-medium text-stone-800">{p.nombre}</h3>
            <p className="text-sm text-stone-600">€{p.precio.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
