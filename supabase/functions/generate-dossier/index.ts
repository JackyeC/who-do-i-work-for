/**
 * Generate Dossier — Comprehensive "Who Do I Work For?" interview prep
 *
 * Generates all 11 dossier sections for a specific job match:
 * 1. Company Overview
 * 2. WDIWF Integrity Snapshot
 * 3. Role Analysis
 * 4. Tailored Resume
 * 5. Cover Letter
 * 6. Interview Questions
 * 7. Salary Benchmarks
 * 8. Preparation Checklist
 * 9. References Template
 * 10. Thank-You Email Draft
 * 11. Follow-Up Timeline
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ------------------------------------------------------------------ */
/*  AI Helper                                                          */
/* ------------------------------------------------------------------ */

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false
): Promise<string> {
  // Try OpenAI first, then Lovable gateway
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const apiKey = openaiKey || lovableKey;
  const baseUrl = openaiKey
    ? "https://api.openai.com/v1"
    : "https://api.lovable.dev/v1";

  if (!apiKey) {
    throw new Error("No AI API key configured (OPENAI_API_KEY or LOVABLE_API_KEY)");
  }

  const body: any = {
    model: openaiKey ? "gpt-4o-mini" : "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`AI API error (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

/* ------------------------------------------------------------------ */
/*  Web research helper                                                */
/* ------------------------------------------------------------------ */

async function webResearch(query: string): Promise<string> {
  const braveKey = Deno.env.get("BRAVE_SEARCH_API_KEY");
  if (!braveKey) return "";

  try {
    const resp = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": braveKey,
        },
      }
    );
    if (!resp.ok) return "";
    const data = await resp.json();
    const results = data.web?.results || [];
    return results
      .map(
        (r: any) =>
          `${r.title}: ${r.description || ""} (${r.url})`
      )
      .join("\n\n");
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Section generators                                                 */
/* ------------------------------------------------------------------ */

async function generateCompanyOverview(
  companyName: string,
  companyData: any,
  jobDescription: string
): Promise<any> {
  const research = await webResearch(
    `${companyName} company mission values culture leadership 2025`
  );
  const newsResearch = await webResearch(`${companyName} recent news 2025`);

  const prompt = `Research and compile a company overview for "${companyName}".

Company data from our database: ${JSON.stringify(companyData || {})}

Web research results:
${research}

Recent news:
${newsResearch}

Job description context: ${jobDescription?.slice(0, 500) || "N/A"}

Return a JSON object with these fields:
{
  "mission": "Company mission statement",
  "values": ["list", "of", "core", "values"],
  "culture": "Summary of company culture",
  "leadership": [{"name": "CEO Name", "title": "CEO", "background": "Brief bio"}],
  "recent_news": [{"headline": "...", "date": "...", "summary": "..."}],
  "industry": "Primary industry",
  "competitors": ["Competitor 1", "Competitor 2"],
  "employee_count": "Approximate headcount",
  "founded": "Year founded",
  "headquarters": "HQ location"
}`;

  const result = await callAI(
    "You are a corporate intelligence analyst for WDIWF (Who Do I Work For?). Generate thorough, factual company overviews. Return valid JSON only.",
    prompt,
    true
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      mission: "Information being gathered",
      values: [],
      culture: result,
      leadership: [],
      recent_news: [],
      industry: "",
      competitors: [],
    };
  }
}

