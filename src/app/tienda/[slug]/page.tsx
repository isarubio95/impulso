// app/tienda/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import Product from '@/assets/img/product.png'
import BuyBox from "./BuyBox";

// Datos simulados (luego pueden venir de una API o DB)
const productos = [
  {
    slug: "suplemento-01",
    nombre: "Suplemento 01",
    precio: 19.99,
    img: Product,
    descripcion: `
      Suplemento diseñado para aumentar la energía y el rendimiento diario gracias a una combinación equilibrada de vitaminas, minerales y extractos naturales.
      Ideal para personas activas, deportistas o quienes buscan un impulso extra para afrontar su jornada con vitalidad.
      
      Su fórmula avanzada proporciona un aporte constante de energía durante todo el día, ayudando a combatir la fatiga mental y física.
      Además, sus ingredientes contribuyen a reforzar el sistema inmunológico y mantener un óptimo estado de salud general.
    `,
    composicion: [
      { nombre: "Vitamina C", cantidad: "500 mg" },
      { nombre: "Magnesio", cantidad: "150 mg" },
      { nombre: "Extracto de Ginseng", cantidad: "200 mg" },
      { nombre: "Zinc", cantidad: "25 mg" },
    ],
  },
  {
    slug: "suplemento-02",
    nombre: "Suplemento 02",
    precio: 17.49,
    img: Product,
    descripcion: `
      Fórmula avanzada creada para favorecer la recuperación muscular después del ejercicio, ayudando a reducir la fatiga y mejorar la regeneración de fibras musculares.
      Contiene ingredientes de alta calidad que contribuyen al bienestar físico y al equilibrio energético.
      
      Ideal para deportistas y personas con entrenamientos exigentes, este suplemento apoya la reparación de los tejidos musculares y reduce el tiempo de recuperación,
      permitiendo retomar la actividad física en mejores condiciones y con menos molestias.
    `,
    composicion: [
      { nombre: "Proteína de suero", cantidad: "20 g" },
      { nombre: "Creatina monohidratada", cantidad: "5 g" },
      { nombre: "BCAA", cantidad: "3 g" },
      { nombre: "Magnesio", cantidad: "100 mg" },
    ],
  },
  {
    slug: "crema-hidratante",
    nombre: "Crema Hidratante",
    precio: 15.99,
    img: Product,
    descripcion: `
      Crema de textura ligera y rápida absorción que hidrata en profundidad, dejando la piel suave, elástica y protegida durante todo el día.
      Su fórmula está enriquecida con agentes nutritivos que ayudan a prevenir la sequedad y mejorar la barrera natural de la piel.
      
      Recomendada para todo tipo de pieles, incluso las más sensibles, esta crema aporta confort inmediato y un acabado sedoso sin sensación grasa.
      Úsala diariamente para mantener tu piel radiante y protegida frente a los cambios climáticos y la contaminación.
    `,
    composicion: [
      { nombre: "Ácido hialurónico", cantidad: "1%" },
      { nombre: "Aloe vera", cantidad: "5%" },
      { nombre: "Aceite de jojoba", cantidad: "2%" },
      { nombre: "Glicerina vegetal", cantidad: "3%" },
    ],
  },
  {
    slug: "crema-de-manos",
    nombre: "Crema de Manos",
    precio: 15.99,
    img: Product,
    descripcion: `
      Crema nutritiva especialmente formulada para hidratar, suavizar y proteger la piel de las manos frente a las agresiones externas como el frío, el viento o el lavado frecuente.
      Contiene ingredientes emolientes que reparan la sequedad y proporcionan una sensación inmediata de confort y suavidad.
      
      Su textura no grasa permite una rápida absorción, dejando las manos suaves y con un aroma delicado.
      Ideal para llevar siempre contigo y aplicar tantas veces como sea necesario a lo largo del día.
    `,
    composicion: [
      { nombre: "Manteca de karité", cantidad: "4%" },
      { nombre: "Aceite de almendras dulces", cantidad: "3%" },
      { nombre: "Glicerina", cantidad: "2%" },
      { nombre: "Vitamina E", cantidad: "0.5%" },
    ],
  },
  {
    slug: "aceite-corporal",
    nombre: "Aceite Corporal",
    precio: 22.50,
    img: Product,
    descripcion: `
      Aceite nutritivo de rápida absorción que hidrata y revitaliza la piel, dejándola con un tacto sedoso y un aspecto radiante.
      Formulado con aceites vegetales de alta calidad, ayuda a mejorar la elasticidad y a prevenir la sequedad.
      
      Perfecto para aplicar después de la ducha o el baño, este aceite retiene la humedad natural de la piel y proporciona una sensación de bienestar duradera.
      Apto para todo tipo de pieles, incluidas las más secas.
    `,
    composicion: [
      { nombre: "Aceite de argán", cantidad: "40%" },
      { nombre: "Aceite de almendras dulces", cantidad: "30%" },
      { nombre: "Aceite de jojoba", cantidad: "20%" },
      { nombre: "Vitamina E", cantidad: "0.5%" },
    ],
  },
  {
    slug: "serum-facial",
    nombre: "Sérum Facial",
    precio: 29.99,
    img: Product,
    descripcion: `
      Sérum concentrado que actúa en profundidad para reducir visiblemente las arrugas y líneas de expresión, aportando firmeza y luminosidad al rostro.
      Su fórmula está enriquecida con antioxidantes y activos regeneradores que mejoran la textura y el tono de la piel.
      
      Ligero y de rápida absorción, este sérum es el complemento perfecto a tu rutina de cuidado facial.
      Úsalo antes de tu crema hidratante habitual para potenciar sus efectos y conseguir una piel más joven y saludable.
    `,
    composicion: [
      { nombre: "Ácido hialurónico", cantidad: "2%" },
      { nombre: "Vitamina C estabilizada", cantidad: "5%" },
      { nombre: "Niacinamida", cantidad: "4%" },
      { nombre: "Extracto de té verde", cantidad: "1%" },
    ],
  },
  {
    slug: "mascarilla-hidratante",
    nombre: "Mascarilla Hidratante",
    precio: 12.75,
    img: Product,
    descripcion: `
      Mascarilla de tratamiento intensivo que proporciona una hidratación profunda, devolviendo la suavidad y la luminosidad al rostro.
      Ideal para pieles secas o deshidratadas, ayuda a restaurar el equilibrio hídrico y a reforzar la barrera protectora natural.
      
      Su textura cremosa y su fórmula rica en activos humectantes hacen que la piel recupere confort y flexibilidad en tan solo unos minutos.
      Se recomienda usar una o dos veces por semana para mantener un nivel óptimo de hidratación.
    `,
    composicion: [
      { nombre: "Ácido hialurónico", cantidad: "1.5%" },
      { nombre: "Extracto de pepino", cantidad: "2%" },
      { nombre: "Manteca de karité", cantidad: "3%" },
      { nombre: "Aloe vera", cantidad: "5%" },
    ],
  },
  {
    slug: "gel-limpiador",
    nombre: "Gel Limpiador",
    precio: 10.99,
    img: Product,
    descripcion: `
      Gel limpiador suave que elimina eficazmente impurezas, restos de maquillaje y exceso de grasa sin resecar la piel.
      Su fórmula equilibrada respeta el pH natural y deja una agradable sensación de frescor y limpieza.
      
      Ideal para el uso diario, incluso en pieles sensibles, ayuda a mantener la piel libre de imperfecciones y preparada para recibir los tratamientos posteriores.
      Úsalo por la mañana y por la noche como primer paso de tu rutina de cuidado facial.
    `,
    composicion: [
      { nombre: "Ácido salicílico", cantidad: "2%" },
      { nombre: "Extracto de manzanilla", cantidad: "1%" },
      { nombre: "Glicerina", cantidad: "3%" },
      { nombre: "Aloe vera", cantidad: "4%" },
    ],
  },
];

