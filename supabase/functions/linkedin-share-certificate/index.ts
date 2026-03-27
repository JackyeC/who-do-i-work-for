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
    const { data: linkedinProfile, error: profileError } = await supabase
      .from("linkedin_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !linkedinProfile) {
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
    if (new Date(linkedinProfile.expires_at) < new Date()) {
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
    const { playerName, certName, certBadge, score, insightQuote, imageBase64 } = body;

    logStep("Preparing LinkedIn post", { certName, playerName });

    const personUrn = `urn:li:person:${linkedinProfile.linkedin_id}`;
    const accessToken = linkedinProfile.access_token;

    // Build post text
    const postText = `🏆 I just earned the "${certName}" ${certBadge} certification in PeoplePuzzles™ by @Jackye Clayton!

"${insightQuote}"

Score: ${score || "Certified"}
Player: ${playerName}

Think you know how companies REALLY operate? Play the game and find out. 👇
https://wdiwf.jackyeclayton.com/peoplepuzzles

#PeoplePuzzles #WDIWF #TalentAcquisition #Recruiting #HRTech #CareerIntelligence`;

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
