import type { Book } from '$modules/books/domain/Book';

import type { UpdateBookFieldsDto } from './update-book.request.dto';

export interface IUpdateBookRepository {
  update(id: string, fields: UpdateBookFieldsDto): Promise<Book>;
}
