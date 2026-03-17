import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ThumbsUp, ShieldAlert } from "lucide-react";

export function SampleDossierPreview() {
  return (
    <div className="max-w-2xl mx-auto opacity-70 pointer-events-none select-none">
      <div className="text-center mb-3">
        <Badge variant="outline" className="text-[10px]">
          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
          Example — Search a company above to get your report
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-elevated">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-display font-bold text-foreground">Amazon</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive">High Risk</Badge>
            <Badge variant="outline" className="bg-[hsl(var(--civic-green))]/10 border-[hsl(var(--civic-green))]/30 text-[hsl(var(--civic-green))] text-[9px]">High Confidence</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Technology · Washington · 1,500,000 employees</p>

        <div className="text-center py-3">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Employer Clarity Score</div>
          <div className="flex items-end justify-center gap-2">
            <span className="font-data text-5xl font-black tabular-nums text-destructive">4.2</span>
            <span className="text-lg text-muted-foreground mb-2">/10</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto mt-2">
            <div className="h-full rounded-full bg-destructive" style={{ width: "42%" }} />
          </div>
        </div>

        <p className="text-sm text-foreground/80 text-center mt-2 font-medium">
          High opportunity, high volatility. Company is mid-reset.
        </p>
      </div>

      <div className="mt-4 px-1">
        <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--civic-yellow))]" /> Before you accept:
        </h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--civic-yellow))] shrink-0" />Large-scale layoffs underway (30,000 roles through May 2026)</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--civic-yellow))] shrink-0" />Middle management roles are being eliminated</li>
          <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--civic-yellow))] shrink-0" />Mandatory 5-day RTO continues to drive attrition</li>
        </ul>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3 px-1">
        <div className="bg-[hsl(var(--civic-green))]/5 border border-[hsl(var(--civic-green))]/20 rounded-lg p-3">
          <h4 className="font-display font-bold text-xs text-[hsl(var(--civic-green))] flex items-center gap-1.5 mb-1.5">
            <ThumbsUp className="w-3 h-3" /> Strong fit if you:
          </h4>
          <ul className="space-y-1 text-[11px] text-foreground/70">
            <li>• Thrive in fast-paced environments</li>
            <li>• Specialize in AI or AWS infrastructure</li>
          </ul>
        </div>
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <h4 className="font-display font-bold text-xs text-destructive flex items-center gap-1.5 mb-1.5">
            <ShieldAlert className="w-3 h-3" /> Risk if you:
          </h4>
          <ul className="space-y-1 text-[11px] text-foreground/70">
            <li>• Are in HR or middle management</li>
            <li>• Need stability and predictable structures</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
