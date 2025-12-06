import { FaWhatsapp, FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import FormularioContacto from './FormularioContacto';
import { MapPin } from 'lucide-react';

export const metadata = {
  title: "Contacto | Impulso Estética",
  description: "Contáctanos para resolver cualquier duda o pedir información",
};

// Paleta por red para el “badge” del icono
const BRAND = {
  whatsapp: 'bg-green-600',
  twitter: 'bg-sky-500',
  instagram: 'bg-rose-500',
  facebook: 'bg-blue-600',
};

const socialNetworks = [
  {
    name: 'WhatsApp',
    icon: <FaWhatsapp className="w-4 h-4 text-white" />,
    href: 'tel:722162177',
    text: '722 162 177',
    brand: BRAND.whatsapp,
  },
  {
    name: 'Twitter',
    icon: <FaTwitter className="w-4 h-4 text-white" />,
    href: 'https://twitter.com/impulsoysoelin',
    text: '@impulsoysoelin',
    brand: BRAND.twitter,
  },
  {
    name: 'Instagram',
    icon: <FaInstagram className="w-4 h-4 text-white" />,
    href: 'https://www.instagram.com/impulso_cb',
    text: '@impulso_cb',
    brand: BRAND.instagram,
  },
  {
    name: 'Facebook',
    icon: <FaFacebookF className="w-4 h-4 text-white" />,
    href: 'https://www.facebook.com/impulsocb',
    text: 'Impulso_cb',
    brand: BRAND.facebook,
  },
];

export default function ContactoPage() {
  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Título */}
      <div className="mx-auto mb-8 text-center">
        <h1 className="text-2xl font-semibold text-stone-800 inline-block">
          Contacto
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          ¿Tienes alguna duda? Escríbenos y te responderemos lo antes posible.
          <br />También puedes visitarnos o contactarnos por redes.
        </p>
      </div>

      {/* Contenedor */}
      <div className="max-w-4xl mb-12 mx-auto flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2">
          <FormularioContacto />
        </div>

        <div className="w-full md:w-1/2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-stone-800 mb-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            Ubicación
          </h3>
          <div className="rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!4v1762714341901!6m8!1m7!1s1OsZ5usJx_5DEfA-p1N9cg!2m2!1d42.46317101275237!2d-2.432758518844386!3f211.32283554938917!4f-6.042347090342034!5f1.0889863562908408"
              width="600"
              height="600"
              className="border-0 max-w-full w-full aspect-square md:aspect-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="mx-auto max-w-4xl">
        <h3 className="font-medium text-stone-800 mb-3">También en redes</h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {socialNetworks.map((network) => (
            <li key={network.name}>
              <a
                href={network.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={network.name}
                className="group block rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
              >
                <div className="flex items-center gap-3">
                  {/* Badge del icono con color de marca */}
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${network.brand} shadow-sm`}
                  >
                    {network.icon}
                  </span>

                  {/* Texto/handle */}
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500 leading-none">{network.name}</p>
                    <p className="text-sm font-medium text-stone-800 truncate group-hover:text-stone-900">
                      {network.text}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>

        {/* Sutil línea decorativa */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      </div>
    </section>
  );
}
