import Link from 'next/link';

type CTAProps = {
  texto: string;
  onClick?: () => void;
  href?: string;
  icono?: React.ReactNode;
  disabled?: boolean;
};

export default function CTA({ texto, onClick, href, icono, disabled }: CTAProps) {
  const baseStyles =
    'inline-flex w-full flex justify-center items-center gap-2 bg-rose-700 text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md text-sm font-bold transition-all duration-300 transition cursor-pointer';
  
  const contenido = (
    <>
      {texto}
      {icono}
    </>
  );

  // Si es un enlace
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${disabled ? 'opacity-50 pointer-events-none cursor-not-allowed hover:shadow-sm hover:scale-100' : 'hover:opacity-80 hover:scale-101'}`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {contenido}
      </Link>
    );
  }

  // Si es un botón
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? 'opacity-50 cursor-not-allowed hover:shadow-sm hover:scale-100' : 'hover:scale-101'}`}
    >
      {contenido}
    </button>
  );
}
