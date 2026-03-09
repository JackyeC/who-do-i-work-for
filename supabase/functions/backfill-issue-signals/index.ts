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
    // Get all companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name');

    if (error || !companies) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch companies' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get companies that already have issue signals
    const { data: existing } = await supabase
      .from('issue_signals')
      .select('entity_id');
    const existingIds = new Set((existing || []).map((e: any) => e.entity_id));

    // Process all companies (even ones with existing signals to pick up new keywords)
    const results: any[] = [];
    
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
      } catch (e) {
        results.push({ company: company.name, error: String(e) });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      companiesProcessed: results.length,
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
