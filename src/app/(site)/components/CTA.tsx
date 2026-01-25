import Link from 'next/link';
import { cn } from '@/lib/utils';

type CTAProps = {
  texto: string;
  onClick?: (e: React.MouseEvent) => void;
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
    'inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-bold cursor-pointer transition-colors duration-200';

  const variantStyles = {
    primary:
      'bg-gradient-to-br from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 hover:shadow-md active:scale-95',
    secondary: 'bg-transparent font-medium text-stone-600 ring-1 ring-inset ring-stone-600 hover:bg-stone-200',
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