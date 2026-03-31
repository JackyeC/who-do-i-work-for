import { AlertTriangle, Shield, Users, Bot, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SignalExamplesProps {
  companyId: string;
}

function confidenceBadgeVariant(score: string): "destructive" | "default" | "secondary" {
  const s = score?.toLowerCase() ?? "";
  if (s.includes("strong") || s.includes("high")) return "destructive";
  if (s.includes("likely") || s.includes("medium")) return "default";
  return "secondary";
}

function categoryIcon(category: string) {
  const c = category?.toLowerCase() ?? "";
  if (c.includes("animal")) return Shield;
  if (c.includes("ai") || c.includes("tech") || c.includes("hr")) return Bot;
  if (c.includes("labor") || c.includes("workforce")) return Users;
  return Activity;
}

export function SignalExamples({ companyId }: SignalExamplesProps) {
  const { data: signals, isLoading } = useQuery({
    queryKey: ["issue-signals", companyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("issue_signals")
        .select("*")
        .eq("entity_id", companyId)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!companyId,
  });

  if (isLoading || !signals || signals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-civic-yellow" />
        <h4 className="text-sm font-semibold text-foreground">Recent Signals</h4>
      </div>
      {signals.map((signal) => {
        const Icon = categoryIcon(signal.issue_category);
        return (
          <div
            key={signal.id}
            className="rounded-xl border border-border/40 bg-card p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-micro font-mono text-muted-foreground uppercase">
                    {signal.issue_category}
                  </span>
                  <Badge variant={confidenceBadgeVariant(signal.confidence_score)} className="text-xs">
                    {signal.confidence_score}
                  </Badge>
                </div>
                <h5 className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                  {signal.signal_type}
                </h5>
              </div>
              {signal.transaction_date && (
                <span className="text-micro text-muted-foreground shrink-0">
                  {new Date(signal.transaction_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            {signal.description && (
              <p className="text-caption text-muted-foreground leading-relaxed">{signal.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
