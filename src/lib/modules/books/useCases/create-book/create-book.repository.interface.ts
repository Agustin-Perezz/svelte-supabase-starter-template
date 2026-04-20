import type { Book } from '$modules/books/domain/Book';

export interface ICreateBookRepository {
  create(book: Book): Promise<Book>;
}
