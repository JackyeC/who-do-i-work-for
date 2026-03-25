import { AlertTriangle, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface FlagItem {
  pillar: "Integrity Gap" | "Labor Impact" | "Safety Alert" | "Connected Dots";
  summary: string;
  amount?: number | null;
  source: string;
}

const PILLAR_COLORS: Record<string, string> = {
  "Integrity Gap": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "Labor Impact": "bg-red-500/15 text-red-600 border-red-500/30",
  "Safety Alert": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  "Connected Dots": "bg-blue-500/15 text-blue-600 border-blue-500/30",
};

interface TopFlagsSectionProps {
  issueSignals: any[] | undefined;
  eeocCases: any[] | undefined;
  valuesSignals: any[] | undefined;
  companyName: string;
}

export function TopFlagsSection({
  issueSignals,
  eeocCases,
  valuesSignals,
  companyName,
}: TopFlagsSectionProps) {
  const flags: FlagItem[] = [];

  // Collect from issue signals
  if (issueSignals) {
    for (const sig of issueSignals) {
      const pillar = categorizeToPillar(sig.issue_category, sig.signal_type);
      flags.push({
        pillar,
        summary: sig.description || sig.issue_category || "Issue signal detected",
        amount: sig.amount || null,
        source: sig.source_url ? extractSourceTag(sig.source_url) : "Public Record",
      });
    }
  }

  // Collect from EEOC cases
  if (eeocCases) {
    for (const c of eeocCases) {
      flags.push({
        pillar: "Labor Impact",
        summary: c.case_name || c.title || `EEOC enforcement action against ${companyName}`,
        amount: c.monetary_relief || c.settlement_amount || null,
        source: "EEOC",
      });
    }
  }

  // Collect from values signals
  if (valuesSignals) {
    for (const v of valuesSignals) {
      flags.push({
        pillar: "Integrity Gap",
        summary: v.signal_summary || v.evidence_text || "Values alignment concern",
        amount: null,
        source: v.source_url ? extractSourceTag(v.source_url) : "Company Records",
      });
    }
  }

  // Sort by amount (descending), then by existence of amount
  const sorted = flags.sort((a, b) => {
    const amtA = a.amount ?? 0;
    const amtB = b.amount ?? 0;
    if (amtB !== amtA) return amtB - amtA;
    return 0;
  });

  const top3 = sorted.slice(0, 3);

  if (top3.length === 0) {
    return (
      <Card className="mb-4 border-border/40 bg-card">
        <CardContent className="p-6 text-center">
          <Flag className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No flags detected yet for {companyName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-border/40 bg-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-foreground">Top Flags</h3>
          <Badge variant="outline" className="text-xs ml-auto">Always Free</Badge>
        </div>
        <div className="space-y-3">
          {top3.map((flag, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-muted/20"
            >
              <Badge
                variant="outline"
                className={`text-xs shrink-0 mt-0.5 ${PILLAR_COLORS[flag.pillar] || ""}`}
              >
                {flag.pillar}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                  {flag.summary}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {flag.amount != null && flag.amount > 0 && (
                    <span className="text-xs font-mono font-semibold text-destructive">
                      ${flag.amount.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{flag.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function categorizeToPillar(
  category?: string,
  signalType?: string
): "Integrity Gap" | "Labor Impact" | "Safety Alert" | "Connected Dots" {
  const cat = (category || "").toLowerCase();
  const sig = (signalType || "").toLowerCase();

  if (cat.includes("labor") || cat.includes("workforce") || cat.includes("layoff") || cat.includes("eeoc") || cat.includes("discrimination") || sig.includes("warn")) {
    return "Labor Impact";
  }
  if (cat.includes("safety") || cat.includes("osha") || cat.includes("environmental") || cat.includes("regulatory")) {
    return "Safety Alert";
  }
  if (cat.includes("lobby") || cat.includes("pac") || cat.includes("political") || cat.includes("contract") || cat.includes("revolving")) {
    return "Connected Dots";
  }
  return "Integrity Gap";
}

function extractSourceTag(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("fec.gov")) return "FEC";
    if (hostname.includes("eeoc.gov")) return "EEOC";
    if (hostname.includes("osha.gov")) return "OSHA";
    if (hostname.includes("sec.gov")) return "SEC";
    if (hostname.includes("usaspending")) return "USAspending";
    return hostname.split(".")[0].toUpperCase().slice(0, 12);
  } catch {
    return "Public Record";
  }
}
