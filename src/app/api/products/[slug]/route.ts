// src/app/api/products/[slug]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

function getSlug(req: Request): string {
  const url = new URL(req.url)
  const parts = url.pathname.replace(/\/+$/, '').split('/')
  return parts[parts.length - 1] // .../products/[slug]
}

export async function GET(req: Request) {
  const slug = getSlug(req)
  const item = await prisma.product.findUnique({ where: { slug } })
  if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: Request) {
  const slug = getSlug(req)
  try {
    const body = await req.json()
    type UpdateData = { [k: string]: unknown; price?: string | number | Prisma.Decimal }
    const data: UpdateData = { ...body }
    if (data.price !== undefined) {
      data.price = new Prisma.Decimal(data.price as string | number)
    }
    const updated = await prisma.product.update({
      where: { slug },
      data: data as Prisma.ProductUncheckedUpdateInput,
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const slug = getSlug(req)
  try {
    await prisma.product.delete({ where: { slug } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo borrar' }, { status: 400 })
  }
}
