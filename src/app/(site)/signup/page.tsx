export const runtime = 'nodejs';

import { signUp } from '@/lib/auth';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <section className="min-h-[75vh] bg-stone-50 text-stone-700 flex flex-col gap-6 items-center justify-center py-6 px-4">
        <form action={signUp} className="w-full ring-1 ring-black/5 shadow max-w-sm space-y-4 rounded-lg bg-white p-6">
            <h1 className="text-xl font-semibold text-center">Crear cuenta</h1>
            <input type="hidden" name="next" value="/" />

            <label className="block">
            <span className="block text-sm mb-1">Nombre</span>
            <input
                name="name"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
            />
            </label>

            <label className="block">
            <span className="block text-sm mb-1">Email</span>
            <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
            />
            </label>

            <label className="block">
            <span className="block text-sm mb-1">Contraseña</span>
            <input
                name="password"
                type="password"
                minLength={8}
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <p className="text-xs text-stone-500 mt-1">Mínimo 8 caracteres.</p>
            </label>

            
                <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
                    >
                    Crear cuenta
                </button>   
                        
        </form>

        <p className="text-sm text-center text-stone-600  md:mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-sky-600 hover:underline">
                Inicia sesión
            </Link>
        </p>
    </section>
  );
}