async function generateIntegritySnapshot(
  companyName: string,
  companyData: any
): Promise<any> {
  const scores = {
    integrity_gap: companyData?.integrity_gap_score ?? null,
    labor_impact: companyData?.labor_impact_score ?? null,
    safety_alert: companyData?.safety_alert_score ?? null,
    connected_dots: companyData?.connected_dots_score ?? null,
  };

  const hasScores = Object.values(scores).some((s) => s !== null);

  if (!hasScores) {
    // Quick research for unknown companies
    const research = await webResearch(
      `${companyName} labor practices safety ethics controversy`
    );

    const prompt = `Based on available information about "${companyName}", generate an integrity assessment.

Web research: ${research}

Return JSON:
{
  "overall_score": 50,
  "pillars": {
    "integrity_gap": {"score": null, "summary": "No WDIWF data available"},
    "labor_impact": {"score": null, "summary": "..."},
    "safety_alert": {"score": null, "summary": "..."},
    "connected_dots": {"score": null, "summary": "..."}
  },
  "positive_findings": ["Finding 1", "Finding 2"],
  "concerning_findings": ["Finding 1"],
  "pac_donations_summary": "...",
  "labor_practices_summary": "...",
  "safety_record": "...",
  "data_availability": "limited"
}`;

    const result = await callAI(
      "You are a WDIWF integrity analyst. Assess companies based on public records. Be balanced and factual. Return valid JSON.",
      prompt,
      true
    );

    try {
      return JSON.parse(result);
    } catch {
      return {
        overall_score: 50,
        pillars: scores,
        data_availability: "limited",
        positive_findings: [],
        concerning_findings: [],
      };
    }
  }

  return {
    overall_score: Math.round(
      Object.values(scores)
        .filter((s): s is number => s !== null)
        .reduce((a, b) => a + b, 0) /
        Object.values(scores).filter((s) => s !== null).length
    ),
    pillars: {
      integrity_gap: {
        score: scores.integrity_gap,
        summary: `Score: ${scores.integrity_gap ?? "N/A"}/100`,
      },
      labor_impact: {
        score: scores.labor_impact,
        summary: `Score: ${scores.labor_impact ?? "N/A"}/100`,
      },
      safety_alert: {
        score: scores.safety_alert,
        summary: `Score: ${scores.safety_alert ?? "N/A"}/100`,
      },
      connected_dots: {
        score: scores.connected_dots,
        summary: `Score: ${scores.connected_dots ?? "N/A"}/100`,
      },
    },
    positive_findings: [],
    concerning_findings: [],
    pac_donations_summary: companyData?.pac_donations || "No data available",
    labor_practices_summary:
      companyData?.labor_practices || "No data available",
    safety_record: companyData?.safety_record || "No data available",
    data_availability: "full",
  };
}

async function generateRoleAnalysis(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  profile: any
): Promise<any> {
  const prompt = `Analyze this role and explain why it matches the candidate's profile.

Role: ${jobTitle} at ${companyName}
Job Description: ${jobDescription?.slice(0, 1000) || "Not available"}

Candidate Profile:
- Skills: ${(profile.top_skills || []).join(", ")}
- Preferred Titles: ${(profile.preferred_titles || []).join(", ")}
- Values: ${(profile.core_values || []).join(", ")}
- Industries: ${(profile.preferred_industries || []).join(", ")}

Return JSON:
{
  "role_summary": "What this role entails",
  "key_responsibilities": ["Responsibility 1", "Responsibility 2"],
  "why_it_matches": "Why this role aligns with the candidate's profile",
  "skill_alignment": [{"skill": "...", "relevance": "..."}],
  "growth_trajectory": "Career growth path from this role",
  "team_structure": "Likely team structure and reporting",
  "challenges": "Potential challenges in this role",
  "day_in_the_life": "What a typical day might look like"
}`;

  const result = await callAI(
    "You are a career advisor at WDIWF. Provide insightful role analysis that helps candidates understand the opportunity. Return valid JSON.",
    prompt,
    true
  );

  try {
    return JSON.parse(result);
  } catch {
    return { role_summary: result, key_responsibilities: [], why_it_matches: "" };
  }
}

async function generateTailoredResume(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  profile: any
): Promise<any> {
  const prompt = `Create a tailored resume strategy for applying to ${jobTitle} at ${companyName}.

Job Description: ${jobDescription?.slice(0, 800) || "Not available"}

Candidate Skills: ${(profile.top_skills || []).join(", ")}
Candidate Preferred Titles: ${(profile.preferred_titles || []).join(", ")}

Return JSON:
{
  "professional_summary": "A rewritten professional summary tailored to this role",
  "highlighted_skills": ["Skill 1 - most relevant", "Skill 2"],
  "skills_to_emphasize": ["Skills that should be prominently featured"],
  "skills_to_add": ["Skills from the JD the candidate should highlight if they have them"],
  "experience_framing": "How to frame past experience for this role",
  "keywords_to_include": ["ATS-friendly keywords from the job description"],
  "suggested_format": "Recommended resume format/style"
}`;

  const result = await callAI(
    "You are a professional resume strategist at WDIWF. Help candidates present their best selves for specific roles. Return valid JSON.",
    prompt,
    true
  );

  try {
    return JSON.parse(result);
  } catch {
    return { professional_summary: result, highlighted_skills: [], keywords_to_include: [] };
  }
}

