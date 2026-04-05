import { AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLatestDeskPublication } from "@/hooks/use-latest-desk-publication";
import { NewsletterDeskLive } from "@/components/newsletter/NewsletterDeskLive";
import { NewsletterDeskSample } from "@/components/newsletter/NewsletterDeskSample";

/**
 * /newsletter desk: loads latest published bi-hourly row from Supabase (RLS).
 * Falls back to static sample with an explicit badge when none exists or query fails.
 */
export function NewsletterDeskPreview() {
  const { data, isLoading, isError, refetch, isFetching } = useLatestDeskPublication({
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

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
    data.generation_status === "completed" &&
    data.publish_status === "success" &&
    data.published_to_site === true;

  if (live) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh desk
          </Button>
        </div>
        <NewsletterDeskLive row={data} />
      </div>
    );
  }

  const bannerClass = isError
    ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
    : "border-primary/20 bg-primary/5 text-foreground";

  return (
    <div className="space-y-3">
      <div
        className={`flex flex-wrap items-center gap-2 justify-between rounded-lg border px-3 py-2 text-xs ${bannerClass}`}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {isError ? (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
          )}
          <span>
            <Badge
              variant="outline"
              className={`mr-2 text-[10px] uppercase ${
                isError ? "border-amber-600/40" : "border-primary/30 text-primary"
              }`}
            >
              {isError ? "Connection" : "Preview"}
            </Badge>
            {isError
              ? "Could not load the desk from the database. Showing sample layout until the connection is fixed."
              : "Pipeline is live — when the next desk edition is published to the site, it appears here automatically. Below is the layout reference until then."}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`h-8 shrink-0 ${isError ? "border-amber-600/40 text-amber-950 dark:text-amber-100" : "border-primary/25"}`}
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Check again
        </Button>
      </div>
      <NewsletterDeskSample />
    </div>
  );
}
