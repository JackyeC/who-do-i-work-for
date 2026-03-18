import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CATEGORY_DEFINITIONS: Record<string, { label: string; definition: string }> = {
  institutional_alignment: {
    label: "Leadership Networks",
    definition: "Analysis of corporate leadership ties to policy-shaping organizations. We track board seats and public endorsements.",
  },
  political_spending: {
    label: "Corporate Political Activity",
    definition: "Direct receipts from FEC and OpenSecrets filings. We look at PAC distributions to see which legislative efforts a company is funding.",
  },
  family_pillar: {
    label: "Work-Life & Family Policies",
    definition: "A measure of how company policies support different family structures, from parental leave to dependent care benefits.",
  },
  dark_money: {
    label: "Undisclosed Spending Signals",
    definition: "Tracking non-disclosed contributions through trade associations and organizations that do not require donor disclosure.",
  },
  insider_context: {
    label: "Employee Experience Signals",
    definition: "Qualitative data from verified employee testimonials and internal culture signals analyzed by our Career Intelligence model.",
  },
  lobbying: {
    label: "Government Influence Activity",
    definition: "Federal and state-level lobbying expenditures tracked via Senate Lobbying Disclosure Act filings. We map which bills and agencies each company targets.",
  },
  civil_rights: {
    label: "Workplace Fairness Signals",
    definition: "Data from EEOC, HRC Corporate Equality Index, and federal court records tracking discrimination filings, settlements, and inclusion commitments.",
  },
  climate: {
    label: "Environmental Commitments",
    definition: "EPA emissions data, CDP scores, and corporate climate commitments cross-referenced with actual emissions and energy policy positions.",
  },
  worker_treatment: {
    label: "Worker Treatment & Conditions",
    definition: "OSHA violations, NLRB filings, WARN Act layoff notices, and compensation transparency signals aggregated from public records.",
  },
  government_contracts: {
    label: "Government Contracts",
    definition: "Federal contract awards tracked via USASpending.gov, including dollar amounts, awarding agencies, and controversy flags.",
  },
};

interface CategoryTooltipProps {
  category: string;
  className?: string;
}

export function CategoryTooltip({ category, className }: CategoryTooltipProps) {
  const def = CATEGORY_DEFINITIONS[category];
  if (!def) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ${className || ""}`}>
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          <p className="font-semibold text-foreground mb-1">{def.label}</p>
          <p className="text-muted-foreground">{def.definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
