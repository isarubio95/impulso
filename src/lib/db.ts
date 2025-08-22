// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

// Fallback para runtime: si DATABASE_URL no está pero sí DIRECT_URL, úsala.
const candidate =
  (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '')
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL

if (candidate && /^postgres(ql)?:\/\//i.test(candidate)) {
  process.env.DATABASE_URL = candidate
} else {
  console.warn('[prisma] DATABASE_URL/DIRECT_URL no configuradas correctamente')
}

// Singleton en dev para evitar múltiples instancias
declare global {
  // eslint-disable-next-line no-var
  var __PRISMA__: PrismaClient | undefined
}

export const prisma =
  globalThis.__PRISMA__ ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__PRISMA__ = prisma
}
