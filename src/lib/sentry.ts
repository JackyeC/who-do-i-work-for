import * as Sentry from "@sentry/react";

/** Browser Sentry; no-op when `VITE_SENTRY_DSN` is unset. */
export function initClientSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  });
}

export { Sentry };
