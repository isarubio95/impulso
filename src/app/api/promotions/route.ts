import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPromotionSchema } from '@/lib/validators'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const now = new Date()
  const includeProduct = searchParams.get('includeProduct') === '1'

  const promos = await prisma.promotion.findMany({
    where: {
      isActive: true,
      OR: [
        { startsAt: null, endsAt: null },
        { startsAt: { lte: now }, endsAt: null },
        { startsAt: null, endsAt: { gte: now } },
        { AND: [{ startsAt: { lte: now } }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: includeProduct ? { product: true } : undefined,
  })

  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const data = createPromotionSchema.parse(json)

    // resolver productId si vino productSlug
    let productId = data.productId
    if (!productId && data.productSlug) {
      const p = await prisma.product.findUnique({ where: { slug: data.productSlug } })
      if (!p) return NextResponse.json({ error: 'Producto no válido' }, { status: 400 })
      productId = p.id
    }

    const created = await prisma.promotion.create({
      data: {
        title: data.title,
        productId,
        blurb: data.blurb,
        priceNew: data.priceNew !== undefined ? new Prisma.Decimal(data.priceNew as any) : undefined,
        priceOld: data.priceOld !== undefined ? new Prisma.Decimal(data.priceOld as any) : undefined,
        imageUrl: data.imageUrl,
        imageAlt: data.imageAlt,
        ctaUrl: data.ctaUrl,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.flatten() }, { status: 422 })
    return NextResponse.json({ error: 'No se pudo crear la promoción' }, { status: 400 })
  }
}
