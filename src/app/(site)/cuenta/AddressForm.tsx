'use client';

import { saveAddress } from './actions';
import { useActionState } from 'react';

export default function AddressForm({ address }: { address?: any }) {
  const [state, formAction, isPending] = useActionState(async (_prev: any, formData: FormData) => {
    try {
      await saveAddress(formData);
      return { error: null };
    } catch (e: any) {
      return { error: 'Error al guardar la dirección. Revisa los campos.' };
    }
  }, null);

  return (
    <form action={formAction} className="space-y-4 mt-4 border-t border-stone-100 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {address?.id && <input type="hidden" name="id" value={address.id} />}
      
      {state?.error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 mb-4">
          <p className="text-sm text-red-800 font-medium text-center">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre completo</label>
          <input name="fullName" defaultValue={address?.fullName} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Dirección</label>
          <input name="line1" defaultValue={address?.line1} required placeholder="Calle, número, piso..." className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Información adicional (opcional)</label>
          <input name="line2" defaultValue={address?.line2} placeholder="Bloque, puerta, etc." className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Código Postal</label>
          <input name="postalCode" defaultValue={address?.postalCode} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ciudad</label>
          <input name="city" defaultValue={address?.city} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Provincia</label>
          <input name="province" defaultValue={address?.province} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">País</label>
          <input name="country" defaultValue={address?.country || 'España'} required className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Teléfono</label>
          <input name="phone" defaultValue={address?.phone} type="tel" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-colors" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-rose-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Guardando...' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  );
}