// This file configures the initialization of Sentry on the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust tracesSampleRate in production (1 = 100% sampling)
  tracesSampleRate: 1,

  // Enable logs
  enableLogs: true,

  // Enable sending user PII
  sendDefaultPii: true,
});
