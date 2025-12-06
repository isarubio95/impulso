import { cn } from "@/lib/utils"

type SectionTitleProps = {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center mt-8 mb-5",
        className
      )}
    >
      {/* Línea izquierda */}
      <div className="h-[1px] w-1/4 bg-gradient-to-r from-transparent via-rose-700 to-transparent rounded-full" />

      {/* Título */}
      <h2 className="mx-4 text-center text-2xl font-semibold text-stone-800 tracking-tight relative">
        {children}
      </h2>

      {/* Línea derecha */}
      <div className="h-[1px] w-1/4 bg-gradient-to-l from-transparent via-rose-700 to-transparent rounded-full" />
    </div>
  )
}
