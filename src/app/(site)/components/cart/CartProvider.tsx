'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { CartAction, CartState } from '@/lib/cart/types';
import { cartReducer, initialCart, getCount, getSubtotal } from '@/lib/cart/cart-reducer';
import { loadCart, saveCart } from '@/lib/cart/storage';

type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  count: number;
  subtotal: number;
  ready: boolean; // evita parpadeo SSR/CSR
};

const CartContext = createContext<CartContextType | null>(null);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, initialCart);

  // hidrata desde localStorage solo en cliente
  useEffect(() => {
    const stored = loadCart<CartState>(initialCart);
    if (stored.items.length > 0) {
      dispatch({ type: 'SET_CART', payload: stored } as unknown as CartAction);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // guarda cambios
  useEffect(() => {
    if (hydrated) saveCart(state);
  }, [state, hydrated]);

  const value = useMemo(() => ({
    state,
    dispatch,
    count: getCount(state.items),
    subtotal: getSubtotal(state.items), // ajusta si usas céntimos
    ready: hydrated,
  }), [state, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
};
