import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import PresoterapiaImg from "@/assets/img/presoterapia.png";
import { absUrl } from "@/lib/abs-url";

type Params = { slug: string };

type IncluyeItem = { nombre: string; cantidad: string };

type ApiTreatment = {
  slug: string;
  titulo: string;
  descripcion: string;
  img?: string | null;
  alt?: string | null;
  incluye?: unknown;
  precioDesde?: number | null;
};

function normalizeIncluye(value: unknown): IncluyeItem[] {
  if (!Array.isArray(value)) return [];
  type MaybeIncluye = { nombre?: unknown; cantidad?: unknown };
  const arr = value as MaybeIncluye[];
  return arr
    .map((it) => {
      const nombre = typeof it.nombre === "string" ? it.nombre : "";
      const cantidad = typeof it.cantidad === "string" ? it.cantidad : "";
      return { nombre, cantidad };
    })
    .filter((x) => x.nombre.length > 0 || x.cantidad.length > 0);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const url = await absUrl(`/api/treatments/${encodeURIComponent(slug)}`);
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return { title: "Tratamiento no encontrado | Impulso" };
    const t = (await r.json()) as ApiTreatment;
    return {
      title: `${t.titulo} | Impulso`,
      description: String(t.descripcion ?? "").slice(0, 150),
    };
  } catch {
    return { title: "Tratamientos | Impulso" };
  }
}

export default async function TratamientoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const url = await absUrl(`/api/treatments/${encodeURIComponent(slug)}`);
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404 || !res.ok) {
    return (
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold text-stone-800 inline-block border-b border-rose-300 pb-2">
            Tratamiento no encontrado
          </h1>
          <Link href="/tratamientos" className="text-sm text-sky-700 hover:underline">
            Volver a tratamientos
          </Link>
        </div>
      </section>
    );
  }

  const data = (await res.json()) as ApiTreatment;

  const incluye = normalizeIncluye(data.incluye);
  const imgSrc: string | StaticImageData =
    typeof data.img === "string" && data.img.trim() !== "" ? data.img : PresoterapiaImg;

  return (
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-start gap-8">
        {/* Imagen */}
        <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
          <Image
            src={imgSrc}
            alt={data.alt ?? data.titulo}
            fill
            className="object-contain p-6 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-stone-800">{data.titulo}</h1>

          <p className="text-stone-600">{data.descripcion}</p>

          {/* Incluye */}
          {incluye.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mt-3 mb-1.5">Incluye</h2>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 mt-1">
                {incluye.map((it, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{it.nombre}</span> — {it.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Precio desde (si algún día lo añades a la API) */}
          {typeof data.precioDesde === "number" && !Number.isNaN(data.precioDesde) && (
            <p className="text-lg text-emerald-700 mt-3">
              Desde {data.precioDesde.toFixed(2)} €
            </p>
          )}

          <Link href="/tratamientos" className="text-sm text-sky-700 hover:underline mt-4">
            Volver a tratamientos
          </Link>
        </div>
      </div>
    </section>
  );
}
