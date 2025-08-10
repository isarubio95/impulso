import TarjetaProducto from "@/app/tienda/TarjetaProducto"
import Product from '@/assets/img/product.png'
import { FiSearch } from "react-icons/fi";

export const metadata = {
  title: "Tienda | Impulso Estética",
  description: "Explora nuestros productos y promociones",
}

const productos = [
  { slug: "suplemento-01", nombre: "Suplemento 01", precio: 19.99, img: Product, descripcion: "Suplemento para aumentar la energía y el rendimiento diario." },
  { slug: "suplemento-02", nombre: "Suplemento 02", precio: 17.49, img: Product, descripcion: "Fórmula para favorecer la recuperación muscular y física." },
  { slug: "crema-hidratante", nombre: "Crema Hidratante", precio: 15.99, img: Product, descripcion: "Hidrata en profundidad, dejando la piel suave y tersa." },
  { slug: "crema-de-manos", nombre: "Crema de Manos", precio: 15.99, img: Product, descripcion: "Nutre y protege las manos frente a la sequedad." },
  { slug: "aceite-corporal", nombre: "Aceite Corporal", precio: 22.50, img: Product, descripcion: "Aceite nutritivo que suaviza y revitaliza la piel." },
  { slug: "serum-facial", nombre: "Sérum Facial", precio: 29.99, img: Product, descripcion: "Reduce arrugas y mejora la firmeza de la piel." },
  { slug: "mascarilla-hidratante", nombre: "Mascarilla Hidratante", precio: 12.75, img: Product, descripcion: "Aporta hidratación intensa y luminosidad al rostro." },
  { slug: "gel-limpiador", nombre: "Gel Limpiador", precio: 10.99, img: Product, descripcion: "Limpia suavemente eliminando impurezas y exceso de grasa." },
]


export default function TiendaPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-2xl font-semibold text-stone-800 inline-block">
          Tienda
        </h1>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Barra de controles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-stone-600">
            Descubre nuestros productos y promociones.
          </p>
          <div className="flex items-center gap-3">
            <select
              aria-label="Ordenar productos"
              className="border rounded-md px-3 h-9 py-2 text-sm text-stone-700 bg-white"
              defaultValue="featured"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Buscar…"
                className="pl-9 border rounded-md px-3 py-2 text-sm text-stone-700 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Grid usando el nuevo componente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p) => (
            <TarjetaProducto
              key={p.slug}
              slug={p.slug}
              nombre={p.nombre}
              precio={p.precio}
              descripcion={p.descripcion}
              img={p.img}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
