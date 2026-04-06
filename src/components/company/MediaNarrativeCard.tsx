/**
 * Compact media sentiment strip backed by `company_news_signals` (GDELT via sync-gdelt).
 * For full article list + bias context on company profile, see NewsIntelligenceCard — avoid rendering both on the same route unless product intentionally wants two modules.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Radio, TrendingUp, Minus, TrendingDown, AlertCircle } from "lucide-react";
import { IntelligenceEmptyState } from "@/components/intelligence/IntelligenceEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { gdeltToneBucket } from "@/lib/gdelt-sentiment";

interface MediaNarrativeCardProps {
  companyId: string;
  companyName: string;
}

interface NewsItem {
  headline: string;
  sentiment_score: number | null;
  tone_label: string | null;
  is_controversy: boolean | null;
  controversy_type: string | null;
  published_at: string | null;
}

function MediaNarrativeCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <Radio className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <span className="font-mono text-xs tracking-[0.15em] uppercase text-primary font-semibold">
          Media Narrative
        </span>
      </div>
      {children}
    </div>
  );
}

export function MediaNarrativeCard({ companyId, companyName }: MediaNarrativeCardProps) {
  const { data: newsItems, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ["media-narrative", companyId],
    queryFn: async () => {
      const { data, error: qError } = await supabase
        .from("company_news_signals")
        .select("headline, sentiment_score, tone_label, is_controversy, controversy_type, published_at")
        .eq("company_id", companyId)
        .order("published_at", { ascending: false })
        .limit(20);
      if (qError) throw qError;
      return (data || []) as NewsItem[];
    },
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000,
  });

  if (!companyId) return null;

  if (isPending) {
    return (
      <MediaNarrativeCardShell>
        <div className="p-5 space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-14 rounded-md" />
            <Skeleton className="h-14 rounded-md" />
            <Skeleton className="h-14 rounded-md" />
          </div>
        </div>
      </MediaNarrativeCardShell>
    );
  }

  if (isError) {
    return (
      <MediaNarrativeCardShell>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Could not load indexed news for {companyName}.{" "}
            {error instanceof Error ? error.message : "Try again later."}
          </p>
        </div>
      </MediaNarrativeCardShell>
    );
  }

  if (isSuccess && (!newsItems || newsItems.length === 0)) {
    return (
      <MediaNarrativeCardShell>
        <div className="p-4">
          <IntelligenceEmptyState category="media" state="after" />
        </div>
      </MediaNarrativeCardShell>
    );
  }

  const items = newsItems ?? [];
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  for (const s of items) {
    const b = gdeltToneBucket(s.sentiment_score);
    if (b === "positive") positive += 1;
    else if (b === "negative") negative += 1;
    else neutral += 1;
  }
  const total = items.length;

  const pctPos = total ? Math.round((positive / total) * 100) : 0;
  const pctNeu = total ? Math.round((neutral / total) * 100) : 0;
  const pctNeg = total ? Math.round((negative / total) * 100) : 0;

  const controversies = items.filter((s) => s.is_controversy).slice(0, 3);

  return (
    <MediaNarrativeCardShell>
      <div className="p-5">
        <div className="flex h-2 rounded-full overflow-hidden mb-4">
          {pctPos > 0 && <div className="bg-primary" style={{ width: `${pctPos}%` }} />}
          {pctNeu > 0 && <div className="bg-muted-foreground/30" style={{ width: `${pctNeu}%` }} />}
          {pctNeg > 0 && <div className="bg-destructive" style={{ width: `${pctNeg}%` }} />}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-foreground tabular-nums">{pctPos}%</div>
            <div className="font-mono text-xs uppercase text-muted-foreground">Positive</div>
          </div>
          <div className="text-center">
            <Minus className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-foreground tabular-nums">{pctNeu}%</div>
            <div className="font-mono text-xs uppercase text-muted-foreground">Neutral</div>
          </div>
          <div className="text-center">
            <TrendingDown className="w-3.5 h-3.5 text-destructive mx-auto mb-1" />
            <div className="font-mono text-lg font-bold text-foreground tabular-nums">{pctNeg}%</div>
            <div className="font-mono text-xs uppercase text-muted-foreground">Negative</div>
          </div>
        </div>

        {controversies.length > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            <div className="font-mono text-xs uppercase text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Recent Controversies
            </div>
            {controversies.map((c, i) => (
              <div
                key={`${c.published_at ?? ""}-${i}`}
                className="text-xs text-foreground border-l-2 border-destructive/50 pl-2.5 py-0.5"
              >
                {c.headline}
              </div>
            ))}
          </div>
        )}
      </div>
    </MediaNarrativeCardShell>
  );
}
