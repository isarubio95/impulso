export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { upsertAppointment, confirmAppointment, cancelAppointment, deleteAppointment } from '../actions';

type Params = { params: { id: string } };

function toInputLocal(d?: Date | null) {
  if (!d) return '';
  const iso = new Date(d).toISOString();
  return iso.slice(0, 16); // YYYY-MM-DDTHH:mm
}

export default async function AppointmentEditPage({ params }: Params) {
  const a = await prisma.appointment.findUnique({
    where: { id: params.id },
  });

  if (!a) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-blue-600">Cita no encontrada.</p>
        <Link href="/admin/appointments" className="inline-flex px-3 py-2 rounded-md border">
          Volver
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar cita</h1>
        <Link href="/admin/appointments" className="text-sm text-blue-700 underline">
          Volver al listado
        </Link>
      </div>

      {/* FORM DE EDICIÓN / REPROGRAMACIÓN */}
      <form action={upsertAppointment} className="space-y-4">
        <input type="hidden" name="id" value={a.id} />

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">Nombre completo</span>
            <input name="fullName" defaultValue={a.fullName} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Teléfono</span>
            <input name="phone" defaultValue={a.phone} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Email</span>
            <input name="email" defaultValue={a.email ?? ''} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Notas</span>
            <input name="notes" defaultValue={a.notes ?? ''} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-sm mb-1">Inicio</span>
            <input
              type="datetime-local"
              name="startsAt"
              defaultValue={toInputLocal(a.startsAt)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Fin</span>
            <input
              type="datetime-local"
              name="endsAt"
              defaultValue={toInputLocal(a.endsAt ?? null)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Duración (min)</span>
            <input
              type="number"
              name="durationMinutes"
              placeholder="60"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-sm mb-1">Estado</span>
          <select
            name="status"
            defaultValue={a.status}
            className="w-full rounded-md border px-3 py-2 text-sm bg-white"
          >
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 mt-4 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
}
