const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const HR_KEYWORDS = [
  'AI recruiting', 'automated screening', 'applicant scoring', 'resume ranking',
  'interview intelligence', 'talent intelligence', 'workforce analytics', 'skills graph',
  'matching engine', 'chatbot recruiting', 'interview assessment', 'automated employment decision',
  'AEDT', 'bias audit', 'people analytics', 'employee monitoring', 'performance analytics',
  'talent marketplace', 'HR automation', 'AI hiring', 'algorithmic hiring',
  'candidate scoring', 'video interview', 'skills inference', 'scheduling automation',
  'sourcing automation', 'predictive hiring', 'automated decision-making',
  'performance prediction', 'workforce planning AI',
];

const VENDOR_MAP: Record<string, string> = {
  'HireVue': 'video interview analysis',
  'Modern Hire': 'interview intelligence',
  'Eightfold AI': 'talent intelligence',
  'Eightfold': 'talent intelligence',
  'Paradox': 'chatbot recruiting assistant',
  'Olivia': 'chatbot recruiting assistant',
  'Phenom': 'talent marketplace',
  'SeekOut': 'sourcing automation',
  'Workday': 'workforce analytics',
  'iCIMS': 'applicant tracking',
  'Greenhouse': 'applicant tracking',
  'SAP SuccessFactors': 'workforce analytics',
  'SuccessFactors': 'workforce analytics',
  'Oracle HCM': 'workforce analytics',
  'Harver': 'automated candidate scoring',
  'pymetrics': 'automated candidate scoring',
  'Textio': 'AI resume screening',
  'Beamery': 'talent marketplace',
  'HiredScore': 'AI resume screening',
  'UKG': 'workforce analytics',
  'Visier': 'people analytics',
  'Gloat': 'internal talent marketplace',
  'Cornerstone OnDemand': 'talent marketplace',
  'Lattice': 'performance prediction',
  'BambooHR': 'HR automation',
  'Lever': 'applicant tracking',
  'SmartRecruiters': 'AI resume screening',
  'Fetcher': 'sourcing automation',
  'Humanly': 'chatbot recruiting assistant',
  'Entelo': 'sourcing automation',
};

