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

export default async function TratamientosPage() {
  const url = await absUrl("/api/treatments");
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return (
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <h1 className="text-2xl font-semibold text-stone-800">Tratamientos</h1>
          <p className="text-stone-600">No se pudieron cargar los tratamientos.</p>
        </div>
      </section>
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
      typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg : (Presoterapia as unknown as string);

    return { slug: it.slug, titulo, resumen, img, alt: alt ?? titulo };
  });

  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Cabecera */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-2xl font-semibold text-stone-800">Tratamientos</h1>
        <p className="mt-3 text-stone-600 max-w-3xl mx-auto">
          Descubre nuestros tratamientos y reserva tu cita.
        </p>
      </div>

      {/* Lista */}
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {items.length === 0 ? (
          <p className="text-center text-stone-600">Aún no hay tratamientos disponibles.</p>
        ) : (
          items.map((t) => (
            <TarjetaTratamiento
              key={t.slug}
              titulo={t.titulo}
              resumen={t.resumen}
              slug={t.slug}
              img={t.img}
              alt={t.alt}
            />
          ))
        )}
      </div>
    </section>
  );
}
