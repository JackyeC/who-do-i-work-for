import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio, ArrowRight, Share2, Copy, Building2, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PULSE_DAYS = 14;
const MAX_ITEMS = 15;

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function whenLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 86_400_000) return "Today";
  if (diff < 172_800_000) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface PulseProps {
  onNavigate: (tab: string) => void;
}

export function WatchlistSignalsPulse({ onNavigate }: PulseProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["watchlist-signals-pulse", user?.id],
    queryFn: async () => {
      const [trackedRes, watchRes] = await Promise.all([
        (supabase as any)
          .from("tracked_companies")
          .select("company_id")
          .eq("user_id", user!.id)
          .eq("is_active", true),
        supabase.from("user_company_watchlist").select("company_id").eq("user_id", user!.id),
      ]);

      const ids = [
        ...new Set([
          ...((trackedRes.data || []) as { company_id: string }[]).map((r) => r.company_id),
          ...((watchRes.data || []) as { company_id: string }[]).map((r) => r.company_id),
        ]),
      ].filter(Boolean);

      if (ids.length === 0) {
        return { items: [] as any[], idSet: new Set<string>(), slugById: new Map<string, string>() };
      }

      const since = new Date();
      since.setDate(since.getDate() - PULSE_DAYS);

      const { data: signals, error: sigErr } = await (supabase as any)
        .from("issue_signals")
        .select(
          "id, entity_id, entity_name_snapshot, issue_category, signal_type, description, amount, created_at, source_url"
        )
        .in("entity_id", ids)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(MAX_ITEMS);

      if (sigErr) console.warn("watchlist pulse issue_signals:", sigErr);

      const { data: companies } = await supabase
        .from("companies")
        .select("id, slug, name")
        .in("id", ids);

      const slugById = new Map((companies || []).map((c: any) => [c.id as string, c.slug as string]));

      return {
        items: (signals || []) as any[],
        idSet: new Set(ids),
        slugById,
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const slugById = data?.slugById ?? new Map<string, string>();
  const hasWatchlist = (data?.idSet.size ?? 0) > 0;

  const shareText = useMemo(() => {
    if (!items.length) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const lines = items.slice(0, 5).map((row: any) => {
      const name = row.entity_name_snapshot || "Employer";
      const bit = row.description ? row.description.replace(/\s+/g, " ").slice(0, 120) : row.issue_category;
      return `• ${name}: ${bit}${row.description && row.description.length > 120 ? "…" : ""}`;
    });
    return `Watchlist update (public filings, last ${PULSE_DAYS}d):\n${lines.join("\n")}\n\n${origin}/dashboard`;
  }, [items]);

  const handleShare = async () => {
    if (!shareText) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Watchlist receipts", text: shareText });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied digest", description: "Paste anywhere to share your watchlist snapshot." });
    }
  };

  const handleCopy = async () => {
    if (!shareText) return;
    await navigator.clipboard.writeText(shareText);
    toast({ title: "Copied", description: "Watchlist digest copied to clipboard." });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="mb-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 animate-pulse">
        <div className="h-5 w-48 bg-muted rounded mb-3" />
        <div className="h-16 bg-muted/50 rounded" />
      </div>
    );
  }

  if (!hasWatchlist) {
    return (
      <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.12] via-card to-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
            <Radio className="w-5 h-5 text-primary" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground tracking-tight">Your watchlist pulse</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Track employers to get a running feed of <strong className="text-foreground/90">new filing-backed rows</strong> (lobbying, PACs, issues) here first—personal, factual, built for sharing.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={() => onNavigate("tracked")} className="gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Add to watchlist
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/search">Search employers</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.12] via-card to-card p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 shrink-0">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground tracking-tight">New on your watchlist</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {PULSE_DAYS} days · issue signals from public data · no score, no verdict
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button type="button" size="sm" variant="secondary" className="gap-1.5" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" /> Share snapshot
            </Button>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5" /> Copy text
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No new issue rows in the last {PULSE_DAYS} days for tracked employers.{" "}
          <button type="button" onClick={() => onNavigate("tracked")} className="text-primary font-medium hover:underline">
            Add more companies
          </button>{" "}
          or check{" "}
          <Link to="/intelligence" className="text-primary font-medium hover:underline">
            the full evidence feed
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((row: any) => {
            const slug = slugById.get(row.entity_id);
            const profileUrl = slug
              ? `/dossier/${slug}`
              : `/search?q=${encodeURIComponent(row.entity_name_snapshot || "company")}`;
            const cat = (row.issue_category || "signal").replace(/_/g, " ");
            return (
              <li key={row.id}>
                <Link
                  to={profileUrl}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 rounded-xl border border-border/40 bg-card/80 hover:bg-muted/30 hover:border-primary/25 transition-colors px-3 py-2.5 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {row.entity_name_snapshot || "Employer"}
                      </span>
                      <Badge variant="outline" className="text-[0.65rem] capitalize">
                        {cat}
                      </Badge>
                      {row.amount != null && Number(row.amount) > 0 && (
                        <span className="text-xs font-mono text-foreground/90">{formatMoney(Number(row.amount))}</span>
                      )}
                      <span className="text-[0.65rem] font-mono text-muted-foreground">{whenLabel(row.created_at)}</span>
                    </div>
                    {row.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{row.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {row.source_url && /^https?:\/\//i.test(row.source_url) && (
                      <a
                        href={row.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary inline-flex items-center gap-0.5 hover:underline"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="text-xs text-primary font-medium inline-flex items-center gap-0.5">
                      Profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/30">
        <button
          type="button"
          onClick={() => onNavigate("tracked")}
          className="text-xs font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
        >
          Manage watchlist <ArrowRight className="w-3 h-3" />
        </button>
        <Link to="/intelligence" className="text-xs font-medium text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          All evidence receipts <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
