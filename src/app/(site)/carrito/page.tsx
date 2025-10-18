'use client';

import { useTransition } from 'react'
import { useCart } from '@/app/(site)/components/cart/CartProvider';
import { formatEUR } from '@/lib/cart/money';
import { persistCartAndGoCheckout } from '../components/cart/actions'

export default function CartPage() {
  const { state, subtotal, dispatch, ready } = useCart();
  const [pending, startTransition] = useTransition()

  if (!ready) return <div className="p-6">Cargando…</div>;
  if (state.items.length === 0) return <div className="p-6">Tu carrito está vacío.</div>;

  const iniciarCheckout = () => {
    const payload = state.items.map(i => ({
      id: i.id,
      variant: i.variant ?? null,
      qty: i.qty,
    }))

    startTransition(async () => {
      try {
        await persistCartAndGoCheckout(payload)
        // El server hará redirect('/checkout')
      } catch (e) {
        console.error(e)
        alert('No se pudo iniciar el checkout. Inténtalo de nuevo.')
      }
    })
  }

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <ul className="space-y-4">
        {state.items.map((i) => (
          <li key={`${i.id}-${i.variant ?? ''}`} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{i.name}</p>
              {i.variant ? <p className="text-sm opacity-70">{i.variant}</p> : null}
              <p className="text-sm">{formatEUR(i.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 cursor-pointer border rounded"
                onClick={() => dispatch({ type: 'DEC', payload: { id: i.id, variant: i.variant } })}>−</button>
              <span>{i.qty}</span>
              <button className="px-2 py-1 cursor-pointer border rounded"
                onClick={() => dispatch({ type: 'INC', payload: { id: i.id, variant: i.variant } })}>+</button>
              <button className="px-3 py-1 cursor-pointer border rounded text-rose-600"
                onClick={() => dispatch({ type: 'REMOVE', payload: { id: i.id, variant: i.variant } })}>Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center border-t pt-4">
        <span className="font-medium">Subtotal</span>
        <span className="text-xl font-bold">{formatEUR(subtotal)}</span>
      </div>

      <button
        className="w-full py-3 cursor-pointer rounded-xl bg-green-600 text-white font-semibold disabled:opacity-60"
        disabled={pending}
        onClick={iniciarCheckout}
      >
        {pending ? 'Iniciando…' : 'Iniciar checkout'}
      </button>
    </section>
  );
}
