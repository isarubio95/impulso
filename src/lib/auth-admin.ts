'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'admin_session';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/admin',
  maxAge: 60 * 60 * 24 * 30, // 30 días
};

function nowPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function getSessionIdFromCookie() {
  const jar = await cookies();            // ← await
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function getAdminSession() {
  const sid = await getSessionIdFromCookie();
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

export async function getCurrentAdmin() {
  const s = await getAdminSession();
  return s?.user ?? null;
}

export async function requireAdmin() {
  const u = await getCurrentAdmin();
  if (!u || u.role !== 'admin') redirect('/admin/login');
  return u;
}

export async function signInAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'admin') throw new Error('Credenciales inválidas');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Credenciales inválidas');

  const session = await prisma.session.create({
    data: { id: crypto.randomUUID(), userId: user.id, expiresAt: nowPlusDays(30) },
  });

  const jar = await cookies();             // ← await
  jar.set(COOKIE_NAME, session.id, COOKIE_OPTS);

  redirect('/admin'); // o /admin/appointments
}

export async function signOutAdmin() {
  const sid = await getSessionIdFromCookie();
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
  }

  const jar = await cookies();             // ← await
  jar.set(COOKIE_NAME, '', { ...COOKIE_OPTS, maxAge: 0 });

  redirect('/admin/login');
}