type Params = { slug: string };

// Next 15: params llega como Promise en generateMetadata
export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const p = productos.find(x => x.slug === slug);
  if (!p) return { title: "Producto no encontrado | Impulso" };
  return { title: `${p.nombre} | Impulso`, description: p.descripcion.slice(0, 150) };
}

// Next 15: también en la página
export default async function ProductoPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const producto = productos.find((p) => p.slug === slug);

  if (!producto) {
    return (
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold text-stone-800 inline-block border-b border-rose-300 pb-2">
            Producto no encontrado
          </h1>
          <Link href="/tienda" className="text-sm text-sky-600 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-stone-50 py-16 px-4">
      {/* Contenido */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-top gap-8">
        {/* Imagen */}
        <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
          <Image
            src={producto.img}
            alt={producto.nombre}
            fill
            className="object-contain p-6 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Info */}        
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-stone-800 inline-block">
            {producto.nombre}
          </h1>

          <p className="text-stone-600">
            {producto.descripcion}
          </p>

          {/* Composición */}
          {producto.composicion && producto.composicion.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mt-3 mb-1.5">Composición</h2>
              <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 mt-1">
                {producto.composicion.map((item: { nombre: string; cantidad: string }, idx: number) => (
                  <li key={idx}>
                    <span className="font-medium">{item.nombre}</span> — {item.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-lg text-emerald-700 mt-3">
            {producto.precio.toFixed(2)} €
          </p>

          {/* BuyBox */}
          <BuyBox precio={producto.precio} productId={producto.slug} />

          <Link href="/tienda" className="text-sm text-sky-700 hover:underline mt-4">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
