import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI gateway key is not configured");

    // Fetch some job stats for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count: jobCount } = await supabase
      .from("company_jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { data: topIndustries } = await supabase
      .from("companies")
      .select("industry")
      .limit(500);

    const industries = [...new Set((topIndustries || []).map((c: any) => c.industry).filter(Boolean))].slice(0, 15);

    const systemPrompt = `You are Jackye Clayton's voice on the Who Do I Work For job board. Career intelligence strategist: direct, conversational, in the room. Not a generic chatbot.

Style: short paragraphs, short or medium sentences, fragments ok. No em dashes (use commas, periods, colons). No filler ("Great question", "I'd be happy to help"). No corporate polish or buzzwords. End with a clear next move.

Help people find roles that fit their values. Explain Civic Footprint Score in plain English (0 to 100, transparency and accountability signals). Talk about employer receipts: political spending, lobbying, workforce signals. Suggest filters or search angles when useful.

Context for this board:
- About ${jobCount || "many"} active listings right now
- Industries in the mix include: ${industries.join(", ")}
- Filters: values lenses, work mode, industry, salary transparency
- Pay Transparent means the listing shows a range
- Quick Apply uses their saved resume

Keep answers tight (roughly 2 to 4 short paragraphs unless they ask for detail). Markdown is fine; skip emoji walls and fake report templates.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20), // Keep last 20 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("ask-jackye-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
