import { FiBox, FiTag, FiCalendar } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <header className="sticky py-6 top-0 z-40 bg-sky-950 text-white border-b">
        <div className="max-w-6xl mx-auto min-h-screen h-full px-4 pb-16 flex flex-col items-center">
          <h1 className="text-lg font-semibold pl-2">Panel de administración</h1>
          <nav className="flex flex-col gap-2 justify-center h-full w-full">
            <a
              href="/admin/products"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiBox className="w-4 h-4" aria-hidden="true" />
              Productos
            </a>

            <a
              href="/admin/promotions"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiTag className="w-4 h-4" aria-hidden="true" />
              Promociones
            </a>

            <a
              href="/admin/appointments"
              className="inline-flex items-center gap-3 px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-800"
            >
              <FiCalendar className="w-4 h-4" aria-hidden="true" />
              Citas
            </a>
          </nav>
        </div>
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
