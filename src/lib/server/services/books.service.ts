import { BookMapper } from '$domain/mappers/book.mapper';
import type { Book } from '$domain/models/book';
import type { bookCreateSchema, bookUpdateSchema } from '$schemas/book.schema';
import type { BooksRepository } from '$server/repositories/books.repository';
import type { z } from 'zod';

type CreateDTO = z.infer<typeof bookCreateSchema>;
type UpdateDTO = Omit<z.infer<typeof bookUpdateSchema>, 'id'>;

export class BooksService {
  private readonly repository: BooksRepository;

  constructor(repository: BooksRepository) {
    this.repository = repository;
  }

  async getAllBooks(): Promise<Book[]> {
    return this.repository.getAll();
  }

  async createBook(dto: CreateDTO): Promise<Book> {
    const insert = BookMapper.fromDtoToInsertEntity(dto);
    return this.repository.create(insert);
  }

  async updateBook(id: string, dto: UpdateDTO): Promise<Book> {
    const update = BookMapper.fromDtoToUpdateEntity(dto);
    return this.repository.update(id, update);
  }

  async deleteBook(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
