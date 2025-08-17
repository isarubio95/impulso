'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type CartUI = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartUIContext = createContext<CartUI | null>(null);

export default function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const toggleCart = useCallback(() => setOpen(v => !v), []);
  return (
    <CartUIContext.Provider value={{ open, openCart, closeCart, toggleCart }}>
      {children}
    </CartUIContext.Provider>
  );
}

export const useCartUI = () => {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error('useCartUI debe usarse dentro de <CartUIProvider>');
  return ctx;
};
