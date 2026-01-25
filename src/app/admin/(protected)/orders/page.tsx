export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FiEye } from 'react-icons/fi';
import { ConfirmOrderButton, DeleteOrderButton } from './OrderActions';

export default async function AdminOrdersPage() {
  // Obtener pedidos ordenados por fecha descendente
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true, // Incluir datos del usuario asociado
    },
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Pedidos</h1>
        <p className="text-stone-600">Gestión de pedidos de la tienda.</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-800 font-medium border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Cliente</th>
                <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                <th className="px-6 py-4 whitespace-nowrap">Email</th>
                <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Total</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No hay pedidos registrados todavía.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderId = String(order.id);
                  const date = new Date(order.createdAt);
                  const total = (order.subtotalCents + order.shippingCents + order.taxCents) / 100;

                  // Mapeo simple de estados para visualización
                  const statusKey = String(order.status);
                  let badgeClass = 'bg-stone-100 text-stone-800';
                  let label = statusKey;

                  if (['PAID', 'COMPLETED', 'DELIVERED'].includes(statusKey)) {
                    badgeClass = 'bg-emerald-100 text-emerald-800';
                    label = statusKey === 'PAID' ? 'Pagado' : statusKey === 'COMPLETED' ? 'Completado' : 'Entregado';
                  } else if (['PENDING', 'PROCESSING'].includes(statusKey)) {
                    badgeClass = 'bg-amber-100 text-amber-800';
                    label = statusKey === 'PENDING' ? 'Pendiente' : 'Procesando';
                  } else if (['CANCELLED', 'FAILED'].includes(statusKey)) {
                    badgeClass = 'bg-rose-100 text-rose-800';
                    label = statusKey === 'CANCELLED' ? 'Cancelado' : 'Fallido';
                  }

                  return (
                    <tr key={orderId} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-800">
                        {order.user?.name || 'Usuario desconocido'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-stone-800">
                          {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-stone-400">
                          {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        <div>
                          {order.user?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-stone-800">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/orders/${orderId}`}
                            className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
                            title="Ver detalles"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>

                          <ConfirmOrderButton id={orderId} />
                          <DeleteOrderButton id={orderId} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
