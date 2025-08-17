'use client';

import { useState } from 'react';

type Props = {
  name: string;
  maxMB?: number;           // por defecto 5
  className?: string;
  accept?: string;
};

export default function ImageInput({
  name,
  maxMB = 5,
  className,
  accept = 'image/*',
}: Props) {
  const [error, setError] = useState<string>('');

  return (
    <div>
      <input
        name={name}
        type="file"
        accept={accept}
        className={className}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f && f.size > maxMB * 1024 * 1024) {
            setError(`La imagen supera el límite de ${maxMB}MB`);
            e.currentTarget.value = ''; // limpia la selección
          } else {
            setError('');
          }
        }}
      />
      {error && <p className="mt-1 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
