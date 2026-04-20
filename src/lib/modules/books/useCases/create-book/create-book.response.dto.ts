import type { Book, BookDTO } from '$modules/books/domain/Book';

export type CreateBookResponseDto = BookDTO;

export function toCreateBookResponseDto(book: Book): CreateBookResponseDto {
  return book.toJSON();
}
