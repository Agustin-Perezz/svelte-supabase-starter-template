import type { SupabaseClient } from '@supabase/supabase-js';
import { Book } from '$modules/books/domain/Book';
import type { BookEntity } from '$modules/books/infrastructure/entities/book.entity';
import type { ICreateBookRepository } from '$modules/books/useCases/create-book/create-book.repository.interface';
import type { Database } from '$modules/shared/domain/database.types';

export class SupabaseCreateBookRepository implements ICreateBookRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(book: Book): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .insert({ title: book.title, author: book.author })
      .select()
      .single();

    if (error) throw error;

    return this.toDomain(data);
  }

  private toDomain(row: BookEntity): Book {
    return Book.reconstruct({
      id: row.id,
      title: row.title,
      author: row.author,
      createdAt: new Date(row.created_at)
    });
  }
}
