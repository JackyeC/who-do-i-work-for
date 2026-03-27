/**
 * Detect Contradictions Engine
 * 
 * Cross-references company public stances against actual spending data
 * to surface evidence-based mismatch signals. No AI — pure data comparison.
 * 
 * Compares:
 * - public_stances (what they say) vs entity_linkages (where money goes)
 * - issue_signals (policy areas funded) vs stated commitments
 * - civil_rights_signals, climate_signals (regulatory actions) vs public claims
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Topic keyword mapping for matching stances to spending categories
const TOPIC_TO_ISSUE_CATEGORIES: Record<string, string[]> = {
  'civil rights': ['civil_rights', 'equality', 'discrimination', 'voting_rights', 'lgbtq'],
  'equality': ['civil_rights', 'equality', 'discrimination', 'lgbtq'],
  'lgbtq': ['lgbtq', 'civil_rights', 'equality'],
  'voting rights': ['voting_rights', 'civil_rights', 'democracy'],
  'climate': ['climate', 'environment', 'energy', 'emissions'],
  'environment': ['climate', 'environment', 'emissions', 'pollution'],
  'labor': ['labor', 'workers_rights', 'unions', 'minimum_wage'],
  'workers rights': ['labor', 'workers_rights', 'unions'],
  'gun control': ['gun_policy', 'firearms', 'gun_control'],
  'gun safety': ['gun_policy', 'firearms', 'gun_control'],
  'immigration': ['immigration', 'border', 'visa'],
  'healthcare': ['healthcare', 'health', 'insurance', 'pharmaceutical'],
  'reproductive rights': ['reproductive_rights', 'abortion', 'womens_health'],
  'diversity': ['diversity', 'dei', 'inclusion', 'civil_rights'],
  'privacy': ['privacy', 'data_privacy', 'surveillance', 'consumer_protection'],
  'consumer protection': ['consumer_protection', 'ftc', 'cfpb'],
};

// Determine if a stance topic matches an issue category
function topicMatchesCategory(stanceTopic: string, issueCategory: string): boolean {
  const normalizedTopic = stanceTopic.toLowerCase().trim();
  for (const [keyword, categories] of Object.entries(TOPIC_TO_ISSUE_CATEGORIES)) {
    if (normalizedTopic.includes(keyword) && categories.some(c => issueCategory.toLowerCase().includes(c))) {
      return true;
    }
  }
  // Fuzzy fallback: direct substring match
  return issueCategory.toLowerCase().includes(normalizedTopic.split(' ')[0]);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth gate: require service-role key
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';
  if (token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { companyId, companyName } = await req.json();
    if (!companyId) {
      return new Response(JSON.stringify({ success: false, error: 'companyId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[detect-contradictions] START: ${companyName || companyId}`);

    // Fetch all relevant data in parallel
    const [
      { data: stances },
      { data: donations },
      { data: issueSignals },
      { data: civilRights },
      { data: climateSignals },
      { data: lobbyingLinks },
      { data: courtCases },
    ] = await Promise.all([
      supabase.from('company_public_stances').select('*').eq('company_id', companyId),
      supabase.from('entity_linkages').select('*').eq('company_id', companyId).in('link_type', ['donation_to_member', 'dark_money_channel', 'trade_association_lobbying']),
      supabase.from('issue_signals').select('*').eq('entity_id', companyId),
      supabase.from('civil_rights_signals').select('*').eq('company_id', companyId),
      supabase.from('climate_signals').select('*').eq('company_id', companyId),
      supabase.from('entity_linkages').select('*').eq('company_id', companyId).eq('link_type', 'lobbying_on_bill'),
      supabase.from('company_court_cases').select('*').eq('company_id', companyId),
    ]);

    const contradictions: Array<{
      company_id: string;
      topic: string;
      public_statement: string;
      spending_reality: string;
      severity: string;
      evidence_sources: any[];
      statement_source_url: string | null;
      spending_source_url: string | null;
    }> = [];

    // 1. Cross-reference public stances against issue signals
    for (const stance of (stances || [])) {
      if (!stance.topic) continue;

      // Already flagged as direct-conflict by company-research
      if (stance.gap === 'direct-conflict') {
        contradictions.push({
          company_id: companyId,
          topic: stance.topic,
          public_statement: stance.public_position || 'Public stance recorded',
          spending_reality: stance.spending_reality || 'Spending contradicts stated position',
          severity: 'high',
          evidence_sources: [{ type: 'public_stance', source: 'Company Research' }],
          statement_source_url: null,
          spending_source_url: null,
        });
        continue;
      }

      // Match stance topic against issue signals
      const matchingIssues = (issueSignals || []).filter(is =>
        topicMatchesCategory(stance.topic, is.issue_category || '')
      );

      for (const issue of matchingIssues) {
        // Check if the issue signal indicates opposing spending
        const description = (issue.description || '').toLowerCase();
        const isOpposing = description.includes('opposing') || description.includes('against') || description.includes('voted no');

        if (isOpposing || stance.gap === 'mixed') {
          const severity = isOpposing ? 'high' : 'medium';
          contradictions.push({
            company_id: companyId,
            topic: stance.topic,
            public_statement: stance.public_position || `Supports ${stance.topic}`,
            spending_reality: `${issue.signal_type}: ${issue.description || 'Spending to opposing interests'}` +
              (issue.amount ? ` ($${Number(issue.amount).toLocaleString()})` : ''),
            severity,
            evidence_sources: [
              { type: 'public_stance', topic: stance.topic },
              { type: 'issue_signal', category: issue.issue_category, source_url: issue.source_url },
            ],
            statement_source_url: null,
            spending_source_url: issue.source_url || null,
          });
        }
      }
    }

    // 2. Check civil rights stances against EEOC/litigation data
    const civilRightsStances = (stances || []).filter(s =>
      ['civil rights', 'equality', 'diversity', 'lgbtq', 'discrimination', 'dei', 'inclusion'].some(
        kw => (s.topic || '').toLowerCase().includes(kw)
      )
    );

    if (civilRightsStances.length > 0 && (civilRights || []).length > 0) {
      const enforcementActions = (civilRights || []).filter(cr =>
        ['eeoc_enforcement', 'civil_rights_litigation', 'discrimination_lawsuit'].includes(cr.signal_type)
      );

      if (enforcementActions.length > 0) {
        const totalSettlement = enforcementActions.reduce((sum, a) => sum + (a.settlement_amount || 0), 0);
        contradictions.push({
          company_id: companyId,
          topic: 'Civil Rights & Equality',
          public_statement: civilRightsStances.map(s => s.public_position).filter(Boolean).join('; ') || 'Publicly supports civil rights',
          spending_reality: `${enforcementActions.length} enforcement action(s)` +
            (totalSettlement > 0 ? ` with $${totalSettlement.toLocaleString()} in settlements` : '') +
            `. Types: ${[...new Set(enforcementActions.map(a => a.signal_type))].join(', ')}`,
          severity: enforcementActions.length >= 3 || totalSettlement > 500000 ? 'high' : 'medium',
          evidence_sources: enforcementActions.map(a => ({
            type: 'civil_rights_signal',
            signal_type: a.signal_type,
            source: a.source_name,
            url: a.source_url,
          })),
          statement_source_url: null,
          spending_source_url: enforcementActions[0]?.source_url || null,
        });
      }
    }

    // 3. Check climate stances against emissions/violations
    const climateStances = (stances || []).filter(s =>
      ['climate', 'environment', 'sustainability', 'carbon', 'emissions', 'net zero'].some(
        kw => (s.topic || '').toLowerCase().includes(kw)
      )
    );

    if (climateStances.length > 0 && (climateSignals || []).length > 0) {
      const violations = (climateSignals || []).filter(cs =>
        ['epa_violation', 'epa_enforcement', 'ghg_emissions'].includes(cs.signal_type)
      );

      if (violations.length > 0) {
        contradictions.push({
          company_id: companyId,
          topic: 'Climate & Environment',
          public_statement: climateStances.map(s => s.public_position).filter(Boolean).join('; ') || 'Publicly commits to climate action',
          spending_reality: `${violations.length} EPA violation(s) or emissions record(s). ` +
            violations.slice(0, 3).map(v => v.description || v.signal_type).join('; '),
          severity: violations.length >= 3 ? 'high' : 'medium',
          evidence_sources: violations.map(v => ({
            type: 'climate_signal',
            signal_type: v.signal_type,
            source: v.source_name,
            url: v.source_url,
          })),
          statement_source_url: null,
          spending_source_url: violations[0]?.source_url || null,
        });
      }
    }

    // 4. Check for lobbying contradictions (lobbying against stated positions)
    for (const stance of (stances || [])) {
      if (!stance.topic) continue;
      const relatedLobbying = (lobbyingLinks || []).filter(l => {
        const desc = (l.description || '').toLowerCase();
        const topic = stance.topic.toLowerCase();
        return desc.includes(topic.split(' ')[0]) || 
               (topic.includes('climate') && desc.includes('energy')) ||
               (topic.includes('labor') && (desc.includes('wage') || desc.includes('union')));
      });

      if (relatedLobbying.length > 0) {
        const totalLobbyingAmount = relatedLobbying.reduce((sum, l) => sum + (l.amount || 0), 0);
        // Only flag if no existing contradiction for this topic
        if (!contradictions.some(c => c.topic === stance.topic)) {
          contradictions.push({
            company_id: companyId,
            topic: stance.topic,
            public_statement: stance.public_position || `States position on ${stance.topic}`,
            spending_reality: `Active lobbying on related legislation` +
              (totalLobbyingAmount > 0 ? ` ($${totalLobbyingAmount.toLocaleString()})` : '') +
              `: ${relatedLobbying.slice(0, 2).map(l => l.target_entity_name || l.description).join(', ')}`,
            severity: 'low',
            evidence_sources: relatedLobbying.map(l => ({
              type: 'lobbying',
              target: l.target_entity_name,
              url: l.evidence_url,
            })),
            statement_source_url: null,
            spending_source_url: relatedLobbying[0]?.evidence_url || null,
          });
        }
      }
    }

    // 5. Labor rights lens: compare worker/labor stances against court cases & NLRB
    const laborStances = (stances || []).filter(s =>
      ['labor', 'worker', 'union', 'wage', 'fair pay', 'employee', 'workplace'].some(
        kw => (s.topic || '').toLowerCase().includes(kw)
      )
    );

    if (laborStances.length > 0) {
      // Check for labor-related court cases
      const laborCases = (courtCases || []).filter((cc: any) => {
        const text = `${cc.nature_of_suit || ''} ${cc.case_name || ''} ${cc.cause || ''} ${cc.summary || ''}`.toLowerCase();
        return ['labor', 'wage', 'flsa', 'nlrb', 'osha', 'discrimination', 'retaliation', 'wrongful termination', 'class action'].some(
          kw => text.includes(kw)
        );
      });

      if (laborCases.length > 0) {
        const totalDamages = laborCases.reduce((sum: number, c: any) => sum + (c.damages_amount || 0), 0);
        contradictions.push({
          company_id: companyId,
          topic: 'Labor & Worker Rights',
          public_statement: laborStances.map(s => s.public_position).filter(Boolean).join('; ') || 'Publicly supports worker rights',
          spending_reality: `${laborCases.length} labor-related court case(s)` +
            (totalDamages > 0 ? ` with $${totalDamages.toLocaleString()} in damages` : '') +
            `. Cases: ${laborCases.slice(0, 2).map((c: any) => c.case_name?.slice(0, 50)).join('; ')}`,
          severity: laborCases.length >= 3 || totalDamages > 500000 ? 'high' : 'medium',
          evidence_sources: laborCases.map((c: any) => ({
            type: 'court_case',
            case_name: c.case_name,
            source: c.source || 'CourtListener',
            url: c.courtlistener_url,
          })),
          statement_source_url: null,
          spending_source_url: laborCases[0]?.courtlistener_url || null,
        });
      }

      // Check for labor-related lobbying against worker interests
      const laborLobbying = (lobbyingLinks || []).filter((l: any) => {
        const desc = (l.description || '').toLowerCase();
        return ['wage', 'union', 'labor', 'nlrb', 'osha', 'worker', 'overtime'].some(kw => desc.includes(kw));
      });

      if (laborLobbying.length > 0 && !contradictions.some(c => c.topic === 'Labor & Worker Rights')) {
        const totalAmount = laborLobbying.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
        contradictions.push({
          company_id: companyId,
          topic: 'Labor & Worker Rights',
          public_statement: laborStances.map(s => s.public_position).filter(Boolean).join('; ') || 'Publicly supports worker rights',
          spending_reality: `${laborLobbying.length} lobbying filing(s) on labor legislation` +
            (totalAmount > 0 ? ` ($${totalAmount.toLocaleString()})` : ''),
          severity: 'medium',
          evidence_sources: laborLobbying.map((l: any) => ({
            type: 'lobbying',
            target: l.target_entity_name,
            url: l.evidence_url,
          })),
          statement_source_url: null,
          spending_source_url: laborLobbying[0]?.evidence_url || null,
        });
      }
    }

    // Deduplicate by topic
    const seen = new Set<string>();
    const unique = contradictions.filter(c => {
      const key = `${c.topic}:${c.severity}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Upsert: clear old and insert new
    if (unique.length > 0) {
      await supabase.from('contradiction_signals').delete().eq('company_id', companyId);
      const { error } = await supabase.from('contradiction_signals').insert(unique);
      if (error) console.error('[detect-contradictions] Insert error:', error);
    }

    console.log(`[detect-contradictions] DONE: ${unique.length} contradictions for ${companyName || companyId}`);

    return new Response(JSON.stringify({
      success: true,
      contradictions: unique.length,
      details: unique.map(c => ({ topic: c.topic, severity: c.severity })),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[detect-contradictions] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