async function generateCoverLetter(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  profile: any,
  integritySnapshot: any
): Promise<string> {
  const positiveFindings =
    integritySnapshot?.positive_findings?.slice(0, 3) || [];

  const prompt = `Write a compelling, unique cover letter for a ${jobTitle} position at ${companyName}.

Job Description: ${jobDescription?.slice(0, 800) || "Not available"}

Candidate Skills: ${(profile.top_skills || []).join(", ")}
Candidate Values: ${(profile.core_values || []).join(", ")}

${
  positiveFindings.length
    ? `IMPORTANT: Reference these positive findings about the company from WDIWF Receipts research:
${positiveFindings.map((f: string) => `- ${f}`).join("\n")}

Include a line like: "I was drawn to ${companyName} because your public record shows [specific finding]"`
    : ""
}

Requirements:
- Professional but warm tone
- NOT generic — reference specific aspects of the company and role
- Show genuine enthusiasm informed by real research
- 3-4 paragraphs
- Include the WDIWF Receipts reference naturally
- End with a strong closing`;

  return await callAI(
    "You are a professional career coach at WDIWF. Write authentic, researched cover letters that stand out. Never write generic content.",
    prompt
  );
}

async function generateInterviewQuestions(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  integritySnapshot: any
): Promise<any> {
  const prompt = `Generate comprehensive interview preparation questions for ${jobTitle} at ${companyName}.

Job Description: ${jobDescription?.slice(0, 600) || "Not available"}

Company Integrity Data: ${JSON.stringify(integritySnapshot || {})}

Return JSON:
{
  "company_specific": [
    {"question": "...", "guidance": "How to answer this well", "why_asked": "Why they might ask this"}
  ],
  "behavioral": [
    {"question": "...", "guidance": "STAR method tip", "example_situation": "Type of example to use"}
  ],
  "questions_to_ask": [
    {"question": "...", "purpose": "What you'll learn from the answer", "informed_by": "What WDIWF data informed this question"}
  ],
  "red_flag_probes": [
    {"question": "...", "context": "Diplomatic way to probe a concerning finding", "what_to_watch_for": "Red flags in their answer"}
  ]
}

Generate exactly:
- 10 company-specific questions
- 5 behavioral questions
- 5 questions to ask the interviewer (informed by Receipts data)
- 3 red flag probe questions (diplomatic)`;

  const result = await callAI(
    "You are an interview coach at WDIWF. Generate insightful, research-informed interview questions. Questions to ask should subtly probe company integrity. Return valid JSON.",
    prompt,
    true
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      company_specific: [],
      behavioral: [],
      questions_to_ask: [],
      red_flag_probes: [],
    };
  }
}

async function generateSalaryBenchmarks(
  jobTitle: string,
  companyName: string,
  location: string
): Promise<any> {
  const research = await webResearch(
    `${jobTitle} salary range ${location || "United States"} 2025`
  );
  const compResearch = await webResearch(
    `${companyName} salary compensation reviews glassdoor levels.fyi`
  );

  const prompt = `Generate salary benchmarks for ${jobTitle} at ${companyName} in ${location || "United States"}.

Market research:
${research}

Company compensation data:
${compResearch}

Return JSON:
{
  "market_range": {"low": 80000, "median": 110000, "high": 150000},
  "company_range": {"low": null, "median": null, "high": null, "note": "Based on available data"},
  "currency": "USD",
  "location_factor": "Description of how location affects salary",
  "total_comp_notes": "Notes on benefits, equity, bonuses",
  "negotiation_points": [
    "Point 1 based on market data",
    "Point 2 based on company data"
  ],
  "data_sources": ["Source 1", "Source 2"],
  "confidence": "medium"
}`;

  const result = await callAI(
    "You are a compensation analyst at WDIWF. Provide realistic salary benchmarks based on market data. Return valid JSON.",
    prompt,
    true
  );

  try {
    return JSON.parse(result);
  } catch {
    return {
      market_range: { low: null, median: null, high: null },
      negotiation_points: [],
      confidence: "low",
    };
  }
}

function generatePreparationChecklist(
  jobTitle: string,
  companyName: string
): any {
  return {
    before_interview: [
      {
        task: `Research ${companyName}'s recent news and press releases`,
        done: false,
      },
      {
        task: "Review the full WDIWF integrity report for the company",
        done: false,
      },
      {
        task: `Practice answering the 10 company-specific questions aloud`,
        done: false,
      },
      {
        task: "Prepare 2-3 concrete examples using the STAR method",
        done: false,
      },
      {
        task: `Review the ${jobTitle} job description one more time`,
        done: false,
      },
      {
        task: "Prepare your questions for the interviewer",
        done: false,
      },
      { task: "Test your video/audio setup if virtual", done: false },
      {
        task: "Plan your outfit (professional, appropriate for company culture)",
        done: false,
      },
      {
        task: "Print copies of your resume and reference sheet",
        done: false,
      },
      { task: "Map the route / confirm meeting link", done: false },
    ],
    day_of: [
      { task: "Review your preparation notes one final time", done: false },
      { task: "Eat well and hydrate", done: false },
      { task: "Arrive 10-15 minutes early", done: false },
      { task: "Bring a notepad and pen", done: false },
      { task: "Silence your phone", done: false },
      { task: "Take three deep breaths before walking in", done: false },
    ],
    after_interview: [
      {
        task: "Send thank-you email within 24 hours",
        done: false,
      },
      {
        task: "Note key discussion points while fresh in memory",
        done: false,
      },
      {
        task: "Update your application tracker",
        done: false,
      },
    ],
  };
}

