/**
 * GDELT DOC API tone scale (first tone value). Same thresholds as sync-gdelt toneLabel
 * and NewsIntelligenceCard styling.
 */
export const GDELT_POSITIVE_THRESHOLD = 1.5;
export const GDELT_NEGATIVE_THRESHOLD = -1.5;

export function gdeltToneScore(score: number | null | undefined): number {
  return Number(score) || 0;
}

export function isGdeltPositiveTone(score: number | null | undefined): boolean {
  return gdeltToneScore(score) >= GDELT_POSITIVE_THRESHOLD;
}

export function isGdeltNegativeTone(score: number | null | undefined): boolean {
  return gdeltToneScore(score) <= GDELT_NEGATIVE_THRESHOLD;
}

export type GdeltToneBucket = "positive" | "neutral" | "negative";

export function gdeltToneBucket(score: number | null | undefined): GdeltToneBucket {
  if (isGdeltPositiveTone(score)) return "positive";
  if (isGdeltNegativeTone(score)) return "negative";
  return "neutral";
}
