'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
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
      const currentQ = searchParams.get('q') || '';

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
    <div className="flex flex-col-reverse sm:flex-row gap-4 mb-6">
      
      {/* --- INPUT DE BÚSQUEDA --- */}
      <div className="relative group flex-1">
        {/* Icono Lupa */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <FiSearch className="h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors duration-300" />
        </div>
        
        <input
          type="search"
          placeholder="Buscar productos..."
          className="
            block w-full pl-10 pr-4 py-2.5 
            bg-white border border-stone-200 
            text-stone-700 placeholder:text-stone-400 text-sm font-medium
            rounded-xl shadow-sm
            transition-all duration-200 ease-out
            focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10
            hover:border-stone-300
          "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Indicador de carga dentro del input */}
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-rose-500 font-bold animate-pulse uppercase tracking-wider bg-white pl-2">
            Actualizando...
          </div>
        )}
      </div>

      {/* --- SELECT DE ORDENACIÓN --- */}
      <div className="relative group w-full sm:w-64 z-10">
        <select
          aria-label="Ordenar productos"
          className="
            appearance-none cursor-pointer
            block w-full pl-4 pr-10 py-2.5 
            bg-white border border-stone-200 
            text-stone-700 text-sm font-medium
            rounded-xl shadow-sm
            transition-all duration-200 ease-out
            focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10
            hover:border-stone-300
          "
          value={searchParams.get('sort') || 'featured'}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="featured">Destacados</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
        
        {/* Flecha personalizada */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <FiChevronDown className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </div>
      </div>

    </div>
  );
}