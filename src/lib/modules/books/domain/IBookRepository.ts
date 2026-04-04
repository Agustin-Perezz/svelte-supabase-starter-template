import type { Book, BookInsert, BookUpdate } from './Book';

export interface IBookRepository {
  getAll(): Promise<Book[]>;
  getById(_id: string): Promise<Book>;
  create(_book: BookInsert): Promise<Book>;
  update(_id: string, _book: BookUpdate): Promise<Book>;
  delete(_id: string): Promise<void>;
}
