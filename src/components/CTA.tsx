import Link from 'next/link'
import Image, { StaticImageData } from 'next/image'

type CTAProps = {
  texto: string
  onClick?: () => void
  href?: string
  icono?: React.ReactNode
}

export default function CTA({ texto, onClick, href, icono}: CTAProps) {
  const baseStyles =
    'inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-2xl shadow hover:shadow-lg text-sm font-bold cursor-pointer hover:scale-102 transition-transform duration-300 transition'
    
    const contenido = (
        <>
            {texto}
            {icono}
        </>
    )

    if (href) {
        return <Link href={href} className={baseStyles}>{contenido}</Link>
    }

    return <button onClick={onClick} className={baseStyles}>{contenido}</button>
}
