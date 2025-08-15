import TarjetaTratamiento from "../tratamientos/TarjetaTratamiento"
import Presoterapia from "@/assets/img/presoterapia.png" // cambia por tus imágenes

export const metadata = {
  title: "Tratamientos | Impulso Estética",
  description: "Descubre nuestros tratamientos y reserva tu cita",
}

const tratamientos = [
  {
    slug: "presoterapia",
    titulo: "Presoterapia",
    resumen:
      "Mejora la circulación, reduce la retención de líquidos y favorece el drenaje linfático. Ideal para piernas cansadas y como complemento en procesos de remodelación corporal.",
    img: Presoterapia,
    alt: "Persona recibiendo presoterapia",
  },
  {
    slug: "masaje-paihuen",
    titulo: "Masaje Paihuen",
    resumen:
      "Técnica relajante y descontracturante para aliviar tensiones musculares, reducir el estrés y mejorar el bienestar general con maniobras profundas y precisas.",
    img: Presoterapia, // sustituye por la imagen real
    alt: "Masaje terapéutico en camilla",
  },
  {
    slug: "tratamiento-facial",
    titulo: "Tratamiento Facial",
    resumen:
      "Limpieza profunda, hidratación y luminosidad adaptadas a tu tipo de piel. Combate signos de fatiga y mejora la textura con activos específicos.",
    img: Presoterapia, // sustituye
    alt: "Tratamiento facial en cabina",
  },
]

export default function TratamientosPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Cabecera */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-2xl font-semibold text-stone-800">Tratamientos</h1>
        <p className="mt-3 text-stone-600 max-w-3xl mx-auto">
          Lorem ipsum dolor sit amet consectetur. Sit egestas amet tincidunt cursus non dolor egestas.
          Massa erat porttitor nunc scelerisque pellentesque purus phasellus diam dignissim.
        </p>
      </div>

      {/* Lista */}
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {tratamientos.map((t) => (
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
    </section>
  )
}
