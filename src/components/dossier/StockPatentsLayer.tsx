import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Lightbulb, BarChart3, Loader2, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceDot, CartesianGrid,
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface StockPatentsProps {
  companyId: string;
  companyName: string;
}

const RANGE_OPTIONS = [
  { value: "1y", label: "1 Year" },
  { value: "2y", label: "2 Years" },
  { value: "5y", label: "5 Years" },
  { value: "10y", label: "10 Years" },
  { value: "max", label: "Max" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatPrice(val: number) {
  return `$${val.toFixed(2)}`;
}

export function StockPatentsLayer({ companyId, companyName }: StockPatentsProps) {
  const [range, setRange] = useState("5y");

  // Look up ticker from pipeline_entities
  const { data: tickerData } = useQuery({
    queryKey: ["stock-ticker", companyId, companyName],
    queryFn: async () => {
      // Try to find a ticker via pipeline_entities matching company name
      const { data } = await supabase
        .from("pipeline_entities")
        .select("ticker, canonical_name")
        .ilike("canonical_name", `%${companyName.split(",")[0].split(" Inc")[0].split(" Corp")[0].trim()}%`)
        .not("ticker", "is", null)
        .limit(1);
      return data?.[0]?.ticker || null;
    },
    enabled: !!companyName,
  });

  // Fetch stock chart from edge function
  const { data: stockData, isLoading: loadingStock, error: stockError } = useQuery({
    queryKey: ["stock-chart", tickerData, range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-stock-chart", {
        body: {
          ticker: tickerData,
          range,
          interval: range === "1y" ? "1wk" : "1mo",
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!tickerData,
    staleTime: 1000 * 60 * 30, // cache 30 min
  });

  // Load inflection-point signals (WARN, leadership changes, etc.)
  const { data: inflectionSignals } = useQuery({
    queryKey: ["stock-inflections", companyId],
    queryFn: async () => {
      const [warnRes, signalRes] = await Promise.all([
        supabase
          .from("company_warn_notices")
          .select("notice_date, employees_affected, layoff_type")
          .eq("company_id", companyId)
          .order("notice_date", { ascending: false })
          .limit(10),
        supabase
          .from("company_signal_scans")
          .select("scan_timestamp, signal_type, signal_category, signal_value")
          .eq("company_id", companyId)
          .in("signal_category", ["leadership", "restructuring", "innovation", "regulatory"])
          .limit(10),
      ]);

      const markers: Array<{ date: string; label: string; type: string }> = [];

      (warnRes.data || []).forEach(w => {
        markers.push({
          date: w.notice_date.split("T")[0],
          label: `WARN: ${w.employees_affected} employees (${w.layoff_type || "Layoff"})`,
          type: "warn",
        });
      });

      (signalRes.data || []).forEach(s => {
        markers.push({
          date: (s.scan_timestamp || "").split("T")[0],
          label: s.signal_type,
          type: s.signal_category,
        });
      });

      return markers;
    },
    enabled: !!companyId,
  });

  // Load innovation signals
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

  // Match inflection points to chart data points
  const chartPoints = stockData?.chartData || [];
  const markerPoints = (inflectionSignals || [])
    .map(marker => {
      // Find closest chart data point
      const closest = chartPoints.reduce((best: any, pt: any) => {
        if (!best) return pt;
        const diff = Math.abs(new Date(pt.date).getTime() - new Date(marker.date).getTime());
        const bestDiff = Math.abs(new Date(best.date).getTime() - new Date(marker.date).getTime());
        return diff < bestDiff ? pt : best;
      }, null);
      if (!closest || Math.abs(new Date(closest.date).getTime() - new Date(marker.date).getTime()) > 90 * 86400000) return null;
      return { ...closest, markerLabel: marker.label, markerType: marker.type };
    })
    .filter(Boolean);

  const noTicker = !tickerData && !loadingStock;

  return (
    <div className="space-y-6">
      {/* Stock Chart */}
      {noTicker ? (
        <div className="text-center py-8 rounded-lg bg-muted/20">
          <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-caption text-muted-foreground">
            No stock ticker found for {companyName}. This company may be private or not yet mapped.
          </p>
        </div>
      ) : loadingStock ? (
        <Card className="border-border/30">
          <CardContent className="p-5 flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
            <span className="text-caption text-muted-foreground">Loading stock data for {tickerData}…</span>
          </CardContent>
        </Card>
      ) : stockError ? (
        <div className="text-center py-8 rounded-lg bg-destructive/5 border border-destructive/10">
          <BarChart3 className="w-8 h-8 text-destructive/40 mx-auto mb-3" />
          <p className="text-caption text-muted-foreground">Unable to load stock data. Yahoo Finance may be temporarily unavailable.</p>
        </div>
      ) : chartPoints.length > 0 ? (
        <Card className="border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-foreground text-body flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {stockData.companyName || companyName}
                  <Badge variant="secondary" className="text-micro font-mono">{stockData.ticker}</Badge>
                </h4>
                <p className="text-micro text-muted-foreground mt-0.5">
                  {stockData.exchange} · {stockData.currency}
                  {chartPoints.length > 0 && ` · Last: ${formatPrice(chartPoints[chartPoints.length - 1].close)}`}
                </p>
              </div>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={formatDate}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatPrice(v), "Close"]}
                    labelFormatter={(label: string) => new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#stockGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                  {/* Inflection point markers */}
                  {markerPoints.map((pt: any, idx: number) => (
                    <ReferenceDot
                      key={idx}
                      x={pt.date}
                      y={pt.close}
                      r={6}
                      fill={pt.markerType === "warn" ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Inflection point legend */}
            {markerPoints.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <h5 className="text-micro font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Inflection Points
                </h5>
                {markerPoints.map((pt: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-micro text-muted-foreground">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: pt.markerType === "warn" ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                      }}
                    />
                    <span className="font-mono">{formatDate(pt.date)}</span>
                    <span>—</span>
                    <span>{pt.markerLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

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
