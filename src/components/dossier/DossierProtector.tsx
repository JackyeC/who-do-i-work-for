import { ReactNode } from "react";
import { useTrackedCompanies } from "@/hooks/use-tracked-companies";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/use-premium";
import { DossierPaywall } from "@/components/dossier/DossierPaywall";
import { SignalExamples } from "@/components/dossier/SignalExamples";
import { InfluenceGauge } from "@/components/dossier/InfluenceGauge";

interface DossierProtectorProps {
  companyId: string;
  companyName: string;
  influenceScore: number;
  /** Free content — always visible (overview + Top 3 Flags + Basics) */
  overviewContent: ReactNode;
  /** Pro-tier content — Integrity Gap, Labor Impact, Connected Dots */
  proContent: ReactNode;
  /** Premium/Dossier-tier content — Safety Alert, Interview Questions, Decision Brief */
  premiumContent?: ReactNode | null;
}

/**
 * Higher-Order wrapper that enforces the 3-tier fuzz/lock paywall.
 *
 * Free: overview + Integrity Score gauge + signal examples + CTA
 * Pro ($19/mo): + Integrity Gap, Labor Impact, Connected Dots
 * Dossier ($199) or Professional: + Safety Alert, Interview Questions, Decision Brief
 */
export function DossierProtector({
  companyId,
  companyName,
  influenceScore,
  overviewContent,
  proContent,
  premiumContent,
}: DossierProtectorProps) {
  const { user } = useAuth();
  const { isCompanyTracked, isPremium } = useTrackedCompanies();
  const { tier } = usePremium();

  const isTracked = isCompanyTracked(companyId);
  const hasProAccess = isTracked && isPremium;
  const hasPremiumAccess = isTracked && (tier === "professional");

  // Full access — show everything
  if (hasPremiumAccess) {
    return (
      <>
        {overviewContent}
        {proContent}
        {premiumContent}
      </>
    );
  }

  // Pro access — show free + pro, paywall before premium
  if (hasProAccess) {
    return (
      <>
        {overviewContent}
        {proContent}
        {premiumContent && (
          <DossierPaywall companyId={companyId} companyName={companyName} layerIndex={5} />
        )}
      </>
    );
  }

  // Free / not tracked — show overview + gauge + signal examples + pro paywall
  return (
    <>
      {/* Always visible: overview (header, gauges, Jackye's Read, Top 3 Flags, Basics) */}
      {overviewContent}

      {/* Always visible: Integrity Score gauge */}
      <div className="flex justify-center py-6">
        <InfluenceGauge value={influenceScore} label="Integrity Score" size="lg" />
      </div>

      {/* Always visible: one signal example */}
      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <SignalExamples />
      </div>

      {/* Paywall CTA */}
      <DossierPaywall companyId={companyId} companyName={companyName} />
    </>
  );
}
