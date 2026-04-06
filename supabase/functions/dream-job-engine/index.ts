/**
 * Dream Job Engine — Core matching & auto-apply pipeline
 *
 * Accepts a user_id, reads their career profile and auto-apply settings,
 * searches for matching jobs via web search, scores them, stores results,
 * and for Auto Mode users queues approved jobs + generates dossiers.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface CareerProfile {
  id: string;
  user_id: string;
  preferred_titles: string[];
  preferred_industries: string[];
  preferred_locations: string[];
  salary_min: number | null;
  salary_max: number | null;
  work_mode_preference: string | null;
  top_skills: string[];
  core_values: string[];
  min_integrity_score: number;
  blocked_companies: string[];
  blocked_industries: string[];
  resume_url: string | null;
}

interface AutoApplySettings {
  is_enabled: boolean;
  mode: string; // 'auto', 'hybrid', 'review'
  min_alignment_threshold: number;
  max_daily_applications: number;
  is_paused: boolean;
}

interface JobListing {
  title: string;
  company: string;
  location: string;
  salary_range: string;
  work_mode: string;
  description: string;
  source: string;
  source_url: string;
  posted_date: string;
}

/** Build search queries from the user's career profile */
function buildSearchQueries(profile: CareerProfile): string[] {
  const queries: string[] = [];
  const titles = profile.preferred_titles?.length
    ? profile.preferred_titles
    : ["software engineer"];
  const locations = profile.preferred_locations?.length
    ? profile.preferred_locations
    : ["remote"];

  for (const title of titles.slice(0, 3)) {
    for (const loc of locations.slice(0, 2)) {
      queries.push(`${title} jobs ${loc} hiring now 2025`);
    }
  }

  // Add industry-specific queries
  if (profile.preferred_industries?.length) {
    for (const industry of profile.preferred_industries.slice(0, 2)) {
      queries.push(
        `${titles[0]} ${industry} jobs ${locations[0]} open positions`
      );
    }
  }

  return queries;
}

/** Search for jobs using web search via fetch */
async function searchJobs(queries: string[]): Promise<JobListing[]> {
  const results: JobListing[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    try {
      // Use Brave Search API if available, fallback to SerpAPI patterns
      const braveKey = Deno.env.get("BRAVE_SEARCH_API_KEY");
      const serpApiKey = Deno.env.get("SERPAPI_KEY");

      let searchResults: any[] = [];

      if (braveKey) {
        const resp = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Encoding": "gzip",
              "X-Subscription-Token": braveKey,
            },
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          searchResults = data.web?.results || [];
        }
      } else if (serpApiKey) {
        const resp = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&engine=google_jobs&num=10`
        );
        if (resp.ok) {
          const data = await resp.json();
          searchResults =
            data.jobs_results ||
            data.organic_results ||
            [];
        }
      } else {
        // Fallback: use Google Custom Search if configured
        const googleApiKey = Deno.env.get("GOOGLE_SEARCH_API_KEY");
        const cx = Deno.env.get("GOOGLE_SEARCH_CX");
        if (googleApiKey && cx) {
          const resp = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`
          );
          if (resp.ok) {
            const data = await resp.json();
            searchResults = data.items || [];
          }
        }
      }

      // Parse search results into job listings
      for (const item of searchResults) {
        const url = item.url || item.link || item.detected_extensions?.link || "";
        if (!url || seenUrls.has(url)) continue;
        seenUrls.add(url);

        const listing = parseSearchResult(item, query);
        if (listing) {
          results.push(listing);
        }
      }
    } catch (err) {
      console.error(`Search failed for query "${query}":`, err);
    }
  }

  return results;
}

