import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { AuthedUser } from "./auth.ts";

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key);
}

export type QuotaResult =
  | { ok: true; service: SupabaseClient }
  | { ok: false; response: Response };

/**
 * Rolling 24h quota using public.user_usage (service role).
 */
export async function enforceDailyQuota(
  user: AuthedUser,
  functionName: string,
  dailyLimit: number,
  corsHeaders: Record<string, string>,
): Promise<QuotaResult> {
  let service: SupabaseClient;
  try {
    service = serviceClient();
  } catch {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await service
    .from("user_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("function_name", functionName)
    .gte("used_at", since);

  if (error) {
    console.error("quota lookup error:", error);
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Quota check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  if ((count ?? 0) >= dailyLimit) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: `Daily usage limit reached (${dailyLimit} requests per 24 hours for this feature).`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      ),
    };
  }

  return { ok: true, service };
}

export async function recordUsage(
  service: SupabaseClient,
  userId: string,
  functionName: string,
): Promise<void> {
  await service.from("user_usage").insert({ user_id: userId, function_name: functionName });
}
