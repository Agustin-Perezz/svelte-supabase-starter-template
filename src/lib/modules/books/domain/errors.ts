export class BookNotFoundError extends Error {
  constructor(id: string) {
    super(`Book not found: ${id}`);
    this.name = 'BookNotFoundError';
  }
}

export class DuplicateBookError extends Error {
  constructor(title: string) {
    super(`A book with title "${title}" already exists`);
    this.name = 'DuplicateBookError';
  }
}
