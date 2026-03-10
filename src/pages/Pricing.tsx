import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Building2, Users, Zap, Shield, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/hooks/use-premium";
import { toast } from "sonner";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    slots: 3,
    perCompany: "$9.67",
    priceId: STRIPE_TIERS.starter.price_id,
    features: [
      "3 tracked companies",
      "Full 7-layer dossier",
      "Influence scores & signals",
      "Values filter lenses",
      "Evidence receipts",
      "Unlimited users",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$250",
    period: "/mo",
    slots: 25,
    perCompany: "$10",
    priceId: STRIPE_TIERS.pro.price_id,
    features: [
      "25 tracked companies",
      "Full 7-layer dossier",
      "Influence scores & signals",
      "Values filter lenses",
      "Evidence receipts",
      "Talent risk signals",
      "Decision-maker mapping",
      "Priority support",
      "Unlimited users",
    ],
    popular: true,
  },
  {
    name: "Team",
    price: "$800",
    period: "/mo",
    slots: 100,
    perCompany: "$8",
    priceId: STRIPE_TIERS.team.price_id,
    features: [
      "100 tracked companies",
      "Full 7-layer dossier",
      "Influence scores & signals",
      "Values filter lenses",
      "Evidence receipts",
      "Talent risk signals",
      "Decision-maker mapping",
      "EVP integrity reports",
      "Market intelligence",
      "Dedicated support",
      "Unlimited users",
    ],
    popular: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

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
      <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-xs font-mono uppercase tracking-wider">
            Slot-Based Pricing
          </Badge>
          <h1 className="text-heading-1 font-bold text-foreground mb-4">
            Track Companies. See the Receipts.
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each slot unlocks the full 7-layer intelligence dossier for one company.
            Swap companies anytime — your slots are a living workspace.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col relative ${
                tier.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                  : "border-border/40 bg-card"
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
                <p className="text-caption text-muted-foreground mt-2">
                  {tier.slots} tracked companies · {tier.perCompany}/company
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={tier.popular ? "default" : "outline"}
                className="w-full"
                onClick={() => handleCheckout(tier.priceId, tier.name)}
                disabled={loadingTier === tier.name}
              >
                {loadingTier === tier.name ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Get {tier.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Add-on slots */}
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Need More Slots?</h3>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto mb-4">
            Add individual company slots to any plan for <strong>$12/company/month</strong>.
            Expand your workspace without upgrading your full tier.
          </p>
          <Button variant="outline" size="sm" onClick={() => user ? navigate("/dashboard?tab=tracked") : navigate("/login")}>
            Manage Slots
          </Button>
        </div>

        {/* Integrity Note */}
        <div className="rounded-2xl bg-muted/40 border border-border/30 px-8 py-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Data Integrity</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our data is sourced directly from FEC, USASpending, and SEC filings.
            We provide the receipts so you can verify the facts.
            No anonymous tips, no "feelings" — just intelligence.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
