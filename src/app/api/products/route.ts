// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function toPlain(p: {
  slug: string
  name: string
  desc: string | null
  price: number | Prisma.Decimal
  imageUrl: string | null
}) {
  const price = typeof p.price === 'number' ? p.price : p.price.toNumber()
  return {
    slug: p.slug,
    name: p.name,
    desc: p.desc ?? '',
    price,
    imageUrl: p.imageUrl,
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || ''
  const order = url.searchParams.get('order') || 'featured'

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { desc: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { updatedAt: 'desc' }
  if (order === 'price-asc') orderBy = { price: 'asc' }
  if (order === 'price-desc') orderBy = { price: 'desc' }

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    select: { slug: true, name: true, desc: true, price: true, imageUrl: true },
  })

  const items = rows.map(toPlain)
  return NextResponse.json({ items })
}
