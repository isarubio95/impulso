import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const item = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    type UpdateData = { [k: string]: unknown; price?: string | number | Prisma.Decimal }
    const data: UpdateData = { ...body }
    if (data.price !== undefined) {
      data.price = new Prisma.Decimal(data.price as string | number)
    }
    const updated = await prisma.product.update({
      where: { slug: params.slug },
      data: data as Prisma.ProductUncheckedUpdateInput, // tipado explícito
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await prisma.product.delete({ where: { slug: params.slug } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo borrar' }, { status: 400 })
  }
}
