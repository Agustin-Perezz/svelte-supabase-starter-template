import type { Book, BookEntityInsert, BookEntityUpdate } from './Book';

export interface IBookRepository {
  getAll(): Promise<Book[]>;
  getById(_id: string): Promise<Book>;
  create(_book: BookEntityInsert): Promise<Book>;
  update(_id: string, _book: BookEntityUpdate): Promise<Book>;
  delete(_id: string): Promise<void>;
}
