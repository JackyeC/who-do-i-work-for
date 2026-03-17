import { AlertTriangle } from "lucide-react";
import type { CompanyResult } from "./EmployerDossierSearch";

function deriveSignals(company: CompanyResult): string[] {
  // Use curated dossier insights if available
  if (company.dossier?.insights?.length) {
    return company.dossier.insights.slice(0, 5);
  }

  const signals: string[] = [];
  if (company.total_pac_spending > 100000) signals.push("Significant political spending detected (transparency risk)");
  if ((company.lobbying_spend ?? 0) > 50000) signals.push("Active lobbying presence — check policy alignment");
  if (!company.employee_count) signals.push("Employee headcount not publicly disclosed");
  if (company.civic_footprint_score < 40) signals.push("Limited public transparency across governance metrics");
  if (company.record_status !== "verified") signals.push("Company record has not been fully verified yet");
  if ((company.career_intelligence_score ?? 5) < 5) signals.push("Below-average career intelligence indicators");
  if (signals.length === 0) {
    signals.push("No major red flags detected in available data");
    signals.push("Continue due diligence with role-specific research");
  }
  return signals.slice(0, 5);
}

interface BeforeYouAcceptBlockProps {
  company: CompanyResult;
}

export function BeforeYouAcceptBlock({ company }: BeforeYouAcceptBlockProps) {
  const signals = deriveSignals(company);

  return (
    <div className="max-w-2xl mx-auto mt-5">
      <h3 className="font-display font-bold text-foreground text-base sm:text-lg flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-[hsl(var(--civic-yellow))]" />
        Before you accept:
      </h3>
      <ul className="space-y-2">
        {signals.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--civic-yellow))] shrink-0" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
