import type { Book, BookDTO } from '$domain/entities/book.entity';

export type CreateBookResponseDto = BookDTO;

export function toCreateBookResponseDto(book: Book): CreateBookResponseDto {
  return book.toJSON();
}
