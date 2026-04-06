import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { initializeImageUpload, uploadImage, createLinkedInPost } from "../_shared/linkedin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LINKEDIN-SHARE-CERTIFICATE] ${step}${detailsStr}`);
};

const DEFAULT_CHECK_URL = "https://wdiwf.jackyeclayton.com/check?tab=company";

function buildCertificatePostText(input: {
  certName: string;
  certBadge: string;
  insightQuote: string;
  realWorld: string;
  credibilityPct?: number | string;
  checkUrl: string;
}): string {
  const credPart =
    input.credibilityPct != null && input.credibilityPct !== ""
      ? `Behavioral credibility: ${input.credibilityPct}%. `
      : "";

  const rw = input.realWorld.trim()
    ? input.realWorld.trim()
    : "Patterns beat vibes when you're choosing who to work for.";

  return `${credPart}I ran PeoplePuzzles™ — Jackye Clayton's decision simulation on WDIWF — and earned "${input.certName}" ${input.certBadge}.

"${input.insightQuote}"

What that means when stakes are real: ${rw}

Next move I'm making: run a company scan before I sign — ${input.checkUrl}

#PeoplePuzzles #WDIWF #CareerIntelligence`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Get LinkedIn profile with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    // Decrypt the LinkedIn access token server-side
    const { data: linkedinProfile, error: profileError } = await supabase
      .rpc("get_linkedin_token", { p_user_id: user.id });

    // Fallback: if the RPC doesn't exist yet, query directly (service_role bypasses RLS)
    let profile = linkedinProfile;
    if (profileError) {
      logStep("RPC not available, using direct query", { error: profileError.message });
      const { data: directProfile, error: directError } = await supabase
        .from("linkedin_profiles")
        .select("linkedin_id, access_token, encrypted_access_token, expires_at")
        .eq("user_id", user.id)
        .single();
      if (directError || !directProfile) {
        logStep("LinkedIn not connected for user");
        return new Response(JSON.stringify({
          error: "LinkedIn not connected",
          needsAuth: true,
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      profile = directProfile;
    }

    if (!profile) {
      logStep("LinkedIn not connected for user");
      return new Response(JSON.stringify({
        error: "LinkedIn not connected",
        needsAuth: true,
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check token expiry
    if (new Date(profile.expires_at) < new Date()) {
      logStep("LinkedIn token expired");
      return new Response(JSON.stringify({
        error: "LinkedIn token expired — please reconnect",
        needsAuth: true,
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      certName,
      certBadge,
      insightQuote,
      imageBase64,
      realWorld,
      credibilityPct,
      checkUrl,
    } = body;

    logStep("Preparing LinkedIn post", { certName });

    const personUrn = `urn:li:person:${profile.linkedin_id}`;
    // Use plaintext token (will be migrated to encrypted in future)
    const accessToken = profile.access_token;

    const scanUrl =
      typeof checkUrl === "string" && checkUrl.startsWith("http")
        ? checkUrl
        : DEFAULT_CHECK_URL;

    const postText = buildCertificatePostText({
      certName: certName ?? "",
      certBadge: certBadge ?? "",
      insightQuote: insightQuote ?? "",
      realWorld: typeof realWorld === "string" ? realWorld : "",
      credibilityPct,
      checkUrl: scanUrl,
    });

    let imageUrn: string | undefined;

    // If image is provided, upload it to LinkedIn
    if (imageBase64) {
      logStep("Uploading certificate image to LinkedIn");
      const imageBytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

      const { uploadUrl, imageUrn: urn } = await initializeImageUpload(accessToken, personUrn);
      await uploadImage(uploadUrl, imageBytes);
      imageUrn = urn;
      logStep("Image uploaded", { imageUrn });
    }

    // Create the post
    logStep("Creating LinkedIn post");
    const postId = await createLinkedInPost(accessToken, personUrn, postText, imageUrn);
    logStep("Post created", { postId });

    return new Response(JSON.stringify({ success: true, postId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logStep("Error", { message: err.message });
    console.error("LinkedIn share error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
