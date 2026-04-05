const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Issue keyword mappings ───
const ISSUE_KEYWORDS: Record<string, string[]> = {
  gun_policy: [
    'firearms', 'gun', 'second amendment', 'nra', 'weapons manufacturing',
    'firearm legislation', 'gun control', 'gun rights', 'ammunition',
    'national rifle association', 'gun violence', 'assault weapon',
    'national shooting sports foundation', 'nssf', 'second amendment foundation',
    'everytown', 'brady campaign', 'giffords', 'gun safety',
    'concealed carry', 'open carry', 'firearms policy', 'weapons regulation',
    'smith & wesson', 'sturm ruger', 'vista outdoor', 'olin corporation',
    'american outdoor brands', 'firearm manufacturer', 'ammunition manufacturer',
  ],
  reproductive_rights: [
    'abortion', 'reproductive health', 'planned parenthood', 'family planning',
    'maternal health', 'reproductive rights', 'contraception', 'birth control',
    'roe v wade', 'pro-life', 'pro-choice', 'title x funding', 'title x program',
    'contraceptive access', 'reproductive healthcare', 'dobbs', 'roe v. wade',
    'pregnancy discrimination', 'ivf', 'in vitro fertilization',
    'naral', 'emily\'s list', 'emilys list', 'susan b anthony list',
    'march for life', 'americans united for life', 'national right to life',
    'center for reproductive rights', 'reproductive freedom',
    'heartbeat bill', 'fetal personhood', 'medication abortion',
    'mifepristone', 'misoprostol', 'abortion ban', 'abortion access',
    'women\'s reproductive', 'reproductive justice',
  ],
  labor_rights: [
    'union', 'collective bargaining', 'minimum wage', 'worker protection',
    'labor standards', 'labor rights', 'wage theft', 'right to work',
    'nlrb', 'osha', 'workplace safety', 'fair labor', 'overtime',
    'employee rights', 'labor law', 'workers compensation', 'prevailing wage',
  ],
  climate: [
    'climate', 'carbon', 'emissions', 'fossil fuel', 'renewable energy',
    'environmental regulation', 'clean energy', 'greenhouse gas', 'epa',
    'paris agreement', 'global warming', 'sustainability', 'oil and gas',
    'coal', 'petroleum', 'natural gas', 'pipeline', 'clean air', 'clean water',
    'pollution', 'environmental protection',
  ],
  civil_rights: [
    'civil rights', 'discrimination', 'equal protection', 'racial justice',
    'voting rights act', 'affirmative action', 'diversity', 'equity',
    'inclusion', 'dei', 'racial equality', 'police reform', 'racial profiling',
    'hate crime', 'equal opportunity',
  ],
  lgbtq_rights: [
    'lgbtq', 'marriage equality', 'gender identity', 'sexual orientation',
    'anti-discrimination', 'transgender', 'same-sex', 'pride',
    'equality act', 'conversion therapy', 'don\'t say gay',
  ],
  voting_rights: [
    'voting access', 'redistricting', 'election integrity', 'gerrymandering',
    'ballot access', 'voter id', 'voter registration', 'election security',
    'mail-in voting', 'absentee ballot', 'voter suppression', 'voting rights',
  ],
  immigration: [
    'immigration', 'visa', 'border security', 'detention', 'asylum',
    'refugee', 'daca', 'dreamers', 'ice', 'deportation', 'migrant',
    'border wall', 'h-1b', 'green card', 'citizenship', 'border patrol',
    'immigration enforcement', 'immigration reform',
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
    'hospital', 'biotech', 'fda', 'mental health', 'substance abuse',
  ],
  consumer_protection: [
    'consumer safety', 'product regulation', 'consumer rights', 'antitrust',
    'ftc', 'cfpb', 'consumer financial', 'data privacy', 'product recall',
    'price gouging', 'monopoly', 'competition',
  ],
  faith_christian: [
    'religious liberty', 'religious freedom', 'faith based', 'church',
    'christian values', 'prayer', 'conscience protection',
  ],
  israel_mideast: [
    'israel', 'bds', 'middle east', 'palestinian', 'iron dome',
    'anti-semitism', 'zionism',
  ],
};

