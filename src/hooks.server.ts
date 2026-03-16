import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { BooksRepository } from '$server/repositories/books.repository';
import { BooksService } from '$server/services/books.service';

import { NodeEnv } from '$lib/env';
import { authenticateUser } from '$lib/server/auth';

Sentry.init({
  enabled: process.env.NODE_ENV === NodeEnv.Production,
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

const supabaseHandle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' });
          });
        }
      }
    }
  );

  event.locals.booksRepository = new BooksRepository(event.locals.supabase);
  event.locals.booksService = new BooksService(event.locals.booksRepository);

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });

  return response;
};

const authHandle: Handle = async ({ event, resolve }) => {
  event.locals.user = authenticateUser(event);

  if (event.url.pathname.startsWith('/protected')) {
    if (!event.locals.user) {
      throw redirect(303, '/');
    }
  }

  const response = await resolve(event);

  return response;
};

export const handle = sequence(
  Sentry.sentryHandle(),
  supabaseHandle,
  authHandle
);

export const handleError = Sentry.handleErrorWithSentry();
