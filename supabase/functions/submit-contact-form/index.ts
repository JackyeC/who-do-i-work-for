import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const NOTIFY_TO = "jackye@jackyeclayton.com";

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: controller.signal,
    });
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const token =
      typeof body?.token === "string" && body.token.trim()
        ? body.token.trim()
        : typeof body?.["cf-turnstile-response"] === "string" && body["cf-turnstile-response"].trim()
          ? body["cf-turnstile-response"].trim()
          : "";

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : "General";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!token || !name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const turnstileOk = await verifyTurnstile(token);
    if (!turnstileOk) {
      return new Response(JSON.stringify({ error: "Turnstile verification failed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const subject = `Who Do I Work For Contact: ${reason}`;
    const { data: row, error: insertError } = await sb
      .from("contact_submissions")
      .insert({
        name,
        email,
        subject,
        message,
        email_sent: false,
      })
      .select("id")
      .single();

    if (insertError || !row?.id) {
      console.error("contact_submissions insert:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const from =
      Deno.env.get("RESEND_FROM")?.trim() ||
      "Who Do I Work For <onboarding@resend.dev>";

    const mailSubject = `[WDIWF Contact] ${reason} — ${name}`;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeReason = escapeHtml(reason);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
<p><strong>New contact form submission</strong></p>
<p><strong>Name:</strong> ${safeName}<br/>
<strong>Email:</strong> <a href="mailto:${encodeURIComponent(email)}">${safeEmail}</a><br/>
<strong>Reason:</strong> ${safeReason}</p>
<p><strong>Message:</strong></p>
<p>${safeMessage}</p>
<hr/><p style="color:#666;font-size:12px">Submission id: ${row.id}</p>
</body></html>`;

    const text = `New contact form submission\n\nName: ${name}\nEmail: ${email}\nReason: ${reason}\n\nMessage:\n${message}\n`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [NOTIFY_TO],
        reply_to: email,
        subject: mailSubject,
        html,
        text,
      }),
    });

    const resendJson = (await resendRes.json().catch(() => ({}))) as Record<string, unknown>;
    if (!resendRes.ok) {
      console.error("Resend error", resendRes.status, resendJson);
      return new Response(
        JSON.stringify({
          error: "Your message was saved, but we could not send the notification email. Please email us directly.",
          id: row.id,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: updateError } = await sb
      .from("contact_submissions")
      .update({ email_sent: true })
      .eq("id", row.id);

    if (updateError) {
      console.error("email_sent update failed:", updateError);
    }

    return new Response(JSON.stringify({ success: true, id: row.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-contact-form:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