// ─── Congress.gov policy_area → issue category mapping ───
const POLICY_AREA_TO_ISSUE: Record<string, string[]> = {
  'Labor and Employment': ['labor_rights'],
  'Environmental Protection': ['climate'],
  'Energy': ['climate'],
  'Civil Rights and Liberties, Minority Issues': ['civil_rights', 'lgbtq_rights', 'voting_rights'],
  'Immigration': ['immigration'],
  'Education': ['education'],
  'Health': ['healthcare', 'reproductive_rights'],
  'Consumer Protection': ['consumer_protection'],
  'Crime and Law Enforcement': ['gun_policy'],
  'Commerce': ['consumer_protection'],
  'Finance and Financial Sector': ['consumer_protection'],
  'Taxation': ['labor_rights'],
  'Social Welfare': ['labor_rights', 'healthcare'],
  'Public Lands and Natural Resources': ['climate'],
  'Water Resources Development': ['climate'],
  'Science, Technology, Communications': ['consumer_protection'],
  'Women': ['reproductive_rights', 'civil_rights'],
  'Families': ['reproductive_rights', 'healthcare'],
  'International Affairs': ['immigration', 'israel_mideast'],
  'Government Operations and Politics': ['voting_rights'],
  'Housing and Community Development': ['civil_rights'],
  'Agriculture and Food': ['consumer_protection'],
  'Native Americans': ['civil_rights'],
};

// ─── Gun policy classification ───
const GUN_RIGHTS_ORGS = [
  'national rifle association', 'nra', 'second amendment foundation',
  'national shooting sports foundation', 'nssf', 'gun owners of america',
  'firearms policy coalition',
];
const GUN_CONTROL_ORGS = [
  'everytown for gun safety', 'everytown', 'brady campaign', 'brady',
  'giffords', 'moms demand action', 'march for our lives',
  'coalition to stop gun violence', 'sandy hook promise',
];
const FIREARM_INDUSTRY_KEYWORDS = [
  'smith & wesson', 'sturm ruger', 'ruger', 'vista outdoor',
  'olin corporation', 'american outdoor brands', 'remington',
  'sig sauer', 'colt', 'beretta', 'firearms manufacturer',
  'ammunition manufacturer', 'weapons manufacturer',
];

const KNOWN_GUN_POLICY_ACTIONS: { companies: string[]; action: string; subtype: string; source: string }[] = [
  { companies: ["dick's sporting goods", "dicks sporting goods"], action: "Stopped selling assault-style weapons and raised purchase age to 21 (2018)", subtype: "gun_control_signal", source: "Corporate press release / SEC filing" },
  { companies: ["walmart"], action: "Raised minimum age for gun purchases to 21 and discontinued sales of assault-style rifle ammunition (2019)", subtype: "gun_control_signal", source: "Corporate press release" },
  { companies: ["levi strauss", "levi's"], action: "Created $1M fund for gun violence prevention groups and joined Everytown Business Leaders for Gun Safety", subtype: "gun_control_signal", source: "Giffords Impact Network" },
  { companies: ["citigroup", "citi"], action: "Requires retail clients to restrict gun sales to those under 21 and mandate background checks", subtype: "gun_control_signal", source: "Corporate policy announcement" },
  { companies: ["bank of america"], action: "Stopped lending to manufacturers of military-style rifles for civilian use", subtype: "gun_control_signal", source: "Corporate press release" },
  { companies: ["salesforce"], action: "Banned customers from using Salesforce Commerce Cloud to sell certain weapons and accessories", subtype: "gun_control_signal", source: "Salesforce Acceptable Use Policy" },
  { companies: ["aldi"], action: "Prohibits open carry of firearms in stores", subtype: "gun_control_signal", source: "Corporate policy" },
  { companies: ["kroger"], action: "Requested customers not openly carry firearms in stores and ceased gun/ammo sales in Alaska", subtype: "gun_control_signal", source: "Corporate statement" },
  { companies: ["vista outdoor"], action: "Major firearms and ammunition manufacturer (Federal, CCI, Speer brands)", subtype: "firearm_industry_signal", source: "SEC filings" },
  { companies: ["smith & wesson", "smith and wesson"], action: "Major firearms manufacturer, member of NSSF", subtype: "firearm_industry_signal", source: "SEC filings" },
  { companies: ["bass pro shops"], action: "Major firearms retailer, opposes additional gun restrictions", subtype: "gun_rights_signal", source: "Public business model" },
];

