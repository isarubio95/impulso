'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth' // ajusta si tu helper vive en otra ruta

const AddressSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, 'Nombre requerido'),
  phone: z.string().optional().default(''),
  line1: z.string().min(3, 'Dirección requerida'),
  line2: z.string().optional().default(''),
  city: z.string().min(2, 'Ciudad requerida'),
  province: z.string().min(2, 'Provincia requerida'),
  postalCode: z.string().min(3, 'CP requerido'),
  country: z.string().min(2).default('ES'),
  isDefault: z.boolean().optional().default(false),
})

function revalidate() {
  revalidatePath('/perfil/direcciones')
  revalidatePath('/checkout') // por si el usuario está en checkout
}

export async function upsertAddress(formData: FormData) {
  const me = await requireUser()

  const data = AddressSchema.parse({
    id: formData.get('id')?.toString() || undefined,
    fullName: formData.get('fullName')?.toString(),
    phone: formData.get('phone')?.toString(),
    line1: formData.get('line1')?.toString(),
    line2: formData.get('line2')?.toString() || '',
    city: formData.get('city')?.toString(),
    province: formData.get('province')?.toString(),
    postalCode: formData.get('postalCode')?.toString(),
    country: (formData.get('country')?.toString() || 'ES').toUpperCase(),
    isDefault: formData.get('isDefault') === 'on' || formData.get('isDefault') === 'true',
  })

  await prisma.$transaction(async (tx) => {
    if (data.id) {
      const updated = await tx.address.update({
        where: { id: data.id, userId: me.id },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: data.isDefault,
        },
      })
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: me.id, id: { not: updated.id } },
          data: { isDefault: false },
        })
      }
    } else {
      const created = await tx.address.create({
        data: { ...data, userId: me.id },
      })
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: me.id, id: { not: created.id } },
          data: { isDefault: false },
        })
      }
    }
  })

  revalidate()
  return { ok: true as const }
}

export async function setDefaultAddress(formData: FormData) {
  const me = await requireUser()
  const id = formData.get('id')?.toString()
  if (!id) return { ok: false as const, error: 'Falta id' }

  await prisma.$transaction(async (tx) => {
    // marca esta como default
    await tx.address.update({ where: { id, userId: me.id }, data: { isDefault: true } })
    // desmarca las demás
    await tx.address.updateMany({
      where: { userId: me.id, id: { not: id } },
      data: { isDefault: false },
    })
  })

  revalidate()
  return { ok: true as const }
}

export async function deleteAddress(formData: FormData) {
  const me = await requireUser()
  const id = formData.get('id')?.toString()
  if (!id) return { ok: false as const, error: 'Falta id' }

  // comprobamos que pertenece al usuario
  const addr = await prisma.address.findFirst({ where: { id, userId: me.id } })
  if (!addr) return { ok: false as const, error: 'No encontrado' }

  await prisma.address.delete({ where: { id } })
  revalidate()
  return { ok: true as const }
}
