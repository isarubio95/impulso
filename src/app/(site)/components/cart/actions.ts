'use server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export type CartClientItem = { id: string; variant?: string | null; qty: number }

/**
 * Persiste el carrito del usuario en BD y redirige a /checkout.
 * Acepta items con id = product.id **o** id = product.slug.
 */
export async function persistCartAndGoCheckout(items: CartClientItem[]) {
  const me = await getCurrentUser()
  if (!me) redirect('/login?next=/checkout')

  // 1) Normaliza cantidades y recoge todos los posibles identificadores
  const normalized = items
    .map((it) => ({
      key: String(it?.id ?? '').trim(),
      variant: it?.variant ?? null,
      qty: Number(it?.qty ?? 0),
    }))
    .filter((x) => x.key !== '' && x.qty > 0)

  if (normalized.length === 0) redirect('/checkout')

  const identifiers = Array.from(new Set(normalized.map((x) => x.key)))

  // 2) Buscar productos por id **o** por slug y que estén activos
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ id: { in: identifiers } }, { slug: { in: identifiers } }],
    },
    select: { id: true, slug: true },
  })

  // Índices para resolver rápidamente
  const byId = new Map(products.map((p) => [p.id, p]))
  const bySlug = new Map(products.map((p) => [p.slug, p]))

  // 3) Resolver cada item al productId real (prioriza id, si no intenta slug)
  type Resolved = { productId: string; variant: string | null; qty: number }
  const resolved: Resolved[] = []
  for (const it of normalized) {
    const p = byId.get(it.key) ?? bySlug.get(it.key)
    if (!p) continue // identificador no válido → se descarta
    resolved.push({ productId: p.id, variant: it.variant, qty: it.qty })
  }

  if (resolved.length === 0) {
    // No hay ningún producto válido; redirigimos igualmente
    redirect('/checkout')
  }

  // 4) Agrupar por (productId + variant)
  const groupedMap = new Map<string, Resolved>()
  for (const r of resolved) {
    const k = `${r.productId}__${r.variant ?? ''}`
    const prev = groupedMap.get(k)
    if (prev) prev.qty += r.qty
    else groupedMap.set(k, { ...r })
  }
  const grouped = Array.from(groupedMap.values())

  // 5) Upsert del carrito y reemplazar items
  const cart = await prisma.cart.upsert({
    where: { userId: me.id },
    update: {},
    create: { userId: me.id },
    select: { id: true },
  })

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    await tx.cartItem.createMany({
      data: grouped.map((g) => ({
        cartId: cart.id,
        productId: g.productId,
        quantity: g.qty,
      })),
    })
  })

  // 6) Continuar al checkout
  redirect('/checkout')
}
