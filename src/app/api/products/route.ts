import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createProductSchema } from '@/lib/validators'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)))

  const where: Prisma.ProductWhereInput = q
    ? {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
          { slug: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
          { desc: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      }
    : { isActive: true }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ items, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createProductSchema.parse(body)

    const created = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        price: new Prisma.Decimal(data.price as any),
        desc: data.desc,
        imageUrl: data.imageUrl,
        composition: data.composition as any,
        isActive: data.isActive ?? true,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') return NextResponse.json({ error: err.flatten() }, { status: 422 })
    return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 400 })
  }
}
