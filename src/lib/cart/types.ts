export type CartItem = {
  id: string;       // usa tu slug o id de BD
  name: string;
  price: number;    // en céntimos o euros (elige uno y sé consistente)
  image?: string;
  qty: number;
  variant?: string; // talla/color si aplica
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: 'ADD'; payload: Omit<CartItem, 'qty'> & { qty?: number } }
  | { type: 'INC'; payload: { id: string; variant?: string } }
  | { type: 'DEC'; payload: { id: string; variant?: string } }
  | { type: 'REMOVE'; payload: { id: string; variant?: string } }
  | { type: 'CLEAR' };
