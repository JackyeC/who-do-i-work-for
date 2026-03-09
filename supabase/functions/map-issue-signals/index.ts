const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Issue keyword mappings ───
const ISSUE_KEYWORDS: Record<string, string[]> = {
  gun_policy: [
    'firearms', 'gun', 'second amendment', 'nra', 'weapons manufacturing',
    'firearm legislation', 'gun control', 'gun rights', 'ammunition',
    'national rifle association', 'gun violence', 'assault weapon',
  ],
  reproductive_rights: [
    'abortion', 'reproductive health', 'planned parenthood', 'family planning',
    'maternal health', 'reproductive rights', 'contraception', 'birth control',
    'roe v wade', 'pro-life', 'pro-choice',
  ],
  labor_rights: [
    'union', 'collective bargaining', 'minimum wage', 'worker protection',
    'labor standards', 'labor rights', 'wage theft', 'right to work',
    'nlrb', 'osha', 'workplace safety', 'fair labor', 'overtime',
  ],
  climate: [
    'climate', 'carbon', 'emissions', 'fossil fuel', 'renewable energy',
    'environmental regulation', 'clean energy', 'greenhouse gas', 'epa',
    'paris agreement', 'global warming', 'sustainability', 'oil and gas',
    'coal', 'petroleum', 'natural gas', 'pipeline',
  ],
  civil_rights: [
    'civil rights', 'discrimination', 'equal protection', 'racial justice',
    'voting rights act', 'affirmative action', 'diversity', 'equity',
    'inclusion', 'dei', 'racial equality', 'police reform',
  ],
  lgbtq_rights: [
    'lgbtq', 'marriage equality', 'gender identity', 'sexual orientation',
    'anti-discrimination', 'transgender', 'same-sex', 'pride',
    'equality act', 'conversion therapy', 'don\'t say gay',
  ],
  voting_rights: [
    'voting access', 'redistricting', 'election integrity', 'gerrymandering',
    'ballot access', 'voter id', 'voter registration', 'election security',
    'mail-in voting', 'absentee ballot', 'voter suppression',
  ],
  immigration: [
    'immigration', 'visa', 'border security', 'detention', 'asylum',
    'refugee', 'daca', 'dreamers', 'ice', 'deportation', 'migrant',
    'border wall', 'h-1b', 'green card', 'citizenship',
  ],
  education: [
    'education policy', 'school funding', 'charter schools', 'student loans',
    'public education', 'higher education', 'title ix', 'school choice',
    'student debt', 'teachers union', 'curriculum', 'voucher',
  ],
  healthcare: [
    'healthcare', 'insurance', 'pharmaceutical', 'drug pricing',
    'medical policy', 'medicare', 'medicaid', 'affordable care act',
    'obamacare', 'prescription drug', 'health insurance', 'public health',
    'hospital', 'biotech', 'fda',
  ],
  consumer_protection: [
    'consumer safety', 'product regulation', 'consumer rights', 'antitrust',
    'ftc', 'cfpb', 'consumer financial', 'data privacy', 'product recall',
    'price gouging', 'monopoly', 'competition',
  ],
};

interface IssueSignal {
  entity_id: string;
  issue_category: string;
  signal_type: string;
  source_dataset: string;
  description: string;
  source_url: string | null;
  confidence_score: string;
  amount: number | null;
}

