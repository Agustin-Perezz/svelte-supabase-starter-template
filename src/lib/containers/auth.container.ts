import type { SupabaseClient } from '@supabase/supabase-js';
import { SignInWithMagicLinkUseCase } from '$application/use-cases/auth/sign-in-with-magic-link/sign-in-with-magic-link.use-case';
import { SignInWithOAuthUseCase } from '$application/use-cases/auth/sign-in-with-oauth/sign-in-with-oauth.use-case';
import { SupabaseAuthRepository } from '$infrastructure/database/postgres/repositories/auth/supabase-auth.repository';

import type { Database } from '$lib/shared/domain/database.types';

export interface AuthContainer {
  signInWithMagicLink: SignInWithMagicLinkUseCase;
  signInWithOAuth: SignInWithOAuthUseCase;
}

export function createAuthContainer(
  supabase: SupabaseClient<Database>
): AuthContainer {
  const authRepository = new SupabaseAuthRepository(supabase);

  return {
    signInWithMagicLink: new SignInWithMagicLinkUseCase(authRepository),
    signInWithOAuth: new SignInWithOAuthUseCase(authRepository)
  };
}
