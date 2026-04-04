import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resilientSearch } from "../_shared/resilient-search.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    u.hash = "";
    let out = u.toString().replace(/\/$/, "");
    return out || null;
  } catch {
    return null;
  }
}

async function urlLooksReachable(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    let res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    if (res.ok || res.status === 405 || res.status === 403) return true;
    if (res.status >= 400 && res.status < 500) {
      res = await fetch(url, { method: "GET", signal: ctrl.signal, redirect: "follow", headers: { Range: "bytes=0-0" } });
      return res.ok || res.status === 206;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function domainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function ensureAdminOrService(
  supabase: ReturnType<typeof createClient>,
  authHeader: string
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const token = authHeader.replace("Bearer ", "");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (token === serviceKey) return { ok: true };

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, status: 401, body: JSON.stringify({ success: false, error: "Unauthorized" }) };

  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  const { data: isOwner } = await supabase.rpc("has_role", { _user_id: user.id, _role: "owner" });
  if (!isAdmin && !isOwner) {
    return { ok: false, status: 403, body: JSON.stringify({ success: false, error: "Forbidden" }) };
  }
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gate = await ensureAdminOrService(supabase, authHeader);
  if (!gate.ok) {
    return new Response(gate.body, { status: gate.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let batchSize = 15;
  try {
    const body = await req.json();
    if (body && typeof body.batchSize === "number" && body.batchSize > 0 && body.batchSize <= 40) {
      batchSize = Math.floor(body.batchSize);
    }
  } catch { /* default */ }

  if (!lovableKey) {
    return new Response(JSON.stringify({ success: false, error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: companies, error: fetchErr } = await supabase
    .from("companies")
    .select("id, name, identity_matched, jackye_insight, description, website_url, company_dossiers(company_id)")
    .is("website_url", null)
    .order("name", { ascending: true })
    .limit(batchSize * 3);

  if (fetchErr) {
    return new Response(JSON.stringify({ success: false, error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eligible = (companies || []).filter((c: any) => {
    const d = c.company_dossiers;
    const hasDossier =
      d != null && (Array.isArray(d) ? d.length > 0 : typeof d === "object");
    return hasDossier || (c.jackye_insight && String(c.jackye_insight).trim()) ||
      (c.description && String(c.description).trim());
  }).slice(0, batchSize);

  const results: Record<string, unknown> = {
    processed: 0,
    applied_high_confidence: 0,
    queued_review: 0,
    skipped_no_url: 0,
    errors: [] as string[],
  };

  for (const co of eligible) {
    const name = co.name as string;
    const id = co.id as string;
    results.processed = (results.processed as number) + 1;

    let searchContent = "";
    try {
      const identityQueries = [`"${name}" official corporate website URL`];
      const { results: identityResults } = await resilientSearch(identityQueries, firecrawlKey, lovableKey);
      for (const r of identityResults) {
        searchContent += `\nURL: ${r.url}\nTitle: ${r.title}\n${r.description || ""}\n`;
      }
    } catch (e: unknown) {
      (results.errors as string[]).push(`${name}: search — ${e instanceof Error ? e.message : "error"}`);
      continue;
    }

    let identityData: Record<string, unknown> = {};
    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a company identity verification expert. Return only valid JSON." },
            {
              role: "user",
              content: `Identify the official website for "${name}" (the operating company, not Wikipedia or LinkedIn).
Return JSON:
{
  "official_name": "Full legal/official name or null",
  "website": "https canonical homepage URL or null",
  "careers_url": "careers page URL or null",
  "confidence": "high, medium, or low",
  "multiple_matches": false
}

${searchContent ? `Search results:\n${searchContent}` : "Use care."}`,
            },
          ],
        }),
      });

      if (aiResp.ok) {
        const aiData = await aiResp.json();
        const raw = aiData.choices?.[0]?.message?.content || "{}";
        const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
        identityData = JSON.parse(jsonMatch[1].trim());
      }
    } catch (e: unknown) {
      (results.errors as string[]).push(`${name}: AI — ${e instanceof Error ? e.message : "parse"}`);
      continue;
    }

    const website = normalizeWebsiteUrl(identityData.website as string | undefined);
    const careers = normalizeWebsiteUrl(identityData.careers_url as string | undefined);
    const conf = String(identityData.confidence || "low").toLowerCase();
    const multiple = Boolean(identityData.multiple_matches);

    if (!website) {
      results.skipped_no_url = (results.skipped_no_url as number) + 1;
      continue;
    }

    const reachable = await urlLooksReachable(website);
    if (!reachable) {
      await supabase.from("company_website_suggestions").delete().eq("company_id", id).eq("status", "pending");
      await supabase.from("company_website_suggestions").insert({
        company_id: id,
        suggested_url: website,
        suggested_careers_url: careers,
        confidence: "low",
        status: "pending",
        source_note: "URL did not respond to HEAD/GET; needs manual check",
      });
      results.queued_review = (results.queued_review as number) + 1;
      continue;
    }

    const applyHigh = conf === "high" && !multiple;
    const applyMedium = conf === "medium" && !multiple;

    if (applyHigh) {
      const patch: Record<string, unknown> = {
        website_url: website,
        identity_matched: true,
        record_status: "identity_matched",
        updated_at: new Date().toISOString(),
      };
      if (careers) patch.careers_url = careers;
      if (identityData.official_name && typeof identityData.official_name === "string") {
        patch.name = identityData.official_name;
      }

      await supabase.from("companies").update(patch).eq("id", id);
      await supabase.from("company_website_suggestions").delete().eq("company_id", id).eq("status", "pending");

      const domain = domainFromUrl(website);
      if (domain) {
        const { error: domErr } = await supabase.from("company_domains").insert({
          company_id: id,
          domain,
          is_primary: true,
          verified: true,
        });
        if (domErr && !String(domErr.message).includes("duplicate")) {
          console.warn("[backfill-company-websites] company_domains insert:", domErr.message);
        }
      }

      results.applied_high_confidence = (results.applied_high_confidence as number) + 1;
    } else if (applyMedium || conf === "low" || multiple) {
      await supabase.from("company_website_suggestions").delete().eq("company_id", id).eq("status", "pending");
      const ins = await supabase.from("company_website_suggestions").insert({
        company_id: id,
        suggested_url: website,
        suggested_careers_url: careers,
        confidence: applyMedium ? "medium" : conf === "high" && multiple ? "low" : conf === "medium" ? "medium" : "low",
        status: "pending",
        source_note: multiple
          ? "Multiple possible matches"
          : applyMedium
          ? "Medium-confidence AI match; approve in Founder Console"
          : "Low-confidence AI match",
      });
      if (ins.error) (results.errors as string[]).push(`${name}: queue — ${ins.error.message}`);
      results.queued_review = (results.queued_review as number) + 1;
    }
  }

  return new Response(JSON.stringify({ success: true, ...results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
