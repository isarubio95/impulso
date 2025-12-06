import { cn } from "@/lib/utils"

type SectionTitleProps = {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center sm:mt-2 sm:mb-4",
        className
      )}
    >
      {/* Línea izquierda */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-rose-700 to-transparent rounded-full" />

      {/* Título */}
      <h1 className="text-2xl font-semibold text-stone-800 mx-2 sm:mx-6 whitespace-nowrap">
        {children}
      </h1>

      {/* Línea derecha */}
      <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-rose-700 to-transparent rounded-full" />
    </div>
  )
}
