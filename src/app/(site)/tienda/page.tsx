import { Suspense } from "react";
import TarjetaProducto from "./TarjetaProducto";
import ProductPlaceholder from "@/assets/img/product.png";
import { absUrl } from "@/lib/abs-url";
import PageTitle from '../components/PageTitle'
import TiendaControls from "./TiendaControls";


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

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;

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
        <TiendaControls />

        <Suspense key={`${q}-${sort}`} fallback={<ProductosSkeleton />}>
          {/* Grid para las tarjetas de producto */}
          <ProductosGrid q={q} sort={sort} />
        </Suspense>
      </div>
    </section>
  );
}

async function ProductosGrid({ q, sort }: { q?: string; sort?: string }) {
  const url = await absUrl("/api/products");
  const res = await fetch(url, { cache: "no-store" });
  let { items } = (await res.json()) as { items: ApiProduct[] };

  if (!items) items = [];

  // 1. Filtrado por búsqueda (nombre o descripción)
  if (q) {
    const query = q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query)
    );
  }

  // 2. Ordenación
  if (sort === "price-asc") {
    items.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price-desc") {
    items.sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center text-stone-600 py-10">
        {q 
          ? `No se han encontrado productos que coincidan con "${q}"` 
          : "No hay productos disponibles por el momento."}
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
