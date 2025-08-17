import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import CartProvider from '@/app/(site)/components/cart/CartProvider';
import CartUIProvider from '@/app/(site)/components/cart/CartUIProvider';
import CartDrawer from '@/app/(site)/components/cart/CartDrawer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartProvider>
        <CartUIProvider>
          <SiteHeader />
            <main className="min-h-[60vh]">{children}</main>
            <CartDrawer />
          <SiteFooter />
        </CartUIProvider>
      </CartProvider>
    </>
  );
}