function classifyGunPolicySubtype(text: string, signalType: string): string {
  const lower = text.toLowerCase();
  if (signalType === 'lobbying_issue' || lower.includes('lobbying')) return 'lobbying_signal';
  for (const org of GUN_RIGHTS_ORGS) { if (lower.includes(org)) return 'gun_rights_signal'; }
  for (const org of GUN_CONTROL_ORGS) { if (lower.includes(org)) return 'gun_control_signal'; }
  for (const kw of FIREARM_INDUSTRY_KEYWORDS) { if (lower.includes(kw)) return 'firearm_industry_signal'; }
  if (signalType === 'pac_donation' || lower.includes('donation') || lower.includes('pac'))
    return 'legislator_support_signal';
  return 'advocacy_signal';
}

interface IssueSignal {
  entity_id: string;
  entity_name_snapshot: string | null;
  issue_category: string;
  signal_type: string;
  signal_subtype: string | null;
  source_dataset: string;
  description: string;
  source_url: string | null;
  confidence_score: string;
  amount: number | null;
  transaction_date: string | null;
}

/** Must use word boundaries — e.g. substring "ice" matches "ALICE" in FEC donor names (false immigration signal). */
const KEYWORD_USE_WORD_BOUNDARY = new Set<string>(['ice']);

function keywordMatchesInText(lower: string, kw: string): boolean {
  if (KEYWORD_USE_WORD_BOUNDARY.has(kw)) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  }
  return lower.includes(kw);
}

