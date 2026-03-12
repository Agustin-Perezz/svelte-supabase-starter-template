import * as Sentry from '@sentry/sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { NodeEnv } from '$lib/env';
import { authenticateUser } from '$lib/server/auth';

Sentry.init({
  enabled: process.env.NODE_ENV === NodeEnv.Production,
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

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

export const handle = sequence(Sentry.sentryHandle(), authHandle);

export const handleError = Sentry.handleErrorWithSentry();
