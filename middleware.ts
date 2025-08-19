import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'admin_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si no es /admin o es la página de login de admin, no hacemos nada
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Miramos si existe la cookie de sesión de admin
  const hasAdminCookie = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!hasAdminCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configuración para que sólo se ejecute en rutas /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};

