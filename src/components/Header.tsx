'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/assets/img/logo.png'
import { FaBars, FaTimes, FaUser, FaShoppingCart } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScroll, setLastScroll] = useState(0)

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/citas', label: 'Citas' },
    { href: '/contacto', label: 'Contacto' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      if (currentScroll < 50) {
        setIsVisible(true)
      } else if (currentScroll < lastScroll) {
        setIsVisible(true) // Subiendo → mostrar
      } else {
        setIsVisible(false) // Bajando → ocultar
      }
      setLastScroll(currentScroll)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScroll])

  return (
    <header
      className={cn(
        'sticky top-0 left-0 w-full bg-rose-100 border-b shadow-lg z-50 transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image src={Logo} alt="Logotipo de Impulso" width={50} />
        </Link>

        {/* Menú Desktop */}
        <nav className="hidden md:flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition',
                pathname === item.href
                  ? 'bg-rose-500 text-white'
                  : 'text-stone-900 hover:bg-rose-200'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Iconos */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cuenta" aria-label="Cuenta">
            <FaUser className="w-4 h-4 text-stone-700 hover:text-stone-800 transition" />
          </Link>
          <Link href="/carrito" aria-label="Carrito">
            <FaShoppingCart className="w-4 h-4 text-stone-700 hover:text-stone-800 transition" />
          </Link>
        </div>

        {/* Botón Hamburguesa */}
        <button
          className="md:hidden text-stone-900 cursor-pointer"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
        >
          <FaBars className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay + Menú Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-64 h-full bg-stone-50 z-50 shadow-lg p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center mb-4">
                <Image src={Logo} alt="Logo" width={40} />
                <button onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
                  <FaTimes className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-base font-medium px-3 py-2 rounded-md transition',
                    pathname === item.href
                      ? 'bg-rose-500 text-white'
                      : 'text-stone-700 hover:bg-rose-200'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-6 flex gap-4">
                <Link href="/cuenta" aria-label="Cuenta" onClick={() => setIsOpen(false)}>
                  <FaUser className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
                </Link>
                <Link href="/carrito" aria-label="Carrito" onClick={() => setIsOpen(false)}>
                  <FaShoppingCart className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
