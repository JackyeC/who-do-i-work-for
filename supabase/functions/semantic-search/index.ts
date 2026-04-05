import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";
import { enforceDailyQuota, recordUsage } from "../_shared/quota.ts";

const FUNCTION_NAME = "semantic-search";
const DAILY_LIMIT = 60;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authGate = await requireUser(req, corsHeaders);
  if (!authGate.ok) return authGate.response;
  const { user } = authGate;

  const quotaGate = await enforceDailyQuota(user, FUNCTION_NAME, DAILY_LIMIT, corsHeaders);
  if (!quotaGate.ok) return quotaGate.response;
  const usageClient = quotaGate.service;

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmed = query.trim();
    if (trimmed.length > 500) {
      return new Response(JSON.stringify({ error: "query too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI gateway key is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a job search query expander. Given a user's search query, return a JSON object with expanded search terms.

Rules:
- Expand abbreviations (PM → Project Manager, SWE → Software Engineer, DE → Data Engineer)
- Add related job titles (Product Manager → also Program Manager, Product Owner)
- Add related skills (React → JavaScript, TypeScript, Frontend)
- Add industry synonyms (Healthcare → Health, Medical, Pharma)
- Keep it concise — max 10 expanded terms total
- Return ONLY valid JSON, no explanation

Response format:
{"expandedTerms": ["term1", "term2", ...], "relatedTitles": ["title1", "title2", ...]}`,
          },
          { role: "user", content: trimmed },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "expand_search",
              description: "Return expanded search terms for a job search query",
              parameters: {
                type: "object",
                properties: {
                  expandedTerms: {
                    type: "array",
                    items: { type: "string" },
                    description: "Expanded keywords and synonyms",
                  },
                  relatedTitles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Related job titles",
                  },
                },
                required: ["expandedTerms", "relatedTitles"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "expand_search" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    await recordUsage(usageClient, user.id, FUNCTION_NAME);

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ expandedTerms: [trimmed], relatedTitles: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error("semantic-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
