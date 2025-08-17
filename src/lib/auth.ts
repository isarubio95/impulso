'use server';

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

type CookieOpts = {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  domain?: string;
  maxAge?: number;
  expires?: Date;
};

const COOKIE_NAME = 'session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días
const COOKIE_OPTS: CookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: COOKIE_MAX_AGE,
};

function nowPlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// Acepta solo paths internos seguros (evita open-redirects)
function safePath(p?: string | null) {
  if (!p || typeof p !== 'string') return null;
  if (!p.startsWith('/')) return null;
  if (p.startsWith('//')) return null;
  return p;
}

/* =================== SIGN UP (registro público) =================== */
const SignUpSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  next: z.string().optional(),
});

export async function signUp(formData: FormData) {
  const parsed = SignUpSchema.parse({
    name: formData.get('name') ?? undefined,
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? undefined,
  });

  const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (exists) throw new Error('Ya existe un usuario con ese email.');

  const hash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      password: hash,
      name: parsed.name || null,
      role: 'user',
    },
  });

  const session = await prisma.session.create({
    data: { id: crypto.randomUUID(), userId: user.id, expiresAt: nowPlusDays(30) },
  });

  const c = await cookies();
  c.set(COOKIE_NAME, session.id, COOKIE_OPTS);

  redirect(parsed.next || '/');
}

/* =================== Sesión / Usuario =================== */
async function getSessionIdFromCookie() {
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value ?? null;
}

export async function getSession() {
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

export async function getCurrentUser() {
  const s = await getSession();
  return s?.user ?? null;
}

/* =================== Guards =================== */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    redirect('/cuenta');
  }
  return user;
}

/* =================== Password helpers =================== */
export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/* =================== Login / Logout =================== */
const LoginSchema = z.object({
  email: z.string(), // cámbialo a .email() si quieres
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function signIn(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? undefined,
  });
  if (!parsed.success) {
    throw new Error('Credenciales inválidas');
  }
  const { email, password } = parsed.data;
  const next = safePath(parsed.data.next);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Email o contraseña incorrectos');

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new Error('Email o contraseña incorrectos');

  const session = await prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      expiresAt: nowPlusDays(30),
    },
  });

  const c = await cookies();
  c.set(COOKIE_NAME, session.id, COOKIE_OPTS);

  // Destino según rol (y respetando `next` si es seguro y permitido)
  if (user.role === 'admin') {
    redirect(next || '/admin');
  } else {
    // Si intentaba ir al admin, lo ignoramos y lo llevamos al área de cliente
    if (next && next.startsWith('/admin')) redirect('/cuenta');
    redirect(next || '/cuenta');
  }
}

export async function signOut() {
  const sid = await getSessionIdFromCookie();
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
  }
  const c = await cookies();
  c.set(COOKIE_NAME, '', { ...COOKIE_OPTS, maxAge: 0 });
  redirect('/login');
}

/* =================== Utilidad admin opcional =================== */
export async function createAdmin(email: string, password: string, name?: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Ya existe un usuario con ese email');
  const hash = await hashPassword(password);
  return prisma.user.create({
    data: { email, password: hash, role: 'admin', name },
  });
}
