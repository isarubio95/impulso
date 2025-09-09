// src/app/(shop)/checkout/page.tsx
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import CheckoutClient from './ui/CheckoutClient'

export const runtime = 'nodejs'

// Convierte tu Decimal `price` a céntimos
function unitCentsOf(p: any): number {
  if (!p) return 0
  return Math.round(Number(p.price ?? 0) * 100)
}

export default async function CheckoutPage() {
  const me = await requireUser()

  const [addresses, cart] = await Promise.all([
    prisma.address.findMany({
      where: { userId: me.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        fullName: true,
        phone: true,
        line1: true,
        line2: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    }),
    prisma.cart.findFirst({
      where: { userId: me.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, price: true } }, // solo lo necesario
          },
        },
      },
    }),
  ])

  const subtotalCents =
    cart?.items?.reduce((acc, it) => acc + unitCentsOf(it.product) * it.quantity, 0) ?? 0

  const defaultAddressId =
    addresses.find(a => a.isDefault)?.id ?? addresses[0]?.id ?? ''

  // ✅ NO pasamos `cart` al cliente (evita Decimal/Date). Enviamos solo primitivos.
  return (
    <CheckoutClient
      addresses={addresses}
      defaultAddressId={defaultAddressId}
      subtotalCents={subtotalCents}
      hasItems={(cart?.items?.length ?? 0) > 0}
    />
  )
}
