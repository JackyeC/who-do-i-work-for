const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { company_id, user_id } = await req.json();

    if (!company_id || !user_id) {
      return new Response(JSON.stringify({ error: 'company_id and user_id are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch company data
    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyErr || !company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch company signals in parallel
    const [
      { data: aiSignals },
      { data: benefitSignals },
      { data: paySignals },
      { data: sentimentData },
      { data: warnNotices },
    ] = await Promise.all([
      supabase.from('ai_hr_signals').select('signal_type, signal_category, confidence').eq('company_id', company_id).limit(10),
      supabase.from('company_signal_scans').select('signal_type, signal_category, signal_value').eq('company_id', company_id).eq('signal_category', 'worker_benefits').limit(10),
      supabase.from('pay_equity_signals').select('signal_type, signal_category, confidence').eq('company_id', company_id).limit(10),
      supabase.from('company_worker_sentiment').select('overall_rating, sentiment, ai_summary, top_praises, top_complaints').eq('company_id', company_id).order('created_at', { ascending: false }).limit(1),
      supabase.from('company_warn_notices').select('employees_affected, notice_date, layoff_type').eq('company_id', company_id).limit(5),
    ]);

    // Fetch user preferences
    const { data: preferences } = await supabase
      .from('job_match_preferences')
      .select('signal_key, signal_label, is_required')
      .eq('user_id', user_id);

    // Build signal summary for AI
    const signalSummary = {
      ai_hiring: (aiSignals || []).map(s => s.signal_type),
      worker_benefits: (benefitSignals || []).map(s => `${s.signal_type}: ${s.signal_value}`),
      pay_equity: (paySignals || []).map(s => s.signal_type),
      sentiment: sentimentData?.[0] ? {
        rating: sentimentData[0].overall_rating,
        sentiment: sentimentData[0].sentiment,
        praises: sentimentData[0].top_praises,
        complaints: sentimentData[0].top_complaints,
      } : null,
      warn_notices: (warnNotices || []).length,
      civic_footprint_score: company.civic_footprint_score,
    };

    // Calculate alignment score
    let alignmentScore = company.civic_footprint_score || 0;
    const matchedSignals: string[] = [];
    const missingSignals: string[] = [];

    for (const pref of (preferences || [])) {
      const hasSignal = checkSignalPresent(pref.signal_key, signalSummary);
      if (hasSignal) {
        matchedSignals.push(pref.signal_label);
        alignmentScore = Math.min(100, alignmentScore + 5);
      } else if (pref.is_required) {
        missingSignals.push(pref.signal_label);
        alignmentScore = Math.max(0, alignmentScore - 10);
      }
    }

    // Build detailed signal descriptions for the prompt
    const aiToolNames = (aiSignals || []).map(s => s.signal_type).filter(Boolean);
    const benefitNames = (benefitSignals || []).map(s => `${s.signal_type}: ${s.signal_value}`).filter(Boolean);
    const payNames = (paySignals || []).map(s => s.signal_type).filter(Boolean);
    const biasAuditStatus = aiToolNames.some(s => s.toLowerCase().includes('bias audit')) ? 'Verified Bias Audit' : 'No verified audit';

    // Extract detected AI vendor name
    const aiVendorSignal = (aiSignals || []).find(s => s.signal_type === 'ai_vendor_detected');
    const detectedVendor = aiVendorSignal?.evidence_text?.replace('Known AI vendor: ', '') || 'Unknown';

    // Generate structured payload via AI with tool calling
    const prompt = `You are a Career Strategist generating an application payload for a senior professional.

CANDIDATE PROFILE:
- Name: ${profile.full_name || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}
- Skills: ${(profile.skills || []).join(', ') || 'Not provided'}
- Target role: ${(profile.target_job_titles || []).join(', ') || 'Not provided'}

COMPANY: ${company.name}
- Industry: ${company.industry}
- Civic Footprint Score: ${company.civic_footprint_score}/100

DETECTED SIGNALS:
- AI/HR Vendor: ${detectedVendor}
- AI/HR Tools: ${aiToolNames.join(', ') || 'None detected'}
- Worker Benefits: ${benefitNames.join(', ') || 'None detected'}
- Pay Equity Signals: ${payNames.join(', ') || 'None detected'}
- Bias Audit Status: ${biasAuditStatus}
- Worker Sentiment: ${signalSummary.sentiment ? `${signalSummary.sentiment.rating}/5 (${signalSummary.sentiment.sentiment})` : 'No data'}
- WARN Notices: ${signalSummary.warn_notices} on record

ALIGNMENT: ${alignmentScore}% | Matched: ${matchedSignals.join(', ') || 'None'} | Missing: ${missingSignals.join(', ') || 'None'}

Generate three fields plus a full value proposition statement.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a Career Strategist for high-impact professionals. Generate structured application data. No corporate jargon, no flattery. Be specific about detected signals.' },
          { role: 'user', content: prompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_payload',
            description: 'Generate a structured application payload with targeted intro, HR tech alignment, values check, and full value proposition.',
            parameters: {
              type: 'object',
              properties: {
                targeted_intro: {
                  type: 'string',
                  description: 'A 2-sentence value proposition mentioning the company specific Bias Audit status or civic footprint score.',
                },
                hr_tech_alignment: {
                  type: 'string',
                  description: 'A statement addressing the AI vendor detected (e.g. "I am familiar with the Eightfold ecosystem and value its commitment to skills-based ranking"). Be specific to the vendor name.',
                },
                values_check: {
                  type: 'string',
                  description: 'A confirmation of their CROWN Act support, Pay Transparency stance, or worker protection values based on detected signals.',
                },
                matching_statement: {
                  type: 'string',
                  description: 'A 150-250 word Personal Value Proposition with structure: THE LEAD (acknowledge a specific company practice), THE WHY (connect to candidate values), THE EVIDENCE (mention a specific detected signal), THE CTA (how candidate will help).',
                },
              },
              required: ['targeted_intro', 'hr_tech_alignment', 'values_check', 'matching_statement'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'generate_payload' } },
      }),
    });

    let matchingStatement = '';
    let targetedIntro = '';
    let hrTechAlignment = '';
    let valuesCheck = '';

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          targetedIntro = parsed.targeted_intro || '';
          hrTechAlignment = parsed.hr_tech_alignment || '';
          valuesCheck = parsed.values_check || '';
          matchingStatement = parsed.matching_statement || '';
        } catch (e) {
          console.error('Failed to parse tool call:', e);
          // Fallback to content
          matchingStatement = aiData.choices?.[0]?.message?.content || '';
        }
      } else {
        matchingStatement = aiData.choices?.[0]?.message?.content || '';
      }
    } else if (aiResponse.status === 429) {
      targetedIntro = `${company.name} maintains a ${company.civic_footprint_score}/100 civic footprint score. ${biasAuditStatus === 'Verified Bias Audit' ? 'Their verified bias audit demonstrates commitment to fair hiring.' : 'Their transparency practices are worth tracking.'}`;
      hrTechAlignment = `I understand ${company.name} uses ${detectedVendor} in their hiring process and am prepared to engage with their technology stack.`;
      valuesCheck = matchedSignals.length > 0 ? `I value ${company.name}'s commitment to ${matchedSignals.slice(0, 2).join(' and ').toLowerCase()}.` : `I prioritize employers committed to workforce transparency.`;
      matchingStatement = `${targetedIntro} ${hrTechAlignment} ${valuesCheck}`;
    } else if (aiResponse.status === 402) {
      targetedIntro = `${company.name}'s civic transparency practices align with my professional values.`;
      hrTechAlignment = `I'm familiar with ${detectedVendor} hiring technology.`;
      valuesCheck = 'I prioritize employers committed to ethical hiring and workforce transparency.';
      matchingStatement = `${targetedIntro} ${hrTechAlignment} ${valuesCheck}`;
    } else {
      console.error('AI gateway error:', aiResponse.status);
      targetedIntro = `I value ${company.name}'s approach to corporate transparency.`;
      hrTechAlignment = `I'm prepared to engage with ${detectedVendor}-based hiring processes.`;
      valuesCheck = 'Ethical employment practices are central to my career decisions.';
      matchingStatement = `${targetedIntro} ${hrTechAlignment} ${valuesCheck}`;
    }

    return new Response(JSON.stringify({
      success: true,
      payload: {
        fullName: profile.full_name || '',
        email: profile.email || '',
        resumeLink: profile.resume_url || '',
        linkedinUrl: profile.linkedin_url || '',
        matchingStatement: matchingStatement.trim(),
        targetedIntro: targetedIntro.trim(),
        hrTechAlignment: hrTechAlignment.trim(),
        valuesCheck: valuesCheck.trim(),
        detectedVendor,
        biasAuditStatus,
        alignmentScore,
        matchedSignals,
        missingSignals,
        companyName: company.name,
        civicScore: company.civic_footprint_score,
        careerSiteUrl: company.careers_url || null,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('generate-application-payload error:', error);

    if (error instanceof Response) {
      const status = error.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function checkSignalPresent(signalKey: string, signals: any): boolean {
  switch (signalKey) {
    case 'worker_benefits':
      return (signals.worker_benefits || []).length > 0;
    case 'ai_transparency':
      return (signals.ai_hiring || []).some((s: string) =>
        s.toLowerCase().includes('transparency') || s.toLowerCase().includes('disclosure'));
    case 'bias_audit_completed':
      return (signals.ai_hiring || []).some((s: string) =>
        s.toLowerCase().includes('bias audit') || s.toLowerCase().includes('audit'));
    case 'pay_transparency':
      return (signals.pay_equity || []).length > 0;
    case 'salary_range_posted':
      return (signals.pay_equity || []).some((s: string) =>
        s.toLowerCase().includes('salary') || s.toLowerCase().includes('range'));
    case 'worker_sentiment':
      return signals.sentiment?.rating != null && signals.sentiment.rating >= 3.0;
    default:
      return false;
  }
}
