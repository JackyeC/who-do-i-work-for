import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, Network, Landmark, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/data/sampleData";
import { InfluenceScore, calculateInfluenceScore } from "@/components/InfluenceScore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

export function LiveInfluencePreview() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["live-preview-company"],
    queryFn: async () => {
      // Get the company with highest PAC spending as the showcase
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name, slug, total_pac_spending, lobbying_spend, government_contracts, industry")
        .order("total_pac_spending", { ascending: false })
        .limit(1);

      if (!companies?.length) return null;
      const company = companies[0];

      // Fetch supporting data in parallel
      const [execRes, rdRes, taRes] = await Promise.all([
        supabase.from("company_executives").select("total_donations").eq("company_id", company.id),
        supabase.from("company_revolving_door").select("id").eq("company_id", company.id),
        supabase.from("company_board_affiliations").select("id").eq("company_id", company.id),
      ]);

      const executiveDonations = (execRes.data || []).reduce((sum, e) => sum + (e.total_donations || 0), 0);
      const revolvingDoorCount = rdRes.data?.length || 0;
      const tradeAssociationCount = taRes.data?.length || 0;

      const influenceScore = calculateInfluenceScore({
        totalPacSpending: company.total_pac_spending,
        lobbyingSpend: company.lobbying_spend || 0,
        governmentContracts: company.government_contracts || 0,
        revolvingDoorCount,
        tradeAssociationCount,
        executiveDonations,
      });

      return {
        ...company,
        executiveDonations,
        revolvingDoorCount,
        tradeAssociationCount,
        influenceScore,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!data) return null;

  const pipeline = [
    {
      icon: DollarSign,
      label: "Money In",
      color: "text-civic-gold",
      bgColor: "bg-civic-gold/10 border-civic-gold/20",
      value: formatCurrency((data.total_pac_spending || 0) + (data.lobbying_spend || 0) + (data.executiveDonations || 0)),
      detail: "Donations + lobbying",
    },
    {
      icon: Network,
      label: "Influence Network",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      value: `${data.revolvingDoorCount + data.tradeAssociationCount} connections`,
      detail: "Executives, PACs, trade groups",
    },
    {
      icon: Landmark,
      label: "Benefits Out",
      color: "text-[hsl(var(--civic-green))]",
      bgColor: "bg-[hsl(var(--civic-green))]/10 border-[hsl(var(--civic-green))]/20",
      value: data.government_contracts ? formatCurrency(data.government_contracts) : "Scanning...",
      detail: "Contracts & subsidies",
    },
  ];

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
            <div className="gold-line w-16 mx-auto mb-8" />
            <h2 className="text-headline text-foreground mb-3 font-display">
              See how corporate money flows into politics.
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-xl mx-auto">
              Real data from <span className="font-semibold text-foreground">{data.name}</span> — updated from public filings.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="bg-card rounded-3xl border border-border/40 p-8 shadow-luxury">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Influence Score */}
              <div className="shrink-0">
                <InfluenceScore score={data.influenceScore} size="lg" />
              </div>

              {/* Pipeline */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pipeline.map((step, i) => (
                    <motion.div
                      key={step.label}
                      variants={fadeUp}
                      custom={i + 2}
                      className={`rounded-2xl border p-5 ${step.bgColor} relative`}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-card/80 border border-border/40 flex items-center justify-center">
                          <step.icon className={`w-4 h-4 ${step.color}`} />
                        </div>
                        <span className="text-xs font-bold text-foreground font-display uppercase tracking-wide">{step.label}</span>
                      </div>
                      <p className="text-lg font-bold text-foreground font-display">{step.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>

                      {i < pipeline.length - 1 && (
                        <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-card border border-border/60 items-center justify-center shadow-sm">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Based on FEC filings, lobbying disclosures, and USASpending.gov records.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => navigate(`/company/${data.slug}`)}
                >
                  View Full Profile <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => navigate("/check?tab=company")}
                >
                  Search Any Company <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
