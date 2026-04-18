import type { SupabaseAuthRepository } from '../infrastructure/SupabaseAuthRepository.server';

export class SignInWithMagicLink {
  // eslint-disable-next-line no-unused-vars
  constructor(private repo: SupabaseAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<void> {
    await this.repo.signInWithOtp(email, redirectTo);
  }
}
