import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DeskPublicationRow = {
  id: string;
  created_at: string;
  run_id: string | null;
  kind: string;
  generation_status: string;
  site_markdown: string | null;
  newsletter_markdown: string | null;
  email_subject: string | null;
  email_preview_text: string | null;
  social_linkedin: string | null;
  social_bluesky: string | null;
  social_x: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
};

/** Latest row visible under RLS: bi-hourly, completed, published_to_site, with site_markdown. */
export function useLatestDeskPublication() {
  return useQuery({
    queryKey: ["desk-publication-latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wdiwf_desk_publications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as DeskPublicationRow | null;
    },
    staleTime: 1000 * 60 * 2,
  });
}
