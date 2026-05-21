import type { Book, BookDto } from '$domain/entities/book.entity';

export type CreateBookResponseDto = BookDto;

export function toCreateBookResponseDto(book: Book): CreateBookResponseDto {
  return book.toJSON();
}
