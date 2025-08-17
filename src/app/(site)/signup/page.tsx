export const runtime = 'nodejs';

import { signUp } from '@/lib/auth';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <section className="bg-stone-50 min-h-[75vh] w-full mx-auto flex flex-col justify-center space-y-6 text-stone-700">
        <div className='flex flex-col self-center gap-6 justify-center min-w-md max-w-md'>
            <h1 className="text-xl font-semibold text-center">Crear cuenta</h1>
            <form action={signUp} className="space-y-4">
                {/* opcional: a dónde volver tras registrarse */}
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

                <div className='flex w-fit mx-auto'>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
                        >
                        Crear cuenta
                    </button>   
                </div>
                           
            </form>

            <p className="text-sm text-center text-stone-600 mt-6">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-sky-600 hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </div>
    </section>
  );
}
