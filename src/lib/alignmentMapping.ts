import type { ValuesLensKey } from "./valuesLenses";

// ── Alignment Quiz Types ──────────────────────────────────
export type AlignmentCategory = "fairness" | "safety" | "politics" | "transparency" | "stability";

export interface AlignmentResults {
  fairness: number;  // 0 = left/not important, 1 = right/important, 2 = dealbreaker
  safety: number;
  politics: number;
  transparency: number;
  stability: number;
}

export type ValueWeight = "Dealbreaker" | "Important" | "Not important";

export type UserValues = Partial<Record<ValuesLensKey, ValueWeight>>;

// ── Mapping Function ──────────────────────────────────────
// Translates quiz scores into value weights per the spec:
//   Score 2 = Dealbreaker for primary values, Important for secondary
//   Score 1 = Important
//   Score 0 = Not important
//   Any value not touched defaults to "Important"

export function mapAlignmentToValues(results: AlignmentResults): Record<ValuesLensKey, ValueWeight> {
  const mapped: Partial<Record<ValuesLensKey, ValueWeight>> = {};

  // FAIRNESS
  if (results.fairness === 2) {
    mapped.anti_discrimination = "Dealbreaker";
    mapped.gender_equality = "Important";
    mapped.lgbtq_rights = "Important";
  } else if (results.fairness === 1) {
    mapped.anti_discrimination = "Important";
  } else {
    mapped.anti_discrimination = "Not important";
  }

  // SAFETY
  if (results.safety === 2) {
    mapped.workplace_safety = "Dealbreaker";
  } else if (results.safety === 1) {
    mapped.workplace_safety = "Important";
  } else {
    mapped.workplace_safety = "Not important";
  }

  // POLITICS
  if (results.politics === 2) {
    mapped.political_donations = "Dealbreaker";
    mapped.lobbying_activity = "Important";
  } else if (results.politics === 1) {
    mapped.political_donations = "Important";
  } else {
    mapped.political_donations = "Not important";
  }

  // TRANSPARENCY / AI
  if (results.transparency === 2) {
    mapped.ai_ethics = "Dealbreaker";
    mapped.data_privacy = "Important";
    mapped.anti_corruption = "Important";
  } else if (results.transparency === 1) {
    mapped.ai_ethics = "Important";
  } else {
    mapped.ai_ethics = "Not important";
  }

  // STABILITY
  if (results.stability === 2) {
    mapped.labor_rights = "Important";
    mapped.workplace_safety = mapped.workplace_safety === "Dealbreaker" ? "Dealbreaker" : "Important";
  } else if (results.stability === 1) {
    mapped.labor_rights = "Important";
  } else {
    mapped.labor_rights = "Not important";
  }

  // Apply defaults: every lens key not explicitly set gets "Important"
  const ALL_LENS_KEYS: ValuesLensKey[] = [
    "dei_equity", "anti_discrimination", "lgbtq_rights", "disability_inclusion",
    "gender_equality", "workplace_safety", "pay_equity", "labor_rights",
    "union_rights", "gig_worker_treatment", "healthcare", "reproductive_rights",
    "political_transparency", "anti_corruption", "ai_ethics", "data_privacy",
    "political_donations", "lobbying_activity", "consumer_protection",
    "voting_rights", "international_trade", "environment_climate",
    "pollution_waste", "sustainable_supply_chains", "energy_fossil_fuel",
    "community_investment", "immigration", "faith_christian", "animal_welfare",
    "education_access",
  ];

  const full = {} as Record<ValuesLensKey, ValueWeight>;
  for (const key of ALL_LENS_KEYS) {
    full[key] = mapped[key] ?? "Important";
  }

  return full;
}

// ── Confidence calculation ────────────────────────────────
export function computeConfidence(results: AlignmentResults): "High" | "Medium" {
  const scores = Object.values(results);
  const dealbreakers = scores.filter(s => s === 2).length;
  const hasVariety = new Set(scores).size >= 3;

  // High confidence: 2+ dealbreakers AND varied answers
  if (dealbreakers >= 2 && hasVariety) return "High";
  return "Medium";
}

// ── Top Priorities ────────────────────────────────────────
export function getTopPriorities(userValues: Record<ValuesLensKey, ValueWeight>): ValuesLensKey[] {
  const dealbreakers = (Object.entries(userValues) as [ValuesLensKey, ValueWeight][])
    .filter(([, v]) => v === "Dealbreaker")
    .map(([k]) => k);

  const important = (Object.entries(userValues) as [ValuesLensKey, ValueWeight][])
    .filter(([, v]) => v === "Important")
    .map(([k]) => k);

  // All dealbreakers + top 2 important values
  return [...dealbreakers, ...important.slice(0, 2)];
}