/** Parse a raw search result into a JobListing */
function parseSearchResult(item: any, query: string): JobListing | null {
  // SerpAPI Google Jobs format
  if (item.title && item.company_name) {
    return {
      title: item.title,
      company: item.company_name,
      location: item.location || "",
      salary_range: item.salary || item.detected_extensions?.salary || "",
      work_mode: detectWorkMode(
        `${item.title} ${item.description || ""} ${item.location || ""}`
      ),
      description: item.description || item.snippet || "",
      source: detectSource(item.link || item.url || ""),
      source_url: item.link || item.url || item.apply_link || "",
      posted_date: item.detected_extensions?.posted_at || new Date().toISOString(),
    };
  }

  // Brave / Google Custom Search format
  const title = item.title || "";
  const snippet = item.description || item.snippet || "";
  const url = item.url || item.link || "";

  // Try to extract job info from title/snippet
  if (isJobRelated(title, snippet)) {
    const companyName = extractCompany(title, snippet);
    return {
      title: extractJobTitle(title) || query.split(" jobs")[0].trim(),
      company: companyName || "Unknown Company",
      location: extractLocation(snippet) || "",
      salary_range: extractSalary(snippet) || "",
      work_mode: detectWorkMode(`${title} ${snippet}`),
      description: snippet,
      source: detectSource(url),
      source_url: url,
      posted_date: new Date().toISOString(),
    };
  }

  return null;
}

