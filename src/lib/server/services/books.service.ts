import type { Book, BookInsert, BookUpdate } from '$domain/models/book';
import type { BooksRepository } from '$server/repositories/books.repository';

export class BooksService {
  private readonly repository: BooksRepository;

  constructor(repository: BooksRepository) {
    this.repository = repository;
  }

  async getAllBooks(): Promise<Book[]> {
    return this.repository.getAll();
  }

  async createBook(data: BookInsert): Promise<Book> {
    if (!data.title.trim()) {
      throw new Error('Title is required');
    }

    if (!data.author.trim()) {
      throw new Error('Author is required');
    }

    return this.repository.create(data);
  }

  async updateBook(id: string, data: BookUpdate): Promise<Book> {
    return this.repository.update(id, data);
  }

  async deleteBook(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
