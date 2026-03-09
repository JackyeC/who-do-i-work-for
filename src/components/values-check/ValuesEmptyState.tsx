import { Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  hasAnySignals: boolean;
  selectedIssue: string | null | undefined;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function ValuesEmptyState({ hasAnySignals, selectedIssue, onGenerate, isGenerating }: Props) {
  if (hasAnySignals && selectedIssue) {
    return (
      <div className="text-center py-8 px-4">
        <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-foreground font-medium mb-1.5">
          No signals found for {selectedIssue}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          No values-related public signals were found for the selected issue based on the sources checked so far.
          This does not confirm the absence of activity.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 px-4">
      <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="text-sm text-foreground font-medium mb-1.5">
        No verified values signals yet
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto mb-4">
        We checked available public sources and will show partial results whenever evidence is found.
        Generate a values check to map political, lobbying, and leadership signals to the issues that matter to you.
      </p>
      {onGenerate && (
        <Button onClick={onGenerate} disabled={isGenerating} variant="premium" className="gap-2">
          <Shield className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate Values Check"}
        </Button>
      )}
    </div>
  );
}
