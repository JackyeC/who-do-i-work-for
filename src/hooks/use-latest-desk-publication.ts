import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DeskPublicationRow = {
  id: string;
  created_at: string;
  run_id: string | null;
  kind: string | null;
  generation_status: string | null;
  publish_status: string | null;
  published_to_site: boolean | null;
  site_markdown: string | null;
  newsletter_markdown: string | null;
  email_subject: string | null;
  email_preview_text: string | null;
  social_linkedin: string | null;
  social_bluesky: string | null;
  social_x: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  run_log?: unknown;
};

export type UseLatestDeskPublicationOptions = {
  staleTime?: number;
  refetchInterval?: number | false;
};

/**
 * Latest row that is live on /newsletter — uses RPC `wdiwf_latest_live_desk_publication()`
 * (same contract as RLS: success + bi_hourly + completed + published_to_site + markdown).
 */
export function useLatestDeskPublication(options?: UseLatestDeskPublicationOptions) {
  const staleTime = options?.staleTime !== undefined ? options.staleTime : 1000 * 60;
  const refetchInterval =
    options?.refetchInterval !== undefined ? options.refetchInterval : 1000 * 60 * 2;
  return useQuery({
    queryKey: ["desk-publication-latest"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("wdiwf_latest_live_desk_publication");
      if (error) throw error;
      const rows = data as DeskPublicationRow[] | null;
      const row = rows && rows.length > 0 ? rows[0] : null;
      return row;
    },
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}
