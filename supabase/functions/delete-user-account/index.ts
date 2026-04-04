import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { serviceClient } from "../_shared/quota.ts";

const ACCOUNT_DELETE_CONFIRMATION = "DELETE_MY_WDIWF_ACCOUNT";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authGate = await requireUser(req, corsHeaders);
  if (!authGate.ok) return authGate.response;

  let body: { confirmation?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (body.confirmation !== ACCOUNT_DELETE_CONFIRMATION) {
    return new Response(
      JSON.stringify({
        error: "Invalid confirmation. You must submit the exact confirmation phrase shown in the app.",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const userId = authGate.user.id;
  const supabase = serviceClient();

  const { data: careerFiles } = await supabase.storage.from("career_docs").list(userId);
  if (careerFiles?.length) {
    await supabase.storage.from("career_docs").remove(careerFiles.map((f) => `${userId}/${f.name}`));
  }

  const { data: offerFiles } = await supabase.storage.from("offer-letters").list(userId);
  if (offerFiles?.length) {
    await supabase.storage.from("offer-letters").remove(offerFiles.map((f) => `${userId}/${f.name}`));
  }

  await supabase.from("user_documents").delete().eq("user_id", userId);
  await supabase.from("offer_scores").delete().eq("user_id", userId);
  await supabase.from("offer_records").delete().eq("user_id", userId);
  await supabase.from("offer_letter_reviews").delete().eq("user_id", userId);
  await supabase.from("user_career_profile").delete().eq("user_id", userId);
  await supabase.from("job_alerts").delete().eq("user_id", userId);
  await supabase.from("user_offer_preferences").delete().eq("user_id", userId);

  const { error: delError } = await supabase.auth.admin.deleteUser(userId);
  if (delError) {
    console.error("auth.admin.deleteUser error:", delError);
    return new Response(
      JSON.stringify({ error: "Could not complete account deletion. Please contact support." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
