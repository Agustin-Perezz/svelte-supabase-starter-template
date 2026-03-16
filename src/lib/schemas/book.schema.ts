import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required')
});

export const bookUpdateSchema = z.object({
  id: z.string().min(1, 'Book ID is required'),
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required')
});

export const bookDeleteSchema = z.object({
  id: z.string().min(1, 'Book ID is required')
});
