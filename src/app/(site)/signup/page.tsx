'use client';

import { signUp } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    formData.delete('confirmPassword'); // Limpiamos el campo extra antes de enviar
    await signUp(formData);
  }

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Crear una cuenta
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Únete a nosotros para empezar a comprar
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-stone-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="next" value="/" />

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                Nombre completo
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full rounded-md border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm px-3 py-2 border outline-none transition-colors placeholder:text-stone-400 text-stone-900"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="block w-full rounded-md border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm px-3 py-2 border outline-none transition-colors placeholder:text-stone-400 text-stone-900"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">Mínimo 8 caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
                Repetir contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="block w-full rounded-md border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm px-3 py-2 border outline-none transition-colors placeholder:text-stone-400 text-stone-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-rose-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                Crear cuenta
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
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-md border border-stone-300 bg-white py-2 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
              >
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
