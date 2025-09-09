import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// (Opcional pero recomendable) fija apiVersion para tipado estable
const stripe = new Stripe(STRIPE_SECRET_KEY!, {});

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Stripe env vars missing', { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new NextResponse('Missing stripe-signature', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAID' },
          });
          // TIP: si guardaste userId en metadata, aquí podrías vaciar su carrito.
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'FAILED' },
          });
        }
        break;
      }

      // Añade aquí otros eventos que quieras manejar explícitamente
      default:
        // No-Op: confirmamos recepción para eventos no manejados
        break;
    }
  } catch (err: unknown) {
    console.error('Webhook handler error:', err);
    return new NextResponse('Webhook handler error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
