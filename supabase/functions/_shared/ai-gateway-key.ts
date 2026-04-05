/**
 * OpenAI-compatible chat completions + related APIs.
 * Prefer AI_GATEWAY_API_KEY in new deployments; LOVABLE_API_KEY remains supported for existing Supabase secrets.
 */
export function getAiGatewayKey(): string | undefined {
  return Deno.env.get("AI_GATEWAY_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
}
