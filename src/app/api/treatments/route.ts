// src/app/api/tratamientos/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || ''
  const order = url.searchParams.get('order') || 'recent' // recent | title-asc | title-desc

  const where: Prisma.TreatmentWhereInput = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { desc: { contains: q, mode: 'insensitive' } },
            { longDesc: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  let orderBy: Prisma.TreatmentOrderByWithRelationInput = { updatedAt: 'desc' }
  if (order === 'title-asc') orderBy = { title: 'asc' }
  if (order === 'title-desc') orderBy = { title: 'desc' }

  const rows = await prisma.treatment.findMany({
    where,
    orderBy,
    select: {
      slug: true,
      title: true,
      desc: true,
      imageUrl: true,
      imageAlt: true,
    },
  })

  // Devolvemos el shape que ya usas en tus tarjetas (titulo/resumen/img/alt)
  const items = rows.map(r => ({
    slug: r.slug,
    titulo: r.title,
    resumen: r.desc,
    img: r.imageUrl,
    alt: r.imageAlt,
  }))

  return NextResponse.json({ items })
}
