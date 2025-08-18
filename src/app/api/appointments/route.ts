import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createAppointmentSchema } from '@/lib/validators'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const day = searchParams.get('day') // YYYY-MM-DD opcional
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

  const where: Prisma.AppointmentWhereInput = {}

  if (day) {
    const startLocal = new Date(`${day}T00:00:00`)
    const endLocal = new Date(startLocal)
    endLocal.setDate(endLocal.getDate() + 1)

    where.startsAt = { gte: startLocal, lt: endLocal }
  }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ])

  return NextResponse.json(
    { items, total, page, pageSize },
    { headers: { 'Cache-Control': 'no-store' } } // opcional
  )
}

export async function POST(req: NextRequest) {
  try {
    const data = createAppointmentSchema.parse(await req.json())
    const starts = new Date(data.startsAt)
    const ends = new Date(data.endsAt)

    if (isNaN(starts.getTime()) || isNaN(ends.getTime()) || ends <= starts) {
      return NextResponse.json({ error: 'Rango de fechas inválido' }, { status: 400 })
    }

    const overlap = await prisma.appointment.findFirst({
      where: { startsAt: { lt: ends }, endsAt: { gt: starts } },
      select: { id: true },
    })
    if (overlap) {
      return NextResponse.json({ error: 'Franja no disponible' }, { status: 409 })
    }

    const appt = await prisma.appointment.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        startsAt: starts,
        endsAt: ends,
        status: 'pending',
      },
    })
    return NextResponse.json(appt, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: 'No se pudo crear la cita' }, { status: 400 });
  }
}
