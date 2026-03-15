import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, Briefcase, Check, X, ArrowRight, Loader2,
  Mail, FileText, Scale, Star, Shield, Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/hooks/use-premium";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePageSEO } from "@/hooks/use-page-seo";

const certCriteria = [
  { icon: Mail, label: "Identity Linkage", desc: "Verified corporate email domain matching your company." },
  { icon: FileText, label: "Documented Disclosure", desc: "Public DEI/ESG report or employee handbook supporting your Official Response." },
  { icon: Scale, label: "Non-Interference Agreement", desc: "Respond to insights freely — but zero authority to suppress independent research." },
];

export default function ForEmployers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  usePageSEO({
    title: "For Employers — Claim, Respond & Get Certified",
    description: "Post values-aligned jobs and earn Gold Shield certification on Who Do I Work For. Founding Partner pricing available now.",
    path: "/for-employers",
  });

  const handleCheckout = async (priceId: string, tierName: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoadingTier(tierName);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 lg:px-16 py-24 lg:py-32 max-w-[960px] mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-xs font-mono uppercase tracking-wider">
            For Employers
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Your candidates are checking.{" "}
            <span className="text-primary">Show them the receipts.</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Claim your company profile, respond to intelligence findings, and earn Certified status —
            all without suppressing a single data point.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 lg:px-16 pb-20 max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Single Job Credit */}
            <Card className="border-border/40 bg-card">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    One-Time
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Single Job Credit</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold font-mono text-foreground">$199</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  One 'Value-Aligned' job post on the Job Integrity Board for 30 days.
                  Includes standard transparency data overlay.
                </p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {[
                    { label: "1 job post for 30 days", included: true },
                    { label: "Standard transparency data", included: true },
                    { label: "Jackye Insight overlay (read-only)", included: true },
                    { label: "Connection Chain display", included: true },
                    { label: "Gold Shield badge", included: false },
                    { label: "Response to Jackye Insights", included: false },
                  ].map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCheckout(STRIPE_TIERS.single_job_credit.price_id, "single_job")}
                  disabled={loadingTier === "single_job"}
                >
                  {loadingTier === "single_job" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Post a Job
                </Button>
              </CardContent>
            </Card>

            {/* Founding Partner */}
            <Card className="border-amber-500/30 bg-card ring-1 ring-amber-500/10 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs border-0">
                Founders' Special
              </Badge>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Annual
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Founding Partner</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold font-mono text-foreground">$599</span>
                  <span className="text-muted-foreground">/yr</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground line-through">$999/yr</span>
                  <Badge variant="secondary" className="text-[10px] text-green-600 bg-green-500/10 border-green-500/20">
                    Save 40%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Permanent Gold Shield, full transparency audit, and direct response to Jackye Insights.
                  Limited founding cohort pricing.
                </p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {[
                    { label: "5 job slots (30 days each)", included: true },
                    { label: "Permanent Founding Partner Gold Shield", included: true },
                    { label: "Full Transparency Audit by Jackye", included: true },
                    { label: "Exclusive response module for Jackye Insights", included: true },
                    { label: "Priority placement on Job Integrity Board", included: true },
                    { label: "Non-interference agreement required", included: true },
                  ].map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-foreground">{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => handleCheckout(STRIPE_TIERS.founding_partner.price_id, "founding_partner")}
                  disabled={loadingTier === "founding_partner"}
                >
                  {loadingTier === "founding_partner" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Become a Founding Partner
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How Certification Works */}
        <section className="bg-card border-y border-border px-6 lg:px-16 py-20">
          <div className="max-w-[960px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                How Certification Works
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The Gold Shield is earned, not bought. Payment gets you in the door — Jackye's 3-point audit gets you certified.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {certCriteria.map((c, i) => (
                <Card key={c.label} className="border-border/40">
                  <CardContent className="p-6">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <c.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1.5">
                      {i + 1}. {c.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrity Promise */}
        <section className="px-6 lg:px-16 py-16 max-w-[960px] mx-auto">
          <Card className="border-border/40 bg-muted/20">
            <CardContent className="p-8 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-3">The Integrity Promise</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Employer certification grants the right to respond to Jackye Insights —
                but provides <span className="font-semibold text-foreground">zero authority</span> to
                edit, remove, or suppress any data found by AI or Jackye's independent research.
                Every listing on the Job Integrity Board is paired with read-only intelligence
                that employers cannot modify.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="px-6 lg:px-16 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to show your receipts?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Your candidates are already checking. Meet them with transparency.
          </p>
          <Button
            size="lg"
            onClick={() => handleCheckout(STRIPE_TIERS.founding_partner.price_id, "founding_partner_cta")}
            disabled={!!loadingTier}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            {loadingTier === "founding_partner_cta" && <Loader2 className="w-4 h-4 animate-spin" />}
            <ShieldCheck className="w-4 h-4" />
            Get Started as a Founding Partner
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
