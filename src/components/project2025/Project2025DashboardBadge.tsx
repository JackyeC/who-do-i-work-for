import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  companySlug: string;
  /** When true, badge is shown */
  active: boolean;
  className?: string;
}

export function Project2025DashboardBadge({ companySlug, active, className }: Props) {
  if (!active) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={`/dossier/${companySlug}#project2025`} className={className} onClick={(e) => e.stopPropagation()}>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 shrink-0">
            Project 2025 data
          </Badge>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        We have documented Project 2025 affiliations for this company. See the company dossier for details.
      </TooltipContent>
    </Tooltip>
  );
}
