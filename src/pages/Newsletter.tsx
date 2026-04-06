import { useState, useEffect, useMemo } from "react";
import { isToday, isYesterday, differenceInCalendarDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePageSEO } from "@/hooks/use-page-seo";
import { useWorkNews, WorkNewsArticle, publishedMs } from "@/hooks/use-work-news";
import {
  useReceiptsPostersByWorkNewsIds,
  type PosterData,
} from "@/hooks/use-receipts-posters-by-work-news-ids";
import { SharePasticheCard } from "@/components/newsletter/SharePasticheCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTurnstile } from "@/hooks/useTurnstile";
import { verifyTurnstileToken } from "@/lib/verifyTurnstile";
import {
  Mail, ArrowRight, Check, ExternalLink, Newspaper,
  AlertTriangle, Flame, ChevronRight, Radio,
  Eye, TrendingUp, RefreshCw, ChevronDown, Sparkles, Rss,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NewsletterDeskPreview } from "@/components/newsletter/NewsletterDeskPreview";
import { FoundingMemberRecognition } from "@/components/dashboard/FoundingMemberRecognition";
import { SourceOrientationChip } from "@/components/newsletter/SourceOrientationChip";
import { WorkNewsSourceMap } from "@/components/newsletter/WorkNewsSourceMap";
import { parseWorkNewsSourceMap } from "@/hooks/use-work-news";

/* ── Category config ── */
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  regulation: { label: "REG", color: "bg-civic-blue/10 text-[hsl(var(--civic-blue))] border-[hsl(var(--civic-blue))]/30" },
  future_of_work: { label: "WORK", color: "bg-primary/10 text-primary border-primary/30" },
  worker_rights: { label: "RIGHTS", color: "bg-civic-green/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" },
  ai_workplace: { label: "AI", color: "bg-purple-500/10 text-purple-400 border-purple-400/30" },
  legislation: { label: "LAW", color: "bg-civic-blue/10 text-[hsl(var(--civic-blue))] border-[hsl(var(--civic-blue))]/30" },
  layoffs: { label: "LAYOFFS", color: "bg-destructive/10 text-destructive border-destructive/30" },
  pay_equity: { label: "PAY", color: "bg-civic-yellow/10 text-[hsl(var(--civic-yellow))] border-[hsl(var(--civic-yellow))]/30" },
  labor_organizing: { label: "LABOR", color: "bg-civic-green/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" },
  dei: { label: "DEI", color: "bg-primary/10 text-primary border-primary/30" },
  workplace: { label: "WORK", color: "bg-primary/10 text-primary border-primary/30" },
  policy: { label: "POLICY", color: "bg-civic-blue/10 text-[hsl(var(--civic-blue))] border-[hsl(var(--civic-blue))]/30" },
  general: { label: "NEWS", color: "bg-muted text-muted-foreground border-border/50" },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.general;
}

/* ── Time helpers ── */
function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatEditionTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function wireDateBucketLabel(iso: string | null): string {
  if (!iso) return "Earlier";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "Earlier";
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  const days = differenceInCalendarDays(startOfDay(new Date()), startOfDay(d));
  if (days >= 0 && days < 7) return "This week";
  return "Earlier";
}

const TAKES_PER_PAGE = 12;
const WIRE_PER_PAGE = 15;

type SortMode = "newest" | "drama" | "spiciest";

/* ── Spice meter based on controversy + sentiment ── */
function spiceLevel(article: WorkNewsArticle): number {
  let score = 1;
  if (article.is_controversy) score += 2;
  if (article.sentiment_score !== null && article.sentiment_score < -0.3) score += 1;
  if (article.controversy_type) score += 1;
  return Math.min(score, 5);
}

