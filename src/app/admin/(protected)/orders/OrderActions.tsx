'use client';

import { useTransition } from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import { confirmOrder, deleteOrder } from './actions';

export function ConfirmOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => confirmOrder(id))}
      disabled={isPending}
      className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
      title="Confirmar pedido"
    >
      <FiCheck className="w-5 h-5" />
    </button>
  );
}

export function DeleteOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
          startTransition(() => deleteOrder(id));
        }
      }}
      disabled={isPending}
      className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
      title="Eliminar pedido"
    >
      <FiTrash2 className="w-5 h-5" />
    </button>
  );
}
