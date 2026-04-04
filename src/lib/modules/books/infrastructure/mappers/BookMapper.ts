import type {
  Book,
  BookEntity,
  BookEntityInsert,
  BookEntityUpdate
} from '$modules/books/domain/Book';
import type {
  CreateBookDTO,
  UpdateBookDTO
} from '$modules/books/domain/BookSchemas';

export class BookMapper {
  static fromEntitiesToBooks(rows: BookEntity[]): Book[] {
    return rows.map((row) => BookMapper.fromEntityToBook(row));
  }

  static fromEntityToBook(entity: BookEntity): Book {
    return {
      id: entity.id,
      title: entity.title,
      author: entity.author,
      createdAt: entity.created_at
    } satisfies Book;
  }

  static fromDtoToInsertEntity(dto: CreateBookDTO): BookEntityInsert {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookEntityInsert;
  }

  static fromDtoToUpdateEntity(dto: UpdateBookDTO): BookEntityUpdate {
    return {
      title: dto.title,
      author: dto.author
    } satisfies BookEntityUpdate;
  }
}
