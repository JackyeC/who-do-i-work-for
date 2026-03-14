import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURTLISTENER_BASE = "https://www.courtlistener.com/api/rest/v4";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth gate: admin or service role
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (token !== serviceKey) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      const { data: isOwner } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "owner",
      });
      if (!isAdmin && !isOwner) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { company_id, company_name } = await req.json();
    if (!company_id || !company_name) {
      return new Response(
        JSON.stringify({ error: "company_id and company_name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[court-records] Searching CourtListener for: ${company_name}`);

    // Search CourtListener RECAP archive (free, no API key required for basic search)
    const searchUrl = `${COURTLISTENER_BASE}/search/?q="${encodeURIComponent(company_name)}"&type=r&order_by=dateFiled+desc&page_size=25`;

    const clResponse = await fetch(searchUrl, {
      headers: { "Accept": "application/json" },
    });

    if (!clResponse.ok) {
      const errText = await clResponse.text();
      console.error(`[court-records] CourtListener error ${clResponse.status}: ${errText}`);
      return new Response(
        JSON.stringify({ error: `CourtListener API error: ${clResponse.status}`, results: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clData = await clResponse.json();
    const results = clData.results || [];
    console.log(`[court-records] Found ${results.length} results for ${company_name}`);

    let inserted = 0;

    for (const result of results) {
      const caseName = result.caseName || result.case_name || result.caseNameShort || "Unknown Case";
      const docketNumber = result.docketNumber || result.docket_number || null;
      const courtName = result.court || result.court_citation_string || null;
      const dateFiled = result.dateFiled || result.date_filed || null;
      const dateTerminated = result.dateTerminated || result.date_terminated || null;
      const suitNature = result.suitNature || result.nature_of_suit || null;
      const cause = result.cause || null;
      const status = dateTerminated ? "closed" : "open";
      const clId = result.docket_id?.toString() || result.id?.toString() || null;
      const clUrl = clId
        ? `https://www.courtlistener.com/docket/${clId}/`
        : null;

      // Determine if company is plaintiff or defendant from case name
      const nameLower = company_name.toLowerCase();
      const caseNameLower = caseName.toLowerCase();
      const vIndex = caseNameLower.indexOf(" v. ") || caseNameLower.indexOf(" vs. ");
      let role = "unknown";
      if (vIndex > -1) {
        const beforeV = caseNameLower.substring(0, vIndex);
        role = beforeV.includes(nameLower.substring(0, 8)) ? "plaintiff" : "defendant";
      }

      // Upsert by courtlistener_id or case_number to avoid duplicates
      const { error: upsertErr } = await supabase
        .from("company_court_cases")
        .upsert(
          {
            company_id,
            case_name: caseName,
            case_number: docketNumber,
            court_name: courtName,
            date_filed: dateFiled,
            date_terminated: dateTerminated,
            nature_of_suit: suitNature,
            cause,
            status,
            plaintiff_or_defendant: role,
            courtlistener_id: clId,
            courtlistener_url: clUrl,
            source: "courtlistener",
            confidence: "high",
          },
          { onConflict: "company_id,courtlistener_id", ignoreDuplicates: true }
        );

      if (upsertErr) {
        // If unique constraint doesn't exist, just insert and skip duplicates
        const { error: insertErr } = await supabase
          .from("company_court_cases")
          .insert({
            company_id,
            case_name: caseName,
            case_number: docketNumber,
            court_name: courtName,
            date_filed: dateFiled,
            date_terminated: dateTerminated,
            nature_of_suit: suitNature,
            cause,
            status,
            plaintiff_or_defendant: role,
            courtlistener_id: clId,
            courtlistener_url: clUrl,
            source: "courtlistener",
            confidence: "high",
          });
        if (!insertErr) inserted++;
      } else {
        inserted++;
      }
    }

    console.log(`[court-records] Inserted ${inserted} cases for ${company_name}`);

    return new Response(
      JSON.stringify({ success: true, results: results.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[court-records] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
