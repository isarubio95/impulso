// src/app/api/appointments/[id]/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const patchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  // opcional: reprogramar
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
})

export async function GET(_req: Request, ctx: unknown) {
  const { params } = ctx as { params: { id: string } }
  const appt = await prisma.appointment.findUnique({ where: { id: params.id } })
  if (!appt) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(appt)
}

export async function PATCH(req: Request, ctx: unknown) {
  const { params } = ctx as { params: { id: string } }

  try {
    const data = patchSchema.parse(await req.json())

    // si reprogramas, controla solapes
    if (data.startsAt && data.endsAt) {
      const starts = new Date(data.startsAt)
      const ends = new Date(data.endsAt)
      if (isNaN(starts.getTime()) || isNaN(ends.getTime()) || ends <= starts) {
        return NextResponse.json({ error: 'Rango de fechas inválido' }, { status: 400 })
      }
      const overlap = await prisma.appointment.findFirst({
        where: {
          id: { not: params.id },
          startsAt: { lt: ends },
          endsAt: { gt: starts },
        },
        select: { id: true },
      })
      if (overlap) return NextResponse.json({ error: 'Franja no disponible' }, { status: 409 })
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: data.status,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 })
    }
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, ctx: unknown) {
  const { params } = ctx as { params: { id: string } }

  try {
    await prisma.appointment.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo borrar' }, { status: 400 })
  }
}
