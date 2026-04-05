import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WorkNewsSourceMapEntry = {
  name: string;
  url: string | null;
  bias: string;
};

/** Parse `work_news.source_map_json` from Supabase (jsonb). */
export function parseWorkNewsSourceMap(raw: unknown): WorkNewsSourceMapEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkNewsSourceMapEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const bias = typeof o.bias === "string" ? o.bias.trim() : "";
    if (!name || !bias) continue;
    const url = typeof o.url === "string" && o.url.trim() ? o.url.trim() : null;
    out.push({ name, url, bias });
  }
  return out;
}

export interface WorkNewsArticle {
  id: string;
  headline: string;
  source_name: string | null;
  source_url: string | null;
  published_at: string | null;
  sentiment_score: number | null;
  tone_label: string | null;
  themes: string[];
  category: string;
  is_controversy: boolean;
  controversy_type: string | null;
  jackye_take: string | null;
  jackye_take_approved: boolean;
  created_at: string;
  source_bias_override: string | null;
  source_map_json: unknown | null;
  developing_label: string | null;
}

function normalizeHeadline(headline: string): string {
  return headline.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Stable key: same story from multiple ingestions shares URL or headline+outlet. */
export function workNewsDedupeKey(a: Pick<WorkNewsArticle, "source_url" | "headline" | "source_name">): string {
  const raw = a.source_url?.trim();
  if (raw) {
    try {
      const u = new URL(raw);
      u.hash = "";
      const href = u.href.replace(/\/$/, "");
      return `url:${href}`;
    } catch {
      return `url:${raw.toLowerCase()}`;
    }
  }
  return `h:${normalizeHeadline(a.headline)}|s:${(a.source_name || "").trim().toLowerCase()}`;
}

function hasTake(a: WorkNewsArticle): boolean {
  return !!(a.jackye_take && a.jackye_take.trim());
}

/** Prefer approved takes over drafts when deduping duplicate ingestions. */
function takeScore(a: WorkNewsArticle): number {
  if (!hasTake(a)) return 0;
  return a.jackye_take_approved ? 2 : 1;
}

function publishedMs(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function mergeWorkNewsPair(a: WorkNewsArticle, b: WorkNewsArticle): WorkNewsArticle {
  const sa = takeScore(a);
  const sb = takeScore(b);
  if (sa !== sb) return sa > sb ? a : b;
  const aTake = hasTake(a);
  const bTake = hasTake(b);
  if (aTake && !bTake) return a;
  if (bTake && !aTake) return b;
  const ta = publishedMs(a.published_at);
  const tb = publishedMs(b.published_at);
  if (ta !== tb) return ta >= tb ? a : b;
  return a.id.localeCompare(b.id) >= 0 ? a : b;
}

/** Merge duplicate ingestions; prefer Jackye's take, then newest `published_at`. */
export function dedupeWorkNewsArticles(articles: WorkNewsArticle[]): WorkNewsArticle[] {
  const map = new Map<string, WorkNewsArticle>();
  for (const row of articles) {
    const k = workNewsDedupeKey(row);
    const ex = map.get(k);
    map.set(k, ex ? mergeWorkNewsPair(ex, row) : row);
  }
  return Array.from(map.values()).sort((x, y) => publishedMs(y.published_at) - publishedMs(x.published_at));
}

export type UseWorkNewsOptions = {
  /** Default 2 min — newsletter / intel surfaces should feel current */
  staleTime?: number;
  /** Poll Supabase while the page is open (e.g. 3 min for /newsletter) */
  refetchInterval?: number | false;
};

export function useWorkNews(limit = 50, options?: UseWorkNewsOptions) {
  const staleTime = options?.staleTime !== undefined ? options.staleTime : 1000 * 60 * 2;
  const refetchInterval =
    options?.refetchInterval !== undefined ? options.refetchInterval : 1000 * 60 * 3;
  return useQuery({
    queryKey: ["work-news", limit],
    queryFn: async () => {
      const fetchCap = Math.min(Math.max(limit * 2, limit), 200);
      const { data, error } = await supabase
        .from("work_news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(fetchCap);
      if (error) throw error;
      const rows = (data as WorkNewsArticle[]) ?? [];
      return dedupeWorkNewsArticles(rows).slice(0, limit);
    },
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}

export function useWorkNewsCount() {
  return useQuery({
    queryKey: ["work-news-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("work_news")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useWorkNewsTicker() {
  return useQuery({
    queryKey: ["work-news-ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_news")
        .select("id, headline, source_name, source_url, category, is_controversy, published_at")
        .order("published_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      const rows =
        (data as Pick<
          WorkNewsArticle,
          "id" | "headline" | "source_name" | "source_url" | "category" | "is_controversy" | "published_at"
        >[]) ?? [];
      const seen = new Set<string>();
      const out: typeof rows = [];
      for (const r of rows) {
        const k = workNewsDedupeKey(r);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(r);
        if (out.length >= 20) break;
      }
      return out;
    },
    staleTime: 1000 * 60 * 10,
  });
}
