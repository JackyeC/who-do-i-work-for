/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  /** Public Substack publication URL for /newsletter CTA (optional). */
  readonly VITE_SUBSTACK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
