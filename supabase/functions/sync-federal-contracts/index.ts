const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const USASPENDING_BASE = 'https://api.usaspending.gov/api/v2';
const CONTRACT_AWARD_TYPES = ['A', 'B', 'C', 'D'];

interface AwardResult {
  Award_ID: string;
  Recipient_Name: string;
  Award_Amount: number;
  Total_Outlays: number;
  Description: string;
  Start_Date: string;
  End_Date: string;
  Awarding_Agency: string;
  Awarding_Sub_Agency: string;
  Award_Type: string;
  generated_internal_id: string;
}

function validateUSASpendingPayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.filters) {
    errors.push('Missing required "filters" object');
    return { valid: false, errors };
  }

  const f = payload.filters;

  // award_type_codes must be a non-empty array of strings
  if (!Array.isArray(f.award_type_codes) || f.award_type_codes.length === 0) {
    errors.push('filters.award_type_codes must be a non-empty array');
  }

  // time_period must be an array of objects with valid dates
  if (!Array.isArray(f.time_period) || f.time_period.length === 0) {
    errors.push('filters.time_period must be a non-empty array');
  } else {
    for (const tp of f.time_period) {
      if (!tp.start_date || !tp.end_date) {
        errors.push('time_period entries must have start_date and end_date');
      }
      // Validate date format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (tp.start_date && !dateRegex.test(tp.start_date)) {
        errors.push(`Invalid start_date format: "${tp.start_date}" (expected YYYY-MM-DD)`);
      }
      if (tp.end_date && !dateRegex.test(tp.end_date)) {
        errors.push(`Invalid end_date format: "${tp.end_date}" (expected YYYY-MM-DD)`);
      }
    }
  }

  // recipient_search_text must be a non-empty array of non-empty strings
  if (f.recipient_search_text) {
    if (!Array.isArray(f.recipient_search_text) || f.recipient_search_text.length === 0) {
      errors.push('filters.recipient_search_text must be a non-empty array');
    } else if (f.recipient_search_text.some((s: any) => typeof s !== 'string' || !s.trim())) {
      errors.push('filters.recipient_search_text entries must be non-empty strings');
    }
  }

  // page and limit
  if (payload.page !== undefined && (typeof payload.page !== 'number' || payload.page < 1)) {
    errors.push('page must be a positive integer');
  }
  if (payload.limit !== undefined && (typeof payload.limit !== 'number' || payload.limit < 1 || payload.limit > 100)) {
    errors.push('limit must be between 1 and 100');
  }

  return { valid: errors.length === 0, errors };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, companyName, uei } = await req.json();

    if (!companyId || !companyName) {
      return new Response(
        JSON.stringify({ success: false, error: 'companyId and companyName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[sync-federal-contracts] Syncing for ${companyName}${uei ? ` (UEI: ${uei})` : ''}...`);

    // Build USASpending search filters
    const endDate = new Date().toISOString().split('T')[0];
    const filters: Record<string, unknown> = {
      award_type_codes: CONTRACT_AWARD_TYPES,
      time_period: [
        { start_date: '2020-01-01', end_date: endDate }
      ],
    };

    // Use UEI if provided, otherwise search by recipient name
    const searchText = uei || companyName;
    if (!searchText || !searchText.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid search text for USASpending', errorType: 'failed_validation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    filters.recipient_search_text = [searchText.trim()];

    const searchPayload = {
      filters,
      fields: [
        'Award ID', 'Recipient Name', 'Award Amount', 'Total Outlays',
        'Description', 'Start Date', 'End Date',
        'Awarding Agency', 'Awarding Sub Agency', 'Award Type',
        'generated_internal_id'
      ],
      page: 1,
      limit: 100,
      sort: 'Award Amount',
      order: 'desc',
      subawards: false,
    };

    // Validate before sending
    const validation = validateUSASpendingPayload(searchPayload);
    if (!validation.valid) {
      const errMsg = `Federal contracts request validation failed: ${validation.errors.join('; ')}`;
      console.error(`[sync-federal-contracts] ${errMsg}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: errMsg,
          errorType: 'failed_validation',
          validationErrors: validation.errors,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-federal-contracts] Outgoing payload: ${JSON.stringify(searchPayload)}`);

    const resp = await fetch(`${USASPENDING_BASE}/search/spending_by_award/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`[sync-federal-contracts] USASpending API error ${resp.status}: ${errText}`);
      
      const isClientError = resp.status >= 400 && resp.status < 500;
      return new Response(
        JSON.stringify({
          success: false,
          error: `USASpending API returned ${resp.status}`,
          errorType: isClientError ? 'upstream_api_error' : 'server_error',
          upstreamStatus: resp.status,
          upstreamBody: errText.substring(0, 500),
        }),
        { status: isClientError ? 422 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await resp.json();
    const results: AwardResult[] = data.results || [];
    console.log(`[sync-federal-contracts] Found ${results.length} contract awards (page 1 of ${Math.ceil((data.page_metadata?.total || 0) / 100)})`);

    if (results.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `No federal contracts found for ${companyName}`,
          contractsFound: 0,
          linkagesCreated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map results to entity_linkages rows
    const linkages = results
      .filter(r => {
        const amount = r['Award Amount' as keyof AwardResult] ?? r.Award_Amount;
        return amount && Number(amount) > 0;
      })
      .map(r => {
        // USASpending may return fields with spaces or underscores
        const awardAmount = Number(r['Award Amount' as keyof AwardResult] ?? r.Award_Amount ?? 0);
        const awardId = (r['Award ID' as keyof AwardResult] ?? r.Award_ID ?? 'N/A') as string;
        const recipientName = (r['Recipient Name' as keyof AwardResult] ?? r.Recipient_Name ?? companyName) as string;
        const description = (r['Description' as keyof AwardResult] ?? r.Description ?? 'N/A') as string;
        const startDate = (r['Start Date' as keyof AwardResult] ?? r.Start_Date ?? null) as string | null;
        const endDate = (r['End Date' as keyof AwardResult] ?? r.End_Date ?? null) as string | null;
        const awardingAgency = (r['Awarding Agency' as keyof AwardResult] ?? r.Awarding_Agency ?? 'Unknown Agency') as string;
        const awardingSubAgency = (r['Awarding Sub Agency' as keyof AwardResult] ?? r.Awarding_Sub_Agency ?? null) as string | null;
        const awardType = (r['Award Type' as keyof AwardResult] ?? r.Award_Type ?? null) as string | null;
        const totalOutlays = Number(r['Total Outlays' as keyof AwardResult] ?? r.Total_Outlays ?? 0);
        const genId = r.generated_internal_id || null;

        return {
          company_id: companyId,
          source_entity_name: awardingAgency,
          source_entity_type: 'federal_agency',
          source_entity_id: null,
          target_entity_name: companyName,
          target_entity_type: 'company',
          target_entity_id: companyId,
          link_type: 'committee_oversight_of_contract' as const,
          amount: Math.round(awardAmount),
          confidence_score: 0.95,
          description: `Federal contract: ${description} (Award ID: ${awardId})`,
          source_citation: JSON.stringify([{
            source: 'USASpending.gov',
            url: genId ? `https://www.usaspending.gov/award/${genId}` : 'https://www.usaspending.gov',
            award_id: awardId,
            date_range: `${startDate || 'N/A'} to ${endDate || 'N/A'}`,
            retrieved_at: new Date().toISOString(),
          }]),
          metadata: JSON.stringify({
            awarding_agency: awardingAgency,
            awarding_sub_agency: awardingSubAgency,
            total_outlays: totalOutlays,
            award_type: awardType,
            start_date: startDate,
            end_date: endDate,
          }),
          _contract_row: {
            company_id: companyId,
            agency_name: awardingAgency,
            agency_acronym: awardingSubAgency,
            contract_value: Math.round(awardAmount),
            contract_description: description || awardType || null,
            contract_id_external: awardId !== 'N/A' ? awardId : null,
            fiscal_year: startDate ? parseInt(startDate.substring(0, 4)) : null,
            confidence: 'direct',
            source: 'USASpending.gov',
            controversy_flag: false,
          },
        };
      });

    // Clear old USASpending linkages
    const { error: deleteErr } = await supabase
      .from('entity_linkages')
      .delete()
      .eq('company_id', companyId)
      .eq('source_entity_type', 'federal_agency')
      .eq('link_type', 'committee_oversight_of_contract')
      .like('description', 'Federal contract:%');

    if (deleteErr) console.error('[sync-federal-contracts] Failed to clear old linkages:', deleteErr);

    // Insert linkages in batches
    let inserted = 0;
    const contractRows: any[] = [];
    
    for (let i = 0; i < linkages.length; i += 50) {
      const batch = linkages.slice(i, i + 50);
      const linkageBatch = batch.map(({ _contract_row, ...linkage }) => linkage);
      contractRows.push(...batch.map(b => b._contract_row));
      
      const { error: insertErr } = await supabase.from('entity_linkages').insert(linkageBatch);
      if (insertErr) {
        console.error(`[sync-federal-contracts] Insert batch error (${i}-${i + batch.length}):`, insertErr);
      } else {
        inserted += batch.length;
      }
    }

    // Also upsert into company_agency_contracts
    await supabase.from('company_agency_contracts').delete().eq('company_id', companyId).eq('source', 'USASpending.gov');

    let contractsInserted = 0;
    for (let i = 0; i < contractRows.length; i += 50) {
      const batch = contractRows.slice(i, i + 50);
      const { error: cErr } = await supabase.from('company_agency_contracts').insert(batch);
      if (cErr) {
        console.error(`[sync-federal-contracts] Contract insert error:`, cErr);
      } else {
        contractsInserted += batch.length;
      }
    }

    const totalContractValue = linkages.reduce((sum, l) => sum + (l.amount || 0), 0);

    console.log(`[sync-federal-contracts] ✅ Synced ${inserted} linkages + ${contractsInserted} contracts for ${companyName}. Total value: $${totalContractValue.toLocaleString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${inserted} contract linkages for ${companyName}`,
        contractsFound: results.length,
        linkagesCreated: inserted,
        contractsInserted,
        totalContractValue,
        totalAvailable: data.page_metadata?.total || results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-federal-contracts] error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'server_error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
