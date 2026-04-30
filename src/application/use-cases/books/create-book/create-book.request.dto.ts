import { z } from 'zod';

export const createBookRequestSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required')
});

export type CreateBookRequestDto = z.infer<typeof createBookRequestSchema>;
