import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  enabled: import.meta.env.PROD,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()]
});

export const handleError = Sentry.handleErrorWithSentry();
