// src/app/api/promotions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function dec(x: number | Prisma.Decimal | null): number | null {
  return x === null ? null : typeof x === 'number' ? x : x.toNumber()
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const includeProduct =
    ['1', 'true', 'yes', 'on'].includes((url.searchParams.get('includeProduct') || '').toLowerCase())

  const now = new Date()

  if (includeProduct) {
    const rows = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        blurb: true,
        priceNew: true,
        priceOld: true,
        ctaUrl: true,
        product: { select: { slug: true, name: true, imageUrl: true } },
      },
    })

    const items = rows.map(r => ({
      id: r.id,
      title: r.title,
      blurb: r.blurb ?? null,
      priceNew: dec(r.priceNew),
      priceOld: dec(r.priceOld),
      ctaUrl: r.ctaUrl ?? null,
      product: r.product
        ? { slug: r.product.slug, name: r.product.name, imageUrl: r.product.imageUrl }
        : null,
    }))

    return NextResponse.json({ items })
  }

  const rows = await prisma.promotion.findMany({
    where: {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      blurb: true,
      priceNew: true,
      priceOld: true,
      ctaUrl: true,
    },
  })

  const items = rows.map(r => ({
    id: r.id,
    title: r.title,
    blurb: r.blurb ?? null,
    priceNew: dec(r.priceNew),
    priceOld: dec(r.priceOld),
    ctaUrl: r.ctaUrl ?? null,
  }))

  return NextResponse.json({ items })
}
