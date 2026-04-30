import type { SupabaseClient } from '@supabase/supabase-js';
import { CreateBookUseCase } from '$application/use-cases/books/create-book/create-book.use-case';
import { UpdateBookUseCase } from '$application/use-cases/books/update-book/update-book.use-case';
import { SupabaseCreateBookRepository } from '$infrastructure/database/postgres/repositories/books/supabase-create-book.repository';
import { SupabaseUpdateBookRepository } from '$infrastructure/database/postgres/repositories/books/supabase-update-book.repository';

import type { Database } from '$lib/shared/domain/database.types';

export interface BooksContainer {
  create: CreateBookUseCase;
  update: UpdateBookUseCase;
}

export function createBooksContainer(
  supabase: SupabaseClient<Database>
): BooksContainer {
  return {
    create: new CreateBookUseCase(new SupabaseCreateBookRepository(supabase)),
    update: new UpdateBookUseCase(new SupabaseUpdateBookRepository(supabase))
  };
}
