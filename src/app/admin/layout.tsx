export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-800">Panel de administración</h1>
          <nav className="text-sm text-stone-800">
            <a href="/admin/products" className="px-4 py-2 rounded hover:bg-stone-100">Productos</a>
            <a href="/admin/promotions" className="px-4 py-2 rounded hover:bg-stone-100">Promociones</a>
            <a href="/admin/appointments" className="px-4 py-2 rounded hover:bg-stone-100">Citas</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
