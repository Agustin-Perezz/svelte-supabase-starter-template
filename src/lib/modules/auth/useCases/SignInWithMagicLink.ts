import type { SupabaseAuthRepository } from '../infrastructure/SupabaseAuthRepository.server';

export class SignInWithMagicLink {
  constructor(private repo: SupabaseAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<void> {
    await this.repo.signInWithOtp(email, redirectTo);
  }
}
