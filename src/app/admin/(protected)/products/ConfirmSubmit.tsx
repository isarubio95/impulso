'use client';

import { useFormStatus } from 'react-dom';

type ServerAction = (formData: FormData) => void | Promise<void>;

export default function ConfirmSubmit({
  children,
  message,
  className,
  formAction,         // ⟵ NUEVO: permite pasar una server action al botón
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  formAction?: ServerAction;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}        // ⟵ clave para no anidar <form>
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      disabled={pending}
    >
      {pending ? 'Procesando…' : children}
    </button>
  );
}
