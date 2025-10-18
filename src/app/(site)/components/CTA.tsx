import Link from 'next/link';
import { cn } from '@/lib/utils';

type CTAProps = {
  texto: string;
  onClick?: () => void;
  href?: string;
  icono?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'success';
  className?: string;
};

export default function CTA({
  texto,
  onClick,
  href,
  icono,
  disabled,
  variant = 'primary',
  className,
}: CTAProps) {

  const baseStyles =
    'inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded-full shadow-sm text-sm font-bold cursor-pointer transition-colors duration-200';

  const variantStyles = {
    primary:
      // 👇 CAMBIOS AQUÍ: Añadimos más efectos al hover y un efecto al click
      'bg-gradient-to-br from-rose-600 to-rose-800 text-white hover:from-rose-700 hover:to-rose-800 hover:shadow-md active:scale-95',

    secondary: 'bg-transparent text-rose-700 ring-1 ring-inset ring-rose-700 hover:bg-rose-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };

  const contenido = (
    <>
      {texto}
      {icono}
    </>
  );

  const finalClassName = cn(
    baseStyles,
    variantStyles[variant],
    {
      'opacity-50 pointer-events-none cursor-not-allowed': disabled,
    },
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={finalClassName}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {contenido}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={finalClassName}>
      {contenido}
    </button>
  );
}