function matchIssues(text: string): { category: string; matchedKeywords: string[] }[] {
  const lower = text.toLowerCase();
  const matches: { category: string; matchedKeywords: string[] }[] = [];
  for (const [category, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    const matched = keywords.filter((kw) => keywordMatchesInText(lower, kw));
    if (matched.length > 0) matches.push({ category, matchedKeywords: matched });
  }
  return matches;
}

function determineConfidence(matchCount: number, sourceType: string): string {
  if (sourceType === 'campaign_finance' || sourceType === 'lobbying_disclosure') return matchCount >= 2 ? 'high' : 'medium';
  if (sourceType === 'government_contract') return matchCount >= 2 ? 'high' : 'medium';
  if (sourceType === 'congress_legislation') return 'high';
  if (sourceType === 'fec_direct') return 'high';
  if (sourceType === 'issue_legislation_map') return 'high';
  return matchCount >= 3 ? 'medium' : 'low';
}

// ─── Direct FEC API query when local data is thin ───
async function queryFECDirect(companyName: string, companyId: string): Promise<IssueSignal[]> {
  const fecApiKey = Deno.env.get('OPENFEC_API_KEY');
  if (!fecApiKey) {
    console.log('[map-issue-signals] No OPENFEC_API_KEY, skipping direct FEC query');
    return [];
  }

  const signals: IssueSignal[] = [];
  try {
    // Search for PAC committees associated with this company
    const searchTerms = [companyName];
    // Also try without common suffixes
    const stripped = companyName.replace(/\b(inc|llc|corp|corporation|company|co|ltd|group|holdings)\b\.?/gi, '').trim();
    if (stripped !== companyName && stripped.length > 3) searchTerms.push(stripped);

    for (const term of searchTerms) {
      const url = `https://api.open.fec.gov/v1/committees/?api_key=${fecApiKey}&q=${encodeURIComponent(term)}&committee_type=Q&per_page=5`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();

      for (const committee of data.results || []) {
        // Get top disbursements from this PAC
        const disbUrl = `https://api.open.fec.gov/v1/schedules/schedule_b/?api_key=${fecApiKey}&committee_id=${committee.committee_id}&per_page=20&sort=-disbursement_amount&two_year_transaction_period=2024`;
        const disbResp = await fetch(disbUrl);
        if (!disbResp.ok) continue;
        const disbData = await disbResp.json();

        for (const disb of disbData.results || []) {
          if (!disb.recipient_name) continue;
          const description = `${committee.name} PAC disbursed $${disb.disbursement_amount?.toLocaleString()} to ${disb.recipient_name}`;
          const searchText = [disb.recipient_name, disb.disbursement_description || ''].join(' ');
          const matches = matchIssues(searchText);

          // Even without keyword matches, this is a campaign finance signal
          if (matches.length === 0 && disb.candidate_id) {
            // We'll link this candidate to legislation in a separate step
            continue;
          }

          for (const match of matches) {
            signals.push({
              entity_id: companyId,
              entity_name_snapshot: companyName,
              issue_category: match.category,
              signal_type: 'pac_disbursement',
              signal_subtype: match.category === 'gun_policy' ? classifyGunPolicySubtype(description, 'pac_donation') : null,
              source_dataset: 'fec_direct',
              description,
              source_url: `https://www.fec.gov/data/disbursements/?committee_id=${committee.committee_id}`,
              confidence_score: 'high',
              amount: disb.disbursement_amount || null,
              transaction_date: disb.disbursement_date || null,
            });
          }
        }

        // Get individual contributions (schedule_a) to this company's PAC — shows who receives
        const contribUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?api_key=${fecApiKey}&committee_id=${committee.committee_id}&per_page=10&sort=-contribution_receipt_amount&two_year_transaction_period=2024`;
        const contribResp = await fetch(contribUrl);
        if (!contribResp.ok) continue;
        const contribData = await contribResp.json();

        if ((contribData.results || []).length > 0) {
          signals.push({
            entity_id: companyId,
            entity_name_snapshot: companyName,
            issue_category: 'labor_rights', // PAC activity is labor-relevant by default
            signal_type: 'pac_activity',
            signal_subtype: 'active_pac',
            source_dataset: 'fec_direct',
            description: `${committee.name} raised $${contribData.results.reduce((sum: number, r: any) => sum + (r.contribution_receipt_amount || 0), 0).toLocaleString()} in the 2024 cycle from ${contribData.results.length}+ contributors`,
            source_url: `https://www.fec.gov/data/committee/${committee.committee_id}/`,
            confidence_score: 'high',
            amount: contribData.results.reduce((sum: number, r: any) => sum + (r.contribution_receipt_amount || 0), 0),
            transaction_date: null,
          });
        }
      }
    }
  } catch (e: any) {
    console.error('[map-issue-signals] FEC direct query error:', e);
  }
  return signals;
}

// ─── Match against issue_legislation_map table ───
async function matchLegislationMap(
  supabase: any, companyId: string, companyName: string | null,
  recipientNames: string[]
): Promise<IssueSignal[]> {
  const signals: IssueSignal[] = [];
  if (recipientNames.length === 0) return signals;

  const { data: legislationMap } = await supabase
    .from('issue_legislation_map')
    .select('issue_category, bill_keyword, policy_area, description');

  if (!legislationMap || legislationMap.length === 0) return signals;

  // For each recipient, check if they match any legislation keywords
  for (const recipient of recipientNames) {
    const lower = recipient.toLowerCase();
    for (const mapping of legislationMap) {
      // This is used when we have bill text or committee data for recipients
      // The structured mapping provides higher confidence than keyword matching
      if (lower.includes(mapping.bill_keyword)) {
        signals.push({
          entity_id: companyId,
          entity_name_snapshot: companyName,
          issue_category: mapping.issue_category,
          signal_type: 'legislation_link',
          signal_subtype: 'structured_mapping',
          source_dataset: 'issue_legislation_map',
          description: `${mapping.description}: detected in records linked to ${companyName || 'company'}`,
          source_url: null,
          confidence_score: 'high',
          amount: null,
          transaction_date: null,
        });
      }
    }
  }
  return signals;
}

