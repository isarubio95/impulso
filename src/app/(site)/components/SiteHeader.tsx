'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/assets/img/logo.png'
import { useCart } from '@/app/(site)/components/cart/CartProvider';
import { useCartUI } from '@/app/(site)/components/cart/CartUIProvider';
import { FaBars, FaTimes, FaUser, FaShoppingCart } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Me = { id: string; name: string | null; email: string; role: 'user' | 'admin' } | null;

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScroll, setLastScroll] = useState(0)

  const { count } = useCart();
  const { openCart } = useCartUI();

  const [me, setMe] = useState<Me | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // ⬇️ ref para detectar clic fuera del menú de usuario
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/citas', label: 'Citas' },
    { href: '/contacto', label: 'Contacto' },
  ]

  // Bloquear scroll al abrir
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Ocultar/mostrar header con scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsVisible(y < 50 || y < lastScroll)
      setLastScroll(y)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScroll])

  // Cerrar menús al navegar
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Cargar usuario
  async function loadUser() {
    try {
      const r = await fetch('/api/me', { cache: 'no-store', credentials: 'same-origin' })
      if (!r.ok) { setMe(null); return }
      const json = await r.json()
      setMe(json?.user ?? null)
    } catch {
      setMe(null)
    }
  }
  useEffect(() => { loadUser() }, [])           // al montar
  useEffect(() => { loadUser() }, [pathname])   // al navegar

  // ⬇️ cerrar menú usuario al hacer clic fuera
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!userMenuOpen) return
      const el = userMenuRef.current
      if (el && !el.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [userMenuOpen])

  // ⬇️ cerrar con tecla Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      {/* HEADER */}
      <header
        className={cn(
          'sticky top-0 left-0 h-fit w-full bg-rose-100 border-b shadow-lg transition-transform duration-300 z-40',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Image src={Logo} alt="Logotipo de Impulso" width={50} />
          </Link>

          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition',
                  pathname === item.href ? 'bg-rose-500 text-white' : 'text-stone-900 hover:bg-rose-200'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-baseline gap-5">
            {/* Botón usuario + menú */}
            <div className="relative" ref={userMenuRef}>
              <button
                aria-label="Cuenta"
                onClick={() => setUserMenuOpen((v) => !v)}
                className='cursor-pointer'
              >
                <FaUser className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-48 bg-emerald-50 text-stone-600 rounded-md shadow-lg p-2"
                  >
                    {me ? (
                      <>
                        <div className="px-2 py-1 text-xs text-stone-500 truncate">
                          {me.name || me.email}
                        </div>
                        <Link
                          href="/cuenta"
                          className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-stone-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Área cliente
                        </Link>
                        <form action={async () => {
                          const mod = await import('@/lib/auth')
                          await mod.signOut()
                        }}>
                          <button
                            type="submit"
                            className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-stone-100 cursor-pointer"
                          >
                            Cerrar sesión
                          </button>
                        </form>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-stone-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              aria-label="Abrir carrito"
              aria-controls="cart-drawer"
              onClick={() => openCart()}
              className="relative inline-block cursor-pointer"
            >
              <FaShoppingCart className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
              {count > 0 && (
                <span
                  aria-label={`${count} artículos en el carrito`}
                  className="absolute -top-2 -right-3 text-xs bg-green-600 font-semibold text-white rounded-full px-1.5 py-0.5"
                >
                  {count}
                </span>
              )}
            </button>
          </div>

          <button
            className="md:hidden text-stone-900 cursor-pointer"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menú"
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* OVERLAY + MENÚ (fuera del header) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md"
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
              className="fixed top-0 left-0 z-[1001] w-64 h-dvh bg-stone-50 shadow-lg p-6 flex flex-col gap-4"
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
                    pathname === item.href ? 'bg-rose-500 text-white' : 'text-stone-700 hover:bg-rose-200'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-6 flex gap-4">
                <Link href={me ? '/cuenta' : '/login'} aria-label="Cuenta" onClick={() => setIsOpen(false)}>
                  <FaUser className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
                </Link>
                <button
                  aria-label="Carrito"
                  onClick={() => { console.log('openCart() click'); openCart(); }}
                >
                  <FaShoppingCart className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
