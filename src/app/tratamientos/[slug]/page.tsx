// app/tratamientos/[slug]/page.tsx
import Image from "next/image"
import Link from "next/link"
import PresoterapiaImg from "@/assets/img/presoterapia.png"

// Datos simulados (luego pueden venir de una API o DB)
const tratamientos = [
  {
    slug: "presoterapia",
    titulo: "Presoterapia",
    img: PresoterapiaImg,
    descripcion: `
      Tratamiento no invasivo que mejora la circulación y favorece el drenaje linfático, ayudando a reducir la retención de líquidos y la sensación de piernas cansadas.
      Ideal como apoyo en procesos de remodelación corporal y recuperación deportiva.
    `,
    incluye: [
      { nombre: "Duración por sesión", cantidad: "30 min" },
      { nombre: "Ciclos de compresión", cantidad: "Programados" },
      { nombre: "Zonas", cantidad: "Piernas y abdomen" },
      { nombre: "Frecuencia recomendada", cantidad: "1-2 veces/semana" },
    ],
    precioDesde: 25, // opcional
  },
  {
    slug: "masaje-paihuen",
    titulo: "Masaje Paihuen",
    img: PresoterapiaImg,
    descripcion: `
      Masaje relajante y descontracturante que combina maniobras profundas y precisas para liberar tensiones, reducir el estrés y mejorar el bienestar general.
    `,
    incluye: [
      { nombre: "Duración por sesión", cantidad: "50 min" },
      { nombre: "Técnica", cantidad: "Relajante/Descontracturante" },
      { nombre: "Zona", cantidad: "Espalda, cuello y hombros" },
      { nombre: "Aceites", cantidad: "Vegetales aromáticos" },
    ],
    precioDesde: 35,
  },
  {
    slug: "tratamiento-facial",
    titulo: "Tratamiento Facial",
    img: PresoterapiaImg,
    descripcion: `
      Limpieza profunda con exfoliación, extracción suave e hidratación intensiva. Aporta luminosidad y mejora la textura de la piel, adaptado a tu tipo de piel.
    `,
    incluye: [
      { nombre: "Duración", cantidad: "60 min" },
      { nombre: "Fases", cantidad: "Limpieza + Exfoliación + Mascarilla + Hidratación" },
      { nombre: "Tipo de piel", cantidad: "Personalizado" },
      { nombre: "Resultados", cantidad: "Luminosidad y suavidad" },
    ],
    precioDesde: 40,
  },
]

type Params = { slug: string }

export default async function TratamientoPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params
  const tratamiento = tratamientos.find((t) => t.slug === slug)

  if (!tratamiento) {
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
    )
  }

  return (
    <section className="bg-stone-50 py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-start gap-8">
        {/* Imagen */}
        <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
          <Image
            src={tratamiento.img}
            alt={tratamiento.titulo}
            fill
            className="object-contain p-6 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-stone-800">
            {tratamiento.titulo}
          </h1>

          <p className="text-stone-600">
            {tratamiento.descripcion}
          </p>

          {/* Incluye (lista tipo composición) */}
          {tratamiento.incluye?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mt-3 mb-1.5">Incluye</h2>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 mt-1">
                {tratamiento.incluye.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{item.nombre}</span> — {item.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Precio desde (opcional) */}
          {typeof tratamiento.precioDesde === "number" && (
            <p className="text-lg text-emerald-700 mt-3">
              Desde {tratamiento.precioDesde.toFixed(2)} €
            </p>
          )}

          <Link href="/tratamientos" className="text-sm text-sky-700 hover:underline mt-4">
            Volver a tratamientos
          </Link>
        </div>
      </div>
    </section>
  )
}
