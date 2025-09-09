export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import Link from 'next/link';
import { createProduct, updateProduct } from '../actions';
import CompositionEditor from '../CompositionEditor';
import NameSlugFields from '../NameSlugFields';
import FileDropzone from '../../FileDropzone';

type Params = { slug: string };

export default async function EditProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const isNew = slug === 'new';

  const product = isNew
    ? null
    : await prisma.product.findUnique({
        where: { slug },
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

  // --- Normalización para CompositionEditor ---
  type RawComposition = {
    nombre?: string;
    name?: string;
    ingrediente?: string;
    cantidad?: string;
    amount?: string;
  };

  const compInitial: Array<{ nombre: string; cantidad?: string }> =
    Array.isArray((product as { composition?: RawComposition[] })?.composition)
      ? (product!.composition as RawComposition[])
          .map((x) => ({
            nombre: String(x?.nombre ?? x?.name ?? x?.ingrediente ?? '').trim(),
            cantidad: String(x?.cantidad ?? x?.amount ?? '').trim(),
          }))
          .filter((x) => x.nombre !== '')
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

          {/* Imagen nueva + preview (no anidar en <label> para evitar doble open) */}
          <div className="block">
            <span className="block text-sm mb-1">Imagen</span>

            {/* Preview inicial */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="productPreview"
              src="/assets/img/product.png"
              alt="Previsualización"
              className="w-20 h-20 object-contain border rounded-md bg-white mb-2"
            />

            <FileDropzone
              name="image"
              accept="image/*"
              maxMB={5}
              className="w-full"
              previewImgId="productPreview"
            />

            <p className="text-xs text-stone-500 mt-1">
              Arrastra y suelta o haz clic. Máx. 5MB.
            </p>
          </div>

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

          {/* Composición con datos precargados */}
          <label className="block">
            <span className="block text-sm mb-2">Composición (ingredientes)</span>
            <CompositionEditor initial={compInitial} />
          </label>

          {/* Imagen: ruta actual + preview */}
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="block text-sm mb-1">Imagen (ruta actual)</span>
              <input
                name="imageUrl"
                defaultValue={currentImageUrl}
                readOnly
                className="w-full rounded-md border px-3 py-2 text-sm bg-stone-50"
                title="Ruta de la imagen actual"
              />
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="productPreview" // 👈 FileDropzone actualizará esta preview
              src={currentImageUrl || '/assets/img/product.png'}
              alt={product!.name}
              className="w-16 h-16 object-contain border rounded-md bg-white justify-self-end"
            />
          </div>

          <div className="block">
            <span className="block text-sm mb-1">Subir nueva imagen</span>
            <FileDropzone
              name="image"
              accept="image/*"
              maxMB={5}
              className="w-full"
              previewImgId="productPreview"
            />
            <p className="text-xs text-stone-500 mt-1">
              Arrastra y suelta o haz clic. Máx. 5MB (se valida también al guardar).
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
            >
              Guardar
            </button>            
          </div>
        </form>
      )}
    </section>
  );
}
