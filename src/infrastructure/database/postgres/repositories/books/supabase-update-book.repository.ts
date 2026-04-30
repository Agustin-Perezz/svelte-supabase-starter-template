import type { SupabaseClient } from '@supabase/supabase-js';
import type { IUpdateBookRepository } from '$application/use-cases/books/update-book/update-book.repository.interface';
import type { UpdateBookFieldsDto } from '$application/use-cases/books/update-book/update-book.request.dto';
import { Book } from '$domain/entities/book.entity';

import type { Database } from '$lib/shared/domain/database.types';
import type { BookEntity } from '../../entities/book.entity';

export class SupabaseUpdateBookRepository implements IUpdateBookRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async update(id: string, fields: UpdateBookFieldsDto): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .update(fields)
      .eq('id', id)
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
