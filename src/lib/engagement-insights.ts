/**
 * Weekly-rotating subcopy for sidebar “civic impact” — lightweight variable-reward feel
 * (different message each week without fixed badge ladders).
 */
const POOL = [
  "Tip: track a company to catch the next policy shift early.",
  "Compare two employers — transparency gaps show up fast.",
  "Signal alerts turn filings into plain English.",
  "Offer Check pairs public records with what’s on the table.",
  "Values search finds employers that match what you fund.",
] as const;

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** ISO week key YYYY-Www (UTC) for stable rotation across sessions */
export function isoWeekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  if (day !== 1) t.setUTCDate(t.getUTCDate() - (day - 1));
  const y = t.getUTCFullYear();
  const first = new Date(Date.UTC(y, 0, 1));
  const w = Math.ceil(((+t - +first) / 86400000 + first.getUTCDay() + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

export function weeklyEngagementSubcopy(userId: string, weekKey = isoWeekKey()): string {
  const idx = hashString(`${userId}:${weekKey}`) % POOL.length;
  return POOL[idx]!;
}

export const CIVIC_MILESTONES = [1, 5, 10, 25, 50] as const;

export function milestoneToastMessage(count: number): string | null {
  switch (count) {
    case 1:
      return "First employer signal logged — you’re building receipts.";
    case 5:
      return "Five signals surfaced. Few candidates go this deep.";
    case 10:
      return "Ten signals — share a scorecard and help someone else decide.";
    case 25:
      return "25 signals — your diligence trail is rare.";
    case 50:
      return "50 signals — you’re operating at analyst depth.";
    default:
      return null;
  }
}
