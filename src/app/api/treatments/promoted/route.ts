import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const items = await prisma.treatment.findMany({
      where: { isActive: true, promoted: true },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      select: {
        slug: true,
        title: true,
        desc: true,
        imageAlt: true,
        imageUrl: true,
      },
    })
    return NextResponse.json(items, { status: 200 })
  } catch (e) {
    console.error('GET /api/treatments/promoted error:', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
