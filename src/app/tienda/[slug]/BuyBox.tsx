"use client";

import { useState, useTransition } from "react"
import CTA from "@/components/CTA"
import { addToCart } from "./actions"

export default function BuyBox({ productId, precio }: { productId: string; precio: number }) {
  const [cantidad, setCantidad] = useState(1)
  const [pending, startTransition] = useTransition()

  const inc = () => setCantidad(v => v + 1)
  const dec = () => setCantidad(v => (v > 1 ? v - 1 : 1))

  const handleAdd = () => {
    startTransition(async () => {
      await addToCart(productId, cantidad)
      // opcional: toast/redirect/refetch
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
        <button onClick={dec} className="px-3 text-lg text-stone-600 hover:bg-stone-100 cursor-pointer">−</button>
        <span className="px-4 py-2 text-stone-800 select-none">{cantidad}</span>
        <button onClick={inc} className="px-3 text-lg text-stone-600 hover:bg-stone-100 cursor-pointer">+</button>
      </div>
      <button
        className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-600 text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md text-sm font-bold cursor-pointer hover:scale-102 transition-transform duration-300 transition"
        onClick={handleAdd} 
        disabled={pending}
      >
          {pending ? "Añadiendo..." : `Añadir al carrito`}
      </button>
    </div>
  )
}
