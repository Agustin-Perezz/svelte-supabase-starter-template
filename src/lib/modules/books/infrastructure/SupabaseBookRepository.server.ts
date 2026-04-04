import type { SupabaseClient } from '@supabase/supabase-js';
import type { Book, BookInsert, BookUpdate } from '$modules/books/domain/Book';
import type { IBookRepository } from '$modules/books/domain/IBookRepository';
import type { Database } from '$modules/shared/domain/database.types';

import { BookMapper } from './mappers/BookMapper';

export class SupabaseBookRepository implements IBookRepository {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getAll(): Promise<Book[]> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return BookMapper.fromEntitiesToBooks(data);
  }

  async getById(id: string): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return BookMapper.fromEntityToBook(data);
  }

  async create(book: BookInsert): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .insert(book)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return BookMapper.fromEntityToBook(data);
  }

  async update(id: string, book: BookUpdate): Promise<Book> {
    const { data, error } = await this.supabase
      .from('books')
      .update(book)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return BookMapper.fromEntityToBook(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('books').delete().eq('id', id);

    if (error) {
      throw error;
    }
  }
}
