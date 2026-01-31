'use client'

import { useState, useEffect, useRef, use } from 'react'
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

export const triggerCartAnimation = (e: React.MouseEvent) => {
  const btn = e.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  window.dispatchEvent(new CustomEvent('cart-add-anim', { detail: { x, y } }));
};

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  
  const lastYRef = useRef(0)

  const { count } = useCart();
  const { openCart } = useCartUI();
  
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const mobileCartBtnRef = useRef<HTMLButtonElement>(null);
  const [flyingItems, setFlyingItems] = useState<{id: number, startX: number, startY: number}[]>([]);
  const [displayCount, setDisplayCount] = useState(count);
  const [cartIsBumping, setCartIsBumping] = useState(false);

  useEffect(() => {
    if (flyingItems.length === 0) {
      setDisplayCount(count);
    }
  }, [count, flyingItems.length]);

  useEffect(() => {
    const handler = (e: any) => {
      const { x, y } = e.detail;
      setFlyingItems(prev => [...prev, { id: Date.now(), startX: x, startY: y }]);
      setIsVisible(true); // Mostrar el header si estaba oculto
    };
    window.addEventListener('cart-add-anim', handler);
    return () => window.removeEventListener('cart-add-anim', handler);
  }, []);

  useEffect(() => {
    if (cartIsBumping) {
      const timeout = setTimeout(() => setCartIsBumping(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [cartIsBumping]);

  const [me, setMe] = useState<Me | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/tratamientos', label: 'Tratamientos' },
    { href: '/citas', label: 'Citas' },
    { href: '/contacto', label: 'Contacto' },
  ]

  // Bloquear scroll al abrir menú móvil
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const lastY = lastYRef.current
      
      // Es visible si estás cerca de la parte superior o si subes
      setIsVisible(y < 50 || y < lastY)
      
      // Actualiza la referencia para el próximo evento
      lastYRef.current = y
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, []) // 👈 El array de dependencias está vacío para que se ejecute solo una vez


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
  useEffect(() => { loadUser() }, [])
  useEffect(() => { loadUser() }, [pathname])

  // Cerrar menú de usuario al hacer clic fuera o con Escape
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!userMenuOpen) return
      const el = userMenuRef.current
      if (el && !el.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
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

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 h-fit w-full bg-rose-100/90 backdrop-blur-sm border-b shadow-lg transition-transform duration-300 z-40',
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
                  'px-3 py-1 rounded-md text-sm font-medium relative',
                  pathname === item.href
                    ? 'text-rose-700 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[75%] after:h-[2px] after:bg-rose-600 after:rounded-full after:origin-left after:scale-x-100 after:transition-transform after:duration-300'
                    : 'text-stone-900 hover:text-rose-700 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[90%] after:h-[2px] after:bg-rose-500 after:rounded-full after:origin-left after:scale-x-0'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                aria-label={userMenuOpen ? "Cerrar menú de cuenta" : "Abrir menú de cuenta"}
                onClick={() => setUserMenuOpen((v) => !v)}
                className='cursor-pointer'
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
                    className="absolute top-full right-0 mt-1 w-48 bg-emerald-50 text-stone-600 rounded-md shadow-lg p-2"
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
              ref={cartBtnRef}
              type="button"
              aria-label="Abrir carrito"
              aria-controls="cart-drawer"
              onClick={() => openCart()}
              className="relative flex items-center justify-center cursor-pointer"
            >
              <motion.div
                animate={cartIsBumping ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="relative flex items-center justify-center"
              >
                {displayCount > 0 ? (
                  <FaShoppingCart className="w-5.5 h-auto text-stone-800 hover:text-stone-900 transition" />
                ) : (
                  <FiShoppingCart className="w-6 h-auto text-stone-800 hover:text-stone-900 transition" />
                )}
                {displayCount > 0 && (
                <span
                  aria-label={`${displayCount} artículos en el carrito`}
                  className="absolute -top-2 -right-3 text-xs bg-green-600 font-semibold text-white rounded-full px-1.5 py-0.5"
                >
                  {displayCount}
                </span>
              )}
              </motion.div>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-7">
            <button
              ref={mobileCartBtnRef}
              type="button"
              aria-label="Abrir carrito"
              aria-controls="cart-drawer"
              onClick={() => openCart()}
              className="relative flex items-center justify-center cursor-pointer"
            >
              <motion.div
                animate={cartIsBumping ? { scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="relative inline-block"
              >
                {displayCount > 0 ? (
                  <FaShoppingCart className="w-6 h-6 text-stone-800 hover:text-stone-900 transition" />
                ) : (
                  <FiShoppingCart className="w-6 h-6 text-stone-800 hover:text-stone-900 transition" />
                )}
                {displayCount > 0 && (
                <span
                  aria-label={`${displayCount} artículos en el carrito`}
                  className="absolute -top-2 -right-3 text-xs bg-green-600 font-semibold text-white rounded-full px-1.5 py-0.5"
                >
                  {displayCount}
                </span>
              )}
              </motion.div>
            </button>

            <button
              className="text-stone-900 cursor-pointer"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
            >
              <FaBars className="w-6 h-6 text-stone-700 hover:text-stone-800 transition" />
            </button>
          </div>
        </div>
      </header>

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
                  <FaUser className="w-6 text-stone-700 hover:text-stone-800 transition" />
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flyingItems.map((item) => {
          const desktopRect = cartBtnRef.current?.getBoundingClientRect();
          const mobileRect = mobileCartBtnRef.current?.getBoundingClientRect();
          const targetRect = (desktopRect && desktopRect.width > 0) ? desktopRect : mobileRect;
          
          const targetX = targetRect ? targetRect.left + targetRect.width / 2 - 10 : 0;
          let targetY = targetRect ? targetRect.top + targetRect.height / 2 - 10 : 0;

          // Si el header estaba oculto (transformado hacia arriba), targetY será negativo.
          // Lo ajustamos manualmente para que vuele a la zona visible (aprox 28px desde arriba).
          if (targetY < 0) {
            targetY = 28;
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, x: item.startX - 10, y: item.startY - 10, scale: 1 }}
              animate={{ x: targetX, y: targetY, scale: 0.5, opacity: 0.5 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none' }}
              className="w-5 h-5 bg-rose-600 rounded-full shadow-md border-2 border-white"
              onAnimationComplete={() => {
                setFlyingItems(prev => prev.filter(i => i.id !== item.id));
                // Eliminado el incremento manual para evitar doble conteo
                setCartIsBumping(true);
              }}
            />
          );
        })}
      </AnimatePresence>
    </>
  )
}