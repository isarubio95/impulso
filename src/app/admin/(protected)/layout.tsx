export const runtime = 'nodejs';

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-admin';
import { FiBox, FiTag, FiCalendar, FiActivity } from "react-icons/fi";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ⬇️ Protección: si no hay sesión de admin, redirige a /admin/login
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-stone-50">
      <header className="sticky top-0 box-border z-40 h-screen bg-sky-950 text-white border-r">
        <div className="max-w-6xl py-6 mx-auto min-h-screen h-full px-4 pb-16 flex flex-col items-center">
          <h1 className="text-lg font-semibold pl-2">Panel de administración</h1>
          <nav className="flex flex-col gap-2 justify-center h-full w-full">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiBox className="w-4 h-4" aria-hidden="true" />
              Productos
            </Link>

            <Link
              href="/admin/promotions"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiTag className="w-4 h-4" aria-hidden="true" />
              Promociones
            </Link>

            <Link
              href="/admin/appointments"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiCalendar className="w-4 h-4" aria-hidden="true" />
              Citas
            </Link>

            <Link
              href="/admin/treatments"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiActivity className="w-4 h-4" aria-hidden="true" />
              Tratamientos
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
