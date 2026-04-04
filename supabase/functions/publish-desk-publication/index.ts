/**
 * Publish a WDIWF desk row (bi-hourly or Friday) to Supabase.
 * Auth: Authorization: Bearer <WDIWF_DESK_PUBLISH_SECRET> (set in Supabase Edge secrets).
 * Inserts use service role — bypasses RLS.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PREFIX = "[publish-desk-publication]";

function logInfo(step: string, details?: Record<string, unknown>) {
  const extra = details && Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
  console.log(`${PREFIX} ${step}${extra}`);
}

type Body = {
  run_id?: string | null;
  kind: "bi_hourly" | "friday";
  generation_status: "completed" | "skipped";
  site_markdown?: string | null;
  newsletter_markdown?: string | null;
  email_subject?: string | null;
  email_preview_text?: string | null;
  social_linkedin?: string | null;
  social_bluesky?: string | null;
  social_x?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  run_log?: Record<string, unknown>;
  published_to_site?: boolean;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    logInfo("reject", { reason: "method_not_allowed", method: req.method });
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("WDIWF_DESK_PUBLISH_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    logInfo("auth_failed", { has_secret: Boolean(secret), has_bearer: Boolean(auth) });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    logInfo("config_error", { has_url: Boolean(supabaseUrl), has_service_key: Boolean(serviceKey) });
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    logInfo("reject", { reason: "invalid_json" });
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.kind || !body.generation_status) {
    logInfo("reject", { reason: "missing_kind_or_generation_status" });
    return new Response(JSON.stringify({ error: "kind and generation_status required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const published = body.published_to_site === true;

  if (body.generation_status === "completed" && body.kind === "bi_hourly" && published) {
    const md = (body.site_markdown ?? "").trim();
    if (!md) {
      logInfo("reject", { reason: "empty_site_markdown_bi_hourly_live" });
      return new Response(
        JSON.stringify({ error: "site_markdown required for completed bi_hourly with published_to_site" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  if (body.generation_status === "skipped" && published) {
    logInfo("validation_failed", { reason: "skipped_cannot_publish_to_site" });
    return new Response(JSON.stringify({ error: "skipped runs cannot set published_to_site true" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const siteLen = (body.site_markdown ?? "").length;
  const run_log = {
    ...(typeof body.run_log === "object" && body.run_log !== null ? body.run_log : {}),
    edge_received_at: new Date().toISOString(),
    edge_function: "publish-desk-publication",
  };

  logInfo("insert", {
    kind: body.kind,
    generation_status: body.generation_status,
    published_to_site: published,
    run_id: body.run_id ?? null,
    site_markdown_chars: siteLen,
  });

  const row = {
    run_id: body.run_id ?? null,
    kind: body.kind,
    generation_status: body.generation_status,
    site_markdown: body.site_markdown ?? null,
    newsletter_markdown: body.newsletter_markdown ?? null,
    email_subject: body.email_subject ?? null,
    email_preview_text: body.email_preview_text ?? null,
    social_linkedin: body.social_linkedin ?? null,
    social_bluesky: body.social_bluesky ?? null,
    social_x: body.social_x ?? null,
    social_instagram: body.social_instagram ?? null,
    social_facebook: body.social_facebook ?? null,
    run_log,
    published_to_site: published,
  };

  const { data, error } = await supabase.from("wdiwf_desk_publications").insert(row).select("id, created_at").single();

  if (error) {
    logInfo("insert_error", { message: error.message, code: error.code });
    console.error(`${PREFIX} insert error:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  logInfo("ok", { id: data.id, created_at: data.created_at });

  return new Response(JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
