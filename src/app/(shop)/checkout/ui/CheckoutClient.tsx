'use client'

import { useMemo, useState, useTransition } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import AddressQuickForm from './AddressQuickForm'
import { beginPayment } from '../actions'
import Image from 'next/image'
import { formatEUR } from '@/lib/cart/money'

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

type Address = {
  id: string
  fullName: string
  phone: string | null
  line1: string
  line2: string | null
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
}

type Item = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl: string | null
  }
}

type Props = {
  addresses: Address[]
  defaultAddressId: string
  subtotalCents: number
  hasItems: boolean
  items: Item[]
}

export default function CheckoutClient({
  addresses,
  defaultAddressId,
  subtotalCents,
  hasItems,
  items,
}: Props) {
  const [addressId, setAddressId] = useState(defaultAddressId)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const selectedAddress = addresses.find(a => a.id === addressId)

  const stripePromise = useMemo(() => {
    if (typeof window === 'undefined') return null
    if (!PK) return null
    return loadStripe(PK)
  }, [])

  const startPayment = () => {
    if (!hasItems) return alert('Tu carrito está vacío')
    if (!addressId) return alert('Selecciona una dirección')

    start(async () => {
      const fd = new FormData()
      fd.append('addressId', addressId)
      const res = await beginPayment(fd) // server action: crea Order + PaymentIntent
      if (res.ok) setClientSecret(res.clientSecret)
      else alert(res.error)
    })
  }

  return (
    <section className="bg-stone-200 min-h-screen py-10 px-6 space-y-6">

      {/* Dirección */}
      <div className="bg-stone-100 shadow-softer text-stone-800 max-w-2xl mx-auto rounded-lg p-4">
        <p className="text-xl font-semibold mb-4">Dirección de envío</p>

        {addresses.length > 0 ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Seleccionar dirección guardada</label>
              <select
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
              >
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} — {a.line1}
                  </option>
                ))}
              </select>
            </div>

            {selectedAddress && (
              <div className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-stone-900">{selectedAddress.fullName}</span>
                  <span>{selectedAddress.line1}</span>
                  {selectedAddress.line2 && <span>{selectedAddress.line2}</span>}
                  <span>{selectedAddress.postalCode} {selectedAddress.city}, {selectedAddress.province}</span>
                  <span>{selectedAddress.country}</span>
                  {selectedAddress.phone && <span className="text-stone-500 mt-1">Tel: {selectedAddress.phone}</span>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="opacity-60 mb-3">Añade una dirección en tu perfil o desde aquí mismo.</p>
        )}

        <div className="border-t border-stone-200">
          <AddressQuickForm />
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-stone-100 shadow-softer text-stone-800 max-w-2xl mx-auto rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Resumen</h2>
        
        <ul className="space-y-4 mb-4 border-b border-stone-200 pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 bg-stone-200 rounded-md overflow-hidden flex-shrink-0 border border-stone-300">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-500">
                    Sin img
                  </div>
                )}
                <span className="absolute top-0 right-0 bg-stone-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                  x{item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 line-clamp-2">
                  {item.product.name}
                </p>
                <p className="text-sm text-stone-500">
                  {formatEUR(item.product.price)}
                </p>
              </div>
              <div className="text-sm font-semibold text-stone-800">
                {formatEUR(item.product.price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className='text-green-800 font-semibold'>{formatEUR(subtotalCents / 100)}</span>
        </div>
        {!hasItems && <p className="text-sm opacity-70 mt-2">Tu carrito está vacío.</p>}
      </div>

      {/* Pago / Stripe */}
      <div className="max-w-2xl mx-auto">
        {!clientSecret ? (
          <button
            onClick={startPayment}
            disabled={pending || !hasItems}
            className="w-full block px-4 py-2 cursor-pointer rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
          >
            {pending ? 'Preparando pago…' : 'Ir a pago'}
          </button>
        ) : (
          stripePromise && (
            <Elements
              stripe={stripePromise as unknown as Promise<Stripe | null>}
              options={{ clientSecret }}
            >
              <PaySection />
            </Elements>
          )
        )}
      </div>

      {!PK && (
        <p className="text-amber-600 text-sm">
          Falta <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> en el entorno del cliente.
        </p>
      )}
    </section>
  )
}

function PaySection() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <PaymentElement />
      <button
        onClick={pay}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-emerald-600 text-white"
      >
        {loading ? 'Procesando…' : 'Pagar'}
      </button>
    </div>
  )
}
