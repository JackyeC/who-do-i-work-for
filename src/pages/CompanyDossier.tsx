import { useMemo, useState } from "react";
import { ContentProtector } from "@/components/ContentProtector";
import { useParams, Link } from "react-router-dom";
import { CompanyZeroState } from "@/components/CompanyZeroState";
import { useQuery } from "@tanstack/react-query";
import { usePageSEO } from "@/hooks/use-page-seo";
import { getOGImageUrl } from "@/lib/social-share";
import {
  Building2, Lightbulb, Network, Landmark, Eye,
  Sparkles, Users, Heart, Loader2, ShoppingCart,
  BarChart3, TrendingUp, User, Megaphone, Target, AlertTriangle,
  FileSearch, Scan, Search, Receipt, Shield, MessageSquareQuote,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JackyesInsightBlock } from "@/components/company/JackyesInsightBlock";
import { AuditRequestForm } from "@/components/AuditRequestForm";
import { Skeleton } from "@/components/ui/skeleton";
import { DossierLayer, TransparencyDisclaimer } from "@/components/dossier/DossierLayout";
import { DossierProtector } from "@/components/dossier/DossierProtector";
import { InfluenceGauge } from "@/components/dossier/InfluenceGauge";
import { useTrackedCompanies } from "@/hooks/use-tracked-companies";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { ExportDossierButton } from "@/components/dossier/ExportDossierButton";
import { useDossierLens } from "@/contexts/DossierLensContext";
import { TopFlagsSection } from "@/components/dossier/TopFlagsSection";

// Layer components
import { ProductsPlatformsLayer } from "@/components/dossier/ProductsPlatformsLayer";
import { MarketsSegmentsLayer } from "@/components/dossier/MarketsSegmentsLayer";
import { EcosystemSubcontractorsLayer } from "@/components/dossier/EcosystemSubcontractorsLayer";
import { InfluencePolicyLayer } from "@/components/dossier/InfluencePolicyLayer";
import { PoliticalGivingCard } from "@/components/giving/PoliticalGivingCard";
import { ExecutiveGivingSection } from "@/components/giving/ExecutiveGivingCard";
import { InstitutionalDNACard } from "@/components/dossier/InstitutionalDNACard";
import { InsiderScoreBreakdown } from "@/components/dossier/InsiderScoreBreakdown";
import { PatternsSynthesisLayer } from "@/components/dossier/PatternsSynthesisLayer";
import { TalentContextLayer } from "@/components/dossier/TalentContextLayer";
import { ValuesSignalsLayer } from "@/components/dossier/ValuesSignalsLayer";
import { FullEvidenceLayer } from "@/components/dossier/FullEvidenceLayer";
import { DecisionMakerLayer } from "@/components/dossier/DecisionMakerLayer";
import { WorkforceDemographicsLayer } from "@/components/dossier/WorkforceDemographicsLayer";
import { BuyingLogicLayer } from "@/components/dossier/BuyingLogicLayer";
import { EEOCCaseAlert } from "@/components/EEOCCaseAlert";
import { useEEOCByCompanyName } from "@/hooks/use-eeoc-cases";
import { PremiumGate } from "@/components/PremiumGate";
import { useViewMode } from "@/contexts/ViewModeContext";
import { HighRiskConnectionCard } from "@/components/company/HighRiskConnectionCard";
import { StateWomenStatusCard } from "@/components/StateWomenStatusCard";
import { PolicyScoreCard } from "@/components/policy-intelligence/PolicyScoreCard";
import { SituationContextBanner } from "@/components/policy-intelligence/SituationContextBanner";
import { TrustFramingLine } from "@/components/TrustFramingLine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ─── Receipts cross-link mapping ─── */
const RECEIPTS_SLUGS = new Set(["meta", "google", "amazon", "microsoft", "boeing", "booz-allen-hamilton", "accenture", "verizon", "t-mobile", "att"]);
const SLUG_TO_RECEIPT: Record<string, string> = {
  "alphabet-inc-google": "google",
  "meta-platforms-facebook": "meta",
  "meta-platforms": "meta",
  "at-t": "att",
  "at-t-inc": "att",
  "booz-allen-hamilton-holding": "booz-allen-hamilton",
};

