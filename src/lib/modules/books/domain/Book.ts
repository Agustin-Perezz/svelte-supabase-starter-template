import type { Database } from '$modules/shared/domain/database.types';

export type BookEntity = Database['public']['Tables']['books']['Row'];
export type BookEntityInsert = Database['public']['Tables']['books']['Insert'];
export type BookEntityUpdate = Database['public']['Tables']['books']['Update'];

export type Book = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
};

export type BookInsert = Omit<Book, 'id' | 'createdAt'>;
export type BookUpdate = Partial<Omit<BookInsert, 'id'>>;
