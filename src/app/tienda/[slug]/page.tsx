import Image from "next/image";

// Datos simulados (luego pueden venir de una API o DB)
const productos = [
  { slug: "suplemento-01", nombre: "Suplemento 01", precio: 19.99, descripcion: "Suplemento para energía", img: "/product.png" },
  { slug: "suplemento-02", nombre: "Suplemento 02", precio: 17.49, descripcion: "Suplemento para recuperación", img: "/product.png" },
  { slug: "crema-hidratante", nombre: "Crema Hidratante", precio: 15.99, descripcion: "Hidrata tu piel", img: "/product.png" },
];

export default function ProductoPage({ params }: { params: { slug: string } }) {
  const producto = productos.find((p) => p.slug === params.slug);

  if (!producto) {
    return <div className="p-6 text-center">Producto no encontrado</div>;
  }

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
          <Image src={producto.img} alt={producto.nombre} fill className="object-contain p-6" />
        </div>

        <div>
          <h1 className="text-3xl font-semibold mb-4 text-stone-800">{producto.nombre}</h1>
          <p className="text-lg font-medium text-rose-500 mb-6">€{producto.precio.toFixed(2)}</p>
          <p className="text-stone-600 mb-6">{producto.descripcion}</p>
          <button className="bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600">
            Añadir al carrito
          </button>
        </div>
      </div>
    </section>
  );
}
