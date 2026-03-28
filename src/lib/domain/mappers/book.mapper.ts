import type { Book, BookInsert, BookUpdate } from '$domain/models/book';
import type { Database } from '$domain/types/database.types';
import type { bookCreateSchema, bookUpdateSchema } from '$schemas/book.schema';
import type { z } from 'zod';

type BookRow = Database['public']['Tables']['books']['Row'];
type CreateDTO = z.infer<typeof bookCreateSchema>;
type UpdateDTO = Omit<z.infer<typeof bookUpdateSchema>, 'id'>;

export class BookMapper {
  static fromEntitiesToBooks(rows: BookRow[]): Book[] {
    return rows.map((row) => BookMapper.fromEntityToBook(row));
  }

  static fromEntityToBook(row: BookRow): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      created_at: row.created_at
    } satisfies Book;
  }

  static fromDtoToInsertEntity(dto: CreateDTO): BookInsert {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookInsert;
  }

  static fromDtoToUpdateEntity(dto: UpdateDTO): BookUpdate {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookUpdate;
  }
}
