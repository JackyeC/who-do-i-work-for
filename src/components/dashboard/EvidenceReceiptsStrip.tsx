import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";

/**
 * Lightweight bridge from dashboard → cross-company evidence list.
 * High engagement usually comes from *personal* hooks (watchlist, employer); this is a secondary discovery path.
 */
export function EvidenceReceiptsStrip() {
  return (
    <div className="mb-8 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Evidence receipts</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cross-company rows from public filings (lobbying, PACs, contracts). Facts only—company profiles unpack definitions and sources.
          </p>
        </div>
      </div>
      <Link
        to="/intelligence"
        className="text-sm font-medium text-primary inline-flex items-center gap-1.5 shrink-0 hover:underline"
      >
        Open feed
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
