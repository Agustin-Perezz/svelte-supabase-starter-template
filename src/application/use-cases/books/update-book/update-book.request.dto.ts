import { z } from 'zod';

export const updateBookRequestSchema = z.object({
  id: z.string().min(1, 'Book ID is required'),
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required')
});

export type UpdateBookRequestDto = z.infer<typeof updateBookRequestSchema>;
export type UpdateBookFieldsDto = Omit<UpdateBookRequestDto, 'id'>;