/* ─── Interview question generator ─── */
function generateInterviewQuestions(issueSignals: any[] | undefined, jackyeInsight: string | null | undefined): string[] {
  const questions: string[] = [];

  if (issueSignals && issueSignals.length > 0) {
    const categories = [...new Set(issueSignals.map((s: any) => s.issue_category).filter(Boolean))];
    if (categories.some((c: string) => c.toLowerCase().includes("layoff") || c.toLowerCase().includes("workforce"))) {
      questions.push("Can you walk me through the company's recent workforce changes and how the team has adapted?");
    }
    if (categories.some((c: string) => c.toLowerCase().includes("discrimination") || c.toLowerCase().includes("eeoc"))) {
      questions.push("What concrete steps has the company taken to address workplace equity and inclusion concerns?");
    }
    if (categories.some((c: string) => c.toLowerCase().includes("lobby") || c.toLowerCase().includes("political"))) {
      questions.push("How does the company's political activity align with its stated values and employee interests?");
    }
  }

  if (jackyeInsight) {
    questions.push("What would you say is the biggest gap between the company's public messaging and day-to-day reality?");
  }

  // Always include these general questions to reach at least 3
  const defaults = [
    "How does leadership handle transparency around company decisions that affect employees?",
    "What does the company's track record look like on following through on commitments to workers?",
    "Can you describe the company's approach to safety, compliance, and regulatory accountability?",
    "How are decisions made about workforce investments versus cost-cutting measures?",
    "What mechanisms exist for employees to raise concerns without retaliation?",
  ];

  for (const d of defaults) {
    if (questions.length >= 5) break;
    if (!questions.includes(d)) questions.push(d);
  }

  return questions.slice(0, 5);
}

/* ─── Lens config ─── */
const LENS_META = {
  candidate: { label: "Candidate View", icon: User, color: "text-primary" },
  sales: { label: "Sales Intelligence", icon: TrendingUp, color: "text-civic-yellow" },
  hr: { label: "HR Strategy", icon: Users, color: "text-civic-blue" },
} as const;

