import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$modules/shared/domain/database.types';

import { OAuthProvider } from '../domain/AuthSchemas';

export class SupabaseAuthRepository {
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
