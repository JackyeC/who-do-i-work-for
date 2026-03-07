const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BENEFIT_CATEGORIES: Record<string, string[]> = {
  'Healthcare': ['health insurance', 'medical coverage', 'dental coverage', 'vision coverage', 'health benefits', 'healthcare', 'medical plan', 'PPO', 'HMO', 'HSA', 'health savings'],
  'Parental Leave': ['parental leave', 'maternity leave', 'paternity leave', 'family leave', 'birth parent', 'adoption leave', 'bonding leave'],
  'Paid Sick Leave': ['paid sick leave', 'sick days', 'sick time', 'paid time off for illness'],
  'Mental Health': ['mental health', 'EAP', 'employee assistance program', 'counseling benefit', 'therapy benefit', 'wellness program', 'mental wellness', 'behavioral health'],
  'Fertility Benefits': ['fertility benefit', 'fertility coverage', 'IVF coverage', 'egg freezing', 'fertility treatment', 'family planning benefit', 'reproductive health'],
  'Retirement': ['401k', '401(k)', 'retirement plan', 'pension', 'employer match', 'retirement benefit', 'defined contribution', 'profit sharing'],
  'Remote Work': ['remote work', 'work from home', 'hybrid work', 'flexible work', 'distributed team', 'remote-first', 'telecommute', 'work flexibility'],
  'Childcare': ['childcare', 'child care', 'daycare', 'dependent care', 'backup care', 'childcare assistance', 'childcare subsidy', 'on-site childcare'],
  'Education Benefits': ['tuition reimbursement', 'tuition assistance', 'education benefit', 'student loan', 'learning stipend', 'professional development', 'continuing education', 'education assistance'],
  'Union Relationships': ['union', 'collective bargaining', 'organized labor', 'labor union', 'union contract', 'unionized', 'CBA', 'labor agreement'],
  'Caregiver Leave': ['caregiver leave', 'family caregiver', 'eldercare', 'bereavement leave', 'compassionate leave', 'family medical leave'],
  'Paid Time Off': ['PTO', 'paid time off', 'vacation days', 'unlimited PTO', 'flexible PTO', 'paid vacation', 'annual leave'],
  'Disability Benefits': ['disability insurance', 'short-term disability', 'long-term disability', 'disability benefit', 'disability coverage'],
  'Life Insurance': ['life insurance', 'AD&D', 'accidental death', 'life benefit', 'survivor benefit'],
  'Equity & Stock': ['stock options', 'RSU', 'restricted stock', 'equity compensation', 'ESPP', 'employee stock', 'equity grant'],
};

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

    console.log(`Worker benefits scan for: ${companyName}`);

    const searchQueries = [
      `"${companyName}" employee benefits healthcare parental leave`,
      `"${companyName}" careers benefits 401k retirement PTO`,
      `"${companyName}" mental health fertility childcare employee support`,
      `"${companyName}" remote work hybrid flexible workplace policy`,
      `"${companyName}" union labor collective bargaining workers`,
      `"${companyName}" tuition reimbursement education professional development`,
      `"${companyName}" ESG employee benefits workplace protections`,
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

    // Try scraping careers/benefits page
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
            allContent += `\n\nSOURCE: ${company.careers_url}\nTYPE: company careers/benefits page\n${md.slice(0, 5000)}`;
          }
        }
      } catch (e) {
        console.error('Careers page scrape failed', e);
      }
    }

    const now = new Date().toISOString();

    if (!allContent || allContent.length < 100) {
      await supabase.from('worker_benefit_signals').delete()
        .eq('company_id', companyId).eq('status', 'auto_detected');

      return new Response(JSON.stringify({
        success: true, signalsFound: 0,
        message: 'No worker benefit signals detected in scanned public sources.',
        scannedAt: now,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const truncated = allContent.slice(0, 25000);
    const categoryList = Object.keys(BENEFIT_CATEGORIES).join(', ');

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
            content: 'You are an expert at detecting employee benefits and workplace protections from public corporate sources. Return only valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze the following content about "${companyName}" for evidence of employee benefits and workplace protections.

Detect signals in these categories: ${categoryList}

Return a JSON array of detected benefit signals:
[{
  "benefit_category": "one of: ${categoryList}",
  "benefit_type": "specific benefit name, e.g. '16 weeks paid parental leave', 'Medical/dental/vision coverage', '401(k) with 6% match'",
  "source_url": "URL where evidence was found, or null",
  "source_type": "e.g. careers page, benefits page, job description, ESG report, press release, Glassdoor, blog post",
  "evidence_text": "1-2 sentence quote or summary of the evidence",
  "detection_method": "keyword_detection or source_parsing or structured_disclosure",
  "confidence": "direct, strong_inference, moderate_inference, or weak_inference"
}]

Return [] if no evidence found. Be specific about what was detected — include actual benefit details when available (e.g. "20 days PTO" not just "PTO offered").

Content:
${truncated}`,
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

    console.log(`Detected ${signals.length} worker benefit signals for ${companyName}`);

    await supabase.from('worker_benefit_signals').delete()
      .eq('company_id', companyId).eq('status', 'auto_detected');

    if (signals.length === 0) {
      return new Response(JSON.stringify({
        success: true, signalsFound: 0,
        message: 'No worker benefit signals detected in scanned public sources.',
        scannedAt: now,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error: insertErr } = await supabase.from('worker_benefit_signals').insert(
      signals.slice(0, 40).map((s: any) => ({
        company_id: companyId,
        benefit_category: s.benefit_category || 'Other',
        benefit_type: s.benefit_type || 'unknown',
        source_url: s.source_url || null,
        source_type: s.source_type || null,
        evidence_text: s.evidence_text || null,
        detection_method: s.detection_method || 'keyword_detection',
        confidence: s.confidence || 'moderate_inference',
        date_detected: now,
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
      scannedAt: now,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Worker benefits scan error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
