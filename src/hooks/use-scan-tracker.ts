import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RECENT_COMPANY_VIEWS_QUERY_KEY } from "@/hooks/use-recent-company-views";

/**
 * Records a signed-in user's employer view for dashboard "Recent Work".
 * (Legacy company_scan_events inserts are admin-only after RLS hardening — they never stuck for normal users.)
 */
export function useScanTracker(companyId: string | undefined, companyName: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId || !companyName || !user) return;

    const sessionKey = `employer_view_logged_${companyId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    void (async () => {
      const { error } = await supabase.from("user_recent_company_views").upsert(
        {
          user_id: user.id,
          company_id: companyId,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,company_id" }
      );
      if (error) {
        if (import.meta.env.DEV) console.warn("[useScanTracker]", error.message);
        return;
      }
      sessionStorage.setItem(sessionKey, "1");
      queryClient.invalidateQueries({ queryKey: [RECENT_COMPANY_VIEWS_QUERY_KEY, user.id] });
    })();
  }, [companyId, companyName, user, queryClient]);
}
