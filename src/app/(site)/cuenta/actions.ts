'use server';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveAddress(formData: FormData) {
  const user = await requireUser();
  
  const id = formData.get('id') as string;
  const fullName = formData.get('fullName') as string;
  const line1 = formData.get('line1') as string;
  const line2 = formData.get('line2') as string;
  const postalCode = formData.get('postalCode') as string;
  const city = formData.get('city') as string;
  const province = formData.get('province') as string;
  const country = formData.get('country') as string;
  const phone = formData.get('phone') as string;

  const data = {
    fullName,
    line1,
    line2: line2 || null,
    postalCode,
    city,
    province,
    country,
    phone: phone || null,
    userId: user.id,
    isDefault: true,
  };

  if (id) {
    await prisma.address.update({ where: { id, userId: user.id }, data });
  } else {
    await prisma.address.create({ data });
  }

  revalidatePath('/cuenta');
  redirect('/cuenta');
}