const KEY = 'cart:v1';

export const loadCart = <T>(fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

export const saveCart = (data: unknown) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('cart:v1', JSON.stringify(data)); } catch {}
};
