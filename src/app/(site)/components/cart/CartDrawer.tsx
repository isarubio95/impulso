'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import { useCartUI } from './CartUIProvider';
import { formatEUR } from '@/lib/cart/money';

export default function CartDrawer() {
  const { state, dispatch, subtotal, ready } = useCart();
  const { open, closeCart } = useCartUI();

  // cerrar con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeCart(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCart]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog" aria-modal="true" aria-label="Carrito"
            id="cart-drawer"
            className="fixed right-0 top-0 h-dvh w-[90%] max-w-md z-[1001] bg-white dark:bg-neutral-900 shadow-2xl p-4 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tu carrito</h2>
              <button onClick={closeCart} aria-label="Cerrar">✖</button>
            </div>

            {!ready ? (
              <p className="opacity-70">Cargando…</p>
            ) : state.items.length === 0 ? (
              <p className="opacity-70">Tu carrito está vacío.</p>
            ) : (
              <ul className="space-y-3 overflow-auto pr-1 flex-1">
                {state.items.map((i) => (
                  <li key={`${i.id}-${i.variant ?? ''}`} className="flex gap-3 items-center">
                    {i.image && <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded-md" />}
                    <div className="flex-1">
                      <p className="font-medium">{i.name}</p>
                      {i.variant && <p className="text-sm opacity-70">{i.variant}</p>}
                      <p className="text-sm">{formatEUR(i.price)}</p>
                      <div className="mt-1 inline-flex items-center gap-2">
                        <button className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800"
                          onClick={() => dispatch({ type: 'DEC', payload: { id: i.id, variant: i.variant } })} aria-label="Disminuir cantidad">−</button>
                        <span aria-live="polite">{i.qty}</span>
                        <button className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800"
                          onClick={() => dispatch({ type: 'INC', payload: { id: i.id, variant: i.variant } })} aria-label="Aumentar cantidad">+</button>
                        <button className="ml-2 text-sm text-rose-600"
                          onClick={() => dispatch({ type: 'REMOVE', payload: { id: i.id, variant: i.variant } })}>Quitar</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between mb-3">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">{formatEUR(subtotal)}</span>
              </div>
              <button className="w-full py-2 rounded-xl bg-green-600 text-white font-semibold"
                onClick={() => alert('TODO: iniciar checkout')}>Iniciar checkout</button>
              <button className="w-full mt-2 py-2 rounded-xl border"
                onClick={() => dispatch({ type: 'CLEAR' })}>Vaciar carrito</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
