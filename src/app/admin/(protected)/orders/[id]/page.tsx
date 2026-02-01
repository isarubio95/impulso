export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiUser, FiMapPin, FiCreditCard } from 'react-icons/fi';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' },
            take: 1
          }
        }
      },
      items: true,
    },
  });

  if (!order) notFound();

  const date = new Date(order.createdAt);
  const subtotal = order.subtotalCents / 100;
  const shipping = order.shippingCents / 100;
  const total = (order.subtotalCents + order.shippingCents + order.taxCents) / 100;
  
  // Cálculo de base imponible descontando el IVA del 21% del subtotal
  const baseImponible = subtotal / 1.21;
  const ivaCalculado = subtotal - baseImponible;

  const address = order.user?.addresses[0];
  const formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-2 transition-colors">
            <FiArrowLeft /> Volver a pedidos
          </Link>
          <h1 className="text-2xl font-bold text-stone-800">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-stone-600">{date.toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {String(order.status)}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Artículos y Resumen */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center gap-2 font-semibold text-stone-800">
              <FiPackage className="text-stone-400" /> Artículos vendidos
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-stone-500 border-b border-stone-100 bg-stone-50/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 text-center font-medium">Cant.</th>
                    <th className="px-4 py-3 text-right font-medium">Precio</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-stone-900">{item.name}</td>
                      <td className="px-4 py-4 text-center text-stone-600">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-stone-600">{formatter.format(item.unitCents / 100)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-stone-900">
                        {formatter.format((item.unitCents * item.quantity) / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 font-semibold text-stone-800 mb-6">
              <FiCreditCard className="text-stone-400" /> Desglose Económico
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Base Imponible (sin IVA 21%)</span>
                <span>{formatter.format(baseImponible)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>IVA (21%)</span>
                <span>{formatter.format(ivaCalculado)}</span>
              </div>
              <div className="flex justify-between font-medium text-stone-800 pt-3 border-t border-stone-100">
                <span>Subtotal Artículos</span>
                <span>{formatter.format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Gastos de envío</span>
                <span>{formatter.format(shipping)}</span>
              </div>
              <div className="pt-4 border-t border-stone-200 flex justify-between text-xl font-bold text-stone-900">
                <span>Total Pedido</span>
                <span>{formatter.format(total)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Cliente y Envío */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 font-semibold text-stone-800 mb-4">
              <FiUser className="text-stone-400" /> Información del Cliente
            </div>
            <div className="text-sm">
              <p className="font-medium text-stone-900">{order.user?.name || 'Usuario desconocido'}</p>
              <p className="text-stone-500">{order.user?.email}</p>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 font-semibold text-stone-800 mb-4">
              <FiMapPin className="text-stone-400" /> Dirección de Envío
            </div>
            {address ? (
              <div className="text-sm text-stone-600 space-y-1">
                <p className="font-medium text-stone-900">{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.postalCode} {address.city}</p>
                <p>{address.province}, {address.country}</p>
                {address.phone && (
                  <div className="mt-4 pt-4 border-t border-stone-50">
                    <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Teléfono de contacto</p>
                    <p className="text-stone-900">{address.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-stone-400 italic">No hay dirección registrada.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
