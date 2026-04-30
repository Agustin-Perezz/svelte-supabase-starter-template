import { OAuthProvider } from '$domain/entities/oauth-provider.enum';

export interface ISignInWithOAuthRepository {
  signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<string>;
}
