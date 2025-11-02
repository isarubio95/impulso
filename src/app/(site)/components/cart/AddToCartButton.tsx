'use client';

import { useState, useCallback } from 'react';
import { useCart } from './CartProvider';
import { cn } from '@/lib/utils';
import { FaShoppingCart } from 'react-icons/fa';
import CTA from '../CTA';

type Props = {
  id: string;
  name: string;
  price: number;
  image?: string;
  variant?: string;
  qty?: number;       // cantidad inicial (por defecto 1)
  className?: string; // clases extra para el botón grande (opcional)
  maxQty?: number;    // para limitar (por defecto 99)
};

export default function AddToCartButton({
  id,
  name,
  price,
  image,
  variant,
  qty = 1,
  maxQty = 99,
  className,
}: Props) {
  const { dispatch } = useCart();
  const [count, setCount] = useState(qty);

  const dec = useCallback(() => setCount(q => Math.max(1, q - 1)), []);
  const inc = useCallback(() => setCount(q => Math.min(maxQty, q + 1)), [maxQty]);

  const add = () => {
    dispatch({
      type: 'ADD',
      payload: { id, name, price, image, variant, qty: count },
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Stepper de cantidad */}
      <div
        className="inline-flex items-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm overflow-hidden"
        role="group"
        aria-label="Seleccionar cantidad"
      >
        <button
          type="button"
          onClick={dec}
          aria-label="Disminuir cantidad"
          className="px-3 py-1.5 cursor-pointer text-stone-700 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          −
        </button>
        <output
          className="min-w-[2.5rem] text-center select-none font-medium"
          aria-live="polite"
        >
          {count}
        </output>
        <button
          type="button"
          onClick={inc}
          aria-label="Aumentar cantidad"
          className="px-3 py-1.5 cursor-pointer text-stone-700 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          +
        </button>
      </div>

      <CTA
        texto="Añadir al carrito"
        onClick={add}
        icono={<FaShoppingCart className="w-4 h-4" />}
        className="w-fit h-full"
      >
      </CTA>
      
      
      <FaShoppingCart className="w-4 h-4 text-white" aria-hidden="true" />
       
    </div>
  );
}
