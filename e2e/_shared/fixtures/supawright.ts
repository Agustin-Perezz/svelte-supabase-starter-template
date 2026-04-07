import { withSupawright } from 'supawright';

import type { Database } from '../../../src/lib/domain/types/database.types';

export const supaTest = withSupawright<Database, 'public'>(['public'], {
  supabase: {
    supabaseUrl: process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  },
  database: {
    host: '127.0.0.1',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  }
});
