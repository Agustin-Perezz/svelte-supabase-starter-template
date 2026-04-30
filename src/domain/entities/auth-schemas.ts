import { z } from 'zod';

import { OAuthProvider } from './oauth-provider.enum';

export const magicLinkSchema = z.object({
  email: z.email('Invalid email address')
});

export type MagicLinkDTO = z.infer<typeof magicLinkSchema>;

export { OAuthProvider };
