'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import { useTransition, useEffect, useState } from 'react';

export default function TiendaControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Estado local para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Efecto para actualizar la URL con debounce al buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Obtenemos el valor que ya existe en la URL
      const currentQ = searchParams.get('q') || '';

      // 2. IMPORTANTE: Si el término escrito es igual al de la URL, paramos aquí.
      // Esto rompe el bucle infinito.
      if (currentQ === searchTerm) return;

      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 400); 

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center sm:justify-end gap-3 w-full">
        <select
          aria-label="Ordenar productos"
          className="border w-full sm:w-fit rounded-md px-3 h-9 py-2 text-sm text-stone-700 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-rose-400"
          // Usamos value en lugar de defaultValue para que reaccione a cambios de URL externos
          value={searchParams.get('sort') || 'featured'}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
        <div className="relative w-full sm:w-fit">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Buscar…"
            className="pl-9 border w-full rounded-md px-3 py-2 text-sm text-stone-700 bg-white focus:ring-2 focus:ring-rose-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {isPending && (
        <div className="text-[10px] text-rose-500 font-medium animate-pulse uppercase tracking-wider">
          Actualizando...
        </div>
      )}
    </div>
  );
}