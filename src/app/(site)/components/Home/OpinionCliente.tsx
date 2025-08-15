import { FaStar } from 'react-icons/fa'

type OpinionProps = {
  nombre: string
  texto: string
}

export default function OpinionCliente({ nombre, texto }: OpinionProps) {
  return (
    <div className="h-full flex flex-col justify-between border px-6 py-4 rounded-xl bg-white shadow-sm text-center">
      <div>
        <h4 className="font-semibold text-stone-700 mb-2">{nombre}</h4>
        <div className="flex justify-center mb-2 text-yellow-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>
        <p className="text-sm text-stone-600">{texto}</p>
      </div>
    </div>
  )
}

