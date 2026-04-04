import type { Book } from '$modules/books/domain/Book';
import type { UpdateBookDTO } from '$modules/books/domain/BookSchemas';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';
import { BookMapper } from '$modules/books/infrastructure/mappers/BookMapper';

export class UpdateBook {
  private readonly repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async execute(id: string, dto: UpdateBookDTO): Promise<Book> {
    const update = BookMapper.fromDtoToUpdateEntity(dto);
    return this.repository.update(id, update);
  }
}
