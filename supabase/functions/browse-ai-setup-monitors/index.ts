const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BROWSE_AI_API = 'https://api.browse.ai/v2';

// Page types to monitor and how to discover URLs
const PAGE_TYPES = [
  { type: 'careers', pathHints: ['/careers', '/jobs', '/join-us', '/work-with-us'] },
  { type: 'benefits', pathHints: ['/benefits', '/perks', '/total-rewards', '/compensation'] },
  { type: 'leadership', pathHints: ['/leadership', '/team', '/about/leadership', '/executives', '/board'] },
  { type: 'esg', pathHints: ['/esg', '/sustainability', '/responsibility', '/csr', '/impact', '/environment'] },
  { type: 'political_disclosure', pathHints: ['/political-activity', '/political-disclosure', '/pac', '/political-engagement', '/government-affairs'] },
  { type: 'job_listings', pathHints: ['/jobs', '/careers/search', '/open-positions', '/job-openings'] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BROWSE_AI_API_KEY = Deno.env.get('BROWSE_AI_API_KEY');
    if (!BROWSE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: 'BROWSE_AI_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { companyId, companyName, websiteUrl, careersUrl } = await req.json();

    if (!companyId || !companyName) {
      return new Response(JSON.stringify({ error: 'companyId and companyName are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check which monitors already exist
    const { data: existingMonitors } = await supabase
      .from('browse_ai_monitors')
      .select('page_type')
      .eq('company_id', companyId);

    const existingTypes = new Set((existingMonitors || []).map(m => m.page_type));

    // Build candidate URLs to monitor
    const baseUrl = (websiteUrl || `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`).replace(/\/$/, '');
    const candidatePages: { type: string; url: string }[] = [];

    for (const pageType of PAGE_TYPES) {
      if (existingTypes.has(pageType.type)) continue;

      if (pageType.type === 'careers' && careersUrl) {
        candidatePages.push({ type: 'careers', url: careersUrl });
        continue;
      }
      if (pageType.type === 'job_listings' && careersUrl) {
        candidatePages.push({ type: 'job_listings', url: careersUrl });
        continue;
      }

      // Use first path hint as the default URL
      candidatePages.push({ type: pageType.type, url: `${baseUrl}${pageType.pathHints[0]}` });
    }

    if (candidatePages.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'All monitors already exist', monitorsCreated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = `${supabaseUrl}/functions/v1/browse-ai-webhook`;
    const results: any[] = [];

    for (const page of candidatePages) {
      try {
        // Create a Browse AI robot to monitor this page
        const robotResp = await fetch(`${BROWSE_AI_API}/robots`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BROWSE_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `CivicLens: ${companyName} - ${page.type}`,
            url: page.url,
            monitorMode: true,
            monitorInterval: 'daily',
            webhookUrl: webhookUrl,
            description: `Monitor ${page.type} page for ${companyName}. Company ID: ${companyId}`,
          }),
        });

        if (!robotResp.ok) {
          const errText = await robotResp.text();
          console.error(`Browse AI robot creation failed for ${page.type}:`, errText);
          
          // Still insert monitor record with error status
          await supabase.from('browse_ai_monitors').upsert({
            company_id: companyId,
            page_type: page.type,
            page_url: page.url,
            status: 'error',
            error_message: `Robot creation failed: HTTP ${robotResp.status}`,
          }, { onConflict: 'company_id,page_type' });

          results.push({ type: page.type, status: 'error', error: `HTTP ${robotResp.status}` });
          continue;
        }

        const robotData = await robotResp.json();
        const robotId = robotData.result?.id || robotData.id;

        // Save monitor record
        await supabase.from('browse_ai_monitors').upsert({
          company_id: companyId,
          page_type: page.type,
          page_url: page.url,
          browse_ai_robot_id: robotId,
          status: 'active',
          error_message: null,
        }, { onConflict: 'company_id,page_type' });

        results.push({ type: page.type, status: 'active', robotId });
        console.log(`[browse-ai] Created robot ${robotId} for ${companyName} - ${page.type}`);

      } catch (pageErr) {
        const msg = pageErr instanceof Error ? pageErr.message : 'Unknown error';
        console.error(`[browse-ai] Error creating monitor for ${page.type}:`, msg);
        
        await supabase.from('browse_ai_monitors').upsert({
          company_id: companyId,
          page_type: page.type,
          page_url: page.url,
          status: 'error',
          error_message: msg,
        }, { onConflict: 'company_id,page_type' });

        results.push({ type: page.type, status: 'error', error: msg });
      }
    }

    const activeCount = results.filter(r => r.status === 'active').length;
    console.log(`[browse-ai] Setup complete for ${companyName}: ${activeCount}/${results.length} monitors active`);

    return new Response(JSON.stringify({
      success: true,
      monitorsCreated: activeCount,
      totalAttempted: results.length,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[browse-ai-setup] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
