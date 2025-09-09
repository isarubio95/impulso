import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ORDER_MAP = {
  recent: { updatedAt: 'desc' } as const,
  'title-asc': { title: 'asc' } as const,
  'title-desc': { title: 'desc' } as const,
};
type OrderKey = keyof typeof ORDER_MAP;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const qRaw = url.searchParams.get('q') ?? '';
    const q = qRaw.trim().slice(0, 200); // corta queries larguísimas

    const orderParam = (url.searchParams.get('order') ?? 'recent') as OrderKey;
    const orderBy: Prisma.TreatmentOrderByWithRelationInput =
      ORDER_MAP[orderParam] ?? ORDER_MAP.recent;

    // paginación
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') ?? '12') || 12));
    const skip = (page - 1) * pageSize;
    const take = pageSize;

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
    };

    const [rows, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          slug: true,
          title: true,
          desc: true,
          imageUrl: true,
          imageAlt: true,
        },
      }),
      prisma.treatment.count({ where }),
    ]);

    const items = rows.map((r) => ({
      slug: r.slug,
      titulo: r.title,
      resumen: r.desc,
      img: r.imageUrl,
      alt: r.imageAlt,
    }));

    return NextResponse.json({
      items,
      pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
      order: orderParam in ORDER_MAP ? orderParam : 'recent',
      q,
    });
  } catch (err) {
    console.error('GET /api/treatments error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
