import type { Book } from '$domain/entities/book.entity';

import type { UpdateBookFieldsDto } from './update-book.request.dto';

export interface IUpdateBookRepository {
  update(id: string, fields: UpdateBookFieldsDto): Promise<Book>;
}
