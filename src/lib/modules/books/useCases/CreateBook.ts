import type { Book } from '$modules/books/domain/Book';
import type { CreateBookDTO } from '$modules/books/domain/BookSchemas';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';
import { BookMapper } from '$modules/books/infrastructure/mappers/BookMapper';

export class CreateBook {
  private readonly repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async execute(dto: CreateBookDTO): Promise<Book> {
    const insert = BookMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(insert);
  }
}
