/**
 * Refresh Intelligence Edge Function
 * 
 * Refreshes a specific section of company intelligence using the provider fallback chain.
 * Records results in company_report_sections and scan_jobs.
 * NEVER overwrites existing good content on failure — preserves the last successful report.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ProviderName = 'firecrawl' | 'scrapingbee' | 'apify' | 'government_api' | 'ats_api';

interface ScrapeResult {
  success: boolean;
  content: any;
  summary?: string;
  sourceUrls?: string[];
  error?: string;
  errorType?: string;
}

// ─── Freshness TTLs (hours) — optimized for currency ───
const FRESHNESS_TTL: Record<string, number> = {
  careers: 24,
  news: 12,
  worker_sentiment: 48,
  compensation: 168,
  leadership: 168,
  reputation: 72,
  recruiter_intelligence: 48,
  ai_hiring: 168,
  ideology: 168,
  benefits: 168,
  sanctions_screening: 168,
  wikidata_enrichment: 336,
  corporate_structure: 168,
  political_influence: 72,
  legal_risk: 72,
  lobbying: 168,
  government_contracts: 168,
  insider_trading: 48,
  sec_filings: 72,
};

// ─── Provider implementations ───

async function scrapeWithFirecrawl(url: string, _query: string): Promise<ScrapeResult> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) return { success: false, content: null, error: 'FIRECRAWL_API_KEY not configured', errorType: 'invalid_api_key' };

  try {
    const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, waitFor: 5000 }),
    });

    if (resp.status === 402) return { success: false, content: null, error: 'Insufficient credits', errorType: 'credits_exhausted' };
    if (resp.status === 401 || resp.status === 403) return { success: false, content: null, error: 'Invalid API key', errorType: 'invalid_api_key' };
    if (resp.status === 429) return { success: false, content: null, error: 'Rate limited', errorType: 'credits_exhausted' };
    if (resp.status >= 500) return { success: false, content: null, error: `Provider outage (${resp.status})`, errorType: 'provider_outage' };

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      return { success: false, content: null, error: errData.error || `HTTP ${resp.status}`, errorType: 'unknown' };
    }

    const data = await resp.json();
    const markdown = data.data?.markdown || data.markdown || '';

    return {
      success: markdown.length > 50,
      content: { markdown, metadata: data.data?.metadata || data.metadata },
      sourceUrls: [url],
      error: markdown.length <= 50 ? 'Insufficient content extracted' : undefined,
    };
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('timeout') || msg.includes('deadline')) {
      return { success: false, content: null, error: msg, errorType: 'timeout' };
    }
    return { success: false, content: null, error: msg, errorType: 'unknown' };
  }
}

async function scrapeWithScrapingBee(url: string, _query: string): Promise<ScrapeResult> {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY');
  if (!apiKey) return { success: false, content: null, error: 'SCRAPINGBEE_API_KEY not configured', errorType: 'invalid_api_key' };

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      url,
      render_js: 'true',
      extract_rules: JSON.stringify({ text: { selector: 'body', type: 'text' } }),
    });

    const resp = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`);

    if (resp.status === 402 || resp.status === 429) return { success: false, content: null, error: 'Credits exhausted', errorType: 'credits_exhausted' };
    if (!resp.ok) return { success: false, content: null, error: `HTTP ${resp.status}`, errorType: resp.status >= 500 ? 'provider_outage' : 'unknown' };

    const text = await resp.text();
    return {
      success: text.length > 50,
      content: { text, format: 'scrapingbee_text' },
      sourceUrls: [url],
    };
  } catch (e: any) {
    return { success: false, content: null, error: e instanceof Error ? e.message : 'Unknown', errorType: 'unknown' };
  }
}

// Provider registry — extensible
const PROVIDERS: Record<string, (url: string, query: string) => Promise<ScrapeResult>> = {
  firecrawl: scrapeWithFirecrawl,
  scrapingbee: scrapeWithScrapingBee,
};

const DEFAULT_CHAIN: ProviderName[] = ['firecrawl', 'scrapingbee'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { companyId, companyName, section, url, triggeredBy = 'user_refresh' } = await req.json();

    if (!companyId || !section) {
      return new Response(
        JSON.stringify({ success: false, error: 'companyId and section are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Freshness gate: skip if data is still fresh (unless user-triggered) ───
    if (triggeredBy !== 'user_refresh' && triggeredBy !== 'admin_rescan') {
      const { data: existing } = await supabase
        .from('company_report_sections')
        .select('last_successful_update')
        .eq('company_id', companyId)
        .eq('section_type', section)
        .maybeSingle();

      if (existing?.last_successful_update) {
        const ttlHours = FRESHNESS_TTL[section] || 168;
        const age = Date.now() - new Date(existing.last_successful_update).getTime();
        if (age < ttlHours * 3600000) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: 'Data is still fresh', section }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Create scan job record
    const chain = DEFAULT_CHAIN;
    const { data: scanJob } = await supabase.from('scan_jobs').insert({
      company_id: companyId,
      section_type: section,
      status: 'running',
      triggered_by: triggeredBy,
      started_at: new Date().toISOString(),
      provider_fallback_chain: chain,
    }).select('id').single();

    const scanJobId = scanJob?.id;
    const startTime = Date.now();

    // Get company URL if not provided
    let targetUrl = url;
    if (!targetUrl) {
      const { data: company } = await supabase
        .from('companies')
        .select('website_url, careers_url')
        .eq('id', companyId)
        .single();
      targetUrl = company?.website_url || company?.careers_url;
    }

    if (!targetUrl) {
      if (scanJobId) {
        await supabase.from('scan_jobs').update({
          status: 'failed',
          error_type: 'unknown',
          error_message: 'No URL available for this company',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        }).eq('id', scanJobId);
      }

      return new Response(
        JSON.stringify({ success: false, error: 'No URL available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Try providers in fallback chain ───
    let result: ScrapeResult | null = null;
    let usedProvider: string | null = null;
    const failedProviders: { provider: string; error: string; errorType: string }[] = [];

    for (const provider of chain) {
      const scraper = PROVIDERS[provider];
      if (!scraper) continue;

      console.log(`[${section}] Trying ${provider} for ${companyName || companyId}: ${targetUrl}`);
      result = await scraper(targetUrl, `${companyName} ${section}`);

      if (result.success) {
        usedProvider = provider;
        console.log(`[${section}] ✓ Success with ${provider}`);
        break;
      }

      failedProviders.push({ provider, error: result.error || 'Unknown', errorType: result.errorType || 'unknown' });
      console.warn(`[${section}] ✗ ${provider} failed: ${result.error} (${result.errorType})`);
    }

    const duration = Date.now() - startTime;

    if (result?.success && usedProvider) {
      // Upsert report section with new content
      await supabase.from('company_report_sections').upsert({
        company_id: companyId,
        section_type: section,
        content: result.content,
        summary: result.summary || null,
        source_urls: result.sourceUrls || [],
        provider_used: usedProvider,
        last_successful_update: new Date().toISOString(),
        last_attempted_update: new Date().toISOString(),
        last_error: null,
        freshness_ttl_hours: FRESHNESS_TTL[section] || 168,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id,section_type' });

      if (scanJobId) {
        await supabase.from('scan_jobs').update({
          status: 'completed',
          provider_used: usedProvider,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        }).eq('id', scanJobId);
      }

      return new Response(
        JSON.stringify({ success: true, provider: usedProvider, section, duration, failedProviders }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── All providers failed — PRESERVE existing content, only update error metadata ───
    const errorMsg = result?.error || 'All providers failed';
    const errorType = result?.errorType || 'unknown';

    // Check if existing content exists — if so, only update error fields, NOT content
    const { data: existingReport } = await supabase
      .from('company_report_sections')
      .select('id, content')
      .eq('company_id', companyId)
      .eq('section_type', section)
      .maybeSingle();

    if (existingReport) {
      // Preserve existing content, just mark the error
      await supabase.from('company_report_sections').update({
        last_attempted_update: new Date().toISOString(),
        last_error: errorMsg,
        updated_at: new Date().toISOString(),
      }).eq('id', existingReport.id);
    } else {
      // No existing report — create a placeholder
      await supabase.from('company_report_sections').insert({
        company_id: companyId,
        section_type: section,
        content: {},
        last_attempted_update: new Date().toISOString(),
        last_error: errorMsg,
        freshness_ttl_hours: FRESHNESS_TTL[section] || 168,
      });
    }

    if (scanJobId) {
      await supabase.from('scan_jobs').update({
        status: 'failed',
        error_type: errorType,
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
      }).eq('id', scanJobId);
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Live data sources temporarily unavailable', section, failedProviders }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('refresh-intelligence error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
