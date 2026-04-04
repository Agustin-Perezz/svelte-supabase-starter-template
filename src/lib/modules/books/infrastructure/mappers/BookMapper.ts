import type { Book, BookInsert, BookUpdate } from '$modules/books/domain/Book';
import type {
  CreateBookDTO,
  UpdateBookDTO
} from '$modules/books/domain/BookSchemas';

export class BookMapper {
  static fromEntitiesToBooks(rows: Book[]): Book[] {
    return rows.map((row) => BookMapper.fromEntityToBook(row));
  }

  static fromEntityToBook(row: Book): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      created_at: row.created_at
    } satisfies Book;
  }

  static fromDtoToInsertEntity(dto: CreateBookDTO): BookInsert {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookInsert;
  }

  static fromDtoToUpdateEntity(dto: UpdateBookDTO): BookUpdate {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookUpdate;
  }
}
