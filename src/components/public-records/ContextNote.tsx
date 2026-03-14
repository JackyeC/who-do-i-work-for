/**
 * Context note for sensitive association data.
 * Must appear for any sensitive association result.
 */

import { Info } from "lucide-react";

export function ContextNote({ className }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border ${className ?? ""}`}>
      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        A mention in public records does not, by itself, establish wrongdoing by a company or individual.
        These records document publicly available associations, filings, and disclosures.
        Review the linked evidence and context before drawing conclusions.
      </p>
    </div>
  );
}
