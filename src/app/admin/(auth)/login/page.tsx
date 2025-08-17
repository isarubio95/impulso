export const runtime = 'nodejs';

import { signIn } from './actions';

export default function AdminLoginPage() {
  return (
    <section className="max-w-sm mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6">Acceso administración</h1>
      <form action={signIn} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" type="email" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input name="password" type="password" className="w-full border rounded px-3 py-2" required />
        </div>
        <button type="submit" className="w-full bg-stone-900 text-white rounded px-3 py-2">
          Entrar
        </button>
      </form>
    </section>
  );
}
