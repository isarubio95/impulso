import { Suspense } from "react";
import TarjetaProducto from "./TarjetaProducto";
import ProductPlaceholder from "@/assets/img/product.png";
import { FiSearch } from "react-icons/fi";
import { absUrl } from "@/lib/abs-url";
import PageTitle from '../components/PageTitle'


export const metadata = {
  title: "Tienda | Impulso Estética",
  description: "Explora nuestros productos y promociones",
};

type ApiProduct = {
  slug: string;
  name: string;
  desc: string;
  price: string | number;
  imageUrl?: string | null;
};

export default function TiendaPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <PageTitle>
          Nuestros productos
        </PageTitle>
        <p className="mt-3 text-stone-600 text-sm max-w-3xl mx-auto">
          Descubre nuestros tratamientos y reserva tu cita.
        </p>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de controles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

        <Suspense fallback={<ProductosSkeleton />}>
          {/* Grid para las tarjetas de producto */}
          <ProductosGrid />
        </Suspense>
      </div>
    </section>
  );
}

async function ProductosGrid() {
  const url = await absUrl("/api/products");
  const res = await fetch(url, { cache: "no-store" });
  const { items } = (await res.json()) as { items: ApiProduct[] };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center text-stone-600">
        No hay productos disponibles por el momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 max-w-4xl mx-auto sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((p) => {
        const img =
          typeof p.imageUrl === "string" && p.imageUrl.trim() !== ""
            ? p.imageUrl
            : ProductPlaceholder;

        return (
          <TarjetaProducto
            key={p.slug}
            slug={p.slug}
            nombre={p.name}
            precio={Number(p.price)}
            descripcion={p.desc}
            img={img}
          />
        );
      })}
    </div>
  );
}

function ProductosSkeleton() {
  return (
    <div className="grid grid-cols-1 max-w-4xl mx-auto sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col rounded-xl bg-white shadow-md ring-1 ring-black/10 p-4 gap-4 animate-pulse"
        >
          <div className="w-full aspect-square rounded-lg bg-stone-200" />
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-stone-200" />
            <div className="h-4 w-full rounded bg-stone-200" />
            <div className="h-5 w-1/3 rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
