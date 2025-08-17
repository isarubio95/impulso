export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import Link from 'next/link';
import { createProduct, updateProduct, deleteProduct } from '../actions';
import ConfirmSubmit from '../ConfirmSubmit';
import CompositionEditor from '../CompositionEditor';
import NameSlugFields from '../NameSlugFields';
import ImageInput from '../ImageInput';

type Params = { params: { slug: string } };

export default async function EditProductPage({ params }: Params) {
  const isNew = params.slug === 'new';

  const product = isNew
    ? null
    : await prisma.product.findUnique({
        where: { slug: params.slug },
      });

  if (!isNew && !product) {
    return (
      <section className="space-y-4 ">
        <p className="text-sm text-blue-600">Producto no encontrado.</p>
        <Link
          href="/admin/products"
          className="inline-flex px-3 py-2 rounded-md border cursor-pointer"
        >
          Volver
        </Link>
      </section>
    );
  }

  // --- Normalización para que CompositionEditor vea siempre { nombre, cantidad }[] ---
  const compInitial: Array<{ nombre: string; cantidad?: string }> =
    Array.isArray((product as any)?.composition)
      ? ((product as any).composition as any[]).map((x) => ({
          nombre: String(x?.nombre ?? x?.name ?? x?.ingrediente ?? '').trim(),
          cantidad: String(x?.cantidad ?? x?.amount ?? '').trim(),
        })).filter((x) => x.nombre !== '')
      : [];

  const currentImageUrl = isNew ? '' : (product!.imageUrl ?? '');

  return (
    <section className="flex flex-col items-center max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isNew ? 'Nuevo producto' : `Editar: ${product!.name}`}
        </h1>
        <Link href="/admin/products" className="text-sm text-blue-700 underline cursor-pointer">
          Volver al listado
        </Link>
      </div>

      {/* CREATE vs UPDATE */}
      {isNew ? (
        <form action={createProduct} className="space-y-4 max-w-2xl w-full">
          <input type="hidden" name="isActive" value="false" />

          <NameSlugFields />

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm mb-1">Precio (€)</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0.00"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="flex items-center gap-2 mt-6">
              <input name="isActive" type="checkbox" value="true" defaultChecked />
              <span className="text-sm">Activo</span>
            </label>
          </div>

          <label className="block">
            <span className="block text-sm mb-1">Descripción corta</span>
            <input
              name="desc"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Descripción larga</span>
            <textarea
              name="longDesc"
              rows={6}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-2">Composición (ingredientes)</span>
            <CompositionEditor initial={[]} />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Imagen</span>
            <ImageInput
              name="image"
              maxMB={5}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
          >
            Guardar
          </button>
        </form>
      ) : (
        <form
          action={updateProduct.bind(null, product!.slug)}
          className="space-y-4 w-full max-w-2xl"
        >
          <input type="hidden" name="isActive" value="false" />

          <NameSlugFields defaultName={product!.name} defaultSlug={product!.slug} />

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm mb-1">Precio (€)</span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(product!.price).toFixed(2)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="flex items-center gap-2 mt-6">
              <input
                name="isActive"
                type="checkbox"
                value="true"
                defaultChecked={product!.isActive}
              />
              <span className="text-sm">Activo</span>
            </label>
          </div>

          <label className="block">
            <span className="block text-sm mb-1">Descripción corta</span>
            <input
              name="desc"
              defaultValue={product!.desc ?? ''}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Descripción larga</span>
            <textarea
              name="longDesc"
              defaultValue={product!.longDesc ?? ''}
              rows={6}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          {/* Composición con datos precargados (normalizados) */}
          <label className="block">
            <span className="block text-sm mb-2">Composición (ingredientes)</span>
            <CompositionEditor initial={compInitial} />
          </label>

          {/* Imagen: ruta actual (readonly) + previsualización + input para nueva imagen */}
          <label className="block">
            <span className="block text-sm mb-1">Imagen</span>

            {/* Ruta actual (readonly) para que se vea y viaje en el form (si no subes nueva, se mantiene) */}
            <input
              name="imageUrl"
              defaultValue={currentImageUrl}
              readOnly
              className="w-full rounded-md border px-3 py-2 text-sm bg-stone-50"
              title="Ruta de la imagen actual"
            />

            {/* Previsualización de la imagen actual */}
            <div className="mt-2 flex items-center gap-3">
              <img
                src={currentImageUrl || '/assets/img/product.png'}
                alt="Imagen actual"
                className="w-20 h-20 object-contain border rounded-md bg-white"
              />

              {/* Selector para nueva imagen (con validación de 5MB) */}
              <ImageInput
                name="image"
                maxMB={5}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </label>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
            >
              Guardar
            </button>

            <ConfirmSubmit
              message={`¿Eliminar "${product!.name}"?`}
              className="px-4 py-2 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm cursor-pointer"
              formAction={deleteProduct.bind(null, product!.slug)}
            >
              Borrar
            </ConfirmSubmit>
          </div>
        </form>
      )}
    </section>
  );
}
