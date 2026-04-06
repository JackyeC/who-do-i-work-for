/**
 * Email Dossier — Sends the interview prep dossier to the user via email
 *
 * Accepts a dossier_id, formats a professional email with summary,
 * and logs to dream_job_email_log.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ------------------------------------------------------------------ */
/*  Email formatting                                                   */
/* ------------------------------------------------------------------ */

function formatDossierEmail(dossier: any): { subject: string; html: string; text: string } {
  const subject = `Your Interview Prep Kit — ${dossier.company_name} — ${dossier.job_title}`;

  const overview = dossier.company_overview || {};
  const integrity = dossier.integrity_snapshot || {};
  const salary = dossier.salary_benchmarks || {};
  const questions = dossier.interview_questions || {};
  const checklist = dossier.preparation_checklist || {};
  const timeline = dossier.follow_up_timeline || {};

  const integrityScore = integrity.overall_score ?? "N/A";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a0e; color: #f0ebe0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { max-width: 640px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; padding: 32px 0; border-bottom: 1px solid rgba(240,192,64,0.2); }
    .logo { color: #f0c040; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }
    h1 { color: #f0ebe0; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 16px 0 8px; }
    h2 { color: #f0c040; font-size: 18px; font-weight: 700; margin: 32px 0 12px; letter-spacing: -0.5px; }
    .subtitle { color: #a0a0a0; font-size: 14px; }
    .card { background: #13121a; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid rgba(240,192,64,0.1); }
    .score-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .score-label { color: #a0a0a0; font-size: 13px; }
    .score-value { color: #f0c040; font-weight: 700; font-size: 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-gold { background: rgba(240,192,64,0.15); color: #f0c040; }
    ul { padding-left: 20px; }
    li { color: #c0c0c0; font-size: 14px; line-height: 1.8; }
    .cta { display: inline-block; background: #f0c040; color: #0a0a0e; padding: 14px 32px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; margin: 24px 0; }
    .footer { text-align: center; padding: 32px 0; border-top: 1px solid rgba(240,192,64,0.1); margin-top: 40px; }
    .footer p { color: #666; font-size: 12px; }
    .footer .tagline { color: #f0c040; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Who Do I Work For?</div>
      <h1>Your Interview Prep Kit</h1>
      <p class="subtitle">${dossier.job_title} at ${dossier.company_name}</p>
    </div>

    <h2>🏢 Company Overview</h2>
    <div class="card">
      <p style="color: #f0ebe0; font-size: 14px; line-height: 1.7;">
        ${overview.mission || "Company intelligence is being gathered."}
      </p>
      ${overview.industry ? `<p style="color: #a0a0a0; font-size: 13px;">Industry: ${overview.industry}</p>` : ""}
      ${overview.headquarters ? `<p style="color: #a0a0a0; font-size: 13px;">HQ: ${overview.headquarters}</p>` : ""}
    </div>

    <h2>🛡️ WDIWF Integrity Score</h2>
    <div class="card">
      <div style="text-align: center; margin-bottom: 16px;">
        <span class="badge badge-gold">${integrityScore}/100</span>
      </div>
      ${integrity.pillars ? `
      <div class="score-row">
        <span class="score-label">Integrity Gap</span>
        <span class="score-value">${integrity.pillars.integrity_gap?.score ?? "—"}</span>
      </div>
      <div class="score-row">
        <span class="score-label">Labor Impact</span>
        <span class="score-value">${integrity.pillars.labor_impact?.score ?? "—"}</span>
      </div>
      <div class="score-row">
        <span class="score-label">Safety Alert</span>
        <span class="score-value">${integrity.pillars.safety_alert?.score ?? "—"}</span>
      </div>
      <div class="score-row" style="border-bottom: none;">
        <span class="score-label">Connected Dots</span>
        <span class="score-value">${integrity.pillars.connected_dots?.score ?? "—"}</span>
      </div>
      ` : ""}
    </div>

    <h2>💰 Salary Benchmarks</h2>
    <div class="card">
      ${salary.market_range ? `
      <div class="score-row">
        <span class="score-label">Market Low</span>
        <span class="score-value">$${(salary.market_range.low || 0).toLocaleString()}</span>
      </div>
      <div class="score-row">
        <span class="score-label">Market Median</span>
        <span class="score-value">$${(salary.market_range.median || 0).toLocaleString()}</span>
      </div>
      <div class="score-row" style="border-bottom: none;">
        <span class="score-label">Market High</span>
        <span class="score-value">$${(salary.market_range.high || 0).toLocaleString()}</span>
      </div>
      ` : "<p style='color: #a0a0a0;'>Salary data being compiled</p>"}
    </div>

    <h2>🎯 Key Interview Questions</h2>
    <div class="card">
      <p style="color: #a0a0a0; font-size: 13px; margin-bottom: 12px;">Top company-specific questions to prepare for:</p>
      <ul>
        ${(questions.company_specific || []).slice(0, 5).map((q: any) =>
          `<li>${typeof q === "string" ? q : q.question || ""}</li>`
        ).join("")}
      </ul>
    </div>

    <h2>✅ Quick Prep Checklist</h2>
    <div class="card">
      <ul>
        ${(checklist.before_interview || []).slice(0, 5).map((item: any) =>
          `<li>☐ ${item.task || item}</li>`
        ).join("")}
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${Deno.env.get("SITE_URL") || "https://whodoimworkfor.com"}/dream-jobs/${dossier.search_result_id}" class="cta">
        View Full Dossier →
      </a>
    </div>

    <p style="text-align: center; color: #a0a0a0; font-size: 13px;">
      Your complete dossier includes all 11 sections: company overview, integrity snapshot,
      role analysis, tailored resume tips, cover letter, interview questions,
      salary benchmarks, preparation checklist, references template,
      thank-you email draft, and follow-up timeline.
    </p>

    <div class="footer">
      <p class="tagline">"Check the receipts. Then apply."</p>
      <p>Generated by Who Do I Work For? — Your career intelligence platform.</p>
      <p>You received this email because you have an active WDIWF Dream Job agent.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
YOUR INTERVIEW PREP KIT
${dossier.job_title} at ${dossier.company_name}
${"=".repeat(50)}

COMPANY OVERVIEW
${overview.mission || "Company intelligence is being gathered."}
${overview.industry ? `Industry: ${overview.industry}` : ""}

WDIWF INTEGRITY SCORE: ${integrityScore}/100

SALARY BENCHMARKS
${salary.market_range ? `Market Range: $${salary.market_range.low?.toLocaleString()} - $${salary.market_range.high?.toLocaleString()}` : "Being compiled"}

TOP INTERVIEW QUESTIONS
${(questions.company_specific || []).slice(0, 5).map((q: any, i: number) =>
    `${i + 1}. ${typeof q === "string" ? q : q.question || ""}`
  ).join("\n")}

QUICK PREP CHECKLIST
${(checklist.before_interview || []).slice(0, 5).map((item: any) =>
    `☐ ${item.task || item}`
  ).join("\n")}

View your complete dossier at: ${Deno.env.get("SITE_URL") || "https://whodoimworkfor.com"}/dream-jobs/${dossier.search_result_id}

---
"Check the receipts. Then apply."
Generated by Who Do I Work For?
`;

  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dossier_id } = await req.json();

    if (!dossier_id) {
      return new Response(
        JSON.stringify({ success: false, error: "dossier_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // ── Load dossier ──
    const { data: dossier, error: dErr } = await sb
      .from("dream_job_dossiers")
      .select("*")
      .eq("id", dossier_id)
      .single();

    if (dErr || !dossier) {
      return new Response(
        JSON.stringify({ success: false, error: "Dossier not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Get user email ──
    const { data: userData } = await sb.auth.admin.getUserById(dossier.user_id);
    const userEmail = userData?.user?.email;

    if (!userEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User email not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Format email ──
    const { subject, html, text } = formatDossierEmail(dossier);

    // ── Send email via Resend or SMTP ──
    let emailSent = false;
    let errorMessage = "";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from:
              Deno.env.get("EMAIL_FROM") ||
              "WDIWF Dream Jobs <noreply@whodoimworkfor.com>",
            to: [userEmail],
            subject,
            html,
            text,
          }),
        });

        if (resp.ok) {
          emailSent = true;
        } else {
          const errData = await resp.json();
          errorMessage = errData.message || `Resend API error: ${resp.status}`;
        }
      } catch (err) {
        errorMessage =
          err instanceof Error ? err.message : "Email send failed";
      }
    } else {
      // Fallback: use Supabase built-in email if configured
      // or log that no email provider is configured
      errorMessage =
        "No email provider configured. Set RESEND_API_KEY environment variable.";
      console.warn("[email-dossier]", errorMessage);
    }

    // ── Log to email_log ──
    await sb.from("dream_job_email_log").insert({
      user_id: dossier.user_id,
      dossier_id,
      recipient_email: userEmail,
      subject,
      status: emailSent ? "sent" : "failed",
      sent_at: emailSent ? new Date().toISOString() : null,
      error_message: emailSent ? null : errorMessage,
    });

    // ── Update search result ──
    if (emailSent) {
      await sb
        .from("dream_job_search_results")
        .update({
          dossier_emailed: true,
          dossier_emailed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", dossier.search_result_id);
    }

    return new Response(
      JSON.stringify({
        success: emailSent,
        message: emailSent
          ? `Dossier emailed to ${userEmail}`
          : `Email failed: ${errorMessage}`,
        recipient: userEmail,
        subject,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[email-dossier] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
