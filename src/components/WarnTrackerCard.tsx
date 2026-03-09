import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, MapPin, Calendar, Loader2, ExternalLink, TrendingDown, BarChart3 } from "lucide-react";
import { useState } from "react";

interface WarnNotice {
  id: string;
  notice_date: string;
  effective_date: string | null;
  employees_affected: number;
  layoff_type: string;
  location_city: string | null;
  location_state: string | null;
  reason: string | null;
  source_url: string | null;
  source_state: string | null;
  confidence: string;
}

export function WarnTrackerCard({ companyName, dbCompanyId }: { companyName: string; dbCompanyId: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: notices, isLoading, refetch } = useQuery({
    queryKey: ["warn-notices", dbCompanyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_warn_notices" as any)
        .select("*")
        .eq("company_id", dbCompanyId)
        .order("notice_date", { ascending: false });
      return (data || []) as unknown as WarnNotice[];
    },
    enabled: !!dbCompanyId,
  });

  const totalAffected = notices?.reduce((sum, n) => sum + (n.employees_affected || 0), 0) || 0;
  const totalNotices = notices?.length || 0;
  const displayedNotices = showAll ? notices : notices?.slice(0, 5);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await supabase.functions.invoke("warn-scan", {
        body: { company_id: dbCompanyId, company_name: companyName },
      });
      setTimeout(() => refetch(), 3000);
    } catch (e) {
      console.error("WARN scan error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const layoffTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      layoff: "Layoff",
      closure: "Plant Closure",
      relocation: "Relocation",
      mass_layoff: "Mass Layoff",
      temporary: "Temporary Layoff",
    };
    return map[t] || t;
  };

  const layoffStatsUrl = `https://layoffstats.com/`;
  const layoffStatsSearchUrl = `https://layoffstats.com/#events`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Workforce Stability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={isScanning}
              className="gap-1.5"
            >
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {isScanning ? "Scanning..." : "Scan WARN"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          WARN Act filings and layoff market intelligence for {companyName}.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Market Intelligence from layoffstats.com */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Live Layoff Market Data</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              LIVE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Real-time layoff tracking from crowdsourced and verified public sources.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={layoffStatsSearchUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3 h-3" />
                View {companyName} on LayoffStats
              </Button>
            </a>
            <a href={layoffStatsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3" />
                Full Market Dashboard
              </Button>
            </a>
          </div>
        </div>

        {/* WARN Act Filings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : totalNotices === 0 ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No WARN Act filings detected for {companyName}.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Scan WARN" to search federal and state filings.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-sm font-semibold text-foreground">WARN Act Filings</span>
            </div>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{totalAffected.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Total Employees Affected</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{totalNotices}</div>
                <div className="text-[10px] text-muted-foreground">WARN Notices Filed</div>
              </div>
            </div>

            {/* Timeline of notices */}
            <div className="space-y-2">
              {displayedNotices?.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(notice.notice_date)}
                      </span>
                    </div>
                    <Badge
                      variant={notice.layoff_type === "closure" ? "destructive" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {layoffTypeLabel(notice.layoff_type)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <strong className="text-foreground">{notice.employees_affected.toLocaleString()}</strong> affected
                    </span>
                    {(notice.location_city || notice.location_state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[notice.location_city, notice.location_state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>

                  {notice.reason && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">"{notice.reason}"</p>
                  )}

                  {notice.source_url && (
                    <a
                      href={notice.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="w-2.5 h-2.5" /> Source
                    </a>
                  )}
                </div>
              ))}
            </div>

            {totalNotices > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs"
              >
                {showAll ? "Show less" : `Show all ${totalNotices} notices`}
              </Button>
            )}
          </>
        )}

        {/* Attribution */}
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            WARN data from public state filings · Market data via{" "}
            <a href="https://layoffstats.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              LayoffStats.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
