/**
 * Publish a WDIWF desk row (bi-hourly, forensic, or Friday) to Supabase.
 * Auth: Authorization: Bearer <WDIWF_DESK_PUBLISH_SECRET>
 * Sets publish_status server-side (success | skipped | failed). Never trust client for final outcome.
 *
 * published_to_site: when true for bi_hourly or forensic, DB + RLS enforce the live contract; bi_hourly → /newsletter, forensic → /integrity-report.
 */
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
  kind: "bi_hourly" | "friday" | "forensic";
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

type PublishStatus = "success" | "skipped" | "failed";

async function recordFailure(
  supabase: SupabaseClient,
  params: {
    run_id?: string | null;
    kind?: "bi_hourly" | "friday" | "forensic" | null;
    generation_status?: "completed" | "skipped" | null;
    failure_code: string;
    failure_message: string;
    run_log: Record<string, unknown>;
  },
): Promise<{ id: string } | null> {
  const run_log = {
    ...params.run_log,
    edge_received_at: new Date().toISOString(),
    edge_function: "publish-desk-publication",
    final_status: "failed" as const,
  };

  const row = {
    run_id: params.run_id ?? null,
    kind: params.kind ?? null,
    generation_status: params.generation_status ?? null,
    publish_status: "failed" as const,
    published_to_site: false,
    site_markdown: null as string | null,
    newsletter_markdown: null as string | null,
    email_subject: null as string | null,
    email_preview_text: null as string | null,
    social_linkedin: null as string | null,
    social_bluesky: null as string | null,
    social_x: null as string | null,
    social_instagram: null as string | null,
    social_facebook: null as string | null,
    failure_code: params.failure_code,
    failure_message: params.failure_message,
    run_log,
  };

  const { data, error } = await supabase.from("wdiwf_desk_publications").insert(row).select("id").single();

  if (error) {
    logInfo("FAILED_AUDIT_INSERT_ERROR", { message: error.message, code: error.code });
    console.error(`${PREFIX} could not persist failure row:`, error);
    return null;
  }

  logInfo("FAILED", {
    audit_id: data.id,
    failure_code: params.failure_code,
    run_id: params.run_id ?? null,
  });

  return { id: data.id };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const secret = Deno.env.get("WDIWF_DESK_PUBLISH_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    logInfo("FINAL", { outcome: "failed", reason: "unauthorized", has_secret: Boolean(secret), has_bearer: Boolean(auth) });
    return jsonResponse({ ok: false, publish_status: "failed" as PublishStatus, error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    logInfo("FINAL", { outcome: "failed", reason: "server_misconfigured" });
    return jsonResponse({ ok: false, publish_status: "failed" as PublishStatus, error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  if (req.method !== "POST") {
    const audit = await recordFailure(supabase, {
      failure_code: "method_not_allowed",
      failure_message: `Expected POST, got ${req.method}`,
      run_log: { http_method: req.method },
    });
    logInfo("FINAL", { outcome: "failed", failure_code: "method_not_allowed", audit_id: audit?.id ?? null });
    return jsonResponse(
      {
        ok: false,
        publish_status: "failed" as PublishStatus,
        audit_id: audit?.id ?? null,
        error: "Method not allowed",
      },
      405,
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    const audit = await recordFailure(supabase, {
      failure_code: "invalid_json",
      failure_message: "Request body is not valid JSON",
      run_log: {},
    });
    logInfo("FINAL", { outcome: "failed", failure_code: "invalid_json", audit_id: audit?.id ?? null });
    return jsonResponse(
      {
        ok: false,
        publish_status: "failed" as PublishStatus,
        audit_id: audit?.id ?? null,
        error: "Invalid JSON",
      },
      400,
    );
  }

  if (!body.kind || !body.generation_status) {
    const audit = await recordFailure(supabase, {
      run_id: body.run_id ?? null,
      failure_code: "missing_kind_or_generation_status",
      failure_message: "kind and generation_status are required",
      run_log: { run_id: body.run_id ?? null },
    });
    logInfo("FINAL", {
      outcome: "failed",
      failure_code: "missing_kind_or_generation_status",
      audit_id: audit?.id ?? null,
      run_id: body.run_id ?? null,
    });
    return jsonResponse(
      {
        ok: false,
        publish_status: "failed" as PublishStatus,
        audit_id: audit?.id ?? null,
        error: "kind and generation_status required",
      },
      400,
    );
  }

  const published = body.published_to_site === true;
  const publishStatus: PublishStatus = body.generation_status === "skipped" ? "skipped" : "success";

  const liveSiteKind =
    body.generation_status === "completed" &&
    published &&
    (body.kind === "bi_hourly" || body.kind === "forensic");
  if (liveSiteKind) {
    const md = (body.site_markdown ?? "").trim();
    if (!md) {
      const audit = await recordFailure(supabase, {
        run_id: body.run_id ?? null,
        kind: body.kind,
        generation_status: body.generation_status,
        failure_code: "empty_site_markdown_live_kind",
        failure_message:
          "site_markdown is required when publishing completed bi_hourly or forensic content to the site",
        run_log: {},
      });
      logInfo("FINAL", {
        outcome: "failed",
        failure_code: "empty_site_markdown_live_kind",
        audit_id: audit?.id ?? null,
        run_id: body.run_id ?? null,
      });
      return jsonResponse(
        {
          ok: false,
          publish_status: "failed" as PublishStatus,
          audit_id: audit?.id ?? null,
          error: "site_markdown required for completed bi_hourly or forensic with published_to_site",
        },
        400,
      );
    }
  }

  if (body.generation_status === "skipped" && published) {
    const audit = await recordFailure(supabase, {
      run_id: body.run_id ?? null,
      kind: body.kind,
      generation_status: body.generation_status,
      failure_code: "skipped_cannot_publish_to_site",
      failure_message: "generation_status skipped cannot set published_to_site true",
      run_log: {},
    });
    logInfo("FINAL", {
      outcome: "failed",
      failure_code: "skipped_cannot_publish_to_site",
      audit_id: audit?.id ?? null,
      run_id: body.run_id ?? null,
    });
    return jsonResponse(
      {
        ok: false,
        publish_status: "failed" as PublishStatus,
        audit_id: audit?.id ?? null,
        error: "skipped runs cannot set published_to_site true",
      },
      400,
    );
  }

  const siteLen = (body.site_markdown ?? "").length;
  const run_log = {
    ...(typeof body.run_log === "object" && body.run_log !== null ? body.run_log : {}),
    edge_received_at: new Date().toISOString(),
    edge_function: "publish-desk-publication",
    final_status: publishStatus,
  };

  logInfo("INGEST", {
    publish_status: publishStatus,
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
    publish_status: publishStatus,
    published_to_site: published,
    site_markdown: body.site_markdown ?? null,
    newsletter_markdown: body.newsletter_markdown ?? null,
    email_subject: body.email_subject ?? null,
    email_preview_text: body.email_preview_text ?? null,
    social_linkedin: body.social_linkedin ?? null,
    social_bluesky: body.social_bluesky ?? null,
    social_x: body.social_x ?? null,
    social_instagram: body.social_instagram ?? null,
    social_facebook: body.social_facebook ?? null,
    failure_code: null as string | null,
    failure_message: null as string | null,
    run_log,
  };

  const { data, error } = await supabase.from("wdiwf_desk_publications").insert(row).select("id, created_at").single();

  if (error) {
    const audit = await recordFailure(supabase, {
      run_id: body.run_id ?? null,
      kind: body.kind,
      generation_status: body.generation_status,
      failure_code: "db_insert_error",
      failure_message: error.message.slice(0, 2000),
      run_log: { supabase_code: error.code ?? null, attempted_publish_status: publishStatus },
    });
    logInfo("FINAL", {
      outcome: "failed",
      failure_code: "db_insert_error",
      audit_id: audit?.id ?? null,
      run_id: body.run_id ?? null,
      message: error.message,
    });
    console.error(`${PREFIX} insert error:`, error);
    return jsonResponse(
      {
        ok: false,
        publish_status: "failed" as PublishStatus,
        audit_id: audit?.id ?? null,
        error: error.message,
      },
      500,
    );
  }

  if (publishStatus === "skipped") {
    logInfo("SKIPPED", {
      id: data.id,
      run_id: body.run_id ?? null,
      kind: body.kind,
      published_to_site: published,
      publish_status: "skipped",
    });
    logInfo("FINAL", { outcome: "skipped", id: data.id, run_id: body.run_id ?? null, kind: body.kind });
  } else {
    logInfo("SUCCESS", {
      id: data.id,
      run_id: body.run_id ?? null,
      kind: body.kind,
      published_to_site: published,
      publish_status: "success",
    });
    logInfo("FINAL", { outcome: "success", id: data.id, run_id: body.run_id ?? null, kind: body.kind });
  }

  return jsonResponse(
    {
      ok: true,
      publish_status: publishStatus,
      final_status: publishStatus,
      id: data.id,
      created_at: data.created_at,
      run_id: body.run_id ?? null,
      kind: body.kind,
      published_to_site: published,
    },
    200,
  );
});
