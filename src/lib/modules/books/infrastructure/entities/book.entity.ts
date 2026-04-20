import type { Database } from '$modules/shared/domain/database.types';

export type BookEntity = Database['public']['Tables']['books']['Row'];
