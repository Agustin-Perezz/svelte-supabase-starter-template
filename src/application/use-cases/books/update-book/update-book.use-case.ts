import type { IUpdateBookRepository } from './update-book.repository.interface';
import type { UpdateBookFieldsDto } from './update-book.request.dto';

export class UpdateBookUseCase {
  constructor(private readonly repository: IUpdateBookRepository) {}

  async execute(id: string, dto: UpdateBookFieldsDto): Promise<void> {
    await this.repository.update(id, dto);
  }
}
