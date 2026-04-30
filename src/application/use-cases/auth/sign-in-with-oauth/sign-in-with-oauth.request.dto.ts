import { OAuthProvider } from '$domain/entities/oauth-provider.enum';
import { z } from 'zod';

export const signInWithOAuthSchema = z.object({
  provider: z.nativeEnum(OAuthProvider)
});

export type SignInWithOAuthDto = z.infer<typeof signInWithOAuthSchema>;
