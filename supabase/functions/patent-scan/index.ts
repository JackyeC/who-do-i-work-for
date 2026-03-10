import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function searchGooglePatents(companyName: string): Promise<{ totalResults: number; titles: string[]; links: string[] }> {
  const query = encodeURIComponent(`"${companyName}"`);

  try {
    const response = await fetch(`https://patents.google.com/?q=${query}&oq=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    const html = await response.text();

    // Extract patent titles from search results
    const titleRegex = /<span class="style-scope search-result-item" id="htmlContent">(.*?)<\/span>/g;
    const linkRegex = /data-result="(.*?)"/g;
    const countRegex = /About ([\d,]+) results/;

    const titles: string[] = [];
    const links: string[] = [];
    let match;

    while ((match = titleRegex.exec(html)) !== null && titles.length < 10) {
      const title = match[1].replace(/<[^>]*>/g, '').trim();
      if (title && title.length > 5) titles.push(title);
    }

    while ((match = linkRegex.exec(html)) !== null && links.length < 10) {
      links.push(`https://patents.google.com/patent/${match[1]}`);
    }

    const countMatch = countRegex.exec(html);
    const totalResults = countMatch ? parseInt(countMatch[1].replace(/,/g, '')) : titles.length;

    return { totalResults, titles: titles.slice(0, 10), links: links.slice(0, 10) };
  } catch (error) {
    console.error("Google Patents scrape error:", error);
    return { totalResults: 0, titles: [], links: [] };
  }
}

async function categorizeWithLLM(companyName: string, patentTitles: string[]): Promise<Array<{ theme: string; count: number; examples: string[] }>> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey || patentTitles.length === 0) return [];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an innovation analyst. Return only valid JSON arrays." },
          {
            role: "user",
            content: `Given the following patent titles from "${companyName}", categorize them into Innovation Clusters.\n\nPatent titles:\n${patentTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nReturn a JSON array of clusters. Each cluster:\n- "theme": concise category (e.g. "Artificial Intelligence", "Biotech", "Supply Chain")\n- "count": number of patents in cluster\n- "examples": array of patent titles in this cluster\n\nReturn ONLY the JSON array.`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return [{ theme: "General Innovation", count: patentTitles.length, examples: patentTitles.slice(0, 5) }];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("LLM categorization error:", error);
    return [{ theme: "General Innovation", count: patentTitles.length, examples: patentTitles.slice(0, 5) }];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();

    if (!companyName) {
      return new Response(
        JSON.stringify({ error: "Missing companyName" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching patents for: ${companyName}`);

    // Step 1: Search Google Patents
    let { totalResults, titles, links } = await searchGooglePatents(companyName);

    // Retry with simplified name
    if (titles.length === 0) {
      const simpleName = companyName.replace(/,?\s*(Inc\.?|Corp\.?|LLC|Ltd\.?|Company|Co\.)$/i, '').trim();
      const retry = await searchGooglePatents(simpleName);
      totalResults = retry.totalResults;
      titles = retry.titles;
      links = retry.links;
    }

    if (titles.length === 0) {
      return new Response(
        JSON.stringify({ totalResults: 0, clusters: [], topPatents: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: AI categorization
    const clusters = await categorizeWithLLM(companyName, titles);

    return new Response(
      JSON.stringify({
        totalResults,
        clusters,
        topPatents: titles.map((t, i) => ({ title: t, url: links[i] || null })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Patent scan error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
