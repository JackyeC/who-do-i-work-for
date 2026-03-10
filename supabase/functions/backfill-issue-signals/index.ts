const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 20;
    const offset = body.offset || 0;
    const onlyScanned = body.onlyScanned !== false; // Default: only process companies with scan data

    let query = supabase
      .from('companies')
      .select('id, name')
      .order('name')
      .range(offset, offset + batchSize - 1);

    // Only process companies that have been scanned (have signal_scans or linkages)
    if (onlyScanned) {
      // Get companies that have entity_linkages or signal_scans
      const { data: linkedCompanies } = await supabase
        .from('entity_linkages')
        .select('company_id')
        .limit(1000);
      
      const { data: scannedCompanies } = await supabase
        .from('company_signal_scans')
        .select('company_id')
        .limit(1000);

      const companyIds = new Set<string>();
      for (const l of linkedCompanies || []) companyIds.add(l.company_id);
      for (const s of scannedCompanies || []) companyIds.add(s.company_id);

      if (companyIds.size === 0) {
        return new Response(JSON.stringify({
          success: true,
          companiesProcessed: 0,
          message: 'No companies with scan data found',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const ids = Array.from(companyIds).slice(offset, offset + batchSize);
      query = supabase.from('companies').select('id, name').in('id', ids);
    }

    const { data: companies, error } = await query;

    if (error || !companies) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch companies' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];
    let totalSignals = 0;

    for (const company of companies) {
      try {
        console.log(`[backfill] Processing ${company.name} (${company.id})`);
        const resp = await fetch(`${supabaseUrl}/functions/v1/map-issue-signals`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId: company.id }),
        });
        const data = await resp.json();
        results.push({ company: company.name, ...data });
        totalSignals += data.signalsFound || 0;
      } catch (e) {
        results.push({ company: company.name, error: String(e) });
      }
    }

    // Update aggregate scan status
    const allCategories = new Set<string>();
    for (const r of results) {
      if (r.categoryCounts) {
        for (const cat of Object.keys(r.categoryCounts)) allCategories.add(cat);
      }
    }

    for (const category of allCategories) {
      // Get total signals for this category
      const { count } = await supabase
        .from('issue_signals')
        .select('id', { count: 'exact', head: true })
        .eq('issue_category', category);

      // Get distinct companies
      const { data: distinctCompanies } = await supabase
        .from('issue_signals')
        .select('entity_id')
        .eq('issue_category', category);

      const uniqueCompanies = new Set((distinctCompanies || []).map((d: any) => d.entity_id)).size;

      await supabase.from('issue_scan_status').upsert({
        issue_category: category,
        signals_generated: count || 0,
        companies_scanned: uniqueCompanies,
        last_scan_at: new Date().toISOString(),
        scan_status: 'completed',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'issue_category' });
    }

    return new Response(JSON.stringify({
      success: true,
      companiesProcessed: results.length,
      totalSignals,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[backfill] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
