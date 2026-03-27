import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getLinkedInAuthUrl } from "../_shared/linkedin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LINKEDIN-AUTH] ${step}${detailsStr}`);
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    if (!clientId) throw new Error("LINKEDIN_CLIENT_ID not configured");

    const url = new URL(req.url);
    const returnTo = url.searchParams.get("return_to") || "/";

    const baseUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://wdiwf.jackyeclayton.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const redirectUri = `${supabaseUrl}/functions/v1/linkedin-callback`;

    // Generate state with return_to encoded
    const state = btoa(JSON.stringify({
      nonce: crypto.randomUUID(),
      return_to: returnTo,
    }));

    const authUrl = getLinkedInAuthUrl(clientId, redirectUri, state);

    logStep("Redirecting to LinkedIn", { returnTo });

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: authUrl,
      },
    });
  } catch (err) {
    logStep("Error", { message: err.message });
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
