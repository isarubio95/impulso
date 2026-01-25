export const runtime = 'nodejs';

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Pedidos</h1>
        <p className="text-stone-600">Gestión de pedidos de la tienda.</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center">
        <p className="text-stone-500">Aquí aparecerá el listado de pedidos.</p>
      </div>
    </div>
  );
}
