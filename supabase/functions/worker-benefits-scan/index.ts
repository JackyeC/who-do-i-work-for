const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resilientSearch } from '../_shared/resilient-search.ts';

const BENEFIT_CATEGORIES: Record<string, string[]> = {
  'Healthcare': ['health insurance', 'medical coverage', 'dental coverage', 'vision coverage'],
  'Parental Leave': ['parental leave', 'maternity leave', 'paternity leave', 'family leave'],
  'Paid Sick Leave': ['paid sick leave', 'sick days', 'sick time'],
  'Mental Health': ['mental health', 'EAP', 'employee assistance program', 'wellness program'],
  'Fertility Benefits': ['fertility benefit', 'IVF coverage', 'egg freezing'],
  'Retirement': ['401k', '401(k)', 'retirement plan', 'pension', 'employer match'],
  'Remote Work': ['remote work', 'work from home', 'hybrid work', 'flexible work'],
  'Childcare': ['childcare', 'daycare', 'dependent care', 'backup care'],
  'Education Benefits': ['tuition reimbursement', 'education benefit', 'student loan', 'learning stipend'],
  'Union Relationships': ['union', 'collective bargaining', 'organized labor'],
  'Caregiver Leave': ['caregiver leave', 'eldercare', 'bereavement leave'],
  'Paid Time Off': ['PTO', 'paid time off', 'vacation days', 'unlimited PTO'],
  'Disability Benefits': ['disability insurance', 'short-term disability', 'long-term disability'],
  'Life Insurance': ['life insurance', 'AD&D'],
  'Equity & Stock': ['stock options', 'RSU', 'restricted stock', 'ESPP'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = body as Record<string, unknown>;
    const companyId = typeof payload.companyId === 'string' ? payload.companyId.trim() : '';
    const companyName = typeof payload.companyName === 'string' ? payload.companyName.trim() : '';
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(companyId) || !companyName || companyName.length > 160) {
      return new Response(JSON.stringify({ success: false, error: 'companyId and companyName required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!lovableKey) {
      return new Response(JSON.stringify({ success: false, error: 'AI gateway not configured' }), {
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

    const { results } = await resilientSearch(searchQueries, firecrawlKey, lovableKey);

    let allContent = results.map(r =>
      `SOURCE: ${r.url}\nTITLE: ${r.title}\n${r.description}\n${r.markdown?.slice(0, 2000) || ''}`
    ).join('\n\n');

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
      headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at detecting employee benefits and workplace protections from public corporate sources. Return only valid JSON.' },
          { role: 'user', content: `Analyze the following content about "${companyName}" for evidence of employee benefits and workplace protections.\n\nDetect signals in these categories: ${categoryList}\n\nReturn a JSON array of detected benefit signals:\n[{"benefit_category": "one of: ${categoryList}", "benefit_type": "specific benefit name", "source_url": "URL or null", "source_type": "e.g. careers page", "evidence_text": "1-2 sentence summary", "detection_method": "keyword_detection or source_parsing or structured_disclosure", "confidence": "direct, strong_inference, moderate_inference, or weak_inference"}]\n\nReturn [] if no evidence found.\n\nContent:\n${truncated}` },
        ],
      }),
    });

    if (!aiResp.ok) {
      return new Response(JSON.stringify({ success: false, error: 'AI analysis failed' }), {
        status: aiResp.status === 429 ? 429 : aiResp.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await aiResp.json();
    const raw = aiData.choices?.[0]?.message?.content || '[]';
    let signals: any[];
    try {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
      signals = JSON.parse(jsonMatch[1].trim());
      if (!Array.isArray(signals)) signals = [];
    } catch { signals = []; }

    await supabase.from('worker_benefit_signals').delete()
      .eq('company_id', companyId).eq('status', 'auto_detected');

    if (signals.length > 0) {
      await supabase.from('worker_benefit_signals').insert(
        signals.slice(0, 40).map((s: any) => ({
          company_id: companyId, benefit_category: s.benefit_category || 'Other',
          benefit_type: s.benefit_type || 'unknown', source_url: s.source_url || null,
          source_type: s.source_type || null, evidence_text: s.evidence_text || null,
          detection_method: s.detection_method || 'keyword_detection',
          confidence: s.confidence || 'moderate_inference', date_detected: now, status: 'auto_detected',
        }))
      );
    }

    return new Response(JSON.stringify({
      success: true, signalsFound: signals.length, companyId, scannedAt: now,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Worker benefits scan error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
