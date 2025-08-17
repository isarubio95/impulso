// app/api/me/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(
    user
      ? { user: { id: user.id, name: user.name, email: user.email, role: user.role } }
      : { user: null },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    }
  );
}
