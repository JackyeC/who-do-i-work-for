import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, AlertTriangle, TrendingUp, TrendingDown, ExternalLink, Sparkles, Search, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaBiasIndicator } from "@/components/MediaBiasIndicator";
import { CoverageBalanceChart } from "@/components/CoverageBalanceChart";
import { GDELT_NEGATIVE_THRESHOLD, GDELT_POSITIVE_THRESHOLD } from "@/lib/gdelt-sentiment";
import { IntelligenceEmptyState } from "@/components/intelligence/IntelligenceEmptyState";

interface Props {
  companyId: string;
  companyName: string;
}

function fallbackNewsSearchUrl(headline: string, companyName: string): string {
  const q = `${headline} ${companyName}`.slice(0, 280);
  return `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(q)}`;
}

function coverageTier(n: number): { label: string; className: string } {
  if (n >= 15) return { label: "Strong", className: "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" };
  if (n >= 5) return { label: "Moderate", className: "bg-[hsl(var(--civic-yellow))]/10 text-[hsl(var(--civic-yellow))] border-[hsl(var(--civic-yellow))]/30" };
  return { label: "Emerging", className: "bg-muted text-muted-foreground border-border" };
}

function sentimentColor(score: number) {
  if (score >= GDELT_POSITIVE_THRESHOLD) return "text-[hsl(var(--civic-green))]";
  if (score <= GDELT_NEGATIVE_THRESHOLD) return "text-destructive";
  return "text-muted-foreground";
}

function sentimentBg(score: number) {
  if (score >= GDELT_POSITIVE_THRESHOLD) return "bg-[hsl(var(--civic-green))]/10 border-[hsl(var(--civic-green))]/20";
  if (score <= GDELT_NEGATIVE_THRESHOLD) return "bg-destructive/10 border-destructive/20";
  return "bg-muted/50 border-border";
}

