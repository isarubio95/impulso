'use client'

import { useMemo, useState, useTransition } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import AddressQuickForm from './AddressQuickForm'
import { beginPayment } from '../actions'

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

type Props = {
  addresses: Address[]
  defaultAddressId: string
  subtotalCents: number
  hasItems: boolean
}

export default function CheckoutClient({
  addresses,
  defaultAddressId,
  subtotalCents,
  hasItems,
}: Props) {
  const [addressId, setAddressId] = useState(defaultAddressId)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [pending, start] = useTransition()

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
        <p className="text-xl font-semibold mb-2">Dirección de envío</p>

        {addresses.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm mr-2 opacity-80">Usar dirección:</label>
            <select
              className="ring ring-black/50 focus:ring-1 shadow-inner rounded-md px-3 py-2 text-sm"
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
            >
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.fullName} — {a.city}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="opacity-60 mb-3">Añade una dirección en tu perfil o desde aquí mismo.</p>
        )}

        <AddressQuickForm />
      </div>

      {/* Resumen */}
      <div className="bg-stone-100 shadow-softer text-stone-800 max-w-2xl mx-auto rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Resumen</h2>
        <span>Subtotal: </span><span className='text-green-800 font-semibold'>{(subtotalCents / 100).toFixed(2)} €</span>
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
