import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlacementToolkitUpsell({
  className,
  compact,
}: {
  className?: string;
  /** Smaller inline banner for dashboards */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground",
          className
        )}
      >
        <span className="font-medium text-foreground">Placement toolkit</span>
        {" — "}
        Values-scored roles we find for you, dossier-backed drafts, and intentional apply pacing are included with{" "}
        <Link to="/pricing" className="text-primary font-semibold hover:underline">
          The Signal, The Match, or the Auto-Apply add-on
        </Link>
        .
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/15 bg-primary/[0.03]", className)}>
      <CardContent className="p-6 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-primary mx-auto" aria-hidden />
        <h3 className="text-lg font-semibold text-foreground">Dossier, coaching-ready materials and roles we find</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          This isn&apos;t a free spray-and-pray bot. Subscribers get values-ranked openings, application drafts you
          approve, and monthly caps that keep every outreach something you&apos;re proud of.
        </p>
        <Button asChild size="sm" className="mt-1">
          <Link to="/pricing">View plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
