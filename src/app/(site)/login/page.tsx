'use client';

import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { useActionState, use } from 'react';

type SearchParams = { next?: string };

type ActionState = {
  error?: string;
} | null;

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = use(searchParams || Promise.resolve({} as SearchParams));
  const next = sp?.next ?? '';

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      return await signIn(formData);
    },
    null
  );

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Bienvenido de nuevo
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-stone-100">
          <form action={formAction} className="space-y-6">
            {next && <input type="hidden" name="next" value={next} />}

            {/* AQUÍ SE MOSTRARÁ EL ERROR EN ROJO */}
            {state?.error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 animate-pulse">
                <p className="text-sm text-red-800 font-medium text-center flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {state.error}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm px-3 py-2 border outline-none transition-colors placeholder:text-stone-400 text-stone-900"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm px-3 py-2 border outline-none transition-colors placeholder:text-stone-400 text-stone-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-md border border-transparent bg-rose-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-stone-500">
                  ¿No tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                href="/signup"
                className="flex w-full items-center justify-center rounded-md border border-stone-300 bg-white py-2 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}