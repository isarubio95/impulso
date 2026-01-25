import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import CheckoutClient from './ui/CheckoutClient'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

// Convierte tu Decimal `price` a céntimos
function unitCentsOf(p: { price: Prisma.Decimal | number | null }): number {
  if (!p || p.price == null) return 0
  return Math.round(Number(p.price) * 100)
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
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    }),
  ])

  const subtotalCents =
    cart?.items?.reduce((acc, it) => acc + unitCentsOf(it.product) * it.quantity, 0) ?? 0

  const defaultAddressId =
    addresses.find(a => a.isDefault)?.id ?? addresses[0]?.id ?? ''

  // Serializar los objetos Decimal de Prisma a number para el componente cliente
  const items =
    cart?.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })) ?? []

  return (
    <section className="bg-stone-50 min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Finalizar Compra</h1>
          <p className="mt-2 text-stone-600">
            Revisa tus datos de envío y completa el pago de forma segura.
          </p>
        </header>

        <CheckoutClient
          addresses={addresses}
          defaultAddressId={defaultAddressId}
          subtotalCents={subtotalCents}
          hasItems={(cart?.items?.length ?? 0) > 0}
          items={items}
        />
      </div>
    </section>
  )
}
