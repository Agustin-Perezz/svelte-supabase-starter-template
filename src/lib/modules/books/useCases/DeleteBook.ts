import type { IBookRepository } from '$modules/books/domain/IBookRepository';

export class DeleteBook {
  private readonly repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
