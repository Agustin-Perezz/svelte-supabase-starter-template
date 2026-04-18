import { z } from 'zod';

export enum OAuthProvider {
  Google = 'google',
  Facebook = 'facebook'
}

export const magicLinkSchema = z.object({
  email: z.email('Invalid email address')
});

export type MagicLinkDTO = z.infer<typeof magicLinkSchema>;
