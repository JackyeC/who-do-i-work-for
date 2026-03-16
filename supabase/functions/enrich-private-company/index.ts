/**
 * Enrich Private Company
 * 
 * Specialized enrichment for privately held companies that lack SEC/FEC/lobbying data.
 * Uses Perplexity AI to fill gaps from news, NLRB, OSHA, watchdog, and review sources.
 * Writes structured signals directly to the database (civil_rights, court cases, etc.)
 * 
 * Input: { companyId: string, companyName: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const sb = createClient(supabaseUrl, serviceKey);

    const { companyId, companyName } = await req.json();
    if (!companyId || !companyName) {
      return new Response(JSON.stringify({ error: "companyId and companyName required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, any> = {};

    // ─── 1. OSHA Violations (DOL API) ───
    try {
      const oshaUrl = `https://enforcedata.dol.gov/api/search?query=${encodeURIComponent(companyName)}&size=20&agency=osha`;
      const oshaResp = await fetch(oshaUrl, { headers: { "Accept": "application/json" } });
      if (oshaResp.ok) {
        const contentType = oshaResp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const oshaData = await oshaResp.json();
          const violations = oshaData?.results || [];
          results.osha = violations.length;
          
          for (const v of violations.slice(0, 10)) {
            await sb.from("civil_rights_signals").upsert({
              company_id: companyId,
              signal_type: "osha_violation",
              signal_category: "workplace_safety",
              source_name: "OSHA",
              source_url: "https://www.osha.gov",
              description: v.summary || v.case_name || `OSHA violation: ${v.penalty_amount ? '$' + v.penalty_amount : 'see record'}`,
              evidence_text: JSON.stringify({ activity_nr: v.activity_nr, penalty: v.penalty_amount }),
              confidence: "high",
              filing_date: v.open_date || null,
              settlement_amount: v.penalty_amount ? Number(v.penalty_amount) : null,
            }, { onConflict: "company_id,signal_type,source_name", ignoreDuplicates: true });
          }
        }
      }
    } catch (e) { console.warn("[OSHA]", e); results.osha = 0; }

    // ─── 2. NLRB Cases ───
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000);
      const nlrbUrl = `https://data.nlrb.gov/api/3/action/datastore_search?q=${encodeURIComponent(companyName)}&limit=20`;
      const nlrbResp = await fetch(nlrbUrl, { signal: controller.signal });
      if (nlrbResp.ok) {
        const nlrbData = await nlrbResp.json();
        const records = nlrbData?.result?.records || [];
        results.nlrb = records.length;

        for (const r of records.slice(0, 10)) {
          await sb.from("company_court_cases").upsert({
            company_id: companyId,
            case_name: r.case_name || `NLRB Case ${r.case_number || ''}`,
            case_number: r.case_number || null,
            case_type: "NLRB",
            court_name: "National Labor Relations Board",
            date_filed: r.date_filed || null,
            status: r.status || "filed",
            summary: r.allegation || r.reason_closed || null,
            source: "NLRB",
            confidence: "high",
          }, { onConflict: "company_id,case_name", ignoreDuplicates: true });
        }
      }
    } catch (e) { console.warn("[NLRB]", e); results.nlrb = 0; }

    // ─── 3. EEOC Press Releases ───
    try {
      const eeocUrl = `https://www.eeoc.gov/newsroom/search?keys=${encodeURIComponent(companyName)}&format=json`;
      const eeocResp = await fetch(eeocUrl);
      if (eeocResp.ok) {
        const ct = eeocResp.headers.get("content-type") || "";
        if (ct.includes("json")) {
          const eeocData = await eeocResp.json();
          results.eeoc = (eeocData?.results || []).length;
        } else {
          results.eeoc = 0;
        }
      }
    } catch (e) { console.warn("[EEOC]", e); results.eeoc = 0; }

    // ─── 4. Perplexity Deep Enrichment (private company focus) ───
    let aiEnrichment = null;
    if (perplexityKey) {
      try {
        const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${perplexityKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              {
                role: "system",
                content: `You are an investigative labor and workplace intelligence analyst. Research this PRIVATE company focusing on employee experience, labor disputes, workplace safety, and corporate behavior. Return structured JSON only.`,
              },
              {
                role: "user",
                content: `Research "${companyName}" as a private company employer. Return JSON with these fields:
{
  "employee_count_estimate": "string",
  "glassdoor_rating": number or null,
  "union_activity": [{ "description": "string", "year": number, "source": "string" }],
  "osha_incidents": [{ "description": "string", "year": number, "penalty": number or null }],
  "discrimination_cases": [{ "description": "string", "year": number, "outcome": "string" }],
  "wage_theft_cases": [{ "description": "string", "year": number, "amount": number or null }],
  "notable_policies": ["string"],
  "controversies": [{ "description": "string", "year": number, "source_url": "string" }],
  "parent_company": "string or null",
  "recent_news": [{ "headline": "string", "date": "string", "source": "string" }]
}
Only include verified, factual information. If no data found for a field, use empty array or null.`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "private_company_intel",
                schema: {
                  type: "object",
                  properties: {
                    employee_count_estimate: { type: "string" },
                    glassdoor_rating: { type: ["number", "null"] },
                    union_activity: { type: "array", items: { type: "object" } },
                    osha_incidents: { type: "array", items: { type: "object" } },
                    discrimination_cases: { type: "array", items: { type: "object" } },
                    wage_theft_cases: { type: "array", items: { type: "object" } },
                    notable_policies: { type: "array", items: { type: "string" } },
                    controversies: { type: "array", items: { type: "object" } },
                    parent_company: { type: ["string", "null"] },
                    recent_news: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          }),
        });

        if (perplexityRes.ok) {
          const aiData = await perplexityRes.json();
          const content = aiData.choices?.[0]?.message?.content;
          const citations = aiData.citations || [];
          
          if (content) {
            try {
              aiEnrichment = JSON.parse(content);
              results.ai = "success";

              // Write union activity as civil rights signals
              for (const u of (aiEnrichment.union_activity || [])) {
                await sb.from("civil_rights_signals").insert({
                  company_id: companyId,
                  signal_type: "union_activity",
                  signal_category: "labor_organizing",
                  source_name: u.source || "Perplexity AI Research",
                  description: u.description,
                  confidence: "medium",
                  filing_date: u.year ? `${u.year}-01-01` : null,
                }).catch(() => {});
              }

              // Write discrimination cases
              for (const d of (aiEnrichment.discrimination_cases || [])) {
                await sb.from("company_court_cases").insert({
                  company_id: companyId,
                  case_name: d.description?.substring(0, 100) || "Discrimination Case",
                  case_type: "Employment Discrimination",
                  date_filed: d.year ? `${d.year}-01-01` : null,
                  status: d.outcome || "unknown",
                  summary: d.description,
                  source: "Perplexity AI Research",
                  confidence: "medium",
                }).catch(() => {});
              }

              // Write controversies
              for (const c of (aiEnrichment.controversies || [])) {
                await sb.from("civil_rights_signals").insert({
                  company_id: companyId,
                  signal_type: "controversy",
                  signal_category: "corporate_behavior",
                  source_name: "News / Perplexity AI",
                  source_url: c.source_url || null,
                  description: c.description,
                  confidence: "medium",
                  filing_date: c.year ? `${c.year}-01-01` : null,
                }).catch(() => {});
              }

              // Update company with AI-sourced metadata
              const updateFields: Record<string, any> = {};
              if (aiEnrichment.employee_count_estimate) updateFields.employee_count = aiEnrichment.employee_count_estimate;
              if (aiEnrichment.parent_company) updateFields.parent_company = aiEnrichment.parent_company;
              if (Object.keys(updateFields).length > 0) {
                await sb.from("companies").update(updateFields).eq("id", companyId);
              }
            } catch (parseErr) {
              console.warn("[Perplexity] JSON parse failed, using raw content");
              results.ai = "parse_error";
            }
          }
        } else {
          results.ai = `error_${perplexityRes.status}`;
        }
      } catch (e) { console.warn("[Perplexity]", e); results.ai = "error"; }
    } else {
      results.ai = "no_api_key";
    }

    // ─── 5. Update scan completion ───
    const { data: company } = await sb.from("companies").select("scan_completion").eq("id", companyId).single();
    const scanCompletion = (company?.scan_completion as Record<string, boolean>) || {};
    scanCompletion.private_company_enrichment = true;
    await sb.from("companies").update({ 
      scan_completion: scanCompletion,
      updated_at: new Date().toISOString(),
    }).eq("id", companyId);

    return new Response(JSON.stringify({
      success: true,
      results,
      aiEnrichment: aiEnrichment ? {
        unionActivity: aiEnrichment.union_activity?.length || 0,
        controversies: aiEnrichment.controversies?.length || 0,
        discriminationCases: aiEnrichment.discrimination_cases?.length || 0,
        recentNews: aiEnrichment.recent_news?.length || 0,
      } : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("enrich-private-company error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
