import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$modules/shared/domain/database.types';

import { SupabaseCreateBookRepository } from './infrastructure/repositories/supabase-create-book.repository';
import { SupabaseUpdateBookRepository } from './infrastructure/repositories/supabase-update-book.repository';
import { CreateBookUseCase } from './useCases/create-book/create-book.use-case';
import { UpdateBookUseCase } from './useCases/update-book/update-book.use-case';

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
