// src/app/admin/(protected)/treatments/[id]/page.tsx
export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { upsertTreatment, deleteTreatment } from '../actions';
import CompositionEditor from '../../products/CompositionEditor';
import FileDropzone from '../../FileDropzone';

// ---------- Server Actions WRAPPERS (devuelven void) ----------
async function saveAction(formData: FormData): Promise<void> {
  'use server';
  const res = await upsertTreatment(formData);
  if (!res.ok) throw new Error(res.error);
  redirect(`/admin/treatments/${res.id}`);
}

async function deleteAction(formData: FormData): Promise<void> {
  'use server';
  const res = await deleteTreatment(formData);
  if (!res.ok) throw new Error(res.error);
  redirect('/admin/treatments');
}
// --------------------------------------------------------------

type Params = { id: string };

// Normaliza lo que venga de BD a { nombre, cantidad }[]
type RawComposition = {
  nombre?: string;
  name?: string;
  ingrediente?: string;
  cantidad?: string;
  amount?: string;
};

export default async function EditTreatmentPage({
  params,
}: {
  params: Promise<Params>; // 👈 params como Promise
}) {
  const { id } = await params; // 👈 desestructurar con await
  if (!id) notFound();

  const isNew = id === 'new';

  const treatment = isNew
    ? null
    : await prisma.treatment.findUnique({
        where: { id },
      });

  if (!isNew && !treatment) {
    notFound();
  }

  const compInitial: Array<{ nombre: string; cantidad?: string }> =
    Array.isArray((treatment as { composition?: RawComposition[] })?.composition)
      ? (treatment!.composition as RawComposition[])
          .map((x) => ({
            nombre: String(x?.nombre ?? x?.name ?? x?.ingrediente ?? '').trim(),
            cantidad: String(x?.cantidad ?? x?.amount ?? '').trim(),
          }))
          .filter((x) => x.nombre !== '')
      : [];

  const currentImageUrl = isNew ? '' : (treatment!.imageUrl ?? '');
  const currentImageAlt = isNew ? '' : (treatment!.imageAlt ?? '');

  return (
    <section className="flex flex-col items-center max-w-6xl mx-auto space-y-6 text-stone-700 px-4 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isNew ? 'Nuevo tratamiento' : `Editar: ${treatment!.title}`}
        </h1>
        <Link
          href="/admin/treatments"
          className="text-sm text-blue-700 underline cursor-pointer"
        >
          Volver al listado
        </Link>
      </div>

      {isNew ? (
        // -------- CREATE --------
        <form action={saveAction} className="space-y-4 max-w-2xl w-full">
          <input type="hidden" name="isActive" value="false" />

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm mb-1">Título</span>
              <input
                name="title"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Presoterapia"
                required
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">Slug</span>
              <input
                name="slug"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="presoterapia"
                required
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input name="isActive" type="checkbox" value="true" defaultChecked />
            <span className="text-sm">Activo</span>
          </label>

          <label className="block">
            <span className="block text-sm mb-1">Descripción corta</span>
            <input name="desc" className="w-full rounded-md border px-3 py-2 text-sm" required />
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
            <span className="block text-sm mb-2">Composición / Incluye</span>
            <CompositionEditor initial={[]} />
          </label>

          {/* Imagen nueva + preview (igual que en otros sitios, sin anidar en <label>) */}
          <div className="block">
            <span className="block text-sm mb-1">Imagen</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="treatmentPreview"
              src="/assets/img/product.png"
              alt="Previsualización"
              className="w-20 h-20 object-contain border rounded-md bg-white mb-2"
            />
            <FileDropzone
              name="image"
              accept="image/*"
              maxMB={5}
              className="w-full"
              previewImgId="treatmentPreview"
            />
            <p className="text-xs text-stone-500 mt-1">
              Arrastra y suelta o haz clic. Máx. 5MB.
            </p>
          </div>

          <label className="block">
            <span className="block text-sm mb-1">Alt de la imagen</span>
            <input
              name="imageAlt"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Persona recibiendo tratamiento"
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
        <>
          {/* -------- EDIT -------- */}
          <form action={saveAction} className="space-y-4 w-full max-w-2xl">
            <input type="hidden" name="id" defaultValue={treatment!.id} />
            <input type="hidden" name="isActive" value="false" />

            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-1">Título</span>
                <input
                  name="title"
                  defaultValue={treatment!.title}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">Slug</span>
                <input
                  name="slug"
                  defaultValue={treatment!.slug}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </label>
            </div>

            <label className="flex items-center gap-2">
              <input
                name="isActive"
                type="checkbox"
                value="true"
                defaultChecked={treatment!.isActive}
              />
              <span className="text-sm">Activo</span>
            </label>

            <label className="block">
              <span className="block text-sm mb-1">Descripción corta</span>
              <input
                name="desc"
                defaultValue={treatment!.desc ?? ''}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">Descripción larga</span>
              <textarea
                name="longDesc"
                defaultValue={treatment!.longDesc ?? ''}
                rows={6}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-2">Composición / Incluye</span>
              <CompositionEditor initial={compInitial} />
            </label>

            {/* Imagen actual + nuevo upload (misma pauta que productos/promos) */}
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
                id="treatmentPreview" // 👈 FileDropzone actualizará esta preview
                src={currentImageUrl || '/assets/img/product.png'}
                alt={currentImageAlt || 'Imagen actual'}
                className="w-20 h-20 object-contain border rounded-md bg-white justify-self-end"
              />
            </div>

            {/* Subir nueva imagen con FileDropzone (fuera de <label> para evitar doble open) */}
            <div className="block">
              <span className="block text-sm mb-1">Subir nueva imagen</span>
              <FileDropzone
                name="image"
                accept="image/*"
                maxMB={5}
                className="w-full"
                previewImgId="treatmentPreview"
              />
              <p className="text-xs text-stone-500 mt-1">
                Arrastra y suelta o haz clic. Máx. 5MB (se valida también al guardar).
              </p>
            </div>

            <label className="block">
              <span className="block text-sm mb-1">Alt de la imagen</span>
              <input
                name="imageAlt"
                defaultValue={currentImageAlt}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Persona recibiendo tratamiento"
              />
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 cursor-pointer"
            >
              Guardar
            </button>
          </form>
        </>
      )}
    </section>
  );
}
