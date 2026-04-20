import { OAuthProvider } from '../domain/AuthSchemas';
import type { SupabaseAuthRepository } from '../infrastructure/SupabaseAuthRepository.server';

export class SignInWithOAuth {
  constructor(private repo: SupabaseAuthRepository) {}

  async execute(provider: OAuthProvider, redirectTo: string): Promise<string> {
    return this.repo.signInWithOAuth(provider, redirectTo);
  }
}
