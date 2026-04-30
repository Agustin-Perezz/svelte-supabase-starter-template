import type { ISignInWithMagicLinkRepository } from './sign-in-with-magic-link.repository.interface';
import type { SignInWithMagicLinkDto } from './sign-in-with-magic-link.request.dto';

export class SignInWithMagicLinkUseCase {
  constructor(private readonly repository: ISignInWithMagicLinkRepository) {}

  async execute(
    dto: SignInWithMagicLinkDto,
    redirectTo: string
  ): Promise<void> {
    await this.repository.signInWithOtp(dto.email, redirectTo);
  }
}
