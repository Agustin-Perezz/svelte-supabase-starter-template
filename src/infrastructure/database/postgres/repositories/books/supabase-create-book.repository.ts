import type { SupabaseClient } from '@supabase/supabase-js';
import type { ICreateBookRepository } from '$application/use-cases/books/create-book/create-book.repository.interface';
import { Book } from '$domain/entities/book.entity';

import type { Database } from '$lib/shared/domain/database.types';
import type { BookEntity } from '../../entities/book.entity';

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
