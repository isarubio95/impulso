'use server';

import { signInAdmin } from '@/lib/auth-admin';
import { z } from 'zod';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(formData: FormData) {
  const parsed = Schema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  await signInAdmin(parsed.email, parsed.password);
}
