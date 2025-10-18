'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/assets/img/logo.png'
import { useCart } from '@/app/(site)/components/cart/CartProvider'
import { useCartUI } from '@/app/(site)/components/cart/CartUIProvider'
import { FaBars, FaShoppingCart, FaRegUser, FaUser, FaTimes } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Me = { id: string; name: string | null; email: string; role: 'user' | 'admin' } | null;

export default function Header() {
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastYRef = useRef(0)
  const topSentinelRef = useRef<HTMLDivElement | null>(null)

  const { count } = useCart()
  const { openCart } = useCartUI()

  const [me, setMe] = useState<Me | undefined>(undefined)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/citas', label: 'Citas' },
    { href: '/contacto', label: 'Contacto' },
  ]

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => { setIsOpen(false) }, [pathname])

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
  useEffect(() => { loadUser() }, [])
  useEffect(() => { loadUser() }, [pathname])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!userMenuOpen) return
      const el = userMenuRef.current
      if (el && !el.contains(e.target as Node)) setUserMenuOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [userMenuOpen])

  useEffect(() => {
    const el = topSentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const last = lastYRef.current
      if (y < 12) setIsVisible(true)
      else setIsVisible(y < last)
      lastYRef.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rose-100 = #ffe4e6
  const bgColor = isScrolled ? 'rgba(255, 228, 230, 0.9)' : 'rgba(255, 228, 230, 1)'

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 w-full z-40 relative overflow-visible', // <- overflow visible para que sobresalga el menú
          'shadow-lg',
          'transition-transform duration-300 will-change-transform',
          'backdrop-blur-sm',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
        style={{
          backgroundColor: bgColor,
          transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,-100%,0)',
          WebkitTransform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,-100%,0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          // ¡Quitado contain: 'paint' para que no recorte el dropdown!
        }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" aria-label="Ir a inicio">
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

          <div className="hidden md:flex items-center gap-5">
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                aria-label={userMenuOpen ? 'Cerrar menú de cuenta' : 'Abrir menú de cuenta'}
                onClick={() => setUserMenuOpen((v) => !v)}
                className="cursor-pointer"
              >
                {userMenuOpen ? (
                  <FaUser className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
                ) : (
                  <FaRegUser className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-48 bg-emerald-50 text-stone-600 rounded-md shadow-lg p-2 z-50" // <- z alto
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
                        <form
                          action={async () => {
                            const mod = await import('@/lib/auth')
                            await mod.signOut()
                          }}
                        >
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
              className="relative flex items-center cursor-pointer"
            >
              {count > 0 ? (
                <FaShoppingCart className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
              ) : (
                <FiShoppingCart className="w-4.5 h-auto text-stone-700 hover:text-stone-800 transition" />
              )}
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

          <div className="md:hidden flex items-center gap-5">
            <button
              type="button"
              aria-label="Abrir carrito"
              aria-controls="cart-drawer"
              onClick={() => openCart()}
              className="relative inline-block cursor-pointer"
            >
              {count > 0 ? (
                <FaShoppingCart className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
              ) : (
                <FiShoppingCart className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
              )}
              {count > 0 && (
                <span
                  aria-label={`${count} artículos en el carrito`}
                  className="absolute -top-2 -right-3 text-xs bg-green-600 font-semibold text-white rounded-full px-1.5 py-0.5"
                >
                  {count}
                </span>
              )}
            </button>

            <button
              className="text-stone-900 cursor-pointer"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sentinela para IO */}
      <div ref={topSentinelRef} aria-hidden className="h-px w-full" />

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

              <div className="mt-6">
                <Link href={me ? '/cuenta' : '/login'} aria-label="Cuenta" onClick={() => setIsOpen(false)}>
                  <FaUser className="w-5 h-5 text-stone-700 hover:text-stone-800 transition" />
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
