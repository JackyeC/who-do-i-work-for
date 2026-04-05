/**
 * Stripe Price ID for The Reset Room ($15/mo recurring); live calls branded "The Briefing Room".
 * Create product in Stripe Dashboard → copy price_… → set in .env and Supabase.
 */
export function getBriefingRoomStripePriceId(): string {
  const id = import.meta.env.VITE_STRIPE_BRIEFING_ROOM_PRICE_ID;
  return typeof id === "string" && id.startsWith("price_") ? id : "";
}

/**
 * When true (default), Briefing Room is only for Founding Supporters (April campaign, etc.).
 * Env name is historical: VITE_BRIEFING_ROOM_JOINERS_ONLY — set to "false" to show everyone.
 */
export function isBriefingRoomLimitedAudience(): boolean {
  return import.meta.env.VITE_BRIEFING_ROOM_JOINERS_ONLY !== "false";
}

/** Calendar year for the founding campaign (UTC). Default: current UTC year. */
export function getBriefingRoomFoundingYear(): number {
  const y = parseInt(import.meta.env.VITE_BRIEFING_ROOM_FOUNDING_YEAR || "", 10);
  if (Number.isFinite(y) && y >= 2020 && y <= 2100) return y;
  return new Date().getUTCFullYear();
}

/** 1–12. Default April (4). Must match Supabase BRIEFING_ROOM_FOUNDING_MONTH. */
export function getBriefingRoomFoundingMonth(): number {
  const m = parseInt(import.meta.env.VITE_BRIEFING_ROOM_FOUNDING_MONTH || "4", 10);
  return Number.isFinite(m) && m >= 1 && m <= 12 ? m : 4;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getBriefingRoomFoundingMonthName(): string {
  const m = getBriefingRoomFoundingMonth();
  return MONTH_NAMES[m - 1] ?? "April";
}

/** ISO 8601 instant falls in the configured founding calendar month (UTC). */
export function isIsoInFoundingCampaignMonth(iso: string | undefined | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const y = getBriefingRoomFoundingYear();
  const m = getBriefingRoomFoundingMonth();
  return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
}

export const BRIEFING_ROOM_SIGNUP_AT_KEY = "wdiwf_signed_up_at";
