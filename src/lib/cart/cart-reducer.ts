import { CartAction, CartItem, CartState } from './types';

const findIndex = (items: CartItem[], id: string, variant?: string) =>
  items.findIndex(i => i.id === id && i.variant === variant);

export const initialCart: CartState = { items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { id, variant, qty = 1, ...rest } = action.payload;
      const quantity = Number(qty) || 1; // Asegurar que es número
      const idx = findIndex(state.items, id, variant);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + quantity };
        return { items };
      }
      return { items: [...state.items, { id, variant, qty: quantity, ...rest }] };
    }
    case 'INC': {
      const idx = findIndex(state.items, action.payload.id, action.payload.variant);
      if (idx < 0) return state;
      const items = [...state.items];
      items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
      return { items };
    }
    case 'DEC': {
      const idx = findIndex(state.items, action.payload.id, action.payload.variant);
      if (idx < 0) return state;
      const items = [...state.items];
      const nextQty = items[idx].qty - 1;
      if (nextQty <= 0) items.splice(idx, 1);
      else items[idx] = { ...items[idx], qty: nextQty };
      return { items };
    }
    case 'REMOVE': {
      return {
        items: state.items.filter(
          i => !(i.id === action.payload.id && i.variant === action.payload.variant)
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export const getSubtotal = (items: CartItem[], cents = false) =>
  items.reduce((acc, i) => acc + (cents ? i.price : i.price) * i.qty, 0);

export const getCount = (items: CartItem[]) =>
  items.reduce((acc, i) => acc + i.qty, 0);
