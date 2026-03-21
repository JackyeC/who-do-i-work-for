import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";
import { Link } from "react-router-dom";

interface TickerEntry {
  label: string;
  message: string;
  slug: string | null;
}

export function LiveIntelligenceTicker() {
  const { data: updates } = useQuery({
    queryKey: ["homepage-live-ticker"],
    queryFn: async () => {
      // Get recent company updates from various signal tables
      const [companyRes, signalRes] = await Promise.all([
        supabase
          .from("companies")
          .select("name, slug, updated_at, record_status")
          .in("record_status", ["verified", "active"])
          .order("updated_at", { ascending: false })
          .limit(12),
        (supabase as any)
          .from("institutional_alignment_signals")
          .select("institution_name, person_name, company_id, companies!inner(name, slug)")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      const items: TickerEntry[] = [];

      // Company updates
      (companyRes.data || []).slice(0, 6).forEach((c: any) => {
        items.push({ label: c.name, message: "Intelligence Updated", slug: c.slug || null });
      });

      // Institutional signals
      (signalRes.data || []).forEach((s: any) => {
        const companyName = s.companies?.name || "Unknown";
        const companySlug = s.companies?.slug || null;
        items.push({ label: companyName, message: `New Institutional Link Found — ${s.institution_name}`, slug: companySlug });
      });

      // Fallbacks
      if (items.length < 4) {
        items.push({ label: "PLATFORM", message: "Live intelligence scanning active", slug: null });
        items.push({ label: "METHODOLOGY", message: "All signals sourced from public filings", slug: null });
        items.push({ label: "2026 EDGE", message: "Heritage vs. Progressive alignment now live", slug: null });
      }

      return items;
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });

  const tickerItems: TickerEntry[] = updates || [
    { label: "PLATFORM", message: "Live intelligence scanning active", slug: null },
    { label: "METHODOLOGY", message: "All signals sourced from public filings", slug: null },
  ];

  const renderItem = (t: TickerEntry, key: string) => (
    <span key={key} className="px-8 inline-flex items-center">
      {t.slug ? (
        <Link
          to={`/company/${t.slug}`}
          className="font-sans text-ticker font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {t.label}
        </Link>
      ) : (
        <span className="font-sans text-ticker font-bold">{t.label}</span>
      )}
      <span className="font-sans text-ticker text-muted-foreground">: {t.message}</span>
      <span className="px-4" style={{ color: 'hsl(43 85% 59% / 0.5)' }}>·</span>
    </span>
  );

  return (
    <div className="bg-background overflow-hidden whitespace-nowrap h-[36px] flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2 px-3 shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <Radio className="w-3 h-3 animate-pulse text-primary" />
        <span className="font-sans text-eyebrow">LIVE</span>
      </div>
      <div className="inline-block animate-ticker">
        {tickerItems.map((t, i) => renderItem(t, `item-${i}`))}
        {tickerItems.slice(0, 3).map((t, i) => renderItem(t, `dup-${i}`))}
      </div>
    </div>
  );
}