function isJobRelated(title: string, snippet: string): boolean {
  const keywords = [
    "job",
    "hiring",
    "career",
    "position",
    "apply",
    "opening",
    "role",
    "salary",
    "remote",
    "hybrid",
    "full-time",
    "part-time",
    "contract",
    "engineer",
    "manager",
    "analyst",
    "developer",
    "designer",
    "coordinator",
  ];
  const text = `${title} ${snippet}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

function detectSource(url: string): string {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("indeed.com")) return "indeed";
  if (url.includes("glassdoor.com")) return "glassdoor";
  if (url.includes("ziprecruiter.com")) return "ziprecruiter";
  if (url.includes("lever.co") || url.includes("greenhouse.io"))
    return "career_page";
  return "web_search";
}

function detectWorkMode(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("remote")) return "remote";
  if (lower.includes("hybrid")) return "hybrid";
  return "onsite";
}

function extractCompany(title: string, snippet: string): string {
  // Try patterns like "at CompanyName", "- CompanyName", "| CompanyName"
  const patterns = [
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.,']+?)(?:\s*[-–|]|\s*$)/,
    /[-–|]\s*([A-Z][A-Za-z0-9\s&.,']+?)(?:\s*[-–|]|\s*$)/,
    /^([A-Z][A-Za-z0-9\s&.,']+?)\s+is\s+(?:hiring|looking)/,
  ];
  for (const p of patterns) {
    const m = title.match(p) || snippet.match(p);
    if (m) return m[1].trim();
  }
  return "";
}

function extractJobTitle(title: string): string {
  // Remove company / location suffixes
  return title
    .replace(/\s*[-–|].*$/, "")
    .replace(/\s*\(.*\)$/, "")
    .trim();
}

function extractLocation(text: string): string {
  const m = text.match(
    /(?:in|location[:\s]+)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/
  );
  return m ? m[1] : "";
}

function extractSalary(text: string): string {
  const m = text.match(
    /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:\/yr|\/year|per year|annually|a year))?/i
  );
  return m ? m[0] : "";
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

function scoreSkillsMatch(
  job: JobListing,
  profile: CareerProfile
): { score: number; matched: string[] } {
  const jobText =
    `${job.title} ${job.description}`.toLowerCase();
  const userSkills = (profile.top_skills || []).map((s) => s.toLowerCase());
  const userTitles = (profile.preferred_titles || []).map((t) =>
    t.toLowerCase()
  );

  let matched: string[] = [];
  let score = 0;

  // Title alignment (up to 50 points)
  for (const title of userTitles) {
    const titleWords = title.split(/\s+/);
    const matchCount = titleWords.filter((w) => jobText.includes(w)).length;
    const titleScore = (matchCount / titleWords.length) * 50;
    score = Math.max(score, titleScore);
  }

  // Skills overlap (up to 50 points)
  for (const skill of userSkills) {
    if (jobText.includes(skill)) {
      matched.push(skill);
    }
  }
  const skillScore =
    userSkills.length > 0 ? (matched.length / userSkills.length) * 50 : 25;
  score += skillScore;

  return { score: Math.min(100, Math.round(score)), matched };
}

function scoreValuesMatch(
  job: JobListing,
  profile: CareerProfile,
  companyData: any
): { score: number; matched: string[] } {
  const userValues = (profile.core_values || []).map((v) => v.toLowerCase());
  if (!userValues.length) return { score: 50, matched: [] };

  const companyText = `${job.description} ${companyData?.description || ""} ${
    companyData?.public_stances || ""
  }`.toLowerCase();

  const matched: string[] = [];
  for (const value of userValues) {
    const keywords = valueKeywords(value);
    if (keywords.some((kw) => companyText.includes(kw))) {
      matched.push(value);
    }
  }

  const score =
    userValues.length > 0 ? (matched.length / userValues.length) * 100 : 50;
  return { score: Math.round(score), matched };
}

function valueKeywords(value: string): string[] {
  const map: Record<string, string[]> = {
    "work-life balance": [
      "work-life",
      "flexible",
      "remote",
      "balance",
      "wellness",
      "pto",
    ],
    diversity: [
      "diversity",
      "inclusion",
      "equity",
      "dei",
      "belonging",
      "representation",
    ],
    innovation: [
      "innovation",
      "cutting-edge",
      "research",
      "r&d",
      "technology",
      "ai",
    ],
    sustainability: [
      "sustainable",
      "green",
      "carbon",
      "environmental",
      "climate",
      "esg",
    ],
    transparency: [
      "transparent",
      "open",
      "honest",
      "accountability",
      "governance",
    ],
    "employee growth": [
      "growth",
      "development",
      "mentorship",
      "training",
      "career path",
      "learning",
    ],
    "social impact": [
      "social impact",
      "community",
      "philanthropy",
      "nonprofit",
      "giving back",
    ],
    compensation: [
      "competitive pay",
      "equity",
      "stock",
      "bonus",
      "compensation",
      "benefits",
    ],
    ethics: [
      "ethics",
      "integrity",
      "responsible",
      "moral",
      "trust",
      "compliance",
    ],
    safety: [
      "safety",
      "well-being",
      "secure",
      "health",
      "osha",
      "protection",
    ],
  };
  return map[value] || [value];
}

function scoreIntegrity(companyData: any): number {
  if (!companyData) return 50; // neutral score when unknown

  const pillars = [
    companyData.integrity_gap_score,
    companyData.labor_impact_score,
    companyData.safety_alert_score,
    companyData.connected_dots_score,
  ].filter((s) => s != null);

  if (!pillars.length) return 50;

  const avg = pillars.reduce((a: number, b: number) => a + b, 0) / pillars.length;
  // Scores in DB are 0-100 where higher = better
  return Math.round(avg);
}

function computeCompositeScore(
  skills: number,
  values: number,
  integrity: number
): number {
  return Math.round(0.4 * skills + 0.35 * values + 0.25 * integrity);
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "user_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // ── 1. Load user career profile ──
    const { data: profile, error: profileErr } = await sb
      .from("user_career_profile")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Career profile not found. Complete onboarding first.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 2. Load auto-apply settings ──
    const { data: settings } = await sb
      .from("auto_apply_settings")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    const autoMode = settings?.is_enabled && !settings?.is_paused;
    const mode = (settings as any)?.mode || "review";
    const threshold = settings?.min_alignment_threshold || 60;

    // ── 3. Build search queries and search ──
    const queries = buildSearchQueries(profile as unknown as CareerProfile);
    console.log(`[dream-job-engine] Searching with ${queries.length} queries for user ${user_id}`);

    const jobListings = await searchJobs(queries);
    console.log(`[dream-job-engine] Found ${jobListings.length} raw listings`);

    if (jobListings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matches: 0,
          message: "No new job listings found matching your criteria.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 4. Score each job ──
    const blockedCompanies = (profile as any).blocked_companies || [];
    const blockedIndustries = (profile as any).blocked_industries || [];
    const scoredJobs: any[] = [];

    for (const job of jobListings) {
      // Filter blocked companies
      if (
        blockedCompanies.some(
          (bc: string) =>
            job.company.toLowerCase().includes(bc.toLowerCase())
        )
      ) {
        continue;
      }

      // Look up company in WDIWF database
      const slug = job.company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { data: companyData } = await sb
        .from("companies")
        .select(
          "id, name, slug, integrity_gap_score, labor_impact_score, safety_alert_score, connected_dots_score, description, public_stances"
        )
        .or(`slug.eq.${slug},name.ilike.%${job.company}%`)
        .limit(1)
        .maybeSingle();

      // Score
      const skillsResult = scoreSkillsMatch(
        job,
        profile as unknown as CareerProfile
      );
      const valuesResult = scoreValuesMatch(
        job,
        profile as unknown as CareerProfile,
        companyData
      );
      const integrityResult = scoreIntegrity(companyData);
      const composite = computeCompositeScore(
        skillsResult.score,
        valuesResult.score,
        integrityResult
      );

      // Filter by minimum integrity threshold
      const minIntegrity = (profile as any).min_integrity_score || 0;
      if (integrityResult < minIntegrity) continue;

      // Filter by alignment threshold
      if (composite < threshold) continue;

      scoredJobs.push({
        user_id,
        job_title: job.title,
        company_name: job.company,
        company_id: companyData?.id || null,
        source: job.source,
        source_url: job.source_url,
        location: job.location,
        salary_range: job.salary_range,
        work_mode: job.work_mode,
        description: job.description,
        posted_date: job.posted_date,
        skills_match_score: skillsResult.score,
        values_match_score: valuesResult.score,
        integrity_score: integrityResult,
        composite_score: composite,
        matched_values: valuesResult.matched,
        matched_skills: skillsResult.matched,
        status: autoMode && mode === "auto" ? "queued" : "matched",
        raw_listing: job,
      });
    }

    // Sort by composite score
    scoredJobs.sort((a, b) => b.composite_score - a.composite_score);

    // ── 5. Store results ──
    let insertedCount = 0;
    const insertedIds: string[] = [];

    if (scoredJobs.length > 0) {
      // Deduplicate against existing results
      const { data: existing } = await sb
        .from("dream_job_search_results")
        .select("source_url")
        .eq("user_id", user_id)
        .in(
          "source_url",
          scoredJobs.map((j) => j.source_url)
        );

      const existingUrls = new Set(
        (existing || []).map((e: any) => e.source_url)
      );
      const newJobs = scoredJobs.filter(
        (j) => !existingUrls.has(j.source_url)
      );

      if (newJobs.length > 0) {
        const { data: inserted, error: insertErr } = await sb
          .from("dream_job_search_results")
          .insert(newJobs)
          .select("id, status");

        if (insertErr) {
          console.error("[dream-job-engine] Insert error:", insertErr);
        } else {
          insertedCount = inserted?.length || 0;
          for (const row of inserted || []) {
            insertedIds.push(row.id);
          }
        }
      }
    }

    // ── 6. Auto Mode: queue approved jobs for application ──
    let queuedCount = 0;
    let dossierCount = 0;

    if (autoMode && mode === "auto") {
      const queuedJobs = scoredJobs.filter((j) => j.status === "queued");
      const dailyLimit = settings?.max_daily_applications || 25;
      const toProcess = queuedJobs.slice(0, dailyLimit);

      for (const job of toProcess) {
        // Create application record
        const { data: app } = await sb
          .from("dream_job_applications")
          .insert({
            user_id,
            search_result_id: insertedIds[scoredJobs.indexOf(job)] || null,
            company_name: job.company_name,
            job_title: job.job_title,
            application_url: job.source_url,
            application_method: `auto_${job.source}`,
            status: "pending",
          })
          .select("id")
          .maybeSingle();

        if (app) {
          queuedCount++;

          // Generate dossier for each queued job
          try {
            const dossierResp = await fetch(
              `${supabaseUrl}/functions/v1/generate-dossier`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  search_result_id:
                    insertedIds[scoredJobs.indexOf(job)] || null,
                  user_id,
                }),
              }
            );
            if (dossierResp.ok) {
              dossierCount++;
            }
          } catch (dossierErr) {
            console.error(
              "[dream-job-engine] Dossier generation failed:",
              dossierErr
            );
          }
        }
      }
    }

    // ── 7. Return summary ──
    return new Response(
      JSON.stringify({
        success: true,
        matches: insertedCount,
        total_scored: scoredJobs.length,
        queued: queuedCount,
        dossiers_generated: dossierCount,
        mode: autoMode ? mode : "review",
        message: `Found ${insertedCount} new matches${
          queuedCount > 0 ? `, queued ${queuedCount} for auto-apply` : ""
        }${dossierCount > 0 ? `, generated ${dossierCount} dossiers` : ""}.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[dream-job-engine] Unhandled error:", err);
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
