import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$modules/shared/domain/database.types';
import type { User } from '$modules/shared/infrastructure/auth.server';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      supabase: SupabaseClient<Database>;
    }
  }
}

export {};
