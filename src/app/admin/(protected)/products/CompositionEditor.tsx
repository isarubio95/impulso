'use client';

import { useMemo, useState } from 'react';

type Item = { name: string; amount: string };

// Posibles formas “crudas” que pueden venir de BD
type RawIngredient = Partial<{
  name: unknown;
  ingrediente: unknown;
  amount: unknown;
  cantidad: unknown;
}>;
type RawCompositionObject = {
  ingredients?: RawIngredient[] | unknown;
  ingredientes?: RawIngredient[] | unknown;
};

function normalize(ri: RawIngredient): Item {
  return {
    name: String(ri.name ?? ri.ingrediente ?? ''),
    amount: String(ri.amount ?? ri.cantidad ?? ''),
  };
}

function anyToItems(input: unknown): Item[] {
  try {
    if (!input) return [];

    if (Array.isArray(input)) {
      return (input as RawIngredient[])
        .map((x: RawIngredient) => normalize(x))
        .filter((x) => x.name.trim() !== '');
    }

    if (typeof input === 'object') {
      const obj = input as RawCompositionObject;

      const arr: RawIngredient[] = Array.isArray(obj.ingredients)
        ? (obj.ingredients as RawIngredient[])
        : Array.isArray(obj.ingredientes)
        ? (obj.ingredientes as RawIngredient[])
        : [];

      return arr
        .map((x: RawIngredient) => normalize(x))
        .filter((x) => x.name.trim() !== '');
    }

    return [];
  } catch {
    return [];
  }
}

export default function CompositionEditor({
  initial,
  inputName = 'composition',
}: {
  /** JSON que viene de la BD para precargar (puede ser [] | {ingredients:[]}) */
  initial?: unknown;
  /** Nombre del input hidden que se enviará con el formulario */
  inputName?: string;
}) {
  const [items, setItems] = useState<Item[]>(() => anyToItems(initial));
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const jsonValue = useMemo(() => JSON.stringify(items), [items]);

  function add() {
    const n = name.trim();
    const a = amount.trim();
    if (!n) return;
    setItems((prev) => [...prev, { name: n, amount: a }]);
    setName('');
    setAmount('');
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="space-y-2">
      {/* Se envía al servidor como texto JSON */}
      <input type="hidden" name={inputName} value={jsonValue} />

      <div className="flex gap-2">
        <input
          placeholder="Ingrediente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKey}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <input
          placeholder="Cantidad"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={onKey}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-md border text-sm hover:bg-stone-50"
        >
          Añadir
        </button>
      </div>

      <div>
        {items.map((it, i) => (
            <div key={`${it.name}-${i}`} className="flex w-fit gap-5 items-center">
            <div className="flex gap-3">
                <div className="border p-2 rounded-md">{it.name}</div>
                {it.amount && <div className="border p-2 rounded-md">{it.amount}</div>}
            </div>
            <button
                type="button"
                onClick={() => remove(i)}
                className="p-2 font-bold rounded-md border border-rose-300 text-rose-800 hover:bg-rose-50 cursor-pointer"
            >
                Eliminar
            </button>
            </div>
        ))}
        </div>
    </div>
  );
}