function generateReferencesTemplate(profile: any): string {
  return `PROFESSIONAL REFERENCES
${"=".repeat(50)}

Prepared for: [Hiring Manager Name]
Position: [Job Title]
Company: [Company Name]
Date: ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

${"─".repeat(50)}

REFERENCE 1
Name: [Reference Full Name]
Title: [Their Title]
Organization: [Their Company]
Relationship: [e.g., Former Direct Supervisor]
Phone: [Phone Number]
Email: [Email Address]
Duration of relationship: [X years]

${"─".repeat(50)}

REFERENCE 2
Name: [Reference Full Name]
Title: [Their Title]
Organization: [Their Company]
Relationship: [e.g., Colleague / Team Lead]
Phone: [Phone Number]
Email: [Email Address]
Duration of relationship: [X years]

${"─".repeat(50)}

REFERENCE 3
Name: [Reference Full Name]
Title: [Their Title]
Organization: [Their Company]
Relationship: [e.g., Client / Cross-functional Partner]
Phone: [Phone Number]
Email: [Email Address]
Duration of relationship: [X years]

${"─".repeat(50)}

Note: All references have been contacted and have agreed
to speak on my behalf. Please feel free to reach out at
your convenience.
`;
}

async function generateThankYouEmail(
  jobTitle: string,
  companyName: string,
  interviewerName = "[Interviewer Name]"
): Promise<string> {
  const prompt = `Write a professional thank-you email to send after an interview for ${jobTitle} at ${companyName}.

Requirements:
- Address to ${interviewerName}
- Reference the specific role
- Express genuine enthusiasm
- Mention something specific discussed (use placeholder)
- Reiterate fit for the role
- Professional but warm closing
- Keep it concise (150-200 words)`;

  return await callAI(
    "You are a career communication specialist at WDIWF. Write professional, warm thank-you emails that reinforce candidacy.",
    prompt
  );
}

