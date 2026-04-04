import { fail } from '@sveltejs/kit';
import {
  bookCreateSchema,
  bookDeleteSchema,
  bookUpdateSchema
} from '$modules/books/domain/BookSchemas';
import { SupabaseBookRepository } from '$modules/books/infrastructure/SupabaseBookRepository.server';
import { CreateBook } from '$modules/books/useCases/CreateBook';
import { DeleteBook } from '$modules/books/useCases/DeleteBook';
import { GetAllBooks } from '$modules/books/useCases/GetAllBooks';
import { UpdateBook } from '$modules/books/useCases/UpdateBook';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

function createBookUseCases(locals: App.Locals) {
  const repository = new SupabaseBookRepository(locals.supabase);

  return {
    getAll: new GetAllBooks(repository),
    create: new CreateBook(repository),
    update: new UpdateBook(repository),
    delete: new DeleteBook(repository)
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  const { getAll } = createBookUseCases(locals);
  const books = await getAll.execute();
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
      const { create } = createBookUseCases(locals);
      await create.execute(form.data);
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
      const { update } = createBookUseCases(locals);
      await update.execute(id, data);
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
      const { delete: deleteBook } = createBookUseCases(locals);
      await deleteBook.execute(form.data.id);
    } catch (err) {
      return fail(500, { error: String(err) });
    }

    return { success: true };
  }
};
