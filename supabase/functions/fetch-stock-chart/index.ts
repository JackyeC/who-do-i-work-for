import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { ticker, range = "max", interval = "1mo" } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: "Missing ticker symbol" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Yahoo Finance query1 endpoint for lifetime monthly data
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Yahoo Finance error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Yahoo Finance returned ${response.status}`, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return new Response(
        JSON.stringify({ error: "No chart data found for ticker", ticker }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const closes = quote.close || [];
    const volumes = quote.volume || [];
    const meta = result.meta || {};

    // Map to clean monthly data points
    const chartData = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      timestamp: ts,
      close: closes[i] != null ? Math.round(closes[i] * 100) / 100 : null,
      volume: volumes[i] || null,
    })).filter((d: any) => d.close !== null);

    return new Response(
      JSON.stringify({
        ticker: meta.symbol || ticker,
        currency: meta.currency || "USD",
        exchange: meta.exchangeName || "",
        companyName: meta.longName || meta.shortName || ticker,
        range,
        interval,
        chartData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Stock chart error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
