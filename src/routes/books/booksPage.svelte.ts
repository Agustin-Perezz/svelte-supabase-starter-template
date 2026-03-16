import type { Book } from '$domain/models/book';

export class BooksPageState {
  books = $state<Book[]>([]);

  readonly hasBooks = $derived(this.books.length > 0);

  constructor(books: Book[]) {
    this.books = books;
  }
}
