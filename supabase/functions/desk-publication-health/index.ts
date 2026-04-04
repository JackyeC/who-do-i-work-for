/**
 * Operator health: last N desk publication rows (all outcomes). Same auth as publish-desk-publication.
 * Does not expose rows to the public internet — Bearer secret required.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PREFIX = "[desk-publication-health]";

function logInfo(step: string, details?: Record<string, unknown>) {
  const extra = details && Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
  console.log(`${PREFIX} ${step}${extra}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const secret = Deno.env.get("WDIWF_DESK_PUBLISH_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    logInfo("unauthorized", {});
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let limit = 5;
  if (req.method === "GET") {
    const url = new URL(req.url);
    const n = parseInt(url.searchParams.get("limit") ?? "5", 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 25) limit = n;
  } else if (req.method === "POST") {
    try {
      const b = (await req.json()) as { limit?: number };
      if (typeof b.limit === "number" && b.limit >= 1 && b.limit <= 25) limit = b.limit;
    } catch {
      /* use default */
    }
  } else {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: rows, error } = await supabase
    .from("wdiwf_desk_publications")
    .select(
      "id, created_at, run_id, kind, generation_status, publish_status, published_to_site, failure_code, failure_message, site_markdown",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logInfo("query_error", { message: error.message });
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message,
        checks: { publications_table: `error: ${error.message}` },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const rpcRes = await supabase.rpc("wdiwf_latest_live_desk_publication");
  const rpcOk = !rpcRes.error;
  const rpcDetail = rpcRes.error ? `error: ${rpcRes.error.message}` : "ok";

  if (rpcRes.error) {
    logInfo("rpc_error", { message: rpcRes.error.message });
  }

  const runs = (rows ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    run_id: r.run_id,
    kind: r.kind,
    generation_status: r.generation_status,
    publish_status: r.publish_status,
    /** Same meaning as DB column: true only when this row is eligible for public live desk (contract enforced in DB). */
    published_to_site: r.published_to_site,
    failure_code: r.failure_code,
    failure_message: r.failure_message,
    site_markdown_chars: typeof r.site_markdown === "string" ? r.site_markdown.length : 0,
  }));

  const liveContract = (r: (typeof runs)[0]) =>
    r.publish_status === "success" &&
    r.published_to_site === true &&
    r.generation_status === "completed" &&
    r.kind === "bi_hourly" &&
    (r.site_markdown_chars ?? 0) > 0;

  const engine_alive = runs.length > 0;
  /** False if operability migration / RPC missing — /newsletter desk hook will fail. */
  const safe_for_newsletter_desk = rpcOk;

  logInfo("ok", { limit, returned: runs.length, rpc_ok: rpcOk });

  return new Response(
    JSON.stringify({
      ok: rpcOk,
      checked_at: new Date().toISOString(),
      checks: {
        publications_table: "ok",
        rpc_latest_live_desk: rpcDetail,
      },
      safe_for_newsletter_desk,
      limit,
      engine_alive,
      /** Newest row that is actually live on the site (same contract as RLS). */
      newest_live: runs.find(liveContract) ?? null,
      runs,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
