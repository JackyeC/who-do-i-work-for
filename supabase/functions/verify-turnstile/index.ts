const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    // Frontend uses { token }. HTML forms / other clients may send cf-turnstile-response.
    const token =
      typeof body?.token === "string" && body.token.trim()
        ? body.token.trim()
        : typeof body?.["cf-turnstile-response"] === "string" && body["cf-turnstile-response"].trim()
          ? body["cf-turnstile-response"].trim()
          : typeof body?.cfTurnstileResponse === "string" && body.cfTurnstileResponse.trim()
            ? body.cfTurnstileResponse.trim()
            : "";

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };

    return new Response(
      JSON.stringify({
        success: result.success === true,
        ...(result.success ? {} : { errorCodes: result["error-codes"] ?? [] }),
      }),
      {
        status: result.success ? 200 : 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("Turnstile verification error:", err);
    return new Response(JSON.stringify({ success: false, error: "Verification failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
