import { Suspense } from "react";
import TarjetaTratamiento from "../tratamientos/TarjetaTratamiento";
import Presoterapia from "@/assets/img/presoterapia.png"; // placeholder por defecto
import { absUrl } from "@/lib/abs-url";

export const metadata = {
  title: "Tratamientos | Impulso Estética",
  description: "Descubre nuestros tratamientos y reserva tu cita",
};

type ApiTreatmentDB = {
  slug: string;
  title: string;
  desc: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

type ApiTreatmentView = {
  slug: string;
  titulo: string;
  resumen: string;
  img?: string | null;
  alt?: string | null;
};

type ApiListResponse = { items: Array<ApiTreatmentDB | ApiTreatmentView> };

export default function TratamientosPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Cabecera */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-2xl font-semibold text-stone-800">Tratamientos</h1>
        <p className="mt-3 text-stone-600 max-w-3xl mx-auto">
          Descubre nuestros tratamientos y reserva tu cita.
        </p>
      </div>

      <Suspense fallback={<TratamientosSkeleton />}>
        {/* Lista */}
        <TratamientosList />
      </Suspense>
    </section>
  );
}

async function TratamientosList() {
  const url = await absUrl("/api/treatments");
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="max-w-5xl mx-auto text-center space-y-3">
        <h2 className="text-xl font-semibold text-stone-800">Tratamientos</h2>
        <p className="text-stone-600">No se pudieron cargar los tratamientos.</p>
      </div>
    );
  }

  const data = (await res.json()) as ApiListResponse;

  const items = (data.items ?? []).map((it) => {
    const titulo = "titulo" in it ? it.titulo : (it as ApiTreatmentDB).title;
    const resumen = "resumen" in it ? it.resumen : (it as ApiTreatmentDB).desc;
    const rawImg = "img" in it ? it.img : (it as ApiTreatmentDB).imageUrl;
    const alt =
      "alt" in it ? it.alt ?? undefined : (it as ApiTreatmentDB).imageAlt ?? undefined;

    const img =
      typeof rawImg === "string" && rawImg.trim() !== ""
        ? rawImg
        : (Presoterapia as unknown as string);

    return { slug: it.slug, titulo, resumen, img, alt: alt ?? titulo };
  });

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <p className="text-center text-stone-600">Aún no hay tratamientos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      {items.map((t) => (
        <TarjetaTratamiento
          key={t.slug}
          titulo={t.titulo}
          resumen={t.resumen}
          slug={t.slug}
          img={t.img}
          alt={t.alt}
        />
      ))}
    </div>
  );
}

function TratamientosSkeleton() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5 animate-pulse"
        >
          <div className="flex flex-col-reverse md:flex-row md:items-center">
            <div className="flex-1 p-5 md:p-8 space-y-3">
              <div className="h-5 w-2/3 rounded bg-stone-200" />
              <div className="h-4 w-full rounded bg-stone-200" />
              <div className="h-4 w-5/6 rounded bg-stone-200" />
              <div className="mt-4 flex gap-4 items-center">
                <div className="h-9 w-28 rounded-full bg-stone-200" />
                <div className="h-5 w-20 rounded bg-stone-200" />
              </div>
            </div>
            <div className="flex-1 bg-stone-100">
              <div className="h-56 w-full bg-stone-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
