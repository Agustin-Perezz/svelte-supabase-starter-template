import type { SupabaseClient } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import {
  magicLinkSchema,
  OAuthProvider
} from '$modules/auth/domain/AuthSchemas';
import { SupabaseAuthRepository } from '$modules/auth/infrastructure/SupabaseAuthRepository.server';
import { SignInWithMagicLink } from '$modules/auth/useCases/SignInWithMagicLink';
import { SignInWithOAuth } from '$modules/auth/useCases/SignInWithOAuth';
import type { Database } from '$modules/shared/domain/database.types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

function createAuthServices(supabase: SupabaseClient<Database>, url: URL) {
  return {
    repo: new SupabaseAuthRepository(supabase),
    redirectUrl: `${url.origin}/auth/callback`
  };
}

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
      const { repo, redirectUrl } = createAuthServices(supabase, url);
      const useCase = new SignInWithMagicLink(repo);
      await useCase.execute(form.data.email, redirectUrl);
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
      const { repo, redirectUrl } = createAuthServices(supabase, url);
      const useCase = new SignInWithOAuth(repo);
      const oauthUrl = await useCase.execute(OAuthProvider.Google, redirectUrl);
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
      const { repo, redirectUrl } = createAuthServices(supabase, url);
      const useCase = new SignInWithOAuth(repo);
      const oauthUrl = await useCase.execute(
        OAuthProvider.Facebook,
        redirectUrl
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
