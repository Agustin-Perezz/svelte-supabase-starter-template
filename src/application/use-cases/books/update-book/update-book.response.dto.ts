import type { Book, BookDTO } from '$domain/entities/book.entity';

export type UpdateBookResponseDto = BookDTO;

export function toUpdateBookResponseDto(book: Book): UpdateBookResponseDto {
  return book.toJSON();
}
