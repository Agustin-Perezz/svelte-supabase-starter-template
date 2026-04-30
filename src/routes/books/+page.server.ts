import { fail } from '@sveltejs/kit';
import { createBookRequestSchema } from '$application/use-cases/books/create-book/create-book.request.dto';
import { updateBookRequestSchema } from '$application/use-cases/books/update-book/update-book.request.dto';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

import { createBooksContainer } from '$lib/containers/books.container';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const createForm = await superValidate(zod(createBookRequestSchema));
  return { createForm };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createBookRequestSchema));

    if (!form.valid) {
      return fail(400, { createForm: form });
    }

    try {
      const { create } = createBooksContainer(locals.supabase);
      await create.execute(form.data);
    } catch (err) {
      return message(form, String(err), { status: 500 });
    }

    return { createForm: form };
  },

  update: async ({ request, locals }) => {
    const form = await superValidate(request, zod(updateBookRequestSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { id, ...fields } = form.data;

    try {
      const { update } = createBooksContainer(locals.supabase);
      await update.execute(id, fields);
    } catch (err) {
      return fail(500, { error: String(err) });
    }

    return { success: true };
  }
};
