/**
 * The Reset Room — community support for job seekers and hiring-side professionals.
 * Stripe / Edge Functions still use "briefing room" env keys and price IDs; user-facing name is here.
 */
export const RESET_ROOM = {
  title: "The Reset Room",
  tagline: "Job search and candidate search support.",
  /** What we call the monthly live video call (same offering as the $15/mo add-on on Pricing). */
  liveSessionName: "The Briefing Room",
} as const;
