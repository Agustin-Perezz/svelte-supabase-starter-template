import { z } from 'zod';

export const signInWithMagicLinkSchema = z.object({
  email: z.email('Invalid email address')
});

export type SignInWithMagicLinkDto = z.infer<typeof signInWithMagicLinkSchema>;
