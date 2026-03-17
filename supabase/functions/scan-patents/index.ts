import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, companyName } = await req.json();
    if (!companyId || !companyName) {
      return new Response(JSON.stringify({ error: "companyId and companyName required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check freshness — skip if we fetched in last 7 days
    const { data: existing } = await supabase
      .from("company_patents")
      .select("id, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing?.length) {
      const lastFetch = new Date(existing[0].created_at);
      const daysSince = (Date.now() - lastFetch.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return new Response(JSON.stringify({ success: true, cached: true, message: "Patent data is fresh" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Query PatentsView API v1 (free, no key required)
    // Search by assignee organization name
    const query = encodeURIComponent(companyName.replace(/,?\s*(Inc|LLC|Corp|Ltd|Co)\.?$/i, "").trim());
    const apiUrl = `https://api.patentsview.org/patents/query?q={"_contains":{"assignees.assignee_organization":"${query}"}}&f=["patent_number","patent_title","patent_abstract","patent_date","patent_type","assignees.assignee_organization","inventors.inventor_first_name","inventors.inventor_last_name"]&o={"page":1,"per_page":50}&s=[{"patent_date":"desc"}]`;

    const response = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`PatentsView API error: ${response.status}`);
      return new Response(JSON.stringify({ success: false, error: `PatentsView API returned ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const patents = data.patents || [];

    if (patents.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: "No patents found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Categorize patents by title keywords
    function categorizePatent(title: string): string {
      const t = title.toLowerCase();
      if (/artificial intelligence|machine learning|neural network|deep learning|nlp|natural language/i.test(t)) return "AI & Machine Learning";
      if (/blockchain|distributed ledger|crypto/i.test(t)) return "Blockchain";
      if (/autonomous|self.?driving|lidar|vehicle/i.test(t)) return "Autonomous Systems";
      if (/cloud|serverless|container|kubernetes/i.test(t)) return "Cloud Computing";
      if (/security|encryption|authentication|cyber/i.test(t)) return "Cybersecurity";
      if (/health|medical|pharma|therapeutic|diagnostic/i.test(t)) return "Healthcare";
      if (/battery|solar|energy|renewable/i.test(t)) return "Energy & Sustainability";
      if (/display|screen|user interface|gui/i.test(t)) return "User Interface";
      if (/wireless|5g|antenna|signal/i.test(t)) return "Communications";
      if (/semiconductor|chip|processor|transistor/i.test(t)) return "Semiconductors";
      return "Other";
    }

    // Upsert patents
    const rows = patents.map((p: any) => ({
      company_id: companyId,
      patent_number: p.patent_number,
      title: p.patent_title || "Untitled",
      abstract: p.patent_abstract?.substring(0, 1000) || null,
      filing_date: p.patent_date || null,
      grant_date: p.patent_date || null,
      patent_type: p.patent_type || "utility",
      category: categorizePatent(p.patent_title || ""),
      inventors: (p.inventors || []).map((inv: any) =>
        `${inv.inventor_first_name || ""} ${inv.inventor_last_name || ""}`.trim()
      ),
      assignee_name: p.assignees?.[0]?.assignee_organization || companyName,
      source_url: `https://patents.google.com/patent/US${p.patent_number}`,
      source: "patentsview",
      confidence: "High",
    }));

    const { error: upsertError } = await supabase
      .from("company_patents")
      .upsert(rows, { onConflict: "company_id,patent_number" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    return new Response(JSON.stringify({ success: true, count: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Patent scan error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