function generateFollowUpTimeline(companyName: string): any {
  const now = new Date();
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  };

  return {
    timeline: [
      {
        day: 0,
        date: addDays(now, 0),
        action: "Send thank-you email",
        template:
          "See the Thank-You Email section above. Send within 24 hours of your interview.",
        priority: "critical",
      },
      {
        day: 3,
        date: addDays(now, 3),
        action: "Connect on LinkedIn",
        template: `Send a brief LinkedIn connection request to your interviewer: "Thank you again for taking the time to discuss the [Role] opportunity at ${companyName}. I enjoyed our conversation about [topic]. Looking forward to staying connected."`,
        priority: "recommended",
      },
      {
        day: 7,
        date: addDays(now, 7),
        action: "First follow-up email",
        template: `Subject: Following Up — [Job Title] Position\n\nDear [Interviewer Name],\n\nI hope this message finds you well. I wanted to follow up on our conversation last week about the [Job Title] role at ${companyName}.\n\nI remain very enthusiastic about the opportunity and believe my [specific skill/experience] would contribute meaningfully to [specific team goal discussed].\n\nPlease don't hesitate to reach out if you need any additional information from my end.\n\nBest regards,\n[Your Name]`,
        priority: "important",
      },
      {
        day: 14,
        date: addDays(now, 14),
        action: "Second follow-up (if no response)",
        template: `Subject: Checking In — [Job Title] at ${companyName}\n\nDear [Interviewer Name],\n\nI wanted to check in regarding the [Job Title] position. I understand the hiring process can take time, and I want to reiterate my strong interest in joining the ${companyName} team.\n\nIf the timeline has shifted or if there's anything else I can provide, please let me know.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`,
        priority: "moderate",
      },
      {
        day: 21,
        date: addDays(now, 21),
        action: "Final follow-up or move on",
        template: `If you haven't heard back after two follow-ups, it's generally time to shift focus to other opportunities. You can send one final brief note expressing continued interest, but prioritize your other active applications.`,
        priority: "low",
      },
    ],
    tips: [
      "Always reference something specific from your conversation",
      "Keep follow-ups brief — 3-4 sentences max",
      "Don't follow up more than twice unless they've indicated a specific timeline",
      "If they gave you a timeline, wait until after it passes before following up",
      `Continue monitoring ${companyName} on WDIWF for any new developments`,
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { search_result_id, user_id } = await req.json();

    if (!search_result_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "search_result_id is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // ── Load search result ──
    const { data: searchResult, error: srErr } = await sb
      .from("dream_job_search_results")
      .select("*")
      .eq("id", search_result_id)
      .single();

    if (srErr || !searchResult) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Search result not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user_id || searchResult.user_id;

    // ── Load user profile ──
    const { data: profile } = await sb
      .from("user_career_profile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // ── Load company data from WDIWF database ──
    let companyData: any = null;
    if (searchResult.company_id) {
      const { data } = await sb
        .from("companies")
        .select("*")
        .eq("id", searchResult.company_id)
        .maybeSingle();
      companyData = data;
    } else {
      const slug = searchResult.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { data } = await sb
        .from("companies")
        .select("*")
        .or(
          `slug.eq.${slug},name.ilike.%${searchResult.company_name}%`
        )
        .limit(1)
        .maybeSingle();
      companyData = data;
    }

    console.log(
      `[generate-dossier] Generating dossier for ${searchResult.job_title} at ${searchResult.company_name}`
    );

    // ── Generate all 11 sections in parallel where possible ──
    const [
      companyOverview,
      integritySnapshot,
      roleAnalysis,
      tailoredResume,
      salaryBenchmarks,
      thankYouEmail,
    ] = await Promise.all([
      generateCompanyOverview(
        searchResult.company_name,
        companyData,
        searchResult.description || ""
      ),
      generateIntegritySnapshot(searchResult.company_name, companyData),
      generateRoleAnalysis(
        searchResult.job_title,
        searchResult.company_name,
        searchResult.description || "",
        profile || {}
      ),
      generateTailoredResume(
        searchResult.job_title,
        searchResult.company_name,
        searchResult.description || "",
        profile || {}
      ),
      generateSalaryBenchmarks(
        searchResult.job_title,
        searchResult.company_name,
        searchResult.location || ""
      ),
      generateThankYouEmail(
        searchResult.job_title,
        searchResult.company_name
      ),
    ]);

    // These depend on previous results
    const [coverLetter, interviewQuestions] = await Promise.all([
      generateCoverLetter(
        searchResult.job_title,
        searchResult.company_name,
        searchResult.description || "",
        profile || {},
        integritySnapshot
      ),
      generateInterviewQuestions(
        searchResult.job_title,
        searchResult.company_name,
        searchResult.description || "",
        integritySnapshot
      ),
    ]);

    const preparationChecklist = generatePreparationChecklist(
      searchResult.job_title,
      searchResult.company_name
    );

    const referencesTemplate = generateReferencesTemplate(profile || {});

    const followUpTimeline = generateFollowUpTimeline(
      searchResult.company_name
    );

    // ── Store dossier ──
    const { data: dossier, error: dossierErr } = await sb
      .from("dream_job_dossiers")
      .insert({
        user_id: userId,
        search_result_id,
        company_name: searchResult.company_name,
        job_title: searchResult.job_title,
        company_overview: companyOverview,
        integrity_snapshot: integritySnapshot,
        role_analysis: roleAnalysis,
        tailored_resume: tailoredResume,
        cover_letter: coverLetter,
        interview_questions: interviewQuestions,
        salary_benchmarks: salaryBenchmarks,
        preparation_checklist: preparationChecklist,
        references_template: referencesTemplate,
        thank_you_email_draft: thankYouEmail,
        follow_up_timeline: followUpTimeline,
      })
      .select("id")
      .single();

    if (dossierErr) {
      console.error("[generate-dossier] Insert error:", dossierErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to store dossier",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Update search result ──
    await sb
      .from("dream_job_search_results")
      .update({
        dossier_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", search_result_id);

    // ── Return dossier data ──
    return new Response(
      JSON.stringify({
        success: true,
        dossier_id: dossier.id,
        company_name: searchResult.company_name,
        job_title: searchResult.job_title,
        sections: {
          company_overview: companyOverview,
          integrity_snapshot: integritySnapshot,
          role_analysis: roleAnalysis,
          tailored_resume: tailoredResume,
          cover_letter: coverLetter,
          interview_questions: interviewQuestions,
          salary_benchmarks: salaryBenchmarks,
          preparation_checklist: preparationChecklist,
          references_template: referencesTemplate,
          thank_you_email_draft: thankYouEmail,
          follow_up_timeline: followUpTimeline,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[generate-dossier] Unhandled error:", err);
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
