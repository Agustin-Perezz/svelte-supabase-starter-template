import type { Book } from '$domain/entities/book.entity';

export interface ICreateBookRepository {
  create(book: Book): Promise<Book>;
}
