/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_SENTRY_DSN?: string;
  /** Public Substack publication URL for /newsletter CTA (optional). */
  readonly VITE_SUBSTACK_URL?: string;
  /** Stripe Price ID for The Reset Room / live Briefing Room ($15/mo); must match Supabase STRIPE_BRIEFING_ROOM_PRICE_ID. */
  readonly VITE_STRIPE_BRIEFING_ROOM_PRICE_ID?: string;
  /** Set to "false" to show Briefing Room to everyone (still requires Stripe price id). Default: founding month only. */
  readonly VITE_BRIEFING_ROOM_JOINERS_ONLY?: string;
  /** Founding campaign year (UTC). Default: current UTC year. Match Supabase BRIEFING_ROOM_FOUNDING_YEAR. */
  readonly VITE_BRIEFING_ROOM_FOUNDING_YEAR?: string;
  /** Founding campaign month 1–12. Default 4 (April). Match Supabase BRIEFING_ROOM_FOUNDING_MONTH. */
  readonly VITE_BRIEFING_ROOM_FOUNDING_MONTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
