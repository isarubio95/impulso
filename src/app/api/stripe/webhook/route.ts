import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata.orderId
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        })
        // Vaciar carrito del usuario si quieres, usando metadata.userId
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata.orderId
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        })
      }
    }
  } catch (e) {
    return new NextResponse('Webhook handler error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
