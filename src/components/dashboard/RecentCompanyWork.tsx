import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Building2, ChevronRight, ScanSearch } from "lucide-react";
import { usePersona } from "@/hooks/use-persona";
import { useRecentCompanyViews } from "@/hooks/use-recent-company-views";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scoreColorClass(score: number) {
  if (score >= 70) return "text-civic-green";
  if (score >= 40) return "text-primary";
  return "text-destructive";
}

interface RecentCompanyWorkProps {
  onNavigate?: (tab: string) => void;
}

/**
 * Dashboard rail: employers the signed-in user actually opened (dossier / profile / check).
 * Populated by useScanTracker → user_recent_company_views.
 */
export function RecentCompanyWork({ onNavigate }: RecentCompanyWorkProps) {
  const navigate = useNavigate();
  const { hasTakenQuiz, personaName } = usePersona();
  const { data: rows, isLoading } = useRecentCompanyViews(10);

  const lensLine =
    hasTakenQuiz && personaName
      ? `Reader lens: “${personaName}” — your view is tuned.`
      : "Your lens is clear.";

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/30 bg-card/50 p-5 animate-pulse space-y-3">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-3 w-full max-w-md bg-muted rounded" />
        <div className="h-12 bg-muted/60 rounded-lg" />
      </div>
    );
  }

  const items = (rows || []).filter((r) => r.company?.slug);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-5 sm:p-6">
        <h3 className="text-sm font-extrabold text-foreground tracking-tight">Your Recent Work</h3>
        <p className="text-xs text-muted-foreground mt-1">{lensLine}</p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          No companies audited yet. Start your first scan to build your signal.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" className="gap-1.5" asChild>
            <Link to="/check?tab=company">
              <ScanSearch className="w-3.5 h-3.5" />
              Run employer scan
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/browse">Browse directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/30 bg-card/80 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-sm font-extrabold text-foreground tracking-tight">Your Recent Work</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{lensLine}</p>
        </div>
        <span className="text-[10px] font-mono uppercase text-muted-foreground/70 shrink-0">
          {items.length} recent
        </span>
      </div>

      <ul className="mt-3 space-y-1">
        {items.map((row) => {
          const c = row.company!;
          const score = c.employer_clarity_score ?? c.civic_footprint_score ?? null;
          const scoreNum = score != null ? Math.round(score) : null;
          return (
            <li key={row.id}>
              <Link
                to={`/dossier/${c.slug}`}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-border/40 hover:bg-muted/30 transition-colors group"
              >
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(row.viewed_at), { addSuffix: true })}
                    {c.industry ? ` · ${c.industry}` : ""}
                  </p>
                </div>
                {scoreNum != null && (
                  <span
                    className={cn(
                      "text-sm font-bold font-mono tabular-nums shrink-0",
                      scoreColorClass(scoreNum)
                    )}
                  >
                    {scoreNum}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => (onNavigate ? onNavigate("tracked") : navigate("/dashboard?tab=tracked"))}
        className="text-xs font-medium mt-3 flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
      >
        Manage watchlist <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
