export const runtime = 'nodejs';

import { requireUser, signOut } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import AddressForm from './AddressForm';
import { use } from 'react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; edit?: string; showOrders?: string }>;
}) {
  // Protegemos la página: si no hay sesión -> redirect('/login')
  const user = await requireUser();
  const sp = await searchParams;
  const isEditingAddress = sp.edit === 'address';
  const showOrders = sp.showOrders === 'true';

  const year = sp.year ? parseInt(sp.year) : undefined;
  const month = sp.month ? parseInt(sp.month) : undefined;

  // 1. Obtener dirección principal (o la primera encontrada)
  const address = await prisma.address.findFirst({
    where: { userId: user.id },
    orderBy: { isDefault: 'desc' }, // Prioriza la marcada como default
  });

  // 2. Construir filtro de fecha para pedidos
  const whereOrders: any = { userId: user.id };
  if (year) {
    const start = new Date(year, month ? month - 1 : 0, 1);
    // Si hay mes, el fin es el mes siguiente; si no, el año siguiente
    const end = month ? new Date(year, month, 1) : new Date(year + 1, 0, 1);
    whereOrders.createdAt = { gte: start, lt: end };
  }

  // 3. Obtener pedidos (solo si se solicita mostrarlos)
  const orders = showOrders 
    ? await prisma.order.findMany({
        where: whereOrders,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // Generar lista de años para el select (año actual y 4 atrás)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <section className="min-h-[80vh] bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- CABECERA DE CUENTA --- */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <header className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-stone-800">Mi cuenta</h1>

          {/* Si el usuario es admin, un acceso rápido al panel */}
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="text-sm text-blue-700 hover:underline"
            >
              Ir al panel
            </Link>
          )}
        </header>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-stone-500">Nombre</p>
              <p className="font-medium text-stone-900">{user.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-stone-500">Email</p>
              <p className="font-medium text-stone-900">{user.email}</p>
            </div>
          </div>

          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* --- SECCIÓN DIRECCIÓN --- */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Mi Dirección</h2>
            <Link
              href={isEditingAddress ? "/cuenta" : "/cuenta?edit=address"}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline"
            >
              {isEditingAddress ? 'Cancelar' : (address ? 'Editar' : 'Añadir dirección')}
            </Link>
          </div>

          {isEditingAddress ? (
            <AddressForm address={address} />
          ) : address ? (
            <div className="text-sm text-stone-600">
              <p className="font-medium text-stone-900">{address.fullName}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.postalCode} {address.city}, {address.province}</p>
              <p>{address.country}</p>
              {address.phone && <p className="mt-1 text-stone-500">Tlf: {address.phone}</p>}
            </div>
          ) : (
            <p className="text-sm text-stone-500 italic">No tienes ninguna dirección guardada.</p>
          )}
        </div>

        {/* --- SECCIÓN PEDIDOS --- */}
        <div className="space-y-4">
          {!showOrders ? (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-10 text-center">
              <h2 className="text-xl font-bold text-stone-800 mb-2">Mis Pedidos</h2>
              <p className="text-stone-500 mb-6 text-sm">Consulta el historial de tus compras realizadas.</p>
              <Link
                href="/cuenta?showOrders=true"
                className="inline-block px-8 py-3 bg-stone-800 text-white text-sm font-bold rounded-lg hover:bg-stone-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Mostrar Pedidos
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-stone-800">Mis Pedidos</h2>
                  <Link href="/cuenta" className="text-xs text-stone-400 hover:text-rose-600 transition-colors underline">
                    (Ocultar)
                  </Link>
                </div>
            
            {/* Filtro */}
            <form className="flex flex-wrap gap-2">
              <input type="hidden" name="showOrders" value="true" />
              <select 
                name="year" 
                defaultValue={year || ''}
                className="text-sm font-medium text-stone-900 border border-stone-300 bg-white px-3 py-2 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500 outline-none cursor-pointer hover:border-stone-400 transition-colors"
              >
                <option value="">Todos los años</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              
              <select 
                name="month" 
                defaultValue={month || ''}
                className="text-sm font-medium text-stone-900 border border-stone-300 bg-white px-3 py-2 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500 outline-none cursor-pointer hover:border-stone-400 transition-colors"
              >
                <option value="">Todos los meses</option>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              
              <button 
                type="submit"
                className="px-3 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Filtrar
              </button>
              {(year || month) && (
                <Link href="/cuenta?showOrders=true" className="px-3 py-2 text-stone-600 text-sm hover:underline flex items-center">
                  Limpiar
                </Link>
              )}
            </form>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200 border-dashed">
              <p className="text-stone-500">No se encontraron pedidos.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded text-stone-600">#{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600">
                      {order.items.length} artículo{order.items.length !== 1 && 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    {/* 1. Usamos totalCents / 2. Dividimos por 100 / 3. Formateamos */}
                    <p className="font-bold text-stone-900">
                      {(order.totalCents / 100).toFixed(2)} €
                    </p>
                    
                    {/* Tip: Añadir el estado del pedido ayuda al usuario */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
