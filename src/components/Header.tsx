'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FaUser, FaShoppingCart } from 'react-icons/fa'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/citas', label: 'Citas' },
    { href: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="bg-rose-100 border-b border-rose-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-lg font-bold text-rose-600">🌸 
                Impulso
            </div>
            <nav className="flex gap-4">
                {navItems.map(item => (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'px-3 py-1 rounded-md text-sm font-medium',
                        pathname === item.href
                        ? 'bg-rose-500 text-white'
                        : 'text-stone-900 hover:bg-rose-200'
                    )}
                    >
                    {item.label}
                    </Link>
                ))}
            </nav>
            <div className="flex items-center gap-4">
                {/* Icono de usuario */}
                <Link href="/cuenta" aria-label="Ir a mi cuenta">
                    <FaUser className="w-4 h-4 text-stone-700 hover:text-stone-800 transition" />
                </Link>

                {/* Icono de carrito */}
                <Link href="/carrito" aria-label="Ir al carrito">
                    <FaShoppingCart className="w-4 h-4 text-stone-700 hover:text-stone-800 transition" />
                </Link>
            </div>
        </div>
    </header>
  )
}
