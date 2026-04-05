import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// One-time purchase prices (not subscriptions)
const ONE_TIME_PRICES = new Set([
  "price_1TEEvz89MyCOs8yvWbLINfKw", // The Dossier $199 (one-time deep-dive)
  "price_1TCTQW7Qj0W6UtN9eFTxOpYg", // Career Strategy Session $350
  "price_1TCTQX7Qj0W6UtN9T019lM6x", // Offer Review Intensive $275
  "price_1TEGpC89MyCOs8yvhPDDHF8l",  // Career Fit Report $49
]);

// Subscription prices (recurring)
const SUBSCRIPTION_PRICES = new Set([
  "price_1TEEvt89MyCOs8yv7SV1TeUJ", // The Signal (Pro) $19/mo
  "price_1TF2Wd89MyCOs8yv0GXHpkUE", // The Signal annual $182/yr
  "price_1TF2WU89MyCOs8yvobpafjEl", // The Analyst $49/mo
  "price_1TF2WU89MyCOs8yvfUHZOfuD", // The Analyst annual $470/yr
  "price_1TF2WU89MyCOs8yvodXAgyVX", // The Brief $99/mo
  "price_1TF2WU89MyCOs8yvS5zZrwjy", // The Brief annual $950/yr
  "price_1TEEw589MyCOs8yvQI8FpHJx", // The Executive $999/yr
  "price_1T9Tvd7Qj0W6UtN9EbbU1EOn", // Auto-Apply add-on (~$9/mo)
]);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const body = await req.json();
    const priceId = body?.priceId;
    if (typeof priceId !== "string" || !priceId.trim()) {
      return new Response(JSON.stringify({ error: "priceId is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    const briefingRoomPrice = Deno.env.get("STRIPE_BRIEFING_ROOM_PRICE_ID")?.trim() || "";
    const allowed =
      ONE_TIME_PRICES.has(priceId) ||
      SUBSCRIPTION_PRICES.has(priceId) ||
      (briefingRoomPrice.length > 0 && priceId === briefingRoomPrice);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    function foundingYearMonth(): { y: number; m: number } {
      const y = parseInt(Deno.env.get("BRIEFING_ROOM_FOUNDING_YEAR") || "", 10);
      const m = parseInt(Deno.env.get("BRIEFING_ROOM_FOUNDING_MONTH") || "4", 10);
      const year = Number.isFinite(y) && y >= 2020 && y <= 2100 ? y : new Date().getUTCFullYear();
      const month = Number.isFinite(m) && m >= 1 && m <= 12 ? m : 4;
      return { y: year, m: month };
    }

    function isoInFoundingMonth(iso: string | undefined, y: number, m: number): boolean {
      if (!iso) return false;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return false;
      return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
    }

    const isBriefingRoom = briefingRoomPrice.length > 0 && priceId === briefingRoomPrice;
    if (isBriefingRoom) {
      const limitToLaunchAudience =
        Deno.env.get("BRIEFING_ROOM_JOINERS_ONLY")?.trim().toLowerCase() !== "false";
      if (limitToLaunchAudience) {
        const { y, m } = foundingYearMonth();
        const authInFounding = isoInFoundingMonth(user.created_at, y, m);

        let earlyAccessInFounding = false;
        if (!authInFounding) {
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          if (serviceKey && supabaseUrl) {
            const admin = createClient(supabaseUrl, serviceKey);
            const email = user.email.trim().toLowerCase();
            const start = new Date(Date.UTC(y, m - 1, 1));
            const end = m === 12 ? new Date(Date.UTC(y + 1, 0, 1)) : new Date(Date.UTC(y, m, 1));
            const { data: ea } = await admin
              .from("early_access_signups")
              .select("id")
              .eq("email", email)
              .gte("created_at", start.toISOString())
              .lt("created_at", end.toISOString())
              .maybeSingle();
            earlyAccessInFounding = !!ea;
          }
        }

        if (!authInFounding && !earlyAccessInFounding) {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const label = monthNames[m - 1] ?? "April";
          return new Response(
            JSON.stringify({
              error:
                `The Reset Room (Founding Supporters) rate is only for people who joined in ${label} ${y}. Questions? hello@jackyeclayton.com`,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 },
          );
        }
      }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!stripeKey.startsWith("sk_live_")) {
      console.warn("[CREATE-CHECKOUT] WARNING: STRIPE_SECRET_KEY is not a live key");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "";
    const isOneTime = ONE_TIME_PRICES.has(priceId);
    const successUrl = `${origin}/dashboard?checkout=success`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isOneTime ? "payment" : "subscription",
      success_url: successUrl,
      cancel_url: `${origin}/dashboard?checkout=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
