import { z } from 'zod'

export const createAppointmentSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  startsAt: z.string().datetime(), // ISO UTC
  endsAt: z.string().datetime(),
})

export const createProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.union([z.number(), z.string()]), // Prisma Decimal -> envía string o number
  desc: z.string().min(1),
  imageUrl: z.string().url().optional(),
  composition: z.any().optional(),
  isActive: z.boolean().optional(),
})

export const createPromotionSchema = z.object({
  title: z.string().min(1),
  productSlug: z.string().optional(), // si quieres asociarla por slug
  productId: z.string().optional(),   // o por id
  blurb: z.string().optional(),
  priceNew: z.union([z.number(), z.string()]).optional(),
  priceOld: z.union([z.number(), z.string()]).optional(),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
  ctaUrl: z.string().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
})
