import { headers } from 'next/headers';

export async function absUrl(path: string) {
  const h = await headers(); // 👈 ahora sí
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}${path}`;
}