export default function CompanyDossier() {
  const { id } = useParams();
  const { isCompanyTracked } = useTrackedCompanies();
  const { canAccessRecruiter } = useViewMode();
  const { lens } = useDossierLens();

  const { data: company, isLoading } = useQuery({
    queryKey: ["dossier-company", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const companyId = company?.id;
  const isTracked = companyId ? isCompanyTracked(companyId) : false;
  const { data: eeocCases } = useEEOCByCompanyName(company?.name);

  const seoCompanyName = company?.name ?? "Company";
  usePageSEO({
    title: `Should I Work at ${seoCompanyName}? Career Risk Report`,
    description: `Should you work at ${seoCompanyName}? See the Career Risk Score: leadership stability, layoff history, pay vs. industry benchmarks, and political activity.`,
    path: `/company/${id}`,
    image: getOGImageUrl({ type: "company", companyA: seoCompanyName }),
  });

  const { data: executives } = useQuery({
    queryKey: ["dossier-executives", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("company_executives").select("*").eq("company_id", companyId!);
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: contracts } = useQuery({
    queryKey: ["dossier-contracts", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("company_agency_contracts").select("*").eq("company_id", companyId!);
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: valuesSignals } = useQuery({
    queryKey: ["dossier-values", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("values_check_signals" as any).select("*").eq("company_id", companyId!);
      return (data || []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: issueSignals } = useQuery({
    queryKey: ["dossier-issue-signals", companyId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("issue_signals").select("issue_category, signal_type, description, amount, confidence_score, source_url").eq("entity_id", companyId!);
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: publicStances } = useQuery({
    queryKey: ["dossier-public-stances", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("company_public_stances").select("*").eq("company_id", companyId!);
      return data || [];
    },
    enabled: !!companyId,
  });

  const politicalGiving = useMemo(() => {
    if (!executives) return [];
    return executives
      .filter((e) => e.total_donations > 0)
      .map((e) => ({
        label: `${e.name} — ${e.title}`,
        summary: `Personal political donations totaling $${e.total_donations.toLocaleString()}`,
        sourceType: "FEC",
        confidence: "strong" as const,
        amount: e.total_donations,
      }));
  }, [executives]);

  const governmentContractSignals = useMemo(() => {
    if (!contracts) return [];
    return contracts.slice(0, 10).map((c) => ({
      label: c.agency_name,
      summary: c.contract_description || `Federal contract with ${c.agency_name}`,
      sourceType: c.source || "USAspending",
      confidence: c.confidence === "high" ? ("strong" as const) : c.confidence === "medium" ? ("likely" as const) : ("possible" as const),
      amount: c.contract_value || 0,
    }));
  }, [contracts]);

  const mappedValues = useMemo(() => {
    if (!valuesSignals) return [];
    return valuesSignals.map((s: any) => ({
      issueCategory: s.issue_category || s.signal_category || "General",
      summary: s.signal_summary || s.evidence_text || "",
      direction: s.signal_direction || "informational_signal",
      sourceUrl: s.source_url,
      verificationStatus: s.verification_status,
      confidence: s.confidence_score >= 0.8 ? ("strong" as const) : s.confidence_score >= 0.5 ? ("likely" as const) : ("possible" as const),
    }));
  }, [valuesSignals]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {/* Company header skeleton */}
          <div className="flex items-center gap-5 mb-6">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>

          {/* Lens indicator skeleton */}
          <Skeleton className="h-10 w-full rounded-xl mb-6" />

          {/* Score gauges skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-2xl border border-border/40 bg-card">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Content layers skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4 rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Company not found.</p>
        </div>
      </div>
    );
  }

  // 4-pillar scores with fallbacks
  const integrityGapScore = company.integrity_gap_score ?? company.civic_footprint_score ?? 0;
  const laborImpactScore = company.labor_impact_score ?? 0;
  const safetyAlertScore = company.safety_alert_score ?? 0;
  const connectedDotsScore = company.connected_dots_score ?? company.insider_score ?? 0;
  const compositeIntegrityScore = Math.round(
    0.30 * integrityGapScore + 0.25 * laborImpactScore + 0.20 * safetyAlertScore + 0.25 * connectedDotsScore
  );

  const hasFullAccess = isTracked;
  const LensMeta = LENS_META[lens];
  const LensIcon = LensMeta.icon;

  // Receipts cross-link
  const receiptSlug = SLUG_TO_RECEIPT[company.slug] || (RECEIPTS_SLUGS.has(company.slug) ? company.slug : null);

  // No-data detection: all scores zero, no insight, no signals, no stances
  const hasNoData =
    compositeIntegrityScore === 0 &&
    !company.jackye_insight &&
    !(company as any).description &&
    (company.total_pac_spending ?? 0) === 0 &&
    (company.lobbying_spend ?? 0) === 0 &&
    (issueSignals?.length || 0) === 0 &&
    (publicStances?.length || 0) === 0;

  /* ─── Shared overview (always visible) ─── */
  const overviewContent = (
    <>
      <div className="flex items-center gap-5 mb-4">
        <CompanyLogo companyName={company.name} logoUrl={company.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h1 truncate">{company.name}</h1>
            {isTracked && (
              <Badge className="bg-primary/10 text-primary text-xs">Tracked</Badge>
            )}
          </div>
          <p className="text-body text-muted-foreground">
            {company.industry} · {company.state}
            {company.employee_count && ` · ${company.employee_count} employees`}
          </p>
        </div>
        <ExportDossierButton companyId={companyId!} companyName={company.name} company={company} />
      </div>

      {/* Active lens indicator */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl border border-border/40 bg-muted/30">
        <LensIcon className={`w-4 h-4 ${LensMeta.color}`} />
        <span className="text-sm font-medium text-foreground">{LensMeta.label}</span>
        <span className="text-xs text-muted-foreground ml-1">— viewing dossier through this lens. Switch via header toggle.</span>
      </div>

      {/* Situation-Aware Context Banner */}
      <TrustFramingLine />
      <SituationContextBanner companyName={company.name} />

      {/* Score gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-2xl border border-border/40 bg-card">
        <InfluenceGauge value={integrityGapScore} label="Integrity Gap" />
        <InfluenceGauge value={laborImpactScore} label="Labor Impact" />
        <InfluenceGauge value={safetyAlertScore} label="Safety Alert" />
        <InfluenceGauge value={connectedDotsScore} label="Connected Dots" />
      </div>

      {/* Jackye's Insight — shared component */}
      <JackyesInsightBlock insight={company.jackye_insight} description={(company as any)?.description} />

      {/* Receipts cross-link */}
      {receiptSlug && (
        <Link
          to={`/receipts/${receiptSlug}`}
          className="flex items-center gap-3 p-4 mb-4 rounded-xl border border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors group"
        >
          <Receipt className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Read the full Receipts report for {company.name} →
          </span>
        </Link>
      )}

      {/* Top 3 Flags — always free */}
      <TopFlagsSection
        issueSignals={issueSignals}
        eeocCases={eeocCases}
        valuesSignals={valuesSignals as any[]}
        companyName={company.name}
      />

      {/* No-data fallback */}
      {hasNoData && (
        <Card className="mb-6 border-dashed border-border/60 bg-muted/20">
          <CardContent className="p-6 text-center">
            <FileSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">We don't have receipts on this company yet.</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Our research team hasn't completed a full scan. You can request one or run an automated scan now.
            </p>
            <div className="flex flex-col items-center gap-4">
              <CompanyZeroState companyName={company.name} />
              <AuditRequestForm companyName={company.name} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layer 1: Company Overview — always shown */}
      <DossierLayer title="Company Overview" subtitle="Products, markets, segments, and company overview" icon={Building2} layerNumber={1} defaultOpen>
        <div className="space-y-6">
          {company.description && (
            <p className="text-body text-muted-foreground leading-relaxed">{company.description}</p>
          )}
          <ProductsPlatformsLayer products={[]} companyName={company.name} />
          <MarketsSegmentsLayer segments={[]} companyName={company.name} />
        </div>
      </DossierLayer>
    </>
  );

  /* ─── CANDIDATE LENS — unified 4-pillar system ─── */

  /* Pro tier content (layers 2-4) */
  const candidateProContent = (
    <>
      <DossierLayer title="Integrity Gap" subtitle="What they say vs. what they do — stated values against documented contradictions" icon={Heart} layerNumber={2} defaultOpen>
        <ValuesSignalsLayer signals={mappedValues} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="Labor Impact" subtitle="Settlement history, layoff patterns, workforce stability, and demographic signals" icon={Users} layerNumber={3} defaultOpen>
        <TalentContextLayer signals={[]} companyName={company.name} />
        <div className="mt-6">
          <WorkforceDemographicsLayer companyId={companyId!} companyName={company.name} />
        </div>
        {/* State-level women's status context */}
        {company.state && (
          <div className="mt-6">
            <StateWomenStatusCard stateCode={company.state} companyName={company.name} />
          </div>
        )}
      </DossierLayer>

      <DossierLayer title="Connected Dots" subtitle="PAC donations, lobbying, executive giving, government contracts, and institutional relationships" icon={Network} layerNumber={4}>
        <InfluencePolicyLayer
          politicalGiving={politicalGiving}
          lobbyingActivity={[]}
          governmentContracts={governmentContractSignals}
          policyLinks={[]}
        />
        {companyId && (
          <div className="mt-6">
            <HighRiskConnectionCard companyId={companyId} companyName={company.name} />
          </div>
        )}
        {companyId && (
          <div className="mt-6">
            <InstitutionalDNACard companyId={companyId} companyName={company.name} />
          </div>
        )}
        {companyId && (
          <div className="mt-6">
            <PolicyScoreCard companyId={companyId} companyName={company.name} />
          </div>
        )}
        {companyId && (
          <div className="mt-6">
            <PoliticalGivingCard companyId={companyId} companyName={company.name} companySlug={company.slug} />
          </div>
        )}
        {companyId && (
          <div className="mt-6">
            <ExecutiveGivingSection companyId={companyId} companyName={company.name} companySlug={company.slug} />
          </div>
        )}
        <div className="mt-6">
          <InsiderScoreBreakdown companyId={companyId!} companyName={company.name} insiderScore={company.insider_score ?? null} />
        </div>
      </DossierLayer>
    </>
  );

  /* Dossier/Premium tier content (layers 5-7) */
  const candidatePremiumContent = (
    <>
      <DossierLayer title="Safety Alert" subtitle="OSHA citations, product safety, environmental record, and regulatory risk" icon={Shield} layerNumber={5}>
        <div className="space-y-6">
          {/* EEOC cases */}
          {eeocCases && eeocCases.length > 0 && (
            <EEOCCaseAlert cases={eeocCases} />
          )}
          {/* Placeholder for additional safety data */}
          <div className="p-4 rounded-xl border border-border/30 bg-muted/20 text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Additional safety data (OSHA, product recalls, environmental records) coming soon.</p>
          </div>
        </div>
      </DossierLayer>

      <DossierLayer title="Interview Questions" subtitle="Personalized questions based on flags detected for this company" icon={MessageSquareQuote} layerNumber={6}>
        <div className="space-y-3">
          {generateInterviewQuestions(issueSignals, company.jackye_insight).map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-muted/20">
              <span className="text-sm font-mono font-bold text-primary mt-0.5">{i + 1}.</span>
              <p className="text-sm text-foreground leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </DossierLayer>

      <DossierLayer title="Decision Brief" subtitle="Key observations, notable patterns, and export" icon={FileText} layerNumber={7}>
        <PatternsSynthesisLayer patterns={[]} companyName={company.name} />
        <div className="mt-6 flex justify-center">
          <ExportDossierButton companyId={companyId!} companyName={company.name} company={company} />
        </div>
      </DossierLayer>
    </>
  );

  /* ─── SALES LENS — buying logic, ecosystem, regulatory ─── */
  const salesContent = (
    <>
      <DossierLayer title="Decision & Buying Logic" subtitle="Typical buying committees, approval layers, decision-maker mapping" icon={ShoppingCart} layerNumber={3} defaultOpen>
        <BuyingLogicLayer companyId={companyId!} companyName={company.name} industry={company.industry} />
      </DossierLayer>

      <DossierLayer title="Key Decision Makers" subtitle="Executives, leadership team, and political activity" icon={Target} layerNumber={4} defaultOpen>
        <DecisionMakerLayer decisionMakers={[]} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="Ecosystem & Subcontractors" subtitle="Supply chain, federal contracts, operational dependencies" icon={Network} layerNumber={5}>
        <EcosystemSubcontractorsLayer entities={[]} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="Government Contracts & Regulatory Exposure" subtitle="Federal contracts and policy dependencies" icon={Landmark} layerNumber={6}>
        <InfluencePolicyLayer
          politicalGiving={politicalGiving}
          lobbyingActivity={[]}
          governmentContracts={governmentContractSignals}
          policyLinks={[]}
        />
      </DossierLayer>

      <DossierLayer title="Patterns & Synthesis" subtitle="Key observations and notable patterns" icon={Sparkles} layerNumber={7}>
        <PatternsSynthesisLayer patterns={[]} companyName={company.name} />
      </DossierLayer>
    </>
  );

  /* ─── HR STRATEGY LENS — talent, EVP, demographics, messaging ─── */
  const hrContent = (
    <>
      <DossierLayer title="Workforce Demographics" subtitle="Role distribution, pay equity, diversity, and promotion signals" icon={BarChart3} layerNumber={3} defaultOpen>
        <WorkforceDemographicsLayer companyId={companyId!} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="Talent Supply & Demand" subtitle="WARN notices, hiring stability, market scarcity" icon={Users} layerNumber={4} defaultOpen>
        <TalentContextLayer signals={[]} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="EVP & Values Alignment" subtitle="Employer Value Proposition signals and Say-Do gap indicators" icon={Megaphone} layerNumber={5}>
        <ValuesSignalsLayer signals={mappedValues} companyName={company.name} />
      </DossierLayer>

      <DossierLayer title="Influence & Policy Signals" subtitle="PAC giving and lobbying that may impact employer brand" icon={Landmark} layerNumber={6}>
        <InfluencePolicyLayer
          politicalGiving={politicalGiving}
          lobbyingActivity={[]}
          governmentContracts={governmentContractSignals}
          policyLinks={[]}
        />
      </DossierLayer>

      <DossierLayer title="Patterns & Synthesis" subtitle="Key observations and notable patterns" icon={Sparkles} layerNumber={7}>
        <PatternsSynthesisLayer patterns={[]} companyName={company.name} />
      </DossierLayer>

      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <FullEvidenceLayer
          campaignFinance={[]}
          lobbying={[]}
          contracts={[]}
          patents={[]}
          subcontractors={[]}
          websiteChanges={[]}
          publicStatements={[]}
          humanCapital={[]}
        />
      </div>
    </>
  );

  const gatedSalesContent = canAccessRecruiter ? salesContent : (
    <PremiumGate feature="Sales Intelligence View" description="Unlock decision-maker mapping, buying logic, ecosystem analysis, and government contract exposure for sales teams." requiredTier="candidate">
      {salesContent}
    </PremiumGate>
  );

  const gatedHrContent = canAccessRecruiter ? hrContent : (
    <PremiumGate feature="HR Strategy View" description="Unlock workforce demographics, talent supply signals, EVP analysis, and employer brand intelligence." requiredTier="candidate">
      {hrContent}
    </PremiumGate>
  );

  // For candidate lens, pass pro + premium content separately to DossierProtector
  const fullContent = lens === "candidate" ? candidateProContent : lens === "sales" ? gatedSalesContent : gatedHrContent;
  const premiumContent = lens === "candidate" ? candidatePremiumContent : null;

  return (
    <ContentProtector className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          <DossierProtector
            companyId={companyId!}
            companyName={company.name}
            influenceScore={compositeIntegrityScore}
            overviewContent={overviewContent}
            proContent={fullContent}
            premiumContent={premiumContent}
          />
          <TransparencyDisclaimer />

          {/* Cross-links to other intelligence tools */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/reality-check"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Got an offer from {company.name}?</p>
                <p className="text-xs text-muted-foreground">Check for red flags with the Reality Check →</p>
              </div>
            </Link>
            <Link
              to="/ask-jackye"
              className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Ask the Intelligence Advisor</p>
                <p className="text-xs text-muted-foreground">Get a deep analysis of {company.name} →</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </ContentProtector>
  );
}
