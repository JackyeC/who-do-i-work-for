import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Lightbulb, BarChart3, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface StockPatentsProps {
  companyId: string;
  companyName: string;
}

// Generate placeholder stock data based on spending history cycles
function generateStockProxy(spendingHistory: any[]): Array<{ period: string; value: number }> {
  if (!spendingHistory || spendingHistory.length === 0) return [];

  return spendingHistory
    .sort((a, b) => a.cycle.localeCompare(b.cycle))
    .map(sh => ({
      period: sh.cycle,
      value: (sh.pac_spending || 0) + (sh.lobbying_spend || 0) + (sh.executive_giving || 0),
    }));
}

export function StockPatentsLayer({ companyId, companyName }: StockPatentsProps) {
  const { data: spendingHistory, isLoading: loadingSpending } = useQuery({
    queryKey: ["stock-spending", companyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_spending_history")
        .select("*")
        .eq("company_id", companyId)
        .order("cycle", { ascending: true });
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: warnNotices } = useQuery({
    queryKey: ["stock-warns", companyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_warn_notices")
        .select("notice_date, employees_affected, layoff_type")
        .eq("company_id", companyId)
        .order("notice_date", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!companyId,
  });

  const { data: signalScans } = useQuery({
    queryKey: ["patent-signals", companyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_signal_scans")
        .select("*")
        .eq("company_id", companyId)
        .eq("signal_category", "innovation");
      return data || [];
    },
    enabled: !!companyId,
  });

  const chartData = generateStockProxy(spendingHistory || []);

  if (loadingSpending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Political Spending Timeline (proxy for financial activity) */}
      {chartData.length > 0 ? (
        <Card className="border-border/30">
          <CardContent className="p-5">
            <h4 className="font-semibold text-foreground text-body flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" /> Political Spending Timeline
            </h4>
            <p className="text-micro text-muted-foreground mb-4">
              Total political spending per election cycle (PAC + Lobbying + Executive giving)
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Total Spending"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-6 rounded-lg bg-muted/20">
          <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-caption text-muted-foreground">No spending timeline data available for {companyName}.</p>
        </div>
      )}

      {/* WARN Notice Events */}
      {warnNotices && warnNotices.length > 0 && (
        <Card className="border-border/30">
          <CardContent className="p-5">
            <h4 className="font-semibold text-foreground text-body flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-destructive" /> Key Workforce Events
            </h4>
            <div className="space-y-2">
              {warnNotices.map((w, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-destructive/5 border border-destructive/10">
                  <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                  <span className="text-caption text-foreground">
                    {new Date(w.notice_date).toLocaleDateString()} — {w.employees_affected} employees ({w.layoff_type || "Layoff"})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Innovation Signals */}
      {signalScans && signalScans.length > 0 ? (
        <Card className="border-border/30">
          <CardContent className="p-5">
            <h4 className="font-semibold text-foreground text-body flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-civic-gold" /> Innovation Signals
            </h4>
            <div className="space-y-2">
              {signalScans.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/20">
                  <span className="font-medium text-foreground text-caption">{s.signal_type}</span>
                  {s.raw_excerpt && (
                    <p className="text-micro text-muted-foreground mt-1 line-clamp-2">{s.raw_excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-micro">{s.confidence_level}</Badge>
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener" className="text-micro text-primary hover:underline flex items-center gap-1">
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-6 rounded-lg bg-muted/20">
          <Lightbulb className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-caption text-muted-foreground">No patent or innovation signals detected yet for {companyName}.</p>
        </div>
      )}
    </div>
  );
}
