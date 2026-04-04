import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLatestDeskPublication } from "@/hooks/use-latest-desk-publication";
import { NewsletterDeskLive } from "@/components/newsletter/NewsletterDeskLive";
import { NewsletterDeskSample } from "@/components/newsletter/NewsletterDeskSample";

/**
 * /newsletter desk: loads latest published bi-hourly row from Supabase (RLS).
 * Falls back to static sample with an explicit badge when none exists or query fails.
 */
export function NewsletterDeskPreview() {
  const { data, isLoading, isError } = useLatestDeskPublication();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading desk…</p>
        </CardContent>
      </Card>
    );
  }

  const live =
    data &&
    data.site_markdown &&
    data.site_markdown.trim().length > 0 &&
    data.generation_status === "completed";

  if (live) {
    return <NewsletterDeskLive row={data} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          <Badge variant="outline" className="mr-2 border-amber-600/40 text-[10px] uppercase">
            Fallback
          </Badge>
          {isError
            ? "Could not load live desk from the database. Showing sample layout until the connection is fixed."
            : "No live desk row is published yet. Showing sample format. After the content engine posts a completed run to Supabase, this block updates automatically."}
        </span>
      </div>
      <NewsletterDeskSample />
    </div>
  );
}
