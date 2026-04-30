import { fail, redirect, type Actions } from '@sveltejs/kit';
import { magicLinkSchema } from '$domain/entities/auth-schemas';
import { OAuthProvider } from '$domain/entities/oauth-provider.enum';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

import { createAuthContainer } from '$lib/containers/auth.container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    throw redirect(303, '/protected');
  }

  const form = await superValidate(zod(magicLinkSchema));

  return { form };
};

export const actions: Actions = {
  magic: async ({ request, locals: { supabase }, url }) => {
    const form = await superValidate(request, zod(magicLinkSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const { signInWithMagicLink } = createAuthContainer(supabase);
      await signInWithMagicLink.execute(
        form.data,
        `${url.origin}/auth/callback`
      );
      return message(form, 'Check your email for the sign-in link.');
    } catch (error) {
      return message(
        form,
        (error as Error).message || 'Failed to send sign-in link',
        { status: 500 }
      );
    }
  },

  google: async ({ locals: { supabase }, url }) => {
    try {
      const { signInWithOAuth } = createAuthContainer(supabase);
      const oauthUrl = await signInWithOAuth.execute(
        OAuthProvider.Google,
        `${url.origin}/auth/callback`
      );
      throw redirect(303, oauthUrl);
    } catch (error) {
      if (error instanceof Error && error.message.includes('303')) {
        throw error;
      }
      throw error;
    }
  },

  facebook: async ({ locals: { supabase }, url }) => {
    try {
      const { signInWithOAuth } = createAuthContainer(supabase);
      const oauthUrl = await signInWithOAuth.execute(
        OAuthProvider.Facebook,
        `${url.origin}/auth/callback`
      );
      throw redirect(303, oauthUrl);
    } catch (error) {
      if (error instanceof Error && error.message.includes('303')) {
        throw error;
      }
      throw error;
    }
  }
};
