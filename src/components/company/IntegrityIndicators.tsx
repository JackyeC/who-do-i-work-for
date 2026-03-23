import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Indicator {
  id: string;
  indicator_type: string;
  indicator_key: string;
  label: string;
  description: string;
  legislation_ref: string | null;
  section_ref: string | null;
  evidence_url: string | null;
  confidence: string;
}

const INDICATOR_STYLES: Record<string, { icon: typeof ShieldAlert; bg: string; border: string; text: string; dot: string }> = {
  red_flag: {
    icon: ShieldAlert,
    bg: "bg-destructive/8",
    border: "border-destructive/25",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  amber_flag: {
    icon: AlertTriangle,
    bg: "bg-[hsl(var(--civic-yellow))]/10",
    border: "border-[hsl(var(--civic-yellow))]/30",
    text: "text-[hsl(var(--civic-yellow))]",
    dot: "bg-[hsl(var(--civic-yellow))]",
  },
  green_badge: {
    icon: ShieldCheck,
    bg: "bg-[hsl(var(--civic-green))]/10",
    border: "border-[hsl(var(--civic-green))]/30",
    text: "text-[hsl(var(--civic-green))]",
    dot: "bg-[hsl(var(--civic-green))]",
  },
};

export function IntegrityIndicators({ companyId }: { companyId: string }) {
  const { data: indicators } = useQuery({
    queryKey: ["integrity-indicators", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrity_indicators")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("indicator_type");
      if (error) throw error;
      return data as Indicator[];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  if (!indicators?.length) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {indicators.map((ind) => {
          const style = INDICATOR_STYLES[ind.indicator_type] || INDICATOR_STYLES.amber_flag;
          const Icon = style.icon;

          return (
            <Tooltip key={ind.id}>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-default transition-colors ${style.bg} ${style.border} ${style.text}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[220px]">{ind.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs text-sm leading-relaxed p-3"
              >
                <p className="font-medium mb-1">{ind.label}</p>
                <p className="text-muted-foreground">{ind.description}</p>
                {ind.legislation_ref && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Ref: {ind.legislation_ref}
                    {ind.section_ref ? ` — ${ind.section_ref}` : ""}
                  </p>
                )}
                {ind.evidence_url && (
                  <a
                    href={ind.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View source
                  </a>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
