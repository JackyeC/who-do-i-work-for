import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";

export function LiveIntelligenceTicker() {
  const { data: updates } = useQuery({
    queryKey: ["homepage-live-ticker"],
    queryFn: async () => {
      // Get recent company updates from various signal tables
      const [companyRes, signalRes] = await Promise.all([
        supabase
          .from("companies")
          .select("name, updated_at, record_status")
          .in("record_status", ["verified", "active"])
          .order("updated_at", { ascending: false })
          .limit(12),
        (supabase as any)
          .from("institutional_alignment_signals")
          .select("institution_name, person_name, company_id, companies!inner(name)")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const items: string[] = [];

      // Company updates
      (companyRes.data || []).slice(0, 6).forEach((c: any) => {
        items.push(`${c.name}: Intelligence Updated`);
      });

      // Institutional signals
      (signalRes.data || []).forEach((s: any) => {
        const companyName = s.companies?.name || "Unknown";
        items.push(`${companyName}: New Institutional Link Found — ${s.institution_name}`);
      });

      // Fallbacks
      if (items.length < 4) {
        items.push("PLATFORM: Live intelligence scanning active");
        items.push("METHODOLOGY: All signals sourced from public filings");
        items.push("2026 EDGE: Heritage vs. Progressive alignment now live");
      }

      return items;
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });

  const tickerItems = updates || [
    "PLATFORM: Live intelligence scanning active",
    "METHODOLOGY: All signals sourced from public filings",
  ];

  return (
    <div className="bg-background overflow-hidden whitespace-nowrap h-[36px] flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2 px-3 shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <Radio className="w-3 h-3 animate-pulse text-primary" />
        <span className="font-sans text-eyebrow">LIVE</span>
      </div>
      <div className="inline-block animate-ticker">
        {tickerItems.map((t, i) => (
          <span key={i} className="px-8">
            <span className="font-sans text-ticker">{t}</span>
            <span className="px-4" style={{ color: 'hsl(43 85% 59% / 0.5)' }}>·</span>
          </span>
        ))}
        {tickerItems.slice(0, 3).map((t, i) => (
          <span key={`dup-${i}`} className="px-8">
            <span className="font-sans text-ticker">{t}</span>
            <span className="px-4" style={{ color: 'hsl(43 85% 59% / 0.5)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