function classifySignalCategory(signalType: string): string {
  const categories: Record<string, string[]> = {
    'Recruiting & Screening': ['AI resume screening', 'automated candidate scoring', 'applicant tracking', 'sourcing automation'],
    'Interview & Assessment': ['interview intelligence', 'video interview analysis', 'chatbot recruiting assistant'],
    'Talent Management': ['talent intelligence', 'talent marketplace', 'internal talent marketplace', 'skills inference'],
    'Workforce Analytics': ['workforce analytics', 'people analytics', 'performance prediction', 'performance analytics'],
    'Employee Monitoring': ['employee monitoring', 'scheduling automation'],
    'Compliance & Governance': ['bias audit', 'AEDT compliance'],
    'HR Automation': ['HR automation'],
  };
  for (const [category, types] of Object.entries(categories)) {
    if (types.some(t => signalType.toLowerCase().includes(t.toLowerCase()))) return category;
  }
  return 'Other';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, companyName } = await req.json();
    if (!companyId || !companyName) {
      return new Response(JSON.stringify({ success: false, error: 'companyId and companyName required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!firecrawlKey || !lovableKey) {
      return new Response(JSON.stringify({ success: false, error: 'Required API keys not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`AI HR scan for: ${companyName}`);

    // Step 1: Search for evidence of AI/HR tool usage
    const searchQueries = [
      `\"${companyName}\" AI hiring recruiting automation`,
      `\"${companyName}\" automated screening candidate assessment`,
      `\"${companyName}\" employee monitoring workforce analytics`,
    ];

    let allContent = '';

    for (const query of searchQueries) {
      try {
        const searchResp = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit: 5 }),
        });

        if (searchResp.ok) {
          const searchData = await searchResp.json();
          const results = searchData.data || [];
          for (const r of results) {
            allContent += `\n\nSOURCE: ${r.url}\nTITLE: ${r.title}\n${r.description || ''}\n${r.markdown?.slice(0, 2000) || ''}`;
          }
        }
      } catch (e) {
        console.error(`Search failed for: ${query}`, e);
      }
    }

    // Step 2: Also try to scrape company careers page if available
    const { data: company } = await supabase
      .from('companies')
      .select('careers_url')
      .eq('id', companyId)
      .single();

    if (company?.careers_url) {
      try {
        const scrapeResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: company.careers_url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        if (scrapeResp.ok) {
          const scrapeData = await scrapeResp.json();
          const md = scrapeData.data?.markdown || scrapeData.markdown || '';
          if (md.length > 50) {
            allContent += `\n\nSOURCE: ${company.careers_url}\nTYPE: company careers page\n${md.slice(0, 5000)}`;
          }
        }
      } catch (e) {
        console.error('Careers page scrape failed', e);
      }
    }

    if (!allContent || allContent.length < 100) {
      return new Response(JSON.stringify({
        success: true, signalsFound: 0,
        message: 'Insufficient public evidence found',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 3: AI extraction
    const truncated = allContent.slice(0, 20000);
    const vendorList = Object.keys(VENDOR_MAP).join(', ');
    const keywordList = HR_KEYWORDS.slice(0, 20).join(', ');

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at detecting AI and automation usage in corporate hiring and HR practices from public sources. Return only valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze the following content about \"${companyName}\" for evidence of AI, automation, or algorithmic tools used in hiring, recruiting, HR, workforce analytics, employee monitoring, or performance management.\n\nLook for these vendors: ${vendorList}\nLook for these concepts: ${keywordList}\n\nReturn a JSON array of detected signals:\n[{\n  \"signal_type\": \"e.g. AI resume screening, automated candidate scoring, video interview analysis\",\n  \"tool_name\": \"specific tool name if mentioned, or null\",\n  \"vendor_name\": \"vendor company if identified, or null\",\n  \"source_url\": \"URL where evidence was found, or null\",\n  \"source_type\": \"e.g. job description, press release, vendor case study, privacy policy, careers page\",\n  \"evidence_text\": \"1-2 sentence quote or summary of the evidence\",\n  \"detection_method\": \"keyword_detection or vendor_match or source_parsing\",\n  \"confidence\": \"direct, strong_inference, moderate_inference, or weak_inference\"\n}]\n\nReturn [] if no evidence found. Be conservative — only flag things with actual evidence.\n\nContent:\n${truncated}`,
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      console.error('AI extraction failed:', aiResp.status);
      return new Response(JSON.stringify({ success: false, error: 'AI analysis failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResp.json();
    const raw = aiData.choices?.[0]?.message?.content || '[]';

    let signals: any[];
    try {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      signals = JSON.parse(jsonMatch[1].trim());
      if (!Array.isArray(signals)) signals = [];
    } catch {
      console.error('Failed to parse AI output:', raw.slice(0, 500));
      signals = [];
    }

    console.log(`Detected ${signals.length} AI/HR signals for ${companyName}`);

    if (signals.length === 0) {
      return new Response(JSON.stringify({
        success: true, signalsFound: 0,
        message: 'No AI/HR signals detected in public sources',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 4: Upsert signals (clear old auto-detected, keep verified/disputed)
    await supabase
      .from('ai_hr_signals')
      .delete()
      .eq('company_id', companyId)
      .eq('status', 'auto_detected');

    const now = new Date().toISOString();
    const { error: insertErr } = await supabase.from('ai_hr_signals').insert(
      signals.slice(0, 30).map((s: any) => ({
        company_id: companyId,
        signal_type: s.signal_type || 'unknown',
        signal_category: classifySignalCategory(s.signal_type || ''),
        tool_name: s.tool_name || null,
        vendor_name: s.vendor_name || null,
        source_url: s.source_url || null,
        source_type: s.source_type || null,
        evidence_text: s.evidence_text || null,
        detection_method: s.detection_method || 'keyword_detection',
        confidence: s.confidence || 'moderate_inference',
        date_detected: now,
        last_verified: null,
        status: 'auto_detected',
      }))
    );

    if (insertErr) {
      console.error('Insert error:', insertErr);
      return new Response(JSON.stringify({ success: false, error: insertErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      signalsFound: signals.length,
      companyId,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('AI HR scan error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
