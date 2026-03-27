/**
 * Sync Regulatory Violations
 * 
 * Pulls enforcement/violation data from free public APIs:
 * 1. EPA ECHO (Environmental violations & penalties)
 * 2. OSHA (Workplace safety inspections & penalties)
 * 3. SEC EDGAR (Securities enforcement actions - curated)
 * 4. FTC (Consumer protection enforcement - curated)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function normalizeCompanyName(name: string): string {
  return name
    .replace(/[,.]?\s*(Inc|LLC|Corp|Corporation|Ltd|Holdings|Group|Company|Co|L\.P\.|LP|Brands?)\.?$/i, '')
    .trim();
}

// ─── 1. EPA ECHO Violations (Live API) ───
async function fetchEPAViolations(companyName: string): Promise<any[]> {
  const results: any[] = [];
  const searchName = normalizeCompanyName(companyName);
  try {
    // EPA ECHO Detailed Facility Report search
    const encoded = encodeURIComponent(searchName);
    const url = `https://echo.epa.gov/dfr-rest-services.get_facilities?p_fn=${encoded}&output=JSON`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return results;
    const data = await resp.json();
    
    const facilities = data?.Results?.Facilities || [];
    for (const facility of facilities.slice(0, 20)) {
      // Get compliance details per facility
      const registryId = facility.RegistryID;
      if (!registryId) continue;

      if (facility.CWAComplianceStatus === 'Violation' || 
          facility.CAAComplianceStatus === 'Violation' ||
          facility.RCRAComplianceStatus === 'Violation') {
        results.push({
          signal_type: 'environmental_violation',
          agency: 'EPA',
          violation_type: [
            facility.CWAComplianceStatus === 'Violation' ? 'Clean Water Act' : null,
            facility.CAAComplianceStatus === 'Violation' ? 'Clean Air Act' : null,
            facility.RCRAComplianceStatus === 'Violation' ? 'RCRA Hazardous Waste' : null,
          ].filter(Boolean).join(', '),
          facility_name: facility.FacilityName || null,
          facility_state: facility.StateName || null,
          penalty_amount: facility.FormalEACount ? null : null,
          description: `EPA compliance violation detected at ${facility.FacilityName || 'facility'} in ${facility.StateName || 'unknown state'}. Violation programs: ${[
            facility.CWAComplianceStatus === 'Violation' ? 'CWA' : null,
            facility.CAAComplianceStatus === 'Violation' ? 'CAA' : null,
            facility.RCRAComplianceStatus === 'Violation' ? 'RCRA' : null,
          ].filter(Boolean).join(', ')}.`,
          source_name: 'EPA ECHO',
          source_url: `https://echo.epa.gov/detailed-facility-report?fid=${registryId}`,
          case_number: registryId,
          confidence: 'high',
        });
      }
    }
  } catch (e: any) {
    console.error('EPA ECHO fetch error:', e);
  }
  return results;
}

// ─── 2. OSHA Inspections (Live API) ───
async function fetchOSHAViolations(companyName: string): Promise<any[]> {
  const results: any[] = [];
  const searchName = normalizeCompanyName(companyName);
  try {
    const encoded = encodeURIComponent(searchName);
    // OSHA enforcement API
    const url = `https://enforcedata.dol.gov/api/search?query=${encoded}&agency=osha&size=20`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return results;
    const data = await resp.json();
    
    const hits = data?.hits?.hits || [];
    for (const hit of hits) {
      const src = hit._source || {};
      results.push({
        signal_type: 'workplace_safety_violation',
        agency: 'OSHA',
        violation_type: src.violation_type || 'Workplace Safety',
        facility_name: src.establishment_name || null,
        facility_state: src.site_state || null,
        penalty_amount: src.total_penalty ? parseFloat(src.total_penalty) : null,
        violation_date: src.open_date || null,
        resolution_date: src.close_date || null,
        status: src.case_status || null,
        description: `OSHA inspection at ${src.establishment_name || 'establishment'}. ${src.total_violations ? `${src.total_violations} violation(s) found.` : ''} ${src.total_penalty ? `Total penalty: $${Number(src.total_penalty).toLocaleString()}.` : ''}`,
        case_number: src.activity_nr || null,
        source_name: 'OSHA Enforcement',
        source_url: src.activity_nr ? `https://www.osha.gov/pls/imis/establishment.inspection_detail?id=${src.activity_nr}` : null,
        confidence: 'high',
      });
    }
  } catch (e: any) {
    console.error('OSHA fetch error:', e);
  }
  return results;
}

// ─── 3. DOL Enforcement (Wage & Hour, MSHA, etc.) ───
async function fetchDOLEnforcement(companyName: string): Promise<any[]> {
  const results: any[] = [];
  const searchName = normalizeCompanyName(companyName);
  try {
    const encoded = encodeURIComponent(searchName);
    // DOL enforcement search (covers WHD, MSHA, OFCCP)
    const url = `https://enforcedata.dol.gov/api/search?query=${encoded}&size=20`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) return results;
    const data = await resp.json();
    
    const hits = data?.hits?.hits || [];
    for (const hit of hits) {
      const src = hit._source || {};
      const agency = src.agency_id || 'DOL';
      // Skip OSHA (already handled above)
      if (agency.toUpperCase() === 'OSHA') continue;
      
      results.push({
        signal_type: 'labor_enforcement',
        agency: agency.toUpperCase(),
        violation_type: src.violation_type || 'Labor Standards',
        facility_name: src.establishment_name || null,
        facility_state: src.site_state || null,
        penalty_amount: src.total_penalty ? parseFloat(src.total_penalty) : null,
        violation_date: src.open_date || null,
        resolution_date: src.close_date || null,
        status: src.case_status || null,
        description: `${agency.toUpperCase()} enforcement action against ${src.establishment_name || 'establishment'}. ${src.total_penalty ? `Penalty: $${Number(src.total_penalty).toLocaleString()}.` : ''}`,
        case_number: src.activity_nr || null,
        source_name: `DOL ${agency.toUpperCase()}`,
        source_url: null,
        confidence: 'high',
      });
    }
  } catch (e: any) {
    console.error('DOL enforcement fetch error:', e);
  }
  return results;
}

// ─── 4. Known SEC/FTC Enforcement (Curated) ───
function getKnownEnforcementActions(companyName: string): any[] {
  const name = companyName.toLowerCase();
  const known: Record<string, any[]> = {
    'meta': [
      { signal_type: 'data_privacy_violation', agency: 'FTC', violation_type: 'Privacy', penalty_amount: 5000000000, violation_date: '2019-07-24', description: 'FTC imposed $5B fine on Meta (Facebook) for privacy violations related to Cambridge Analytica.', source_name: 'FTC', source_url: 'https://www.ftc.gov/news-events/news/press-releases/2019/07/ftc-imposes-5-billion-penalty-sweeping-new-privacy-restrictions-facebook', confidence: 'high' },
    ],
    'facebook': [
      { signal_type: 'data_privacy_violation', agency: 'FTC', violation_type: 'Privacy', penalty_amount: 5000000000, violation_date: '2019-07-24', description: 'FTC imposed $5B fine on Facebook for privacy violations.', source_name: 'FTC', source_url: 'https://www.ftc.gov/news-events/news/press-releases/2019/07/ftc-imposes-5-billion-penalty-sweeping-new-privacy-restrictions-facebook', confidence: 'high' },
    ],
    'wells fargo': [
      { signal_type: 'consumer_protection_violation', agency: 'CFPB', violation_type: 'Consumer Protection', penalty_amount: 3700000000, violation_date: '2022-12-20', description: 'CFPB ordered Wells Fargo to pay $3.7B for widespread consumer harm including illegal fees and interest charges.', source_name: 'CFPB', source_url: 'https://www.consumerfinance.gov/about-us/newsroom/cfpb-orders-wells-fargo-to-pay-37-billion-for-widespread-mismanagement-of-auto-loans-mortgages-and-deposit-accounts/', confidence: 'high' },
      { signal_type: 'securities_violation', agency: 'SEC', violation_type: 'Securities Fraud', penalty_amount: 3000000000, violation_date: '2020-02-21', description: 'Wells Fargo agreed to pay $3B to settle fake accounts scandal with DOJ and SEC.', source_name: 'SEC/DOJ', source_url: 'https://www.sec.gov/news/press-release/2020-38', confidence: 'high' },
    ],
    'amazon': [
      { signal_type: 'data_privacy_violation', agency: 'FTC', violation_type: 'Children\'s Privacy', penalty_amount: 25000000, violation_date: '2023-05-31', description: 'FTC fined Amazon $25M for violating children\'s privacy via Alexa.', source_name: 'FTC', source_url: 'https://www.ftc.gov/news-events/news/press-releases/2023/05/ftc-doj-charge-amazon-violating-childrens-privacy-law-keeping-kids-alexa-voice-recordings-forever', confidence: 'high' },
    ],
    'google': [
      { signal_type: 'antitrust_violation', agency: 'DOJ', violation_type: 'Antitrust', penalty_amount: null, violation_date: '2024-08-05', description: 'DOJ won antitrust case ruling Google holds illegal monopoly in search.', source_name: 'DOJ', source_url: 'https://www.justice.gov/opa/pr/justice-department-wins-landmark-case-against-google-illegally-monopolizing-search', confidence: 'high' },
    ],
    'alphabet': [
      { signal_type: 'antitrust_violation', agency: 'DOJ', violation_type: 'Antitrust', penalty_amount: null, violation_date: '2024-08-05', description: 'DOJ won antitrust case ruling Google (Alphabet) holds illegal monopoly in search.', source_name: 'DOJ', source_url: 'https://www.justice.gov/opa/pr/justice-department-wins-landmark-case-against-google-illegally-monopolizing-search', confidence: 'high' },
    ],
    'johnson & johnson': [
      { signal_type: 'product_safety_violation', agency: 'DOJ', violation_type: 'Product Liability', penalty_amount: 8900000000, violation_date: '2023-04-04', description: 'J&J proposed $8.9B settlement for talc-related cancer claims.', source_name: 'DOJ/Courts', source_url: 'https://www.reuters.com/legal/litigation/jj-proposes-89-bln-settlement-talc-claims-2023-04-04/', confidence: 'high' },
    ],
    'boeing': [
      { signal_type: 'safety_violation', agency: 'DOJ', violation_type: 'Criminal Fraud', penalty_amount: 2500000000, violation_date: '2021-01-07', description: 'Boeing agreed to $2.5B settlement for conspiracy to defraud FAA regarding 737 MAX.', source_name: 'DOJ', source_url: 'https://www.justice.gov/opa/pr/boeing-charged-737-max-fraud-conspiracy-and-agrees-pay-over-25-billion', confidence: 'high' },
    ],
    'walmart': [
      { signal_type: 'opioid_settlement', agency: 'DOJ', violation_type: 'Controlled Substances', penalty_amount: 3100000000, violation_date: '2022-11-15', description: 'Walmart agreed to pay $3.1B to settle opioid lawsuits nationwide.', source_name: 'DOJ/State AGs', source_url: 'https://www.justice.gov/opa/pr/walmart-inc-agrees-pay-31-billion-resolve-opioid-lawsuits', confidence: 'high' },
    ],
    'jpmorgan': [
      { signal_type: 'market_manipulation', agency: 'DOJ/CFTC', violation_type: 'Spoofing/Market Manipulation', penalty_amount: 920000000, violation_date: '2020-09-29', description: 'JPMorgan agreed to pay $920M for market manipulation in precious metals and Treasuries.', source_name: 'DOJ/CFTC', source_url: 'https://www.justice.gov/opa/pr/jpmorgan-chase-co-agrees-pay-920-million-connection-schemes-defraud-precious-metals-and-us', confidence: 'high' },
    ],
    'jpmorgan chase': [
      { signal_type: 'market_manipulation', agency: 'DOJ/CFTC', violation_type: 'Spoofing/Market Manipulation', penalty_amount: 920000000, violation_date: '2020-09-29', description: 'JPMorgan Chase agreed to pay $920M for market manipulation.', source_name: 'DOJ/CFTC', source_url: 'https://www.justice.gov/opa/pr/jpmorgan-chase-co-agrees-pay-920-million-connection-schemes-defraud-precious-metals-and-us', confidence: 'high' },
    ],
  };
  
  for (const [key, actions] of Object.entries(known)) {
    if (name.includes(key)) return actions;
  }
  return [];
}

// ─── Main Handler ───
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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const companyId = body.companyId;
    const companyName = body.companyName;

    if (!companyId || !companyName) {
      // Batch mode: scan all companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .order('civic_footprint_score', { ascending: false })
        .limit(50);

      if (!companies?.length) {
        return new Response(JSON.stringify({ message: 'No companies found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let totalInserted = 0;
      const results: any[] = [];

      for (const company of companies) {
        const count = await syncForCompany(supabase, company.id, company.name);
        totalInserted += count;
        results.push({ company: company.name, signals: count });
        // Throttle
        await new Promise(r => setTimeout(r, 2000));
      }

      return new Response(JSON.stringify({ totalInserted, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Single company mode
    const count = await syncForCompany(supabase, companyId, companyName);
    return new Response(JSON.stringify({ company: companyName, signalsInserted: count }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('sync-regulatory-violations error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function syncForCompany(supabase: any, companyId: string, companyName: string): Promise<number> {
  console.log(`Scanning regulatory violations for: ${companyName}`);
  
  // Fetch from all sources in parallel
  const [epa, osha, dol, known] = await Promise.allSettled([
    fetchEPAViolations(companyName),
    fetchOSHAViolations(companyName),
    fetchDOLEnforcement(companyName),
    Promise.resolve(getKnownEnforcementActions(companyName)),
  ]);

  const allSignals = [
    ...(epa.status === 'fulfilled' ? epa.value : []),
    ...(osha.status === 'fulfilled' ? osha.value : []),
    ...(dol.status === 'fulfilled' ? dol.value : []),
    ...(known.status === 'fulfilled' ? known.value : []),
  ];

  if (!allSignals.length) return 0;

  // Deduplicate by case_number + agency
  const seen = new Set<string>();
  const unique = allSignals.filter(s => {
    const key = `${s.agency}-${s.case_number || s.description?.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rows = unique.map(s => ({
    company_id: companyId,
    signal_type: s.signal_type,
    signal_category: 'regulatory',
    agency: s.agency,
    violation_type: s.violation_type || null,
    facility_name: s.facility_name || null,
    facility_state: s.facility_state || null,
    penalty_amount: s.penalty_amount || null,
    violation_date: s.violation_date || null,
    resolution_date: s.resolution_date || null,
    status: s.status || null,
    description: s.description || null,
    case_number: s.case_number || null,
    source_name: s.source_name || null,
    source_url: s.source_url || null,
    confidence: s.confidence || 'medium',
  }));

  const { error } = await supabase
    .from('regulatory_violations')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error(`Error inserting violations for ${companyName}:`, error);
    return 0;
  }

  console.log(`Inserted ${rows.length} regulatory violations for ${companyName}`);
  return rows.length;
}
