'use server';

import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RescheduleSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // valores de <input type="datetime-local"> (string sin zona)
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});

function toDate(v?: string) {
  const t = (v ?? '').trim();
  if (!t) return undefined;          // conserva la de DB si viene vacío
  const d = new Date(t);             // "YYYY-MM-DDTHH:mm" -> local
  return isNaN(+d) ? undefined : d;
}

function revalidateAll() {
  revalidatePath('/admin/appointments');
}

export async function confirmAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: 'confirmed' },
  });
  revalidateAll();
}

export async function cancelAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled' },
  });
  revalidateAll();
}

export async function deleteAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.delete({ where: { id } });
  revalidateAll();
}

export async function upsertAppointment(formData: FormData) {
  await requireAdmin();

  // 1) Parseo simple
  const raw = Object.fromEntries(formData);
  const data = RescheduleSchema.parse(raw);

  // 2) Estado actual
  const current = await prisma.appointment.findUnique({
    where: { id: data.id },
  });
  if (!current) throw new Error('Cita no encontrada');

  // 3) Normalizar fechas: si el campo viene vacío, se conserva el valor actual
  const startsAt = toDate(data.startsAt) ?? current.startsAt;
  let endsAt = toDate(data.endsAt) ?? current.endsAt;

  // 4) Pequeña salvaguarda: no permitir fin < inicio
  if (startsAt && endsAt && endsAt < startsAt) {
    endsAt = startsAt;
  }

  // 5) Actualización mínima: solo campos presentes
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
