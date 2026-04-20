import type { SupabaseClient } from '@supabase/supabase-js';
import { Book } from '$modules/books/domain/Book';
import type { BookEntity } from '$modules/books/infrastructure/entities/book.entity';
import type { IUpdateBookRepository } from '$modules/books/useCases/update-book/update-book.repository.interface';
import type { UpdateBookFieldsDto } from '$modules/books/useCases/update-book/update-book.request.dto';
import type { Database } from '$modules/shared/domain/database.types';

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