/** Full news coverage card (links, bias, tier). For a compact sentiment strip only, see MediaNarrativeCard — avoid both on one screen unless intentional. */
export function NewsIntelligenceCard({ companyId, companyName }: Props) {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncKickoffDone, setSyncKickoffDone] = useState(false);

  const { data, isLoading, isSuccess, isError, isFetching } = useQuery({
    queryKey: ["news-signals", companyId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("company_news_signals")
        .select("*")
        .eq("company_id", companyId)
        .order("published_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return rows || [];
    },
    enabled: !!companyId,
  });

  const signals = data ?? [];
  const isEmpty = isSuccess && signals.length === 0;

  useEffect(() => {
    setSyncKickoffDone(false);
  }, [companyId]);

  const runGdeltSync = useCallback(async () => {
    if (!companyId || !companyName) return;
    setIsSyncing(true);
    try {
      await supabase.functions.invoke("sync-gdelt", { body: { companyId, companyName } });
    } catch {
      // Network / function errors — still refetch in case partial write
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["news-signals", companyId] });
      await queryClient.invalidateQueries({ queryKey: ["media-narrative", companyId] });
      setIsSyncing(false);
    }
  }, [companyId, companyName, queryClient]);

  useEffect(() => {
    if (!isSuccess || !companyId || !companyName || signals.length > 0 || syncKickoffDone) return;
    setSyncKickoffDone(true);
    void runGdeltSync();
  }, [isSuccess, signals.length, companyId, companyName, syncKickoffDone, runGdeltSync]);

  const showNewsLoader = isLoading || (isEmpty && (!syncKickoffDone || isSyncing || isFetching));

  if (showNewsLoader) {
    return (
      <Card className="mb-6 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
            <span>Pulling recent headlines from GDELT (last ~90 days)…</span>
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mb-6 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Could not load indexed news. Check your connection and try again.</p>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => void runGdeltSync()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (signals.length === 0) {
    return (
      <Card className="mb-6 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntelligenceEmptyState category="media" state="after" />
          <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" onClick={() => void runGdeltSync()} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Refreshing…
              </>
            ) : (
              "Refresh news coverage"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const controversies = signals.filter((s: any) => s.is_controversy);
  const avgTone = signals.reduce((a: number, s: any) => a + (Number(s.sentiment_score) || 0), 0) / signals.length;
  const tier = coverageTier(signals.length);
  const withUrl = signals.filter((s: any) => !!s.source_url).length;
  const latestTs = signals.reduce((best: string | null, s: any) => {
    const t = s.published_at || s.created_at;
    if (!t) return best;
    if (!best) return t;
    return new Date(t) > new Date(best) ? t : best;
  }, null as string | null);

  const toneWord =
    avgTone >= GDELT_POSITIVE_THRESHOLD
      ? "tilts positive"
      : avgTone <= GDELT_NEGATIVE_THRESHOLD
        ? "tilts negative"
        : "reads mixed to neutral";
  const foundLine = `We found ${signals.length} recent article${signals.length !== 1 ? "s" : ""} mentioning ${companyName} in the last ~90 days — enough to ${controversies.length ? "spot controversies and " : ""}see how media coverage ${toneWord}.`;
  const meansLine =
    "Use the links to read originals, then come back: cross-check against PAC, lobbying, and workforce signals on this profile so the story isn't one headline deep.";

  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News Coverage
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", tier.className)}>
              {tier.label}
            </Badge>
            {controversies.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {controversies.length} controvers{controversies.length === 1 ? "y" : "ies"}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What we found</p>
            <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">{foundLine}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What it means for you</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{meansLine}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sentiment summary */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          {avgTone >= 0 ? (
            <TrendingUp className={cn("w-5 h-5", sentimentColor(avgTone))} />
          ) : (
            <TrendingDown className={cn("w-5 h-5", sentimentColor(avgTone))} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Overall tone:{" "}
              <span className={sentimentColor(avgTone)}>
                {avgTone >= GDELT_POSITIVE_THRESHOLD
                  ? "Positive"
                  : avgTone <= GDELT_NEGATIVE_THRESHOLD
                    ? "Negative"
                    : "Neutral / mixed"}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
              <span>
                {signals.length} record{signals.length !== 1 ? "s" : ""}
                {withUrl < signals.length ? ` · ${signals.length - withUrl} without a direct URL (use search)` : ""}
              </span>
              {latestTs && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  Newest {formatDistanceToNow(new Date(latestTs), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Article list */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
          {signals.map((s: any) => {
            const href = s.source_url || fallbackNewsSearchUrl(s.headline, companyName);
            const isFallback = !s.source_url;
            return (
              <a
                key={s.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "block p-2.5 rounded-lg border text-sm transition-colors hover:border-primary/40 hover:bg-primary/[0.03]",
                  sentimentBg(Number(s.sentiment_score) || 0)
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm leading-snug">{s.headline}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {s.source_name && <span className="text-xs text-muted-foreground">{s.source_name}</span>}
                      {s.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.published_at).toLocaleDateString()}
                        </span>
                      )}
                      {s.is_controversy && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {s.controversy_type || "controversy"}
                        </Badge>
                      )}
                      <MediaBiasIndicator sourceUrl={s.source_url} sourceName={s.source_name} />
                      {isFallback && (
                        <Badge variant="secondary" className="text-xs">
                          Web search
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Coverage Balance */}
        <CoverageBalanceChart sourceUrls={signals.map((s: any) => s.source_url).filter(Boolean)} />

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
            <Link to="/newsletter">
              <Newspaper className="w-3 h-3 mr-1" />
              Jackye&apos;s desk
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
            <Link to="/ask-jackye">
              <Sparkles className="w-3 h-3 mr-1" />
              Ask Jackye
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
            <Link to="/check">
              <Search className="w-3 h-3 mr-1" />
              Situation check
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" asChild>
            <Link to="/values-search">Values match</Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => void runGdeltSync()} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh from GDELT"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Pulled from the GDELT news index (last ~90 days). Tone scores come from GDELT; outlet perspective uses AllSides / Ad Fontes where we can match the domain.
        </p>
      </CardContent>
    </Card>
  );
}
