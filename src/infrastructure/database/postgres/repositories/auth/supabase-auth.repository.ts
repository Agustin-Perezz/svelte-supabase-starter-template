import type { SupabaseClient } from '@supabase/supabase-js';
import type { ISignInWithMagicLinkRepository } from '$application/use-cases/auth/sign-in-with-magic-link/sign-in-with-magic-link.repository.interface';
import type { ISignInWithOAuthRepository } from '$application/use-cases/auth/sign-in-with-oauth/sign-in-with-oauth.repository.interface';
import { OAuthProvider } from '$domain/entities/oauth-provider.enum';

import type { Database } from '$lib/shared/domain/database.types';

export class SupabaseAuthRepository
  implements ISignInWithMagicLinkRepository, ISignInWithOAuthRepository
{
  constructor(private supabase: SupabaseClient<Database>) {}

  async signInWithOtp(email: string, emailRedirectTo: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo
      }
    });

    if (error) {
      throw new Error(`Failed to sign in with OTP: ${error.message}`);
    }
  }

  async signInWithOAuth(
    provider: OAuthProvider,
    redirectTo: string
  ): Promise<string> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    });

    if (error) {
      throw new Error(`Failed to sign in with ${provider}: ${error.message}`);
    }

    if (!data.url) {
      throw new Error(`No OAuth URL returned for ${provider}`);
    }

    return data.url;
  }
}
