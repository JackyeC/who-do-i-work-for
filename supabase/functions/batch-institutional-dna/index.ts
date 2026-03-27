import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get all companies with active jobs
    const { data: jobCompanies, error: jobError } = await adminClient
      .from("company_jobs")
      .select("company_id")
      .eq("is_active", true);

    if (jobError) throw new Error(`Failed to fetch job companies: ${jobError.message}`);

    const companyIds = [...new Set((jobCompanies || []).map((j: any) => j.company_id))];
    console.log(`[batch-institutional-dna] Found ${companyIds.length} companies with active jobs`);

    const results: any[] = [];
    const errors: any[] = [];

    for (const companyId of companyIds) {
      try {
        console.log(`[batch-institutional-dna] Scanning company ${companyId}...`);

        const response = await fetch(`${supabaseUrl}/functions/v1/institutional-dna-scan`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ companyId }),
        });

        const result = await response.json();

        if (response.ok) {
          results.push({ companyId, companyName: result.companyName, signals: result.signalsFound, bipartisan: result.isBipartisan });
          console.log(`[batch-institutional-dna] ✓ ${result.companyName}: ${result.signalsFound} signals`);
        } else {
          errors.push({ companyId, error: result.error || "Unknown error" });
          console.error(`[batch-institutional-dna] ✗ ${companyId}: ${result.error}`);
        }

        // 5s throttle for Perplexity rate limits
        await new Promise((r) => setTimeout(r, 5000));
      } catch (e: any) {
        errors.push({ companyId, error: e.message });
        console.error(`[batch-institutional-dna] ✗ ${companyId}: ${e.message}`);
      }
    }

    const totalSignals = results.reduce((sum, r) => sum + (r.signals || 0), 0);

    return new Response(JSON.stringify({
      success: true,
      companiesProcessed: companyIds.length,
      totalSignals,
      results,
      errors,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[batch-institutional-dna] Fatal error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
