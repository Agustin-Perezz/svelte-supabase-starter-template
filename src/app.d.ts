import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$domain/types/database.types';
import type { BooksRepository } from '$server/repositories/books.repository';
import type { BooksService } from '$server/services/books.service';

import type { User } from '$lib/server/auth';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      supabase: SupabaseClient<Database>;
      booksRepository: BooksRepository;
      booksService: BooksService;
    }
  }
}

export {};
