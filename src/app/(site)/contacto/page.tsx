import FormularioContacto from './FormularioContacto';
import { MapPin, Twitter, Instagram, Phone } from 'lucide-react';


export const metadata = {
  title: "Contacto | Impulso Estética",
  description: "Contáctanos para resolver cualquier duda o pedir información",
};

export default function ContactoPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-2xl font-semibold text-stone-800 inline-block">
          Contacto
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          ¿Tienes alguna duda? Escríbenos y te responderemos lo antes posible.
          <br />También puedes visitarnos o contactarnos por redes.
        </p>
      </div>

      {/* Contenedor */}
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <FormularioContacto />

        {/* Info de contacto */}
        <div className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-md border border-emerald-200">
            <h3 className="flex items-center gap-2 text-sm font-medium text-stone-800 mb-1">
              <MapPin className="w-4 h-4 text-rose-600" />
              Ubicación
            </h3>
            <p className="text-sm text-stone-600">
              C. Duquesa de la Victoria, 86,<br />
              26004 Logroño, La Rioja
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-stone-800 mb-2">También en redes</h3>
            <ul className="space-y-2 text-sm text-stone-700">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600" />
                <a href="tel:722162177" className="hover:underline">722 162 177</a>
              </li>
              <li className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-500" />
                <a href="https://twitter.com/impulsoysoelin" target="_blank" rel="noopener noreferrer" className="hover:underline">@impulsoysoelin</a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-rose-500" />
                <a href="https://instagram.com/impulsologrono" target="_blank" rel="noopener noreferrer" className="hover:underline">@impulsologrono</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
