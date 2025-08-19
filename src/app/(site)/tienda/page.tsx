import TarjetaProducto from "./TarjetaProducto"
import ProductPlaceholder from '@/assets/img/product.png';
import { FiSearch } from "react-icons/fi";
import { absUrl } from "@/lib/abs-url";

export const metadata = {
  title: "Tienda | Impulso Estética",
  description: "Explora nuestros productos y promociones",
}

type ApiProduct = {
  slug: string;
  name: string;
  desc: string;
  price: string | number;
  imageUrl?: string | null;
};

// Parseo defensivo de JSON para evitar "Unexpected token '<'"
async function readJSON(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Fetch ${res.url} -> ${res.status} ${res.statusText}\n` + body.slice(0, 500))
  }
  if (!ct.includes('application/json')) {
    const body = await res.text()
    throw new Error(`Respuesta no-JSON desde ${res.url}. content-type="${ct}". Primera parte:\n` + body.slice(0, 500))
  }
  return res.json()
}

export default async function TiendaPage() {
  let items: ApiProduct[] = []

  try {
    const url = await absUrl('/api/products')
    const res = await fetch(url, { cache: 'no-store' })
    const data = (await readJSON(res)) as { items: ApiProduct[] }
    items = data.items ?? []
  } catch (e) {
    console.error('Error cargando productos:', e)
    items = []
  }

  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-2xl font-semibold text-stone-800 inline-block">
          Tienda
        </h1>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Barra de controles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-stone-600">
            Descubre nuestros productos y promociones.
          </p>
          <div className="flex flex-wrap items-center sm:justify-end gap-3">
            <select
              aria-label="Ordenar productos"
              className="border w-full sm:w-fit rounded-md px-3 h-9 py-2 text-sm text-stone-700 bg-white"
              defaultValue="featured"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
            <div className="relative w-full sm:w-fit">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Buscar…"
                className="pl-9 border w-full rounded-md px-3 py-2 text-sm text-stone-700 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Grid para las tarjetas de producto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((p) => {
            const img =
              typeof p.imageUrl === 'string' && p.imageUrl.trim() !== ''
                ? p.imageUrl
                : ProductPlaceholder

            return (
              <TarjetaProducto
                key={p.slug}
                slug={p.slug}
                nombre={p.name}
                precio={Number(p.price)}
                descripcion={p.desc}
                img={img}
              />
            )
          })}
        </div>

        {/* Vacío */}
        {items.length === 0 && (
          <p className="text-center text-stone-500 text-sm">
            No hay productos disponibles ahora mismo.
          </p>
        )}
      </div>
    </section>
  )
}
