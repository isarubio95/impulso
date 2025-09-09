export const runtime = 'nodejs';

import Link from 'next/link';
import { signIn } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp?.next ?? '';

  return (
    <section className="min-h-[75vh] bg-stone-50 text-stone-700 flex flex-col gap-6 items-center justify-center px-4">
      <form action={signIn} className="w-full shadow max-w-sm space-y-4 rounded-lg ring-1 ring-black/5 bg-white p-6">
        {next && <input type="hidden" name="next" value={next} />}

        <h1 className="text-lg mb-6 font-semibold text-center text-stone-800">Iniciar sesión</h1>

        <label className="block">
          <span className="mb-1 block text-sm">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="w-full mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
        >
          Entrar
        </button>
      </form>

      {/* Bloque para crear cuenta */}
      <div className="pt-2 text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="text-sky-700 hover:underline">
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