// ─── Agency → Issue category mapping for government contracts ───
const AGENCY_ISSUE_MAP: Record<string, string[]> = {
  'Department of Defense': ['immigration'],
  'Department of Homeland Security': ['immigration', 'voting_rights'],
  'Immigration and Customs Enforcement': ['immigration'],
  'Customs and Border Protection': ['immigration'],
  'Department of Education': ['education'],
  'Department of Labor': ['labor_rights'],
  'Environmental Protection Agency': ['climate'],
  'Department of Energy': ['climate'],
  'Department of Health and Human Services': ['healthcare', 'reproductive_rights'],
  'Food and Drug Administration': ['healthcare', 'consumer_protection'],
  'Centers for Medicare and Medicaid': ['healthcare'],
  'Federal Trade Commission': ['consumer_protection'],
  'Consumer Financial Protection Bureau': ['consumer_protection'],
  'Department of Justice': ['civil_rights', 'gun_policy'],
  'Bureau of Alcohol, Tobacco, Firearms': ['gun_policy'],
  'Equal Employment Opportunity Commission': ['civil_rights'],
  'Department of the Interior': ['climate'],
  'Department of Agriculture': ['consumer_protection', 'climate'],
  'Department of Housing and Urban Development': ['civil_rights'],
};

Deno.serve(async (req: Request) => {
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

    console.log(`[map-issue-signals] Starting for ${companyId}`);

    const { data: companyRow } = await supabase
      .from('companies')
      .select('name, description, industry, parent_company')
      .eq('id', companyId)
      .single();
    const companyName = companyRow?.name || null;
    const companyDescription = companyRow?.description || '';
    const companyIndustry = companyRow?.industry || '';

    const signals: IssueSignal[] = [];
    let recordsAnalyzed = 0;

    function buildSignal(
      category: string, matchedKeywords: string[], signalType: string,
      sourceDataset: string, description: string, sourceUrl: string | null,
      amount: number | null, transactionDate: string | null,
    ): IssueSignal {
      const subtype = category === 'gun_policy'
        ? classifyGunPolicySubtype(description + ' ' + matchedKeywords.join(' '), signalType)
        : null;
      return {
        entity_id: companyId, entity_name_snapshot: companyName,
        issue_category: category, signal_type: signalType, signal_subtype: subtype,
        source_dataset: sourceDataset, description, source_url: sourceUrl,
        confidence_score: determineConfidence(matchedKeywords.length, sourceDataset),
        amount, transaction_date: transactionDate,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 1: Congress.gov Legislation (highest confidence)
    // ═══════════════════════════════════════════════════════════
    const { data: congressSignals } = await supabase
      .from('company_signal_scans')
      .select('signal_type, signal_value, raw_excerpt, source_url')
      .eq('company_id', companyId)
      .eq('signal_category', 'congress_cross_reference');

    let legislationSignalsGenerated = 0;
    const recipientNames: string[] = [];

    for (const scan of congressSignals || []) {
      recordsAnalyzed++;
      if (!scan.raw_excerpt) continue;
      let parsed: any;
      try { parsed = typeof scan.raw_excerpt === 'string' ? JSON.parse(scan.raw_excerpt) : scan.raw_excerpt; }
      catch { continue; }

      if (parsed.policy_area_focus) {
        for (const policyItem of parsed.policy_area_focus) {
          const issueCategories = POLICY_AREA_TO_ISSUE[policyItem.area] || [];
          for (const issueCategory of issueCategories) {
            signals.push({
              entity_id: companyId, entity_name_snapshot: companyName,
              issue_category: issueCategory, signal_type: 'legislation_sponsorship',
              signal_subtype: 'pac_recipient_legislation', source_dataset: 'congress_legislation',
              description: `${policyItem.count} bills in "${policyItem.area}" sponsored by politicians who received ${companyName} PAC funds`,
              source_url: 'https://www.congress.gov',
              confidence_score: 'high', amount: null, transaction_date: null,
            });
            legislationSignalsGenerated++;
          }
        }
      }

      if (parsed.top_recipients) {
        for (const recipient of parsed.top_recipients) {
          recipientNames.push(recipient.name);
          const recentBill = recipient.recent_bill;
          if (recentBill) {
            const billMatches = matchIssues(recentBill);
            for (const match of billMatches) {
              signals.push({
                entity_id: companyId, entity_name_snapshot: companyName,
                issue_category: match.category, signal_type: 'legislation_sponsorship',
                signal_subtype: 'pac_recipient_bill', source_dataset: 'congress_legislation',
                description: `${recipient.name} (${recipient.party}) received $${recipient.amount?.toLocaleString()} from ${companyName} PAC and sponsors: "${recentBill}"`,
                source_url: `https://www.congress.gov/search?q=${encodeURIComponent(recentBill)}`,
                confidence_score: 'high', amount: recipient.amount || null, transaction_date: null,
              });
              legislationSignalsGenerated++;
            }
          }
          if (recipient.committees) {
            for (const committee of recipient.committees) {
              const committeeMatches = matchIssues(committee);
              for (const match of committeeMatches) {
                signals.push({
                  entity_id: companyId, entity_name_snapshot: companyName,
                  issue_category: match.category, signal_type: 'committee_assignment',
                  signal_subtype: 'pac_recipient_committee', source_dataset: 'congress_legislation',
                  description: `${recipient.name} (${recipient.party}) sits on "${committee}" — received $${recipient.amount?.toLocaleString()} from ${companyName} PAC`,
                  source_url: `https://www.congress.gov`,
                  confidence_score: 'high', amount: recipient.amount || null, transaction_date: null,
                });
                legislationSignalsGenerated++;
              }
            }
          }
        }
      }

      if (scan.signal_type === 'worker_relevant_legislation' && parsed.bills) {
        for (const bill of parsed.bills) {
          const policyIssues = POLICY_AREA_TO_ISSUE[bill.policy_area] || [];
          for (const issueCategory of policyIssues) {
            signals.push({
              entity_id: companyId, entity_name_snapshot: companyName,
              issue_category: issueCategory, signal_type: 'legislation_sponsorship',
              signal_subtype: 'worker_relevant_bill', source_dataset: 'congress_legislation',
              description: `${bill.sponsor} (${bill.party}) sponsors "${bill.bill_title}" — received ${companyName} PAC funds`,
              source_url: `https://www.congress.gov/search?q=${encodeURIComponent(bill.bill_title)}`,
              confidence_score: 'high', amount: null, transaction_date: null,
            });
            legislationSignalsGenerated++;
          }
        }
      }
    }

    console.log(`[map-issue-signals] Congress.gov: ${legislationSignalsGenerated} signals`);

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Structured issue_legislation_map matching
    // ═══════════════════════════════════════════════════════════
    const legislationMapSignals = await matchLegislationMap(supabase, companyId, companyName, recipientNames);
    signals.push(...legislationMapSignals);

    // ═══════════════════════════════════════════════════════════
    // STEP 3: FEC Campaign Finance (entity_linkages)
    // ═══════════════════════════════════════════════════════════
    const { data: linkages } = await supabase
      .from('entity_linkages')
      .select('source_entity_name, target_entity_name, link_type, description, amount, source_citation, confidence_score')
      .eq('company_id', companyId);

    for (const link of linkages || []) {
      recordsAnalyzed++;
      const searchText = [link.description, link.source_entity_name, link.target_entity_name].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      const sourceDataset = link.link_type?.includes('donation') ? 'campaign_finance'
        : link.link_type?.includes('lobbying') ? 'lobbying_disclosure'
        : link.link_type?.includes('contract') ? 'government_contract'
        : 'entity_linkage';

      let sourceUrl: string | null = null;
      if (link.source_citation) {
        try {
          const citations = typeof link.source_citation === 'string' ? JSON.parse(link.source_citation) : link.source_citation;
          if (Array.isArray(citations) && citations[0]?.url) sourceUrl = citations[0].url;
        } catch { /* ignore */ }
      }

      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'keyword_match', sourceDataset,
          `${match.matchedKeywords.join(', ')} found in: ${link.description || link.target_entity_name || 'linkage record'}`,
          sourceUrl, link.amount || null, null));
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Direct FEC API query if local data is thin
    // ═══════════════════════════════════════════════════════════
    const localCampaignSignals = signals.filter(s => ['campaign_finance', 'fec_direct', 'congress_legislation'].includes(s.source_dataset)).length;
    if (localCampaignSignals < 5 && companyName) {
      console.log(`[map-issue-signals] Only ${localCampaignSignals} campaign signals — querying FEC directly`);
      const fecSignals = await queryFECDirect(companyName, companyId);
      signals.push(...fecSignals);
      recordsAnalyzed += fecSignals.length;
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 5: Senate LDA Lobbying Records
    // ═══════════════════════════════════════════════════════════
    const { data: lobbying } = await supabase
      .from('company_state_lobbying')
      .select('issues, lobbying_spend, state, year, source')
      .eq('company_id', companyId);

    for (const lob of lobbying || []) {
      recordsAnalyzed++;
      const searchText = (lob.issues || []).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'lobbying_issue', 'lobbying_disclosure',
          `Lobbied on ${match.matchedKeywords.join(', ')} in ${lob.state} (${lob.year})`,
          lob.source || null, lob.lobbying_spend || null, null));
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 6: Government Contracts (with agency → issue mapping)
    // ═══════════════════════════════════════════════════════════
    const { data: contracts } = await supabase
      .from('company_agency_contracts')
      .select('agency_name, contract_description, contract_value, controversy_description, source, contract_id_external')
      .eq('company_id', companyId);

    for (const contract of contracts || []) {
      recordsAnalyzed++;
      const searchText = [contract.agency_name, contract.contract_description, contract.controversy_description].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      const contractUrl = contract.contract_id_external
        ? `https://www.usaspending.gov/search/?hash=&keyword=${encodeURIComponent(contract.contract_id_external)}`
        : contract.source || null;

      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'government_contract', 'government_contract',
          `Contract with ${contract.agency_name}: ${match.matchedKeywords.join(', ')}`,
          contractUrl, contract.contract_value || null, null));
      }

      // Agency-based issue mapping (structured, not keyword-dependent)
      if (contract.agency_name) {
        for (const [agency, categories] of Object.entries(AGENCY_ISSUE_MAP)) {
          if (contract.agency_name.toLowerCase().includes(agency.toLowerCase())) {
            for (const cat of categories) {
              // Avoid duplicates with keyword matches
              if (!matches.some(m => m.category === cat)) {
                signals.push({
                  entity_id: companyId, entity_name_snapshot: companyName,
                  issue_category: cat, signal_type: 'agency_contract',
                  signal_subtype: 'agency_issue_link', source_dataset: 'government_contract',
                  description: `Federal contract with ${contract.agency_name} ($${(contract.contract_value || 0).toLocaleString()})`,
                  source_url: contractUrl, confidence_score: 'medium',
                  amount: contract.contract_value || null, transaction_date: null,
                });
              }
            }
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 7: Secondary enrichment sources
    // ═══════════════════════════════════════════════════════════

    // Ideology flags
    const { data: ideologyFlags } = await supabase
      .from('company_ideology_flags')
      .select('org_name, category, description, amount, evidence_url, severity')
      .eq('company_id', companyId);
    for (const flag of ideologyFlags || []) {
      recordsAnalyzed++;
      const searchText = [flag.org_name, flag.category, flag.description].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'ideology_flag', 'ideology_scan',
          `${flag.org_name}: ${flag.description || match.matchedKeywords.join(', ')}`,
          flag.evidence_url || null, flag.amount || null, null));
      }
    }

    // PAC candidates
    const { data: candidates } = await supabase
      .from('company_candidates')
      .select('name, party, amount, flag_reason, donation_type')
      .eq('company_id', companyId);
    for (const cand of candidates || []) {
      recordsAnalyzed++;
      const searchText = [cand.flag_reason, cand.name, cand.donation_type].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'pac_donation', 'campaign_finance',
          `PAC donation to ${cand.name} (${cand.party}): ${match.matchedKeywords.join(', ')}`,
          `https://www.fec.gov/data/receipts/?contributor_name=${encodeURIComponent(companyName || '')}`,
          cand.amount || null, null));
      }
    }

    // Public stances
    const { data: stances } = await supabase
      .from('company_public_stances')
      .select('topic, public_position, spending_reality, gap')
      .eq('company_id', companyId);
    for (const stance of stances || []) {
      recordsAnalyzed++;
      const searchText = [stance.topic, stance.public_position, stance.spending_reality].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'public_stance', 'public_stance_analysis',
          `Public stance on ${stance.topic}: "${stance.public_position}" vs spending: "${stance.spending_reality}"`,
          null, null, null));
      }
    }

    // Company description
    if (companyDescription || companyIndustry) {
      const searchText = `${companyDescription} ${companyIndustry}`;
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'company_description', 'company_profile',
          `Company profile mentions: ${match.matchedKeywords.join(', ')}`, null, null, null));
      }
    }

    // Non-congress signal scans
    const { data: signalScans } = await supabase
      .from('company_signal_scans')
      .select('signal_category, signal_type, signal_value, raw_excerpt, source_url')
      .eq('company_id', companyId)
      .neq('signal_category', 'congress_cross_reference');
    for (const scan of signalScans || []) {
      recordsAnalyzed++;
      const searchText = [scan.signal_category, scan.signal_type, scan.signal_value, scan.raw_excerpt].filter(Boolean).join(' ');
      const matches = matchIssues(searchText);
      for (const match of matches) {
        signals.push(buildSignal(match.category, match.matchedKeywords, 'signal_scan', 'company_signal_scan',
          `Signal scan: ${match.matchedKeywords.join(', ')} in ${scan.signal_category}`,
          scan.source_url || null, null, null));
      }
    }

    // Known corporate gun policy actions
    if (companyName) {
      const lowerName = companyName.toLowerCase();
      for (const entry of KNOWN_GUN_POLICY_ACTIONS) {
        const matched = entry.companies.some(alias => lowerName.includes(alias) || alias.includes(lowerName));
        if (matched) {
          signals.push({
            entity_id: companyId, entity_name_snapshot: companyName,
            issue_category: 'gun_policy', signal_type: 'corporate_policy_action',
            signal_subtype: entry.subtype, source_dataset: 'known_corporate_actions',
            description: entry.action, source_url: null,
            confidence_score: 'high', amount: null, transaction_date: null,
          });
        }
      }
    }

    console.log(`[map-issue-signals] Total signals: ${signals.length}`);

    // ═══════════════════════════════════════════════════════════
    // STEP 8: Deduplicate and insert
    // ═══════════════════════════════════════════════════════════
    if (signals.length > 0) {
      await supabase.from('issue_signals').delete().eq('entity_id', companyId);

      const seen = new Set<string>();
      const unique = signals.filter(s => {
        const key = `${s.issue_category}:${s.signal_subtype || ''}:${s.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const BATCH_SIZE = 100;
      let inserted = 0;
      for (let i = 0; i < unique.length; i += BATCH_SIZE) {
        const batch = unique.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('issue_signals').insert(batch);
        if (error) console.error(`[map-issue-signals] Insert error:`, error);
        else inserted += batch.length;
      }
      console.log(`[map-issue-signals] Inserted ${inserted} unique issue signals`);
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 9: Update issue_scan_status for each category
    // ═══════════════════════════════════════════════════════════
    const categoryCounts: Record<string, number> = {};
    for (const s of signals) {
      categoryCounts[s.issue_category] = (categoryCounts[s.issue_category] || 0) + 1;
    }
    const sourceCounts: Record<string, number> = {};
    for (const s of signals) {
      sourceCounts[s.source_dataset] = (sourceCounts[s.source_dataset] || 0) + 1;
    }

    // Update scan status per category
    for (const [category, count] of Object.entries(categoryCounts)) {
      await supabase.from('issue_scan_status').upsert({
        issue_category: category,
        signals_generated: count,
        records_analyzed: recordsAnalyzed,
        companies_scanned: 1, // Will be accumulated by backfill
        last_scan_at: new Date().toISOString(),
        scan_status: 'completed',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'issue_category' });
    }

    return new Response(JSON.stringify({
      success: true,
      signalsFound: signals.length,
      categoryCounts,
      sourceCounts,
      legislationSignals: legislationSignalsGenerated,
      recordsAnalyzed,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[map-issue-signals] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
