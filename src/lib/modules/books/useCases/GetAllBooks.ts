import type { Book } from '$modules/books/domain/Book';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';

export class GetAllBooks {
  private readonly repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Book[]> {
    return this.repository.getAll();
  }
}
