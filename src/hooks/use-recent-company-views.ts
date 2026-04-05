import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const RECENT_COMPANY_VIEWS_QUERY_KEY = "recent-company-views" as const;

export type RecentCompanyViewRow = {
  id: string;
  viewed_at: string;
  company: {
    name: string;
    slug: string;
    industry: string | null;
    employer_clarity_score: number | null;
    civic_footprint_score: number | null;
  } | null;
};

export function useRecentCompanyViews(limit = 8) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [RECENT_COMPANY_VIEWS_QUERY_KEY, user?.id, limit],
    queryFn: async (): Promise<RecentCompanyViewRow[]> => {
      const { data, error } = await supabase
        .from("user_recent_company_views")
        .select(
          "id, viewed_at, company:companies (name, slug, industry, employer_clarity_score, civic_footprint_score)"
        )
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(limit);
      if (error) {
        if (import.meta.env.DEV) console.warn("[useRecentCompanyViews]", error.message);
        return [];
      }
      return (data || []) as RecentCompanyViewRow[];
    },
    enabled: !!user,
    staleTime: 15_000,
  });
}
