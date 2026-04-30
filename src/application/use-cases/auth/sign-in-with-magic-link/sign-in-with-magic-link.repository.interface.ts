export interface ISignInWithMagicLinkRepository {
  signInWithOtp(email: string, emailRedirectTo: string): Promise<void>;
}
