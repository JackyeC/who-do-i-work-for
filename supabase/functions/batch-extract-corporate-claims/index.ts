import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

  let batchSize = 8;
  try {
    const body = await req.json();
    if (body && typeof body.batchSize === "number" && body.batchSize > 0 && body.batchSize <= 20) {
      batchSize = Math.floor(body.batchSize);
    }
  } catch { /* default */ }

  const { data: candidates, error: fetchErr } = await supabase
    .from("companies")
    .select("id, name, website_url")
    .not("website_url", "is", null)
    .order("updated_at", { ascending: true })
    .limit(batchSize * 4);

  if (fetchErr) {
    return new Response(JSON.stringify({ success: false, error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const invoked: { company_id: string; name: string; claims_extracted?: number; error?: string }[] = [];
  let ran = 0;

  for (const c of candidates || []) {
    if (ran >= batchSize) break;
    const { count, error: cErr } = await supabase
      .from("company_corporate_claims")
      .select("id", { count: "exact", head: true })
      .eq("company_id", c.id);
    if (cErr) continue;
    if ((count ?? 0) > 0) continue;

    ran++;
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/extract-corporate-claims`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id: c.id, company_name: c.name }),
      });
      const payload = await r.json().catch(() => ({}));
      if (!r.ok) {
        invoked.push({ company_id: c.id, name: c.name, error: (payload as { error?: string }).error || r.statusText });
      } else {
        invoked.push({
          company_id: c.id,
          name: c.name,
          claims_extracted: (payload as { claims_extracted?: number }).claims_extracted,
        });
      }
    } catch (e: unknown) {
      invoked.push({
        company_id: c.id,
        name: c.name,
        error: e instanceof Error ? e.message : "invoke failed",
      });
    }
  }

  return new Response(JSON.stringify({ success: true, processed: ran, results: invoked }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
