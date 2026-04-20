import { Book } from '$modules/books/domain/Book';

import type { ICreateBookRepository } from './create-book.repository.interface';
import type { CreateBookRequestDto } from './create-book.request.dto';
import {
  toCreateBookResponseDto,
  type CreateBookResponseDto
} from './create-book.response.dto';

export class CreateBookUseCase {
  constructor(private readonly repository: ICreateBookRepository) {}

  async execute(dto: CreateBookRequestDto): Promise<CreateBookResponseDto> {
    const book = Book.create({ title: dto.title, author: dto.author });
    const saved = await this.repository.create(book);
    return toCreateBookResponseDto(saved);
  }
}
