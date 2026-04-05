import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

function publishedMs(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function mergeWorkNewsPair(a: WorkNewsArticle, b: WorkNewsArticle): WorkNewsArticle {
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

export function useWorkNews(limit = 50) {
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
    staleTime: 1000 * 60 * 15, // 15 min
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
