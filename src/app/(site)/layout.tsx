import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}