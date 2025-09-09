'use client';

import { useRef, useState } from 'react';

type Props = {
  name: string;
  accept?: string;     // por defecto 'image/*'
  maxMB?: number;      // por defecto 5
  className?: string;
  // Si lo pones, actualiza ese <img id="..."> con preview al elegir/soltar
  previewImgId?: string;
};

export default function FileDropzone({
  name,
  accept = 'image/*',
  maxMB = 5,
  className,
  previewImgId,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  function setFile(file: File) {
    if (file.size > maxMB * 1024 * 1024) {
      setError(`La imagen supera el límite de ${maxMB}MB`);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');

    // Asignar programáticamente al input (soporta navegadores modernos)
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;

    setFileName(file.name);

    // Preview externa (si se ha pasado un id)
    if (previewImgId) {
      const img = document.getElementById(previewImgId) as HTMLImageElement | null;
      if (img) {
        const url = URL.createObjectURL(file);
        img.src = url;
        // Nota: revocar en cleanup si lo gestionas a nivel de página
      }
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) setFile(f);
        }}
      />

      <div
        className={[
          'w-full rounded-md border border-dashed px-4 py-6 text-sm text-center cursor-pointer',
          dragOver ? 'bg-stone-100' : 'bg-white',
          className ?? '',
        ].join(' ')}
        onClick={(e) => {
          // Evitar que el <label> padre active el input otra vez
          e.preventDefault();
          e.stopPropagation();
          // Mostrar el picker de forma fiable
          if (inputRef.current?.showPicker) inputRef.current.showPicker();
          else inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) setFile(f);
        }}
      >
        <div className="font-medium">Arrastra tu imagen aquí</div>
        <div className="text-stone-500 mt-1">o haz clic para elegir archivo</div>
        {fileName && <div className="mt-2 text-stone-600">Seleccionado: {fileName}</div>}
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
