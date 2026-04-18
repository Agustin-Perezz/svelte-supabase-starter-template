import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$modules/shared/domain/database.types';

declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name?: string;
      } | null;
      supabase: SupabaseClient<Database>;
    }
  }
}

export {};
