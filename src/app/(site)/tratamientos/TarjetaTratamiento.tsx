import CTA from "../components/CTA"
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
        <article className="rounded-2xl bg-white shadow hover:shadow-md transition-shadow duration-300 ring-1 ring-black/5 overflow-hidden">
            <div className="flex flex-col-reverse md:flex-row md:items-center">
                {/* Texto */}
                <div className="flex-1 p-5 md:p-8">
                    <h3 className="text-lg text-center xs:text-left font-semibold text-stone-800">{titulo}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {resumen}
                    </p>

                    {/* Butttons */}
                    <div className="flex gap-4 items-center mt-4">
                        <div className="w-fit">
                            <CTA
                                texto="Pedir cita"
                                href={`/citas`}
                            />
                        </div>
                        
                        {/* Ver más */}
                        <a href={`/tratamientos/${slug}`} className="text-sm text-sky-600 hover:underline">Saber más</a>
                    </div>
                </div>

                {/* Imagen */}
                <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_theme(colors.stone.100)_20%,_theme(colors.stone.200)_70%)]">
                    <div className="relative w-full h-56">
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
