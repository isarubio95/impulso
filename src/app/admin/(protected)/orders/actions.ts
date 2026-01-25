'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function confirmOrder(id: string) {
  await prisma.order.update({
    where: { id },
    data: {
      status: 'PAID',
    },
  });

  revalidatePath('/admin/orders');
}

export async function deleteOrder(id: string) {
  await prisma.orderItem.deleteMany({
    where: { orderId: id },
  });

  await prisma.order.delete({
    where: { id },
  });

  revalidatePath('/admin/orders');
}