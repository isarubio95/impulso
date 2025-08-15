export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { confirmAppointment, cancelAppointment, deleteAppointment } from './actions';

function fmt(dt: Date) {
  return new Date(dt).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function StatusBadge({ s }: { s: 'pending'|'confirmed'|'cancelled' }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${map[s]}`}>{s}</span>;
}

export default async function AppointmentsAdminPage() {
  const items = await prisma.appointment.findMany({
    orderBy: [{ startsAt: 'asc' }],
    select: {
      id: true, fullName: true, phone: true, email: true, notes: true,
      startsAt: true, endsAt: true, status: true,
    },
  });

  return (
    <section className="max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Citas</h1>
      </div>

      <div className="overflow-x-auto border rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 border-b">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Contacto</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b align-middle">
                <td className="p-3">
                  <div className="font-medium">{fmt(a.startsAt)}</div>
                  {a.endsAt && (
                    <div className="text-xs text-stone-500">hasta {fmt(a.endsAt)}</div>
                  )}
                </td>
                <td className="p-3">
                  <div className="font-medium">{a.fullName}</div>
                  {a.notes && <div className="text-xs text-stone-500 mt-1">{a.notes}</div>}
                </td>
                <td className="p-3">
                  <div>{a.phone}</div>
                  {a.email && <div className="text-xs text-stone-500">{a.email}</div>}
                </td>
                <td className="p-3"><StatusBadge s={a.status} /></td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    href={`/admin/appointments/${a.id}`}
                    className="inline-flex px-3 py-2 rounded-md border text-sm hover:bg-stone-50"
                  >
                    Editar
                  </Link>

                  {a.status !== 'confirmed' && (
                    <form action={confirmAppointment.bind(null, a.id)} className="inline">
                      <button
                        type="submit"
                        className="inline-flex px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </form>
                  )}

                  {a.status !== 'cancelled' && (
                    <form action={cancelAppointment.bind(null, a.id)} className="inline">
                      <button
                        type="submit"
                        className="inline-flex px-3 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </form>
                  )}

                  <form action={deleteAppointment.bind(null, a.id)} className="inline">
                    <button
                      type="submit"
                      className="inline-flex px-3 py-2 rounded-md border text-sm hover:bg-stone-50 cursor-pointer"
                    >
                      Borrar
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-stone-500">No hay citas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
