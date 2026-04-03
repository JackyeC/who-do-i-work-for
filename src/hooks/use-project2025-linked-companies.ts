import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns company IDs that have at least one row in project2025_company_links.
 */
export function useProject2025LinkedCompanyIds(companyIds: string[]) {
  const key = [...new Set(companyIds)].filter(Boolean).sort().join(",");

  return useQuery({
    queryKey: ["project2025-linked-company-ids", key],
    queryFn: async (): Promise<Set<string>> => {
      const unique = [...new Set(companyIds.filter(Boolean))];
      if (unique.length === 0) return new Set();

      const { data, error } = await supabase
        .from("project2025_company_links")
        .select("company_id")
        .in("company_id", unique);

      if (error) throw error;
      return new Set((data || []).map((r) => r.company_id as string));
    },
    enabled: companyIds.filter(Boolean).length > 0,
    staleTime: 120_000,
  });
}
