import { OAuthProvider } from '$domain/entities/oauth-provider.enum';

import type { ISignInWithOAuthRepository } from './sign-in-with-oauth.repository.interface';

export class SignInWithOAuthUseCase {
  constructor(private readonly repository: ISignInWithOAuthRepository) {}

  async execute(provider: OAuthProvider, redirectTo: string): Promise<string> {
    return this.repository.signInWithOAuth(provider, redirectTo);
  }
}
