'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RescheduleSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  startsAt: z.string().optional(),       // datetime-local
  endsAt: z.string().optional(),         // datetime-local
  durationMinutes: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending','confirmed','cancelled']).optional(),
});

function toDate(v?: string) {
  const t = (v ?? '').trim();
  if (!t) return undefined;
  const d = new Date(t);
  return isNaN(+d) ? undefined : d;
}

function revalidateAll() {
  revalidatePath('/admin/appointments');
}

export async function confirmAppointment(id: string) {
  await auth.requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: 'confirmed' },
  });
  revalidateAll();
}

export async function cancelAppointment(id: string) {
  await auth.requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled' },
  });
  revalidateAll();
}

export async function deleteAppointment(id: string) {
  await auth.requireAdmin();
  await prisma.appointment.delete({ where: { id } });
  revalidateAll();
}

export async function upsertAppointment(formData: FormData) {
  await auth.requireAdmin();

  const raw = Object.fromEntries(formData);
  const data = RescheduleSchema.parse(raw);

  const current = await prisma.appointment.findUnique({ where: { id: data.id } });
  if (!current) throw new Error('Cita no encontrada');

  // Fechas
  const startsAt = toDate(data.startsAt) ?? current.startsAt;
  let endsAt = toDate(data.endsAt) ?? current.endsAt;

  if (!toDate(data.endsAt) && data.durationMinutes && startsAt) {
    endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60_000);
  }

  await prisma.appointment.update({
    where: { id: data.id },
    data: {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email ?? null }),
      ...(data.notes !== undefined && { notes: data.notes ?? null }),
      startsAt,
      endsAt,
      ...(data.status && { status: data.status }),
    },
  });

  revalidateAll();
}
