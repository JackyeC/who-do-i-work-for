import { useAuth } from "@/contexts/AuthContext";

export type PremiumTier = "free" | "pro";

export const STRIPE_TIERS = {
  pro: {
    price_id: "price_1T93XPGh4NKuXb2AjiV2bobX",
    product_id: "prod_U7I705lqyNGEWI",
    label: "Pro",
    price: "$29/mo",
  },
} as const;

export interface PremiumFeatures {
  tier: PremiumTier;
  maxSavedReports: number;
  canCompare: boolean;
  canExport: boolean;
  canTrackAlerts: boolean;
  unlimitedOfferChecks: boolean;
  advancedSectionDetail: boolean;
}

const FREE_FEATURES: PremiumFeatures = {
  tier: "free",
  maxSavedReports: 5,
  canCompare: false,
  canExport: false,
  canTrackAlerts: false,
  unlimitedOfferChecks: false,
  advancedSectionDetail: false,
};

const PRO_FEATURES: PremiumFeatures = {
  tier: "pro",
  maxSavedReports: Infinity,
  canCompare: true,
  canExport: true,
  canTrackAlerts: true,
  unlimitedOfferChecks: true,
  advancedSectionDetail: true,
};

export function usePremium(): PremiumFeatures & { isPremium: boolean; isLoggedIn: boolean; subscriptionEnd: string | null } {
  const { user, subscriptionStatus } = useAuth();

  const isPremium = subscriptionStatus?.subscribed ?? false;
  const features = isPremium ? PRO_FEATURES : FREE_FEATURES;

  return {
    ...features,
    isPremium,
    isLoggedIn: !!user,
    subscriptionEnd: subscriptionStatus?.subscription_end ?? null,
  };
}
