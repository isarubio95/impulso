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

async function fetchProducts(): Promise<ApiProduct[]> {
  try {
    const url = await absUrl('/api/products')
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error('GET /api/products failed', res.status, txt.slice(0, 200))
      return []
    }

    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      const txt = await res.text().catch(() => '')
      console.error('GET /api/products non-JSON', res.status, txt.slice(0, 200))
      return []
    }

    const data = await res.json().catch(() => null)

    // acepta { items: [...] } o { data: [...] } por si el API cambia
    if (data && Array.isArray((data as any).items)) {
      return (data as { items: ApiProduct[] }).items
    }
    if (data && Array.isArray((data as any).data)) {
      return (data as { data: ApiProduct[] }).data
    }

    console.error('GET /api/products unexpected JSON shape', data)
    return []
  } catch (err) {
    console.error('GET /api/products error', err)
    return []
  }
}

export default async function TiendaPage() {
  const items = await fetchProducts()

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
        {items.length === 0 ? (
          <div className="text-center text-sm text-stone-500 py-8">
            No hay productos disponibles ahora mismo.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((p) => {
              const img =
                typeof p.imageUrl === 'string' && p.imageUrl.trim() !== ''
                  ? p.imageUrl
                  : (ProductPlaceholder as unknown as string)

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
        )}
      </div>
    </section>
  )
}
