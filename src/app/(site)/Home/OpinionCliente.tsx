import { FaStar } from 'react-icons/fa'

type OpinionProps = {
  nombre: string
  texto: string
}

export default function OpinionCliente({ nombre, texto }: OpinionProps) {
  return (
    <article
      className="group h-full rounded-2xl border border-stone-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm
                 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-md hover:ring-1 hover:ring-rose-200/60"
    >
      {/* Comillas decorativas */}
      <div className="pointer-events-none select-none mb-2 text-3xl leading-none text-rose-300/60">“</div>

      {/* Cabecera: nombre + rating */}
      <header className="mb-3 flex flex-col items-center text-center">
        <h4 className="w-full truncate text-base font-semibold text-stone-800">{nombre}</h4>

        <div
          className="mt-1 flex items-center gap-1"
          aria-label="Valoración 5 de 5"
          title="Valoración 5/5"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar
              key={i}
              className="h-4 w-4"
              style={{
                // Degradado dorado sutil sin depender de clases extra
                fill: 'url(#starGradient)',
              }}
            />
          ))}
          {/* SVG oculto para el degradado de relleno */}
          <svg width="0" height="0" className="absolute">
            <linearGradient id="starGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />     {/* amber-200 */}
              <stop offset="100%" stopColor="#F59E0B" />   {/* amber-500 */}
            </linearGradient>
          </svg>
        </div>
      </header>

      {/* Texto */}
      <blockquote className="text-center">
        <p className="text-sm leading-relaxed text-stone-600 line-clamp-6">
          {texto}
        </p>
      </blockquote>

      {/* Línea sutil inferior */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

      {/* Microdetalle al pasar el ratón */}
      <div className="mt-3 text-[11px] font-medium tracking-wide text-stone-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Opinión verificada
      </div>
    </article>
  )
}
