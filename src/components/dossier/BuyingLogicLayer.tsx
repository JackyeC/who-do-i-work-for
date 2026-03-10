import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight, Building2, Shield, DollarSign, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BuyingLogicProps {
  companyId: string;
  companyName: string;
  industry: string;
}

// Industry-specific buying committee templates
function getDefaultCommittee(industry: string) {
  const committees: Record<string, Array<{ role: string; stage: string; influence: string }>> = {
    "Healthcare": [
      { role: "Clinical Director", stage: "Needs Assessment", influence: "Champion" },
      { role: "VP Operations", stage: "Evaluation", influence: "Decision Maker" },
      { role: "CFO", stage: "Budget Approval", influence: "Economic Buyer" },
      { role: "Compliance Officer", stage: "Compliance Review", influence: "Gatekeeper" },
      { role: "CEO / Board", stage: "Final Approval", influence: "Final Authority" },
    ],
    "Technology": [
      { role: "Engineering Lead", stage: "Technical Evaluation", influence: "Champion" },
      { role: "VP Engineering / CTO", stage: "Architecture Review", influence: "Decision Maker" },
      { role: "Security Team", stage: "Security Assessment", influence: "Gatekeeper" },
      { role: "Procurement", stage: "Contract Negotiation", influence: "Economic Buyer" },
      { role: "CFO", stage: "Budget Approval", influence: "Final Authority" },
    ],
    default: [
      { role: "Department Head", stage: "Needs Identification", influence: "Champion" },
      { role: "VP / Director", stage: "Solution Evaluation", influence: "Decision Maker" },
      { role: "Legal / Compliance", stage: "Risk Review", influence: "Gatekeeper" },
      { role: "Procurement", stage: "Vendor Selection", influence: "Economic Buyer" },
      { role: "C-Suite", stage: "Final Approval", influence: "Final Authority" },
    ],
  };

  return committees[industry] || committees.default;
}

const influenceIcons: Record<string, React.ElementType> = {
  "Champion": Users,
  "Decision Maker": Building2,
  "Gatekeeper": Shield,
  "Economic Buyer": DollarSign,
  "Final Authority": FileText,
};

const influenceColors: Record<string, string> = {
  "Champion": "bg-civic-blue/10 text-civic-blue border-civic-blue/20",
  "Decision Maker": "bg-primary/10 text-primary border-primary/20",
  "Gatekeeper": "bg-civic-yellow/10 text-civic-yellow border-civic-yellow/20",
  "Economic Buyer": "bg-civic-green/10 text-civic-green border-civic-green/20",
  "Final Authority": "bg-destructive/10 text-destructive border-destructive/20",
};

export function BuyingLogicLayer({ companyId, companyName, industry }: BuyingLogicProps) {
  const { data: executives, isLoading } = useQuery({
    queryKey: ["buying-logic-execs", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("company_executives").select("name, title").eq("company_id", companyId);
      return data || [];
    },
    enabled: !!companyId,
  });

  const committee = getDefaultCommittee(industry);

  // Map real executives to committee roles where possible
  const mappedCommittee = committee.map(member => {
    const matchedExec = (executives || []).find(e => {
      const title = e.title.toLowerCase();
      if (member.influence === "Final Authority" && (title.includes("ceo") || title.includes("president"))) return true;
      if (member.influence === "Economic Buyer" && (title.includes("cfo") || title.includes("finance"))) return true;
      if (member.influence === "Decision Maker" && (title.includes("vp") || title.includes("director"))) return true;
      return false;
    });
    return { ...member, executive: matchedExec?.name || null };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-caption text-muted-foreground leading-relaxed">
        Typical buying committee and approval layers for {companyName} based on {industry} industry patterns.
        {executives && executives.length > 0 && ` Known executives mapped where applicable.`}
      </p>

      {/* Pipeline visualization */}
      <div className="space-y-1">
        {mappedCommittee.map((member, idx) => {
          const Icon = influenceIcons[member.influence] || Users;
          const color = influenceColors[member.influence] || "bg-muted text-muted-foreground";
          return (
            <div key={idx}>
              <Card className="border-border/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground font-mono text-sm font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color.split(" ").slice(0, 1).join(" ")}`}>
                    <Icon className={`w-4 h-4 ${color.split(" ").slice(1, 2).join(" ")}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-caption">{member.role}</span>
                      <Badge variant="outline" className={`text-micro ${color}`}>{member.influence}</Badge>
                    </div>
                    <p className="text-micro text-muted-foreground mt-0.5">{member.stage}</p>
                    {member.executive && (
                      <p className="text-micro text-primary mt-0.5">Likely: {member.executive}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {idx < mappedCommittee.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-muted/30 border border-border/20 p-3">
        <p className="text-micro text-muted-foreground">
          <strong>Note:</strong> Buying committee structure is modeled from industry patterns and known executive data. Actual processes may vary.
        </p>
      </div>
    </div>
  );
}
