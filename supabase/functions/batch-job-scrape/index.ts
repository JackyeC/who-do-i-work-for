const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BATCH_SIZE = 5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get companies with careers_url that haven't been scraped recently (or ever)
    const { data: companies, error: fetchErr } = await supabase
      .from('companies')
      .select('id, name, careers_url')
      .not('careers_url', 'is', null)
      .neq('careers_url', '')
      .order('name')
      .limit(1000);

    if (fetchErr) {
      return new Response(JSON.stringify({ success: false, error: fetchErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!companies || companies.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No companies with career URLs found', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find companies with no recent job scrapes (older than 7 days or never scraped)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentScrapes } = await supabase
      .from('company_jobs')
      .select('company_id, scraped_at')
      .gte('scraped_at', sevenDaysAgo);

    const recentlyScrapedIds = new Set((recentScrapes || []).map(s => s.company_id));
    const needsScraping = companies.filter(c => !recentlyScrapedIds.has(c.id));

    console.log(`${companies.length} companies with career URLs. ${needsScraping.length} need scraping. Processing ${BATCH_SIZE}.`);

    const batch = needsScraping.slice(0, BATCH_SIZE);
    const results: any[] = [];

    for (const company of batch) {
      console.log(`Scraping jobs for: ${company.name} (${company.careers_url})`);
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/job-scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            careersUrl: company.careers_url,
            companyName: company.name,
          }),
        });

        const data = await resp.json();
        results.push({ company: company.name, success: data.success, jobsAdded: data.jobsAdded || 0, error: data.error });

        if (data.success) {
          console.log(`✅ ${company.name}: ${data.jobsAdded} jobs`);
        } else {
          console.error(`❌ ${company.name}: ${data.error}`);
        }

        // Pause between scrapes
        await new Promise(r => setTimeout(r, 3000));
      } catch (e) {
        console.error(`❌ ${company.name} error:`, e);
        results.push({ company: company.name, success: false, error: String(e) });
      }
    }

    const totalJobs = results.reduce((sum, r) => sum + (r.jobsAdded || 0), 0);

    return new Response(JSON.stringify({
      success: true,
      processed: batch.length,
      remaining: needsScraping.length - batch.length,
      totalJobsAdded: totalJobs,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Batch job scrape error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
