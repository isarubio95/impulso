'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useTransition } from 'react';
import { useCart } from './CartProvider';
import { useCartUI } from './CartUIProvider';
import { formatEUR } from '@/lib/cart/money';
import { persistCartAndGoCheckout } from './actions';
import CTA from '../CTA';

export default function CartDrawer() {
  const { state, dispatch, subtotal, ready } = useCart();
  const { open, closeCart } = useCartUI();
  const [pending, startTransition] = useTransition();

  // Cerrar con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCart]);

  // Ir a checkout: llama a la server action que hace redirect. No la atrapamos.
  function goCheckout() {
    const payload = state.items.map(i => ({
      id: i.id,
      variant: i.variant ?? null,
      qty: i.qty,
    }));

    closeCart(); // opcional

    startTransition(() => {
      // Importante: NO await, NO try/catch → deja que Next redirija.
      void persistCartAndGoCheckout(payload);
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            id="cart-drawer"
            className="fixed right-0 top-0 h-dvh w-[90%] max-w-md z-[1001] bg-stone-100 shadow-2xl px-5 py-4 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-stone-900">Tu carrito</h1>
              <button onClick={closeCart} className='text-stone-900 cursor-pointer p-2' aria-label="Cerrar">✖</button>
            </div>

            {!ready ? (
              <p className="opacity-70 text-stone-900">Cargando…</p>
            ) : state.items.length === 0 ? (
              <p className="opacity-70 text-stone-900">Tu carrito está vacío.</p>
            ) : (
              <ul className="space-y-3 overflow-auto pr-1 flex-1">
                {state.items.map((i) => (
                  <li key={`${i.id}-${i.variant ?? ''}`} 
                    className="flex gap-2 sm:gap-3 items-center bg-stone-200 px-2 py-3 rounded-md">
                    {i.image && (
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-20 h-20 sm:mx-2 object-cover rounded-md"
                      />
                    )}
                    <div className="flex flex-col w-full">
                      <p className="font-medium text-stone-900">{i.name}</p>
                      {i.variant && <p className="text-sm opacity-70 text-stone-900">{i.variant}</p>}
                      <p className="text-sm text-stone-900">{formatEUR(i.price)}</p>
                      <div className='flex justify-between items-center mt-2'>
                        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50 text-stone-800 shadow-sm overflow-hidden">
                          <button
                            className="px-2.5 cursor-pointer py-1.5 text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                            onClick={() =>
                              dispatch({ type: 'DEC', payload: { id: i.id, variant: i.variant } })
                            }
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>
                          <span aria-live="polite" className="min-w-[2.5rem] text-center select-none">{i.qty}</span>
                          <button
                            className="px-2.5 py-1.5 text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
                            onClick={() =>
                              dispatch({ type: 'INC', payload: { id: i.id, variant: i.variant } })
                            }
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>                        
                        </div>
                        <div>
                          <button
                            className="mr-3 text-sm text-rose-700 hover:text-rose-800 cursor-pointer"
                            onClick={() =>
                              dispatch({ type: 'REMOVE', payload: { id: i.id, variant: i.variant } })
                            }
                          >
                            Quitar
                          </button>
                        </div>
                      </div>                    
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between mb-3">
                <span className="font-medium text-stone-900">Subtotal</span>
                <span className="font-semibold text-stone-900">{formatEUR(subtotal)}</span>
              </div>

              <CTA
                texto={pending ? 'Iniciando…' : 'Iniciar checkout'}
                onClick={goCheckout}
                disabled={pending || !ready || state.items.length === 0}
                className='bg-emerald-600 hover:bg-emerald-700'
              />
            
              <CTA
                texto='Vaciar carrito'
                variant='secondary'
                onClick={() => dispatch({ type: 'CLEAR' })}
                className='mt-2'
                // 👇 CAMBIO APLICADO AQUÍ
                disabled={!ready || state.items.length === 0}
              />
              
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}