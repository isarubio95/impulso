import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type IncluyeItem = { nombre: string; cantidad: string }

function getSlug(req: Request): string {
  const path = new URL(req.url).pathname
  // .../api/tratamientos/<slug>
  const parts = path.replace(/\/+$/,'').split('/')
  return decodeURIComponent(parts[parts.length - 1] || '')
}

function toIncluye(comp: unknown): IncluyeItem[] {
  if (!Array.isArray(comp)) return []
  return comp
    .map((it) => {
      let nombre = ''
      let cantidad = ''
      if (typeof it === 'object' && it !== null) {
        const obj = it as Record<string, unknown>
        nombre = typeof obj.nombre === 'string' ? obj.nombre : String(obj.nombre ?? '')
        cantidad = typeof obj.cantidad === 'string' ? obj.cantidad : String(obj.cantidad ?? '')
      } else {
        nombre = String(it ?? '')
      }
      return { nombre, cantidad }
    })
    .filter(it => it.nombre.length > 0 || it.cantidad.length > 0)
}

export async function GET(req: Request) {
  const slug = getSlug(req)
  if (!slug) {
    return NextResponse.json({ error: 'Slug requerido' }, { status: 400 })
  }

  const row = await prisma.treatment.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      desc: true,
      longDesc: true,
      imageUrl: true,
      imageAlt: true,
      composition: true,
      isActive: true,
    },
  })

  if (!row || !row.isActive) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Shape que ya usas en la página de detalle
  const data = {
    slug: row.slug,
    titulo: row.title,
    img: row.imageUrl,
    alt: row.imageAlt,
    descripcion: row.longDesc ?? row.desc,
    incluye: toIncluye(row.composition ?? []),
    // precioDesde: (si algún día añades un campo de precio, lo puedes mapear aquí)
  }

  return NextResponse.json(data)
}
