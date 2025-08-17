'use client';

import { useCart } from '@/app/(site)/components/cart/CartProvider';
import { formatEUR } from '@/lib/cart/money';

export default function CartPage() {
  const { state, subtotal, dispatch, ready } = useCart();

  if (!ready) return <div className="p-6">Cargando…</div>;
  if (state.items.length === 0) return <div className="p-6">Tu carrito está vacío.</div>;

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <ul className="space-y-4">
        {state.items.map((i) => (
          <li key={`${i.id}-${i.variant ?? ''}`} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm opacity-70">{i.variant ?? ''}</p>
              <p className="text-sm">{formatEUR(i.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: 'DEC', payload: { id: i.id, variant: i.variant } })}>−</button>
              <span>{i.qty}</span>
              <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: 'INC', payload: { id: i.id, variant: i.variant } })}>+</button>
              <button className="px-3 py-1 border rounded text-rose-600" onClick={() => dispatch({ type: 'REMOVE', payload: { id: i.id, variant: i.variant } })}>Quitar</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center border-t pt-4">
        <span className="font-medium">Subtotal</span>
        <span className="text-xl font-bold">{formatEUR(subtotal)}</span>
      </div>

      <button className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
        onClick={() => alert('TODO: iniciar checkout')}>
        Iniciar checkout
      </button>
    </section>
  );
}
