import type { PremiumTier } from "@/hooks/use-premium";

/**
 * Central place for subscription tier rank used by PremiumGate and any server-aligned checks.
 * Server: mirror with RLS / Edge Functions — see docs/ACCESS_POLICY.md
 */
const TIER_RANK: Record<PremiumTier, number> = {
  free: 0,
  candidate: 1,
  professional: 2,
};

export type PaidTier = "candidate" | "professional";

export function tierMeetsMinimum(tier: PremiumTier, required: PaidTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[required];
}

export function paidTierRank(tier: PremiumTier): number {
  return TIER_RANK[tier];
}
