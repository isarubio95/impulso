'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const compItemSchema = z.object({
  nombre: z.string().min(1).max(120),
  cantidad: z.string().min(1).max(120),
})

function parseComposition(
  text: string | undefined,
  _ctx: z.RefinementCtx
): Prisma.InputJsonValue | undefined {
  if (!text) return undefined
  const trimmed = text.trim()
  if (trimmed.length === 0) return undefined
  const parsed = z.array(compItemSchema).parse(JSON.parse(trimmed))
  const jsonArray = parsed.map(({ nombre, cantidad }) => ({ nombre, cantidad }))
  return jsonArray
}

const baseSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().trim().min(1, 'Slug requerido'),
  title: z.string().trim().min(1, 'Título requerido'),
  desc: z.string().trim().min(1, 'Resumen requerido'),
  longDesc: z.string().trim().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  imageAlt: z.string().trim().optional().or(z.literal('')).transform(v => (v === '' ? undefined : v)),
  isActive: z.union([z.literal('on'), z.literal('true'), z.literal('1')]).optional().transform(v => v !== undefined),
  composition: z.string().optional().or(z.literal('')).transform(parseComposition),
})

export async function upsertTreatment(formData: FormData) {
  try {
    const data = baseSchema.parse({
      id: (formData.get('id') as string) || undefined,
      slug: (formData.get('slug') as string) ?? '',
      title: (formData.get('title') as string) ?? '',
      desc: (formData.get('desc') as string) ?? '',
      longDesc: (formData.get('longDesc') as string) || undefined,
      imageUrl: (formData.get('imageUrl') as string) || undefined,
      imageAlt: (formData.get('imageAlt') as string) || undefined,
      isActive: (formData.get('isActive') as string) || undefined,
      composition: (formData.get('composition') as string) || '',
    })

    if (data.id) {
      const updated = await prisma.treatment.update({
        where: { id: data.id },
        data: {
          slug: data.slug,
          title: data.title,
          desc: data.desc,
          longDesc: data.longDesc,
          imageUrl: data.imageUrl,
          imageAlt: data.imageAlt,
          isActive: data.isActive,
          composition: data.composition,
        },
        select: { id: true },
      })
      revalidatePath('/admin/treatments')
      revalidatePath(`/admin/treatments/${updated.id}`)
      return { ok: true as const, id: updated.id }
    }

    const created = await prisma.treatment.create({
      data: {
        slug: data.slug,
        title: data.title,
        desc: data.desc,
        longDesc: data.longDesc,
        imageUrl: data.imageUrl,
        imageAlt: data.imageAlt,
        isActive: data.isActive,
        composition: data.composition,
      },
      select: { id: true },
    })
    revalidatePath('/admin/treatments')
    revalidatePath(`/admin/treatments/${created.id}`)
    return { ok: true as const, id: created.id }
  } catch (err) {
    const msg = err instanceof z.ZodError ? JSON.stringify(err.flatten()) : (err as Error).message ?? 'Error'
    return { ok: false as const, error: msg }
  }
}

export async function deleteTreatment(formData: FormData) {
  const id = formData.get('id') as string | null
  if (!id) return { ok: false as const, error: 'ID requerido' }
  await prisma.treatment.delete({ where: { id } })
  revalidatePath('/admin/treatments')
  return { ok: true as const }
}
