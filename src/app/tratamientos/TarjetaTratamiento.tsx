import CTA from "@/components/CTA"
import Image, { StaticImageData } from "next/image"

type Props = {
    titulo: string
    resumen: string
    slug: string
    img: StaticImageData | string
    alt: string
}

export default function TarjetaTratamiento({ titulo, resumen, slug, img, alt }: Props) {
    return (  
        <article className="rounded-2xl bg-white shadow hover:shadow-md transition-shadow duration-300 p-4 ring-1 ring-black/5 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
                {/* Texto */}
                <div className="flex-1 p-5 md:p-6">
                    <h3 className="text-lg font-semibold text-stone-800">{titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {resumen}
                    </p>

                    {/* Butttons */}
                    <div className="flex gap-4 items-center mt-4">
                        <CTA
                            texto="Pedir cita"
                            href={`/citas`}
                        />
                        {/* Ver más */}
                        <a href={`/tratamientos/${slug}`} className="text-sm text-sky-600 hover:underline">Saber más</a>
                    </div>
                </div>

                {/* Imagen */}
                <div className="flex-1 relative">
                    <div className="relative w-auto h-56">
                        <Image
                            src={img}
                            alt={alt}
                            fill
                            className="object-contain p-6"
                            sizes="(min-width: 1024px) 600px, 100vw"
                            priority={false}
                        />
                    </div>
                </div>
            </div>
        </article>
    )
}
