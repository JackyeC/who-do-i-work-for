import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { Button } from "@/components/ui/button";
import { Shield, Check, Loader2, FileSearch, Zap, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STRIPE_TIERS } from "@/hooks/use-premium";
import {
  getBriefingRoomFoundingMonthName,
  getBriefingRoomFoundingYear,
  getBriefingRoomStripePriceId,
} from "@/config/briefingRoom";
import { RESET_ROOM } from "@/config/resetRoom";
import { useBriefingRoomAudienceGate } from "@/hooks/use-briefing-room-audience";

const TIERS = [
  {
    id: "curious",
    name: "I'm Curious",
    tagline: "Know before you sign.",
    description: "Search any company. See the basics. Read the Receipts. Free forever.",
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    annualSavings: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    features: [
      "Search any company — see Employer Clarity Score",
      "Read The Receipts (investigations)",
      "Live news ticker with bias + factuality labels",
      "Workplace DNA assessment",
      "The Receipts (daily + Friday digest)",
      "1 AI job-link audit/month",
      "PeoplePuzzles decision simulation",
    ],
    cta: "Start Free",
    badge: null,
    highlight: false,
    free: true,
  },
  {
    id: "signal",
    name: "The Signal",
    tagline: "I'm actively looking.",
    description: "Full dossiers. Comp data. Interview prep. Values matching.",
    monthlyPrice: 49,
    annualPrice: 399,
    annualMonthly: 33,
    annualSavings: 189,
    monthlyPriceId: "price_1TEEvt89MyCOs8yv7SV1TeUJ",
    annualPriceId: "price_1TF2Wd89MyCOs8yv0GXHpkUE",
    features: [
      "Everything in Free, plus:",
      "Full company dossiers — all signals unlocked",
      "Unlimited AI job-link audits",
      "Values alignment scoring (from Workplace DNA)",
      "Weekly Signal Alerts",
      "Compensation benchmarks (BLS data)",
      "Interview intelligence brief + \"What to Ask\"",
      "Check the Receipts AI — unlimited",
      "Side-by-side company comparisons",
      "Cover letter generation",
    ],
    cta: "Get The Signal",
    badge: null,
    highlight: false,
    free: false,
  },
  {
    id: "match",
    name: "The Match",
    tagline: "Find me my job.",
    description: "Auto-matched jobs. Application tracking. Priority alerts.",
    monthlyPrice: 149,
    annualPrice: 1199,
    annualMonthly: 100,
    annualSavings: 589,
    monthlyPriceId: "price_1TEEw589MyCOs8yvQI8FpHJx",
    annualPriceId: "price_1TEEw589MyCOs8yvQI8FpHJx",
    features: [
      "Everything in The Signal, plus:",
      "Smart job matching — jobs delivered to you",
      "Auto-apply queue with one-click send",
      "Application tracking dashboard",
      "Priority signal alerts",
      "Full career mapping + 5-year trajectory",
      "Downloadable PDF dossiers",
      "Negotiation simulator access",
    ],
    cta: "Get The Match",
    badge: "Most Popular",
    highlight: true,
    free: false,
  },
];

