import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Fetches intelligence about the user's auto-detected employer.
 * Powered by the company_domains table + profiles.employer_company_id.
 */
export function useEmployerIntelligence() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["employer-intelligence", user?.id],
    queryFn: async () => {
      // 1. Get the user's profile with employer link
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("employer_company_id, email_domain, full_name")
        .eq("id", user!.id)
        .maybeSingle();

      if (!profile?.employer_company_id) {
        return { detected: false, company: null, signals: [], alerts: [] };
      }

      // 2. Fetch employer company details + recent signals in parallel
      const [companyRes, signalsRes, alertsRes] = await Promise.all([
        // Company basics
        (supabase as any)
          .from("companies")
          .select("id, name, slug, industry, civic_footprint_score, insider_score, website_url, hq_location, employee_count_range, updated_at")
          .eq("id", profile.employer_company_id)
          .maybeSingle(),
        // Recent signals/briefing items for this company
        (supabase as any)
          .from("briefing_items")
          .select("id, company, signal_type, headline, detail, source_name, source_url, published_at")
          .ilike("company", `%${profile.employer_company_id}%`)
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(5),
        // User alerts specifically about their employer
        (supabase as any)
          .from("user_alerts")
          .select("id, change_description, change_type, signal_category, date_detected")
          .eq("user_id", user!.id)
          .eq("company_id", profile.employer_company_id)
          .order("date_detected", { ascending: false })
          .limit(5),
      ]);

      return {
        detected: true,
        company: companyRes.data,
        signals: signalsRes.data || [],
        alerts: alertsRes.data || [],
        emailDomain: profile.email_domain,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
