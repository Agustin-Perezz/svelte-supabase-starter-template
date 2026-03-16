import { fail } from '@sveltejs/kit';
import {
  bookCreateSchema,
  bookDeleteSchema,
  bookUpdateSchema
} from '$schemas/book.schema';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const books = await locals.booksRepository.getAll();
  const createForm = await superValidate(zod(bookCreateSchema));

  return { books, createForm };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(bookCreateSchema));

    if (!form.valid) {
      return fail(400, { createForm: form });
    }

    try {
      await locals.booksService.createBook(form.data);
    } catch (err) {
      return message(form, String(err), { status: 500 });
    }

    return { createForm: form };
  },

  update: async ({ request, locals }) => {
    const form = await superValidate(request, zod(bookUpdateSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { id, ...data } = form.data;

    try {
      await locals.booksService.updateBook(id, data);
    } catch (err) {
      return fail(500, { error: String(err) });
    }

    return { success: true };
  },

  delete: async ({ request, locals }) => {
    const form = await superValidate(request, zod(bookDeleteSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await locals.booksService.deleteBook(form.data.id);
    } catch (err) {
      return fail(500, { error: String(err) });
    }

    return { success: true };
  }
};