function matchIssues(text: string): { category: string; matchedKeywords: string[] }[] {
  const lower = text.toLowerCase();
  const matches: { category: string; matchedKeywords: string[] }[] = [];

  for (const [category, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    const matched = keywords.filter(kw => lower.includes(kw));
    if (matched.length > 0) {
      matches.push({ category, matchedKeywords: matched });
    }
  }
  return matches;
}

function determineConfidence(matchCount: number, sourceType: string): string {
  if (sourceType === 'campaign_finance' || sourceType === 'lobbying_disclosure') {
    return matchCount >= 2 ? 'high' : 'medium';
  }
  if (sourceType === 'government_contract') {
    return matchCount >= 2 ? 'high' : 'medium';
  }
  return matchCount >= 3 ? 'medium' : 'low';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { companyId } = await req.json();
    if (!companyId) {
      return new Response(JSON.stringify({ error: 'companyId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[map-issue-signals] Starting issue mapping for company ${companyId}`);

    const signals: IssueSignal[] = [];

    // ─── Source 1: Entity linkages (campaign finance, lobbying, contracts) ───
    const { data: linkages } = await supabase
      .from('entity_linkages')
      .select('source_entity_name, target_entity_name, link_type, description, amount, source_url, confidence_score')
      .eq('company_id', companyId);

    for (const link of linkages || []) {
      const searchText = [link.description, link.source_entity_name, link.target_entity_name].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      const sourceDataset = link.link_type?.includes('donation') ? 'campaign_finance'
        : link.link_type?.includes('lobbying') ? 'lobbying_disclosure'
        : link.link_type?.includes('contract') ? 'government_contract'
        : 'entity_linkage';

      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'keyword_match',
          source_dataset: sourceDataset,
          description: `${match.matchedKeywords.join(', ')} found in: ${link.description || link.target_entity_name || 'linkage record'}`,
          source_url: link.source_url || null,
          confidence_score: determineConfidence(match.matchedKeywords.length, sourceDataset),
          amount: link.amount || null,
        });
      }
    }

    // ─── Source 2: Lobbying records ───
    const { data: lobbying } = await supabase
      .from('company_state_lobbying')
      .select('issues, lobbying_spend, state, year, source')
      .eq('company_id', companyId);

    for (const lob of lobbying || []) {
      const searchText = (lob.issues || []).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'lobbying_issue',
          source_dataset: 'lobbying_disclosure',
          description: `Lobbied on ${match.matchedKeywords.join(', ')} in ${lob.state} (${lob.year})`,
          source_url: lob.source || null,
          confidence_score: 'high',
          amount: lob.lobbying_spend || null,
        });
      }
    }

    // ─── Source 3: Ideology flags ───
    const { data: ideologyFlags } = await supabase
      .from('company_ideology_flags')
      .select('org_name, category, description, amount, evidence_url, severity')
      .eq('company_id', companyId);

    for (const flag of ideologyFlags || []) {
      const searchText = [flag.org_name, flag.category, flag.description].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'ideology_flag',
          source_dataset: 'ideology_scan',
          description: `${flag.org_name}: ${flag.description || match.matchedKeywords.join(', ')}`,
          source_url: flag.evidence_url || null,
          confidence_score: flag.severity === 'high' ? 'high' : 'medium',
          amount: flag.amount || null,
        });
      }
    }

    // ─── Source 4: PAC candidates (donation recipients) ───
    const { data: candidates } = await supabase
      .from('company_candidates')
      .select('name, party, amount, flag_reason, donation_type')
      .eq('company_id', companyId);

    for (const cand of candidates || []) {
      const searchText = [cand.flag_reason, cand.name, cand.donation_type].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'pac_donation',
          source_dataset: 'campaign_finance',
          description: `PAC donation to ${cand.name} (${cand.party}): ${match.matchedKeywords.join(', ')}`,
          source_url: null,
          confidence_score: determineConfidence(match.matchedKeywords.length, 'campaign_finance'),
          amount: cand.amount || null,
        });
      }
    }

    // ─── Source 5: Government contracts (agency contracts) ───
    const { data: contracts } = await supabase
      .from('company_agency_contracts')
      .select('agency_name, contract_description, contract_value, controversy_description, source')
      .eq('company_id', companyId);

    for (const contract of contracts || []) {
      const searchText = [contract.agency_name, contract.contract_description, contract.controversy_description].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'government_contract',
          source_dataset: 'government_contract',
          description: `Contract with ${contract.agency_name}: ${match.matchedKeywords.join(', ')}`,
          source_url: contract.source || null,
          confidence_score: 'high',
          amount: contract.contract_value || null,
        });
      }
    }

    // ─── Source 6: Public stances (hypocrisy index) ───
    const { data: stances } = await supabase
      .from('company_public_stances')
      .select('topic, public_position, spending_reality, gap')
      .eq('company_id', companyId);

    for (const stance of stances || []) {
      const searchText = [stance.topic, stance.public_position, stance.spending_reality].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push({
          entity_id: companyId,
          issue_category: match.category,
          signal_type: 'public_stance',
          source_dataset: 'public_stance_analysis',
          description: `Public stance on ${stance.topic}: "${stance.public_position}" vs spending: "${stance.spending_reality}"`,
          source_url: null,
          confidence_score: 'medium',
          amount: null,
        });
      }
    }

    console.log(`[map-issue-signals] Found ${signals.length} issue signals for company ${companyId}`);

    if (signals.length > 0) {
      // Clear old signals for this company before inserting new ones
      await supabase.from('issue_signals').delete().eq('entity_id', companyId);

      // Deduplicate by category + description
      const seen = new Set<string>();
      const unique = signals.filter(s => {
        const key = `${s.issue_category}:${s.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Insert in batches
      const BATCH_SIZE = 100;
      let inserted = 0;
      for (let i = 0; i < unique.length; i += BATCH_SIZE) {
        const batch = unique.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('issue_signals').insert(batch);
        if (error) {
          console.error(`[map-issue-signals] Insert error:`, error);
        } else {
          inserted += batch.length;
        }
      }

      console.log(`[map-issue-signals] Inserted ${inserted} unique issue signals`);
    }

    // Summary by category
    const categoryCounts: Record<string, number> = {};
    for (const s of signals) {
      categoryCounts[s.issue_category] = (categoryCounts[s.issue_category] || 0) + 1;
    }

    return new Response(JSON.stringify({
      success: true,
      signalsFound: signals.length,
      categoryCounts,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[map-issue-signals] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
