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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all companies
    const { data: companies, error: compErr } = await supabase
      .from('companies')
      .select('id, name, slug');

    if (compErr || !companies) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch companies' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results: any[] = [];

    for (const company of companies) {
      // Check if scan is due
      const { data: schedule } = await supabase
        .from('scan_schedules')
        .select('*')
        .eq('company_id', company.id)
        .eq('scan_type', 'agency')
        .single();

      const now = new Date();
      if (schedule && schedule.next_scan_at && new Date(schedule.next_scan_at) > now) {
        results.push({ company: company.name, status: 'skipped', reason: 'not due' });
        continue;
      }

      // Get exec names for social scan
      const { data: execs } = await supabase
        .from('company_executives')
        .select('name')
        .eq('company_id', company.id);

      // Run social scan
      try {
        const socialResp = await fetch(`${supabaseUrl}/functions/v1/social-scan`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            companyName: company.name,
            executiveNames: (execs || []).map((e: any) => e.name),
          }),
        });
        const socialData = await socialResp.json();
        results.push({ company: company.name, scan: 'social', success: socialData.success });
      } catch (e) {
        results.push({ company: company.name, scan: 'social', success: false, error: String(e) });
      }

      // Run agency scan
      try {
        const agencyResp = await fetch(`${supabaseUrl}/functions/v1/agency-scan`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            companyName: company.name,
          }),
        });
        const agencyData = await agencyResp.json();
        results.push({ company: company.name, scan: 'agency', success: agencyData.success });
      } catch (e) {
        results.push({ company: company.name, scan: 'agency', success: false, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Scheduled scan error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
