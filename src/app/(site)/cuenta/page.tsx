export const runtime = 'nodejs';

import { requireUser, signOut } from '@/lib/auth';
import Link from 'next/link';

export default async function CuentaPage() {
  // Protegemos la página: si no hay sesión -> redirect('/login')
  const user = await requireUser();

  return (
    <section className="min-h-[70vh] bg-white text-stone-600 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6 rounded-lg bg-white shadow-soft p-6">
        <header className="flex items-center justify-between">
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

        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-stone-500">Nombre:</span>{' '}
            <span className="text-stone-800">{user.name ?? '—'}</span>
          </div>
          <div className="text-sm">
            <span className="text-stone-500">Email:</span>{' '}
            <span className="text-stone-800">{user.email}</span>
          </div>         
        </div>

        {/* Botón de cerrar sesión */}
        <form action={signOut} className="pt-2">
          <button
            type="submit"
            className="cursor-pointer w-full rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
          >
            Cerrar sesión
          </button>
        </form>

        {/* Bloque opcional para futuras features */}
        <div className="text-xs text-stone-500">
          Próximamente: editar perfil, cambiar contraseña, etc.
        </div>
      </div>
    </section>
  );
}
