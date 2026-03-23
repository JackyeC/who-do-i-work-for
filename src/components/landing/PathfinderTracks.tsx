import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Compass, Bot, Target, Rocket, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tracks = [
  {
    number: 1,
    name: "The Explorer",
    icon: Compass,
    price: "Free",
    priceNote: "Registration required",
    period: "",
    mode: "free" as const,
    hook: "Start Here.",
    description: "Calibrate your Workplace DNA and access the public intelligence dashboard. See what most job boards won't show you.",
    action: "Create Free Account",
    features: [
      "Workplace DNA Calibration results",
      "Public Intelligence Dashboard access",
      "Monday Momentum weekly newsletter",
      "Receipts — free company investigations",
      "Community access",
    ],
  },
  {
    number: 2,
    name: "Pro",
    icon: Bot,
    price: "$19",
    priceNote: "",
    period: "/mo",
    mode: "subscription" as const,
    priceId: "price_1TCdD87Qj0W6UtN9NBt8Wtb9",
    annualPrice: "$15",
    annualPeriod: "/mo",
    annualPriceNote: "billed annually ($180/yr)",
    // TODO: Create annual Stripe price and replace this placeholder
    annualPriceId: "price_scout_annual_placeholder",
    hook: "Your AI Coach.",
    description: "Unlimited AI-powered audits on any job link. Values alignment scoring, real-time employer alerts, and direct access to Ask Jackye.",
    action: "Go Pro",
    features: [
      "Unlimited AI job-link audits",
      "Values alignment scoring",
      "Weekly Signal Alerts (employer red flags)",
      "Ask Jackye — unlimited questions",
      "Everything in Explorer",
    ],
  },
  {
    number: 3,
    name: "The Dossier",
    icon: Target,
    price: "$199",
    priceNote: "",
    period: " one-time",
    mode: "payment" as const,
    priceId: "price_1TCdDA7Qj0W6UtN9VPMXRkyY",
    hook: "Walk In Prepared.",
    description: "A deep-dive employer intelligence report built for one specific company and interview. Data-backed negotiation prep included.",
    action: "Get My Dossier",
    popular: true,
    features: [
      "Full employer intelligence dossier",
      "Compensation benchmarks (BLS data)",
      "Negotiation talking points & scripts",
      "Interview intelligence brief",
      "Red flag summary with sources",
    ],
  },
  {
    number: 4,
    name: "The Executive",
    icon: Rocket,
    price: "$999",
    priceNote: "",
    period: "/year",
    mode: "subscription" as const,
    priceId: "price_1TCTiJ7Qj0W6UtN9hARvCvgh",
    hook: "Career On Autopilot.",
    description: "Full-service career management. Jackye and the WDIWF intelligence engine working for you year-round.",
    action: "Go Executive",
    features: [
      "Apply When It Counts™ placement engine",
      "Full career mapping & 5-year plan",
      "Quarterly 1-on-1 strategy sessions with Jackye",
      "Priority response within 24 hours",
      "All Pro + Dossier features included",
      "Dedicated Slack channel for ongoing support",
    ],
  },
];

export function PathfinderTracks({ showAll = false }: { showAll?: boolean }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  // On homepage: show first 3 tiers. On /pricing: show all 4.
  const visibleTracks = showAll ? tracks : tracks.slice(0, 3);

  const handleTrackAction = async (track: typeof tracks[0]) => {
    if (track.mode === "free") {
      navigate("/join");
      return;
    }

    if (!user) {
      toast.error("Sign in first to continue.", {
        action: { label: "Sign in", onClick: () => navigate("/login") },
      });
      return;
    }

    const effectivePriceId = isAnnual && "annualPriceId" in track
      ? (track as any).annualPriceId
      : track.priceId;

    if (!effectivePriceId || effectivePriceId.includes("placeholder")) {
      toast("This plan is coming soon — check back soon!");
      return;
    }

    setLoading(effectivePriceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: effectivePriceId, mode: track.mode },
      });
      if (error) {
        toast.error("Unable to start checkout. Please try again.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Unable to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getDisplayPrice = (track: typeof tracks[0]) => {
    if (isAnnual && "annualPrice" in track) {
      return {
        price: (track as any).annualPrice,
        period: (track as any).annualPeriod,
        priceNote: (track as any).annualPriceNote,
        originalPrice: track.price,
      };
    }
    return {
      price: track.price,
      period: track.period,
      priceNote: track.priceNote,
      originalPrice: null,
    };
  };

  return (
    <section className="px-6 lg:px-16 py-24 lg:py-32">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <div className="font-mono text-sm tracking-[0.2em] uppercase text-primary mb-3">
            Your Pathfinder
          </div>
          <h2 className="text-2xl lg:text-3xl text-foreground mb-3">
            Choose Your Track
          </h2>
          <p className="text-sm text-muted-foreground max-w-[520px] mx-auto mb-8">
            From free career calibration to full autopilot search management. Start where you are.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-1.5 py-1.5">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "font-mono text-xs tracking-wider uppercase px-4 py-1.5 rounded-full transition-all duration-200",
                !isAnnual
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "font-mono text-xs tracking-wider uppercase px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2",
                isAnnual
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className={cn(
                "text-xs font-semibold tracking-wider px-2 py-0.5 rounded-full",
                isAnnual
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/15 text-primary"
              )}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className={cn(
          "grid gap-px bg-border border border-border",
          showAll
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-3"
        )}>
          {visibleTracks.map((track) => {
            const display = getDisplayPrice(track);
            return (
              <div
                key={track.number}
                className={cn(
                  "bg-card p-6 lg:p-7 flex flex-col relative",
                  track.popular && "ring-2 ring-primary ring-inset"
                )}
              >
                {track.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center font-mono text-xs tracking-[0.2em] uppercase py-1">
                    Most Popular
                  </div>
                )}

                <div className={cn("mb-4", track.popular && "mt-4")}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
                      Track {track.number}
                    </span>
                  </div>
                  <track.icon className="w-6 h-6 text-primary mb-3" strokeWidth={1.5} />
                  <div className="font-mono text-sm tracking-wider uppercase text-foreground font-semibold mb-1">
                    {track.name}
                  </div>
                  <div className="font-mono text-xs tracking-wider uppercase text-primary mb-1">
                    {track.hook}
                  </div>
                  {"subtitle" in track && (track as any).subtitle && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(track as any).subtitle}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  {display.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {display.originalPrice}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-foreground">{display.price}</span>
                  {display.period && (
                    <span className="text-sm text-muted-foreground">{display.period}</span>
                  )}
                  {display.priceNote && (
                    <div className="text-xs text-muted-foreground mt-0.5">{display.priceNote}</div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-grow">
                  {track.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {track.features.map((f) => (
                    <li key={f} className="text-sm text-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleTrackAction(track)}
                  variant={track.popular ? "default" : "outline"}
                  className="w-full gap-1.5 font-mono text-xs tracking-wider uppercase mt-auto"
                  disabled={!!loading}
                >
                  {loading === (isAnnual && "annualPriceId" in track ? (track as any).annualPriceId : track.priceId) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {track.action}
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {!showAll && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/pricing")}
              className="font-mono text-sm tracking-wider uppercase text-primary hover:underline inline-flex items-center gap-1.5"
            >
              See all plans <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Including deep-dive dossiers and full career management.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}