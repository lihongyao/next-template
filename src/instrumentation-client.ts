// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://e825c30e76cbac90806bb4ff1bb63f81@o4511269960417280.ingest.de.sentry.io/4511269977456720',
  enabled: ['prod'].includes(process.env.NEXT_PUBLIC_ENV),
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