export default function Pricing() {
  const foundingMonthLabel = getBriefingRoomFoundingMonthName();
  const foundingYear = getBriefingRoomFoundingYear();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoaded } = useClerkWithFallback();
  const { showBriefingRoom: showBriefingRoomOffer, ready: briefingAudienceReady } =
    useBriefingRoomAudienceGate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  usePageSEO({
    title: "Pricing — Who Do I Work For?",
    description:
      `Plans from free to The Match, Auto-Apply add-on, and The Closer ($199 one-time). The Reset Room (${RESET_ROOM.liveSessionName} live sessions, $15/mo) Founding Supporters rate applies in ${foundingMonthLabel} ${foundingYear}.`,
    path: "/pricing",
    jsonLd: {
      "@type": "WebPage",
      name: "Pricing — Who Do I Work For?",
      description: "Career intelligence plans: Free, The Signal ($49/mo), The Match ($149/mo), The Closer ($199 one-time).",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "Offer", name: "I'm Curious", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "The Signal", price: "49", priceCurrency: "USD" },
          { "@type": "Offer", name: "The Match", price: "149", priceCurrency: "USD" },
          { "@type": "Offer", name: "The Closer", price: "199", priceCurrency: "USD" },
        ],
      },
    },
  });

  const handleCheckout = async (tier: (typeof TIERS)[number]) => {
    if (tier.free) {
      navigate("/join");
      return;
    }

    if (!user) {
      toast("Sign in to subscribe");
      navigate("/login");
      return;
    }

    const priceId = isAnnual ? tier.annualPriceId : tier.monthlyPriceId;
    if (!priceId || priceId.includes("placeholder")) {
      toast("Coming soon — check back soon!");
      return;
    }

    setLoadingTier(tier.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not start checkout. Please try again.");
      }
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 lg:px-16 pt-16 pb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
            Choose Your Intelligence Level
          </h1>
          <p className="text-muted-foreground max-w-[520px] mx-auto text-base">
            From your first employer audit to full career intelligence — pick the plan that fits your search.
          </p>
        </section>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-0 pb-10">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-l-full border transition-colors",
              !isAnnual
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-r-full border border-l-0 transition-colors flex items-center gap-2",
              isAnnual
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground"
            )}
          >
            Annual
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing cards */}
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TIERS.map((tier) => {
              const displayPrice = tier.free
                ? 0
                : isAnnual
                ? tier.annualMonthly
                : tier.monthlyPrice;
              const isLoading = loadingTier === tier.id;

              return (
                <div
                  key={tier.id}
                  className={cn(
                    "relative flex flex-col rounded-xl border bg-card p-6 transition-shadow",
                    tier.highlight
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                      : "border-border"
                  )}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{tier.tagline}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        ${displayPrice}
                      </span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                    {!tier.free && isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${tier.annualPrice}/yr billed annually · save ${tier.annualSavings}
                      </p>
                    )}
                    {!tier.free && !isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">billed monthly</p>
                    )}
                    {tier.free && (
                      <p className="text-xs text-muted-foreground mt-1">Free forever</p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(tier)}
                    disabled={isLoading}
                    variant={tier.free ? "outline" : "default"}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* The Reset Room — same Stripe price as legacy "Briefing Room"; founding month gate in briefingRoom config + create-checkout */}
        {briefingAudienceReady && showBriefingRoomOffer && (
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[800px] mx-auto">
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Mic className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{RESET_ROOM.title}</h3>
                  <span className="text-xs font-semibold leading-tight text-center max-w-[9.5rem] bg-primary/15 text-primary px-2.5 py-1 rounded-lg border border-primary/25">
                    Founding Supporters
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {RESET_ROOM.tagline}{" "}
                  <Link to="/reset-room" className="text-primary hover:underline font-medium">
                    Learn more →
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Monthly live call as <strong className="text-foreground">{RESET_ROOM.liveSessionName}</strong> — job
                  search and candidate search support in one room: public records, hiring AI, and Q&amp;A without the
                  spin. Replay or recap after each session. This special {foundingMonthLabel} {foundingYear} rate is for
                  Founding Supporters only.
                </p>
                <ul className="text-sm text-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Founding Supporter badge in the product for everyone who subscribes during this window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Monthly group video call + recording / recap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>For recruiters, HR, and job seekers — same room, straight talk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Cancel anytime — stacks with free or paid dossier plans</span>
                  </li>
                </ul>
              </div>
              <div className="text-center sm:text-right shrink-0 flex flex-col items-center sm:items-end gap-2">
                <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                  <span className="text-3xl font-bold text-foreground">$15</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  disabled={loadingTier === "briefing-room"}
                  onClick={async () => {
                    if (!user) {
                      toast("Sign in to subscribe");
                      navigate("/login");
                      return;
                    }
                    const priceId = getBriefingRoomStripePriceId();
                    if (!priceId) {
                      toast.error(`${RESET_ROOM.title} checkout is finishing setup — try again soon or email hello@jackyeclayton.com.`);
                      return;
                    }
                    setLoadingTier("briefing-room");
                    try {
                      const { data, error } = await supabase.functions.invoke("create-checkout", {
                        body: { priceId },
                      });
                      if (error) throw error;
                      if (data && typeof data === "object" && "error" in data && data.error && !("url" in data && data.url)) {
                        toast.error(String(data.error));
                        return;
                      }
                      if (data?.url) window.location.href = data.url;
                      else toast.error("Could not start checkout. Please try again.");
                    } catch (e: any) {
                      toast.error(e.message || "Checkout failed");
                    } finally {
                      setLoadingTier(null);
                    }
                  }}
                >
                  {loadingTier === "briefing-room" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Join ${RESET_ROOM.title}`
                  )}
                </Button>
                {!getBriefingRoomStripePriceId() && (
                  <p className="text-[11px] text-muted-foreground max-w-[220px] sm:text-right">
                    Checkout goes live once Stripe is connected — you can still reach us via{" "}
                    <a href="/contact" className="text-primary hover:underline">
                      Contact
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Auto-Apply add-on — stacks with The Signal */}
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[800px] mx-auto">
            <div className="rounded-xl border border-border bg-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Apply When It Counts™</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                    Add-on
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  AI-drafted application payloads and queue for values-aligned roles. Works alongside{" "}
                  <strong className="text-foreground">The Signal</strong> — subscribe here even if you are not on The Match yet.
                </p>
                <ul className="text-sm text-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Auto-apply queue + generate tailored cover-letter style payloads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Application tracking when you mark jobs applied</span>
                  </li>
                </ul>
              </div>
              <div className="text-center sm:text-right shrink-0 flex flex-col items-center sm:items-end gap-2">
                <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                  <span className="text-3xl font-bold text-foreground">
                    {STRIPE_TIERS.auto_apply.price.replace("/mo", "")}
                  </span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={loadingTier === "auto-apply-addon"}
                  onClick={async () => {
                    if (!user) {
                      toast("Sign in to subscribe");
                      navigate("/login");
                      return;
                    }
                    const priceId = STRIPE_TIERS.auto_apply.price_id;
                    setLoadingTier("auto-apply-addon");
                    try {
                      const { data, error } = await supabase.functions.invoke("create-checkout", {
                        body: { priceId },
                      });
                      if (error) throw error;
                      if (data?.url) window.location.href = data.url;
                      else toast.error("Could not start checkout. Please try again.");
                    } catch (e: any) {
                      toast.error(e.message || "Checkout failed");
                    } finally {
                      setLoadingTier(null);
                    }
                  }}
                >
                  {loadingTier === "auto-apply-addon" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Auto-Apply"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* The Closer — one-time deep-dive */}
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[800px] mx-auto">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <FileSearch className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">The Closer</h3>
                    <span className="text-xs font-mono tracking-wider uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      One-time
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-lg">
                    You've got the offer. Now get the full picture. A deep-dive dossier on one company —
                    leadership accountability, political spending, compensation benchmarks, workforce stability,
                    and everything public records reveal. Delivered as a downloadable PDF.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Full company dossier with sourced citations",
                      "Executive leadership & political donation map",
                      "Compensation benchmarks vs. market",
                      "OSHA, NLRB, WARN Act history",
                      "Interview intelligence brief",
                      "Downloadable PDF — yours to keep",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center lg:text-right shrink-0">
                  <div className="flex items-baseline gap-1 justify-center lg:justify-end">
                    <span className="text-4xl font-bold text-foreground">$199</span>
                    <span className="text-muted-foreground text-sm">one-time</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">No subscription required</p>
                  <Button
                    onClick={() => {
                      toast("The Closer launches April 6 — check back soon!");
                    }}
                    className="w-full lg:w-auto"
                  >
                    Get The Closer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust footer */}
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[640px] mx-auto text-center">
            <div className="bg-card border border-primary/20 p-6 lg:p-8 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm tracking-[0.15em] uppercase text-primary font-semibold">Our Guarantee</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Not satisfied? We'll refund your purchase within 7 days — no questions asked.
                All payments processed securely through Stripe.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
