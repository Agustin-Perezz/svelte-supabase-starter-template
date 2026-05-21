import type { Book, BookDto } from '$domain/entities/book.entity';

export type UpdateBookResponseDto = BookDto;

export function toUpdateBookResponseDto(book: Book): UpdateBookResponseDto {
  return book.toJSON();
}
