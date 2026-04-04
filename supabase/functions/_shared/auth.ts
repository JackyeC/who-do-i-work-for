import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuthedUser = { id: string; email?: string | null };

export type RequireUserResult =
  | { ok: true; user: AuthedUser; authHeader: string }
  | { ok: false; response: Response };

/**
 * Validates Authorization: Bearer <user JWT> and returns the Supabase user.
 * Use on functions with verify_jwt = false so all auth logic stays explicit.
 */
export async function requireUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<RequireUserResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  return { ok: true, user, authHeader };
}