function SpiceMeter({ level }: { level: number }) {
  const tip = `Coverage intensity from ingest signals (controversy, tone) — ${level}/5, not a mood score`;
  return (
    <span className="inline-flex flex-col gap-0.5" title={tip}>
      <span className="inline-flex items-center gap-px" aria-label={`Coverage intensity ${level} of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-[11px] leading-none select-none ${i < level ? "opacity-100" : "opacity-20 grayscale"}`}
            aria-hidden
          >
            🌶️
          </span>
        ))}
      </span>
      <span className="inline-flex gap-px" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-0.5 w-2.5 rounded-full ${i < level ? "bg-primary/75" : "bg-muted-foreground/15"}`}
          />
        ))}
      </span>
    </span>
  );
}

/* ── Single story card ── */
function StoryCard({ article, poster }: { article: WorkNewsArticle; poster?: PosterData | null }) {
  const cat = getCategoryConfig(article.category);
  const spice = spiceLevel(article);
  const sourceMapEntries = parseWorkNewsSourceMap(article.source_map_json);

  return (
    <Card className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 rounded-2xl overflow-hidden group">
      <CardContent className="p-0">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-[10px] font-mono tracking-wider border ${cat.color}`}
            >
              {cat.label}
            </Badge>
            {article.developing_label?.trim() && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono tracking-wider border-amber-500/40 text-amber-600 dark:text-amber-400"
              >
                {article.developing_label.trim()}
              </Badge>
            )}
            {article.is_controversy && (
              <AlertTriangle className="w-3.5 h-3.5 text-destructive animate-pulse" />
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {timeAgo(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <div className="px-5 pb-3 space-y-2">
          <h3 className="text-[15px] font-semibold text-foreground leading-snug">
            {article.headline}
          </h3>
          {sourceMapEntries.length > 0 && (
            <WorkNewsSourceMap entries={sourceMapEntries} className="mx-0" />
          )}
        </div>

        {/* The Take — ALWAYS OPEN */}
        {article.jackye_take && (
          <div className="mx-4 mb-3 rounded-xl bg-primary/[0.06] border border-primary/15 border-l-4 border-l-primary pl-4 pr-4 py-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Eye className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold text-primary tracking-wide uppercase">
                Jackye&apos;s take
              </span>
              {!article.jackye_take_approved && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono tracking-wider border-muted-foreground/40 text-muted-foreground"
                >
                  Pending desk review
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {article.jackye_take}
            </p>
            {poster && (
              <div className="mt-4 pt-4 border-t border-primary/15">
                <SharePasticheCard headline={article.headline} sourceUrl={article.source_url} poster={poster} />
              </div>
            )}
          </div>
        )}

        {/* Summary teaser line */}
        {article.themes && article.themes.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {article.themes.map((theme) => (
              <span
                key={theme}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground font-mono"
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Footer: source + orientation + spice + link */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-t border-border/30 bg-muted/30">
          <div className="flex flex-col gap-1.5 min-w-0">
            {article.source_name && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-medium text-foreground">{article.source_name}</span>
                <SourceOrientationChip
                  sourceName={article.source_name}
                  biasOverride={article.source_bias_override}
                  variant="default"
                />
              </div>
            )}
            {!article.source_name && (
              <SourceOrientationChip
                sourceName={null}
                biasOverride={article.source_bias_override}
                variant="default"
              />
            )}
            <SpiceMeter level={spice} />
          </div>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-primary/70 hover:text-primary transition-colors"
            >
              Read Source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Filter bar ── */
const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "developing", label: "Developing" },
  { value: "layoffs", label: "Layoffs" },
  { value: "dei", label: "DEI" },
  { value: "ai_workplace", label: "AI" },
  { value: "regulation", label: "Regulation" },
  { value: "pay_equity", label: "Pay" },
  { value: "controversy", label: "Controversy" },
];

/* ── Main page ── */
export default function Newsletter() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [takePageCount, setTakePageCount] = useState(1);
  const [wirePageCount, setWirePageCount] = useState(1);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [howLabelsOpen, setHowLabelsOpen] = useState(false);
  const { containerRef, getToken, resetToken } = useTurnstile();
  const { data: articles = [], isLoading, isFetching } = useWorkNews(60, {
    staleTime: 45_000,
    refetchInterval: 90_000,
  });

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#source-orientation") setHowLabelsOpen(true);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    setTakePageCount(1);
    setWirePageCount(1);
  }, [filter, sortMode]);

  const refreshFeed = async () => {
    setFeedRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["work-news"] }),
        queryClient.invalidateQueries({ queryKey: ["desk-publication-latest"] }),
        queryClient.invalidateQueries({ queryKey: ["receipts-enriched-posters"] }),
      ]);
    } finally {
      setFeedRefreshing(false);
    }
  };

  usePageSEO({
    title: "Newsletter & Daily Desk | Signal Check™, Substack, Social | Who Do I Work For",
    description:
      "Radically inclusive work & labor desk: receipts and sources first, outlet orientation on every wire item, and Jackye's read only after the facts — grounded in what you value at work.",
    path: "/newsletter",
    jsonLd: {
      "@type": "WebPage",
      name: "Newsletter & Daily Desk — Who Do I Work For",
      description:
        "Inclusive work and labor desk: Signal Check brief, Substack and social distribution, live wire with source receipts and outlet orientation, labeled analysis after the facts.",
      url: "https://wdiwf.jackyeclayton.com/newsletter",
      author: { "@type": "Person", name: "Jackye Clayton" },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email.");
      setStatus("error");
      return;
    }
    setStatus("loading");

    const token = await getToken();
    if (!token) {
      setErrorMsg("Bot verification failed. Please try again.");
      setStatus("error");
      resetToken();
      return;
    }

    const verified = await verifyTurnstileToken(token);
    if (!verified) {
      setErrorMsg("Verification failed. Please try again.");
      setStatus("error");
      resetToken();
      return;
    }

    const { error } = await supabase
      .from("email_signups")
      .insert({ email: trimmed, source: "newsletter_page" } as any);
    if (error) {
      if (error.code === "23505") setStatus("success");
      else {
        setErrorMsg("Something went wrong. Try again.");
        setStatus("error");
      }
    } else {
      setStatus("success");
    }
    resetToken();
  };

  /* ── Filter + sort (client-side on fetched list) ── */
  const filtered = useMemo(() => {
    let list = articles;
    if (filter === "developing") list = list.filter((a) => a.developing_label?.trim());
    else if (filter === "controversy") list = list.filter((a) => a.is_controversy);
    else if (filter !== "all") list = list.filter((a) => a.category === filter);
    return list;
  }, [articles, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortMode === "drama") {
      copy.sort((a, b) => {
        if (a.is_controversy !== b.is_controversy) return a.is_controversy ? -1 : 1;
        const sa = a.sentiment_score ?? 0;
        const sb = b.sentiment_score ?? 0;
        if (sa !== sb) return sa - sb;
        return publishedMs(b.published_at) - publishedMs(a.published_at);
      });
    } else if (sortMode === "spiciest") {
      copy.sort((a, b) => {
        const d = spiceLevel(b) - spiceLevel(a);
        if (d !== 0) return d;
        return publishedMs(b.published_at) - publishedMs(a.published_at);
      });
    } else {
      copy.sort((a, b) => publishedMs(b.published_at) - publishedMs(a.published_at));
    }
    return copy;
  }, [filtered, sortMode]);

  const withTakes = useMemo(() => sorted.filter((a) => a.jackye_take), [sorted]);
  const withoutTakes = useMemo(() => sorted.filter((a) => !a.jackye_take), [sorted]);

  const visibleTakes = useMemo(
    () => withTakes.slice(0, takePageCount * TAKES_PER_PAGE),
    [withTakes, takePageCount],
  );
  const visibleWire = useMemo(
    () => withoutTakes.slice(0, wirePageCount * WIRE_PER_PAGE),
    [withoutTakes, wirePageCount],
  );

  const takePosterIds = useMemo(() => visibleTakes.map((a) => a.id), [visibleTakes]);
  const { data: posterByNewsId } = useReceiptsPostersByWorkNewsIds(takePosterIds);

  const latestEditionIso = sorted[0]?.published_at ?? null;
  const takesExhausted = visibleTakes.length >= withTakes.length;
  const wireExhausted = visibleWire.length >= withoutTakes.length;

  const wireRows = useMemo(() => {
    if (sortMode !== "newest") {
      return visibleWire.map((article) => ({ type: "card" as const, article }));
    }
    const out: Array<{ type: "head"; label: string } | { type: "card"; article: WorkNewsArticle }> = [];
    let last = "";
    for (const article of visibleWire) {
      const label = wireDateBucketLabel(article.published_at);
      if (label !== last) {
        out.push({ type: "head", label });
        last = label;
      }
      out.push({ type: "card", article });
    }
    return out;
  }, [visibleWire, sortMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero + subscribe ── */}
      <section
        id="newsletter-top"
        className="relative border-b border-border/40 overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <Radio className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
                <span className="text-xs font-mono tracking-wider text-primary uppercase">
                  Receipts · desk · wire
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground uppercase mb-3">
                Vol. I · Work & labor
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-foreground tracking-tight mb-4 font-serif">
                The Daily Grind
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 mb-6">
                Work and labor intelligence for{" "}
                <span className="text-foreground font-medium">every kind of worker</span>. Sources and outlet orientation
                on the wire; Signal Check™ on the desk; Jackye&apos;s read when it&apos;s labeled — never faceless wire
                copy.
              </p>
              <ul className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Rss className="w-3.5 h-3.5" />
                  </span>
                  <span>Linked sources on every story</span>
                </li>
                <li className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span>Desk + email + social, same shape</span>
                </li>
              </ul>
            </div>

            <div className="max-w-md mx-auto w-full lg:max-w-none lg:mx-0">
              <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">Join the list</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Free. One email a week. The desk shows its work.
                  </p>
                  {status === "success" ? (
                    <div className="flex items-center gap-2.5 text-primary font-semibold text-sm py-2">
                      <Check className="w-5 h-5 shrink-0" />
                      <span>You&apos;re in. First drop lands Monday.</span>
                    </div>
                  ) : (
                    <form id="newsletter-subscribe" onSubmit={handleSubmit} className="space-y-3">
                      <div ref={containerRef} />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border-2 border-border/60 bg-background px-3 py-1 focus-within:border-primary/50 transition-colors">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setStatus("idle");
                            }}
                            placeholder="you@company.com"
                            className="flex-1 min-w-0 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                            disabled={status === "loading"}
                            autoComplete="email"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={status === "loading"}
                          className="rounded-xl font-semibold shrink-0 sm:px-6"
                        >
                          {status === "loading" ? (
                            "…"
                          ) : (
                            <>
                              Subscribe <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </>
                          )}
                        </Button>
                      </div>
                      {status === "error" && (
                        <p className="text-destructive text-xs font-mono">{errorMsg}</p>
                      )}
                    </form>
                  )}
                  <FoundingMemberRecognition className="mt-6 pt-5 border-t border-border/40" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Jump nav ── */}
      <nav
        className="sticky top-[4.5rem] z-40 border-b border-border/40 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
        aria-label="Newsletter sections"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(
            [
              ["#newsletter-desk", "Today's desk"],
              ["/integrity-report", "Forensic report"],
              ["#newsletter-wire", "Live wire"],
              ["#source-orientation", "How labels work"],
              ["#newsletter-subscribe", "Subscribe"],
            ] as const
          ).map(([href, label]) =>
            href.startsWith("/") ? (
              <Link
                key={href}
                to={href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {label}
              </Link>
            ) : (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {label}
              </a>
            ),
          )}
        </div>
      </nav>

      {/* ── Desk ── */}
      <section id="newsletter-desk" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-24">
        <p className="text-center text-sm text-muted-foreground border-y border-border/35 py-3 mb-8 max-w-[65ch] mx-auto leading-relaxed font-serif">
          <span className="text-foreground font-medium not-italic">Editor&apos;s note</span> — We show sources and
          labels so you can decide. This desk is human-curated, not a bot.{" "}
          <span className="not-italic font-mono text-[10px] tracking-wide text-muted-foreground/90">— The desk</span>
        </p>
        <div className="mb-6 max-w-[65ch]">
          <h2 className="text-2xl font-bold text-foreground tracking-tight font-serif">
            Today&apos;s Signal Check™ desk
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Flagship brief with sources and coverage map — same layout we ship to email and social. Updates when a new
            edition is published.
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            <Link
              to="/integrity-report"
              className="text-primary font-medium underline underline-offset-2 hover:no-underline"
            >
              Forensic integrity report
            </Link>{" "}
            — long-form ledger editions (labor, procurement, preemption) live here so they do not replace the bi-hourly
            desk.
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/40 p-3 sm:p-5 shadow-sm">
          <div className="max-w-[65ch] mx-auto">
            <NewsletterDeskPreview />
          </div>
        </div>
      </section>

      {/* ── Wire toolbar + feed ── */}
      <section id="newsletter-wire" className="max-w-6xl mx-auto px-4 pb-6 scroll-mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight font-serif">Live wire</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Rolling ingest of work and labor headlines. Each card shows the outlet and a desk orientation label. Full
              multi-source maps live on the desk above.
            </p>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-3">
              The Wire · {sorted.length} stor{sorted.length === 1 ? "y" : "ies"} · Edition{" "}
              {formatEditionTime(latestEditionIso)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {sorted.length} in view
              {isFetching && !isLoading ? " · sync…" : ""}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-xl"
              disabled={feedRefreshing || isLoading}
              onClick={() => void refreshFeed()}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${feedRefreshing ? "animate-spin" : ""}`} />
              Refresh feed
            </Button>
          </div>
        </div>

        <div id="source-orientation" className="scroll-mt-28 mb-6">
          <Collapsible open={howLabelsOpen} onOpenChange={setHowLabelsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/35 transition-colors">
              <span>How outlet labels work</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  howLabelsOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-xl border border-border/40 bg-muted/15 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Radical transparency, radically inclusive.</strong> We show how
                outlets tend to frame work and labor — same label whether you&apos;re HR, union, job hunting, or
                leadership. That is orientation and receipts, not a verdict on a reporter. Factuality is a general tier
                for the outlet; Unknown means not mapped yet. The desk can override a row when needed.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="mb-5 max-w-xs">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Sort wire</p>
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="h-9 rounded-xl" aria-label="Sort wire stories">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="drama">Drama first</SelectItem>
              <SelectItem value="spiciest">Spiciest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Filter</p>
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide border transition-all ${
                filter === opt.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border/50 hover:border-primary/35"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Feed ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">Loading intelligence...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No stories in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Stories with Jackye's Take — shown first as featured */}
            {withTakes.length > 0 && (
              <div className="mb-12">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Flame className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground tracking-tight font-serif">
                        With Jackye&apos;s read
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Showing {visibleTakes.length} of {withTakes.length} · facts first, then labeled analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-5">
                  {visibleTakes.map((article) => (
                    <StoryCard
                      key={article.id}
                      article={article}
                      poster={posterByNewsId?.get(article.id)}
                    />
                  ))}
                </div>
                {!takesExhausted && (
                  <div className="flex justify-center mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setTakePageCount((c) => c + 1)}
                    >
                      Load more takes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* All other stories — summary teasers */}
            {withoutTakes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted border border-border/50 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground tracking-tight font-serif">Headlines only</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      Showing {visibleWire.length} of {withoutTakes.length} · wire index
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wireRows.map((row, idx) => {
                    if (row.type === "head") {
                      return (
                        <div key={`wire-head-${row.label}-${idx}`} className="col-span-full pt-1 first:pt-0">
                          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground border-b border-border/35 pb-1.5">
                            {row.label}
                          </h3>
                        </div>
                      );
                    }
                    const article = row.article;
                    const cat = getCategoryConfig(article.category);
                    const wireMap = parseWorkNewsSourceMap(article.source_map_json);
                    const primaryUrl = article.source_url || "#";
                    return (
                      <div
                        key={article.id}
                        className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 h-full flex flex-col"
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono tracking-wider border ${cat.color}`}
                          >
                            {cat.label}
                          </Badge>
                          {article.developing_label?.trim() && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono tracking-wider border-amber-500/40 text-amber-600 dark:text-amber-400"
                            >
                              {article.developing_label.trim()}
                            </Badge>
                          )}
                          {article.is_controversy && (
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                          )}
                          <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">
                            {timeAgo(article.published_at)}
                          </span>
                        </div>
                        {primaryUrl !== "#" ? (
                          <a
                            href={primaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground leading-snug flex-1 hover:text-primary transition-colors"
                          >
                            {article.headline}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground leading-snug flex-1">
                            {article.headline}
                          </p>
                        )}
                        {wireMap.length > 0 && (
                          <WorkNewsSourceMap entries={wireMap} className="mt-3 border-border/25" />
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-border/20">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="text-[10px] text-muted-foreground truncate max-w-[10rem]">
                              {article.source_name || "Source"}
                            </span>
                            <SourceOrientationChip
                              sourceName={article.source_name}
                              biasOverride={article.source_bias_override}
                              variant="compact"
                            />
                          </div>
                          <SpiceMeter level={spiceLevel(article)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!wireExhausted && (
                  <div className="flex justify-center mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setWirePageCount((c) => c + 1)}
                    >
                      Load more headlines
                    </Button>
                  </div>
                )}
              </div>
            )}

            {sorted.length > 0 && takesExhausted && wireExhausted && (
              <p className="text-center text-xs text-muted-foreground font-mono mt-14 border-t border-border/30 pt-8">
                You&apos;re caught up — refresh for new pulls.
              </p>
            )}
          </>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-6 py-10 sm:px-10 text-center">
          <p className="text-muted-foreground text-sm mb-6 max-w-xl mx-auto leading-relaxed">
            <strong className="text-foreground font-medium">Receipts, not vibes.</strong> Inclusive by design — if it
            affects how you earn a living, it belongs here. Opinions show up only after the facts, labeled, and aimed
            at what this community values: clarity, dignity at work, and knowing who benefits from the story you&apos;re
            being sold.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => document.getElementById("newsletter-subscribe")?.scrollIntoView({ behavior: "smooth" })}
              variant="default"
              size="sm"
              className="rounded-xl"
            >
              <Mail className="w-4 h-4 mr-2" /> Subscribe
            </Button>
            <Link to="/receipts">
              <Button variant="outline" size="sm" className="rounded-xl">
                All receipts <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
