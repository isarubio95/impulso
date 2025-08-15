'use client';

import { useEffect, useState } from 'react';
import { slugify } from '@/lib/slug';

export default function NameSlugFields({
  defaultName = '',
  defaultSlug = '',
}: {
  defaultName?: string;
  defaultSlug?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug || slugify(defaultName));
  const [manual, setManual] = useState(Boolean(defaultSlug)); // si ya venía, asumimos manual

  // cuando cambia el nombre y NO está en modo manual, refrescamos slug
  useEffect(() => {
    if (!manual) setSlug(slugify(name));
  }, [name, manual]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <label className="block">
        <span className="block text-sm mb-1">Nombre</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </label>

      <label className="block">
        <span className="block text-sm mb-1">Slug</span>
        <div className="flex items-center gap-2">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setManual(true);
              setSlug(slugify(e.target.value));
            }}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="se-generara-automaticamente"
          />
          <button
            type="button"
            className="px-2 py-1 text-xs rounded border hover:bg-stone-50"
            onClick={() => {
              setManual(false);
              setSlug(slugify(name));
            }}
            title="Regenerar a partir del nombre"
          >
            Auto
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Puedes editarlo. “Auto” lo regenera desde el nombre.
        </p>
      </label>
    </div>
  );
}
