'use server'

import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth' // asumo que ya lo tienes
import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const CURRENCY = 'EUR'

// Calculadora (puedes refinar reglas de envío/IVA)
function calcShipping(subtotalCents: number) {
  // Envío fijo 4.90€ si < 35€, gratis >= 35€
  // return subtotalCents >= 3500 ? 0 : 490
  return 0; // Gastos de envío gratis temporalmente para pruebas
}
function calcTax(subtotalCents: number) {
  // IVA 21% incluido en precios: si ya son PVP con IVA, puedes poner 0.
  // Si quieres desglosar, usa: Math.round(subtotalCents * 0.1736) // equivalente a 21% sobre base.
  return 0
}

/** Crea/actualiza dirección del usuario */
export async function upsertAddress(formData: FormData) {
  const me = await requireUser()
  const id = String(formData.get('id') ?? '')
  const data = {
    fullName: String(formData.get('fullName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    line1: String(formData.get('line1') ?? ''),
    line2: String(formData.get('line2') ?? ''),
    city: String(formData.get('city') ?? ''),
    province: String(formData.get('province') ?? ''),
    postalCode: String(formData.get('postalCode') ?? ''),
    country: String(formData.get('country') ?? 'ES'),
    isDefault: formData.get('isDefault') === 'on',
    userId: me.id,
  }

  if (id) {
    const updated = await prisma.address.update({ where: { id }, data })
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: me.id, id: { not: updated.id } },
        data: { isDefault: false },
      })
    }
  } else {
    const created = await prisma.address.create({ data })
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: me.id, id: { not: created.id } },
        data: { isDefault: false },
      })
    }
  }

  revalidatePath('/checkout')
  return { ok: true as const }
}

/** Inicia el pago: crea Order + PaymentIntent y devuelve clientSecret */
export async function beginPayment(formData: FormData) {
  const me = await requireUser()

  const addressId = String(formData.get('addressId') ?? '')
  if (!addressId) return { ok: false as const, error: 'Selecciona una dirección' }

  // Cargar carrito
  const cart = await prisma.cart.findFirst({
    where: { userId: me.id },
    include: { items: { include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) {
    return { ok: false as const, error: 'El carrito está vacío' }
  }

  // Recalcular totales en servidor (seguro)
  const subtotalCents = cart.items.reduce((acc, it) => {
    const unitCents = Math.round(Number(it.product.price ?? 0) * 100)
    return acc + unitCents * it.quantity
  }, 0)
  const shippingCents = calcShipping(subtotalCents)
  const taxCents = calcTax(subtotalCents)
  const totalCents = subtotalCents + shippingCents + taxCents

  // Crear Order + OrderItems
  const order = await prisma.order.create({
    data: {
      userId: me.id,
      addressId,
      status: 'PENDING',
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      currency: CURRENCY,
      items: {
        create: cart.items.map((it) => ({
          productId: it.productId,
          name: it.product.name,
          quantity: it.quantity,
          unitCents: Math.round(Number(it.product.price ?? 0) * 100),
          totalCents: Math.round(Number(it.product.price ?? 0) * 100) * it.quantity,
        })),
      },
    },
    select: { id: true, totalCents: true },
  })

  // Stripe PaymentIntent
  const pi = await stripe.paymentIntents.create({
    amount: order.totalCents,
    currency: CURRENCY.toLowerCase(),
    metadata: { orderId: order.id, userId: me.id },
    automatic_payment_methods: { enabled: true },
  })

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePI: pi.id, status: 'PENDING' },
  })

  return { ok: true as const, clientSecret: pi.client_secret!, orderId: order.id }
}
