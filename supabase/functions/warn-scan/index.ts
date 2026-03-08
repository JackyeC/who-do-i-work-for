import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, company_name } = await req.json();
    if (!company_id || !company_name) {
      return new Response(JSON.stringify({ error: "company_id and company_name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "Firecrawl not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Scanning WARN notices for: ${company_name}`);

    // Search for WARN notices using Firecrawl
    const searchQueries = [
      `"${company_name}" WARN Act layoff notice`,
      `"${company_name}" mass layoff plant closure WARN`,
      `"${company_name}" worker adjustment retraining notification`,
    ];

    const allResults: any[] = [];

    for (const query of searchQueries) {
      try {
        const searchRes = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 10,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.data) {
            allResults.push(...searchData.data);
          }
        }
      } catch (e) {
        console.error(`Search failed for query: ${query}`, e);
      }
    }

    if (allResults.length === 0) {
      console.log("No WARN results found");
      return new Response(JSON.stringify({ success: true, notices: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Gemini to extract structured WARN notice data
    const combinedText = allResults
      .map((r) => `URL: ${r.url}\nTitle: ${r.title || ""}\n${(r.markdown || r.description || "").slice(0, 2000)}`)
      .join("\n---\n")
      .slice(0, 15000);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Deno.env.get("LOVABLE_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract WARN Act layoff notices for "${company_name}" from the following search results. Return ONLY a JSON array of notices. Each notice should have:
- notice_date (YYYY-MM-DD format)
- effective_date (YYYY-MM-DD or null)
- employees_affected (integer)
- layoff_type ("layoff", "closure", "relocation", "mass_layoff", "temporary")
- location_city (string or null)
- location_state (US state abbreviation or null)
- reason (brief description or null)
- source_url (the URL where this was found)
- source_state (state that filed the WARN notice)

Only include notices that are specifically about "${company_name}" (not other companies). Be strict about matching the company name. If no valid WARN notices are found, return an empty array [].

Search results:
${combinedText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error("Gemini error:", await geminiRes.text());
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let notices: any[];
    try {
      notices = JSON.parse(responseText);
      if (!Array.isArray(notices)) notices = [];
    } catch {
      console.error("Failed to parse AI response:", responseText);
      notices = [];
    }

    console.log(`Found ${notices.length} WARN notices`);

    // Insert notices, avoiding duplicates by checking existing dates + employee counts
    let inserted = 0;
    for (const notice of notices) {
      if (!notice.notice_date || !notice.employees_affected) continue;

      // Check for duplicate
      const { data: existing } = await supabase
        .from("company_warn_notices")
        .select("id")
        .eq("company_id", company_id)
        .eq("notice_date", notice.notice_date)
        .eq("employees_affected", notice.employees_affected)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { error } = await supabase.from("company_warn_notices").insert({
        company_id,
        notice_date: notice.notice_date,
        effective_date: notice.effective_date || null,
        employees_affected: parseInt(notice.employees_affected) || 0,
        layoff_type: notice.layoff_type || "layoff",
        location_city: notice.location_city || null,
        location_state: notice.location_state || null,
        reason: notice.reason || null,
        source_url: notice.source_url || null,
        source_state: notice.source_state || null,
        confidence: "direct",
      });

      if (error) {
        console.error("Insert error:", error);
      } else {
        inserted++;
      }
    }

    // Also log to signal scans for timeline
    if (inserted > 0) {
      await supabase.from("company_signal_scans").insert({
        company_id,
        signal_category: "warn_layoffs",
        signal_type: `${inserted} WARN Act notice(s) detected`,
        signal_value: `${notices.reduce((s: number, n: any) => s + (parseInt(n.employees_affected) || 0), 0)} employees affected`,
        confidence_level: "direct",
        source_url: notices[0]?.source_url || null,
      });
    }

    return new Response(
      JSON.stringify({ success: true, notices: inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WARN scan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
