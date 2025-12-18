// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust tracesSampleRate in production (1 = 100% sampling)
  tracesSampleRate: 1.0,

  // Enable logs
  enableLogs: true,

  // Enable sending user PII
  sendDefaultPii: true,

  // Debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Replay settings
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Session Replay integration
  integrations:
    typeof window !== "undefined" && Sentry.replayIntegration
      ? [
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ]
      : [],
});

// Export router transition tracking for Next.js App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
