export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { confirmAppointment, cancelAppointment, deleteAppointment } from './actions';
import { FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

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
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Citas</h1>
        <p className="text-stone-600">Gestión de citas programadas.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-stone-800 font-medium border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                <th className="px-6 py-4 whitespace-nowrap">Cliente</th>
                <th className="px-6 py-4 whitespace-nowrap">Contacto</th>
                <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-800">{fmt(a.startsAt)}</div>
                    {a.endsAt && (
                      <div className="text-xs text-stone-500">hasta {fmt(a.endsAt)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-800">{a.fullName}</div>
                    {a.notes && <div className="text-xs text-stone-500 mt-1 line-clamp-1">{a.notes}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-stone-800">{a.phone}</div>
                    {a.email && <div className="text-xs text-stone-500">{a.email}</div>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge s={a.status} /></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/appointments/${a.id}`}
                        className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                        title="Editar cita"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>

                      {a.status !== 'confirmed' && (
                        <form action={confirmAppointment.bind(null, a.id)} className="inline-flex">
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                            title="Confirmar cita"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        </form>
                      )}

                      {a.status !== 'cancelled' && (
                        <form action={cancelAppointment.bind(null, a.id)} className="inline-flex">
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors cursor-pointer"
                            title="Rechazar cita"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </form>
                      )}

                      <form action={deleteAppointment.bind(null, a.id)} className="inline-flex">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          title="Eliminar cita"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">No hay citas programadas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
