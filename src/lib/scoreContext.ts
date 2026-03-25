/**
 * Score Context — Relative percentile labels for integrity scores.
 *
 * Translates raw 0-100 scores into human-readable context like
 * "More flags than 74% of employers" instead of just showing "50".
 *
 * TODO: Replace static percentile table with real distribution
 * from Supabase (query all companies, compute actual percentiles).
 */

// Static percentile lookup: [score, % of employers scoring LOWER]
// Roughly normal distribution centered around 35-40
const PERCENTILE_TABLE: [number, number][] = [
  [0, 0], [10, 8], [15, 15], [20, 22], [25, 32], [30, 42],
  [35, 52], [40, 60], [45, 68], [50, 74], [55, 80], [60, 85],
  [65, 89], [70, 92], [75, 95], [80, 97], [85, 98], [90, 99], [100, 100],
];

export function getScorePercentile(score: number): number {
  if (score <= 0) return 0;
  if (score >= 100) return 100;

  for (let i = 1; i < PERCENTILE_TABLE.length; i++) {
    const [s1, p1] = PERCENTILE_TABLE[i - 1];
    const [s2, p2] = PERCENTILE_TABLE[i];
    if (score <= s2) {
      const t = (score - s1) / (s2 - s1);
      return Math.round(p1 + t * (p2 - p1));
    }
  }
  return 100;
}

export function getScoreContextLabel(score: number): string {
  const pct = getScorePercentile(score);
  if (pct <= 15) return "Lower concern than most employers";
  if (pct <= 40) return "Below average concern";
  if (pct <= 60) return "Average among employers";
  if (pct <= 80) return `Higher concern than ${pct}% of employers`;
  return `Top ${100 - pct}% most concerning`;
}

export function getCompositeContextLabel(score: number): string {
  const pct = getScorePercentile(score);
  if (pct <= 20) return `Scores better than ${100 - pct}% of employers we've analyzed`;
  if (pct <= 50) return "Middle of the pack — similar to most employers";
  return `More flags than ${pct}% of employers in our database`;
}
