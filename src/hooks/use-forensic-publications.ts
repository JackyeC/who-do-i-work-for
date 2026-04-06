import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DeskPublicationRow } from "@/hooks/use-latest-desk-publication";

export type UseForensicPublicationsOptions = {
  limit?: number;
  staleTime?: number;
  refetchInterval?: number | false;
};

/**
 * Recent forensic integrity reports (newest first) — RPC `wdiwf_forensic_publications_recent`.
 * Same row shape as desk publications; kind is always `forensic` for returned rows.
 */
export function useForensicPublications(options?: UseForensicPublicationsOptions) {
  const limit = options?.limit !== undefined ? options.limit : 20;
  const staleTime = options?.staleTime !== undefined ? options.staleTime : 1000 * 60 * 2;
  const refetchInterval =
    options?.refetchInterval !== undefined ? options.refetchInterval : 1000 * 60 * 5;

  return useQuery({
    queryKey: ["forensic-publications-recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("wdiwf_forensic_publications_recent", {
        p_limit: limit,
      });
      if (error) throw error;
      return (data ?? []) as DeskPublicationRow[];
    },
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}
