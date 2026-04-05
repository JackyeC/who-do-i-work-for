import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Matches `poster_data` from jackyefy-news / `receipts_enriched`. */
export type PosterData = {
  bg: string;
  accent: string;
  dark: string;
  emoji: string;
  bigTxt: string;
  sub: string;
  tag: string;
  copy: string;
  fine: string;
};

function isPosterData(v: unknown): v is PosterData {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.bg === "string" &&
    typeof o.accent === "string" &&
    typeof o.dark === "string" &&
    typeof o.emoji === "string" &&
    typeof o.bigTxt === "string" &&
    typeof o.sub === "string" &&
    typeof o.tag === "string" &&
    typeof o.copy === "string" &&
    typeof o.fine === "string"
  );
}

/** Latest `poster_data` per `work_news_id` (by `created_at` desc). */
export function useReceiptsPostersByWorkNewsIds(ids: string[]) {
  const sortedKey = [...ids].sort().join(",");
  return useQuery({
    queryKey: ["receipts-enriched-posters", sortedKey],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts_enriched")
        .select("work_news_id, poster_data, created_at")
        .in("work_news_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map = new Map<string, PosterData>();
      for (const row of data ?? []) {
        const wid = row.work_news_id as string;
        if (map.has(wid)) continue;
        if (isPosterData(row.poster_data)) map.set(wid, row.poster_data);
      }
      return map;
    },
    staleTime: 60_000,
  });
}
