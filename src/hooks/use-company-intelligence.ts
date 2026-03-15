/**
 * Cache-first intelligence loading hook.
 * 
 * Loads section-level cached reports from the database first,
 * then optionally triggers a background refresh if data is stale.
 * Never blocks the UI on live scraping.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  type IntelligenceSection,
  isSectionStale,
  getFreshnessLabel,
  SECTION_LABELS,
} from '@/lib/intelligence-provider';
import {
  isProviderUnavailable,
  classifyProviderError,
  recordProviderFailure,
  logScanError,
} from '@/lib/firecrawl-circuit-breaker';

export interface SectionReport {
  section_type: IntelligenceSection;
  content: any;
  summary: string | null;
  source_urls: string[];
  provider_used: string | null;
  last_successful_update: string | null;
  last_error: string | null;
  confidence_score: number;
  isStale: boolean;
  freshnessLabel: string;
}

export type RefreshStatus = 'idle' | 'refreshing' | 'success' | 'failed' | 'skipped';

interface UseCompanyIntelligenceOptions {
  companyId?: string;
  companyName?: string;
  sections?: IntelligenceSection[];
  /** Auto-refresh stale sections in background on load (default true) */
  autoRefreshStale?: boolean;
}

export function useCompanyIntelligence({
  companyId,
  companyName,
  sections,
  autoRefreshStale = true,
}: UseCompanyIntelligenceOptions) {
  const [reports, setReports] = useState<Record<string, SectionReport>>({});
  const [loading, setLoading] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState<Record<string, RefreshStatus>>({});
  const { toast } = useToast();
  const fetchedRef = useRef(false);
  const autoRefreshTriggeredRef = useRef(false);

  // Load cached reports from DB
  const loadCachedReports = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }

    try {
      let query = supabase
        .from('company_report_sections')
        .select('*')
        .eq('company_id', companyId);

      if (sections?.length) {
        query = query.in('section_type', sections);
      }

      const { data, error } = await query;
      if (error) { console.error('Failed to load cached reports:', error); return; }

      const mapped: Record<string, SectionReport> = {};
      for (const row of data || []) {
        const sectionType = row.section_type as IntelligenceSection;
        mapped[sectionType] = {
          section_type: sectionType,
          content: row.content,
          summary: row.summary,
          source_urls: row.source_urls || [],
          provider_used: row.provider_used,
          last_successful_update: row.last_successful_update,
          last_error: row.last_error,
          confidence_score: Number(row.confidence_score) || 0.5,
          isStale: isSectionStale(row.last_successful_update, sectionType),
          freshnessLabel: getFreshnessLabel(row.last_successful_update),
        };
      }
      setReports(mapped);
    } finally {
      setLoading(false);
    }
  }, [companyId, sections]);

  // Initial load
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadCachedReports();
  }, [loadCachedReports]);

  // Auto-refresh stale sections in background (non-blocking)
  useEffect(() => {
    if (!autoRefreshStale || autoRefreshTriggeredRef.current || loading || !companyId) return;
    autoRefreshTriggeredRef.current = true;

    const staleSections = Object.values(reports).filter(r => r.isStale);
    if (staleSections.length === 0) return;

    // Only auto-refresh if providers are available
    if (isProviderUnavailable('firecrawl') && isProviderUnavailable('scrapingbee')) return;

    // Quietly refresh stale sections in background
    for (const report of staleSections) {
      backgroundRefresh(report.section_type);
    }
  }, [reports, loading, companyId, autoRefreshStale]);

  // Background refresh — no toast, no blocking UI
  const backgroundRefresh = useCallback(async (section: IntelligenceSection) => {
    if (!companyId) return;

    setRefreshStatus(prev => ({ ...prev, [section]: 'refreshing' }));

    try {
      const { data, error } = await supabase.functions.invoke('refresh-intelligence', {
        body: { companyId, companyName, section, triggeredBy: 'system' },
      });

      if (error || !data?.success) {
        const classified = classifyProviderError(error || data?.error || '');
        if (classified.isFirecrawl) {
          recordProviderFailure('firecrawl', classified.errorType, classified.message);
          logScanError({
            provider: 'firecrawl', errorType: classified.errorType,
            companyId, companyName, scanType: 'refresh-intelligence',
            section, rawError: classified.message,
          });
        }
        setRefreshStatus(prev => ({ ...prev, [section]: data?.skipped ? 'skipped' : 'failed' }));
        return;
      }

      if (data?.skipped) {
        setRefreshStatus(prev => ({ ...prev, [section]: 'skipped' }));
        return;
      }

      setRefreshStatus(prev => ({ ...prev, [section]: 'success' }));
      // Reload cached data silently
      await loadCachedReports();
    } catch {
      setRefreshStatus(prev => ({ ...prev, [section]: 'failed' }));
    }
  }, [companyId, companyName, loadCachedReports]);

  // Manual refresh — shows toast feedback
  const refreshSection = useCallback(async (section: IntelligenceSection) => {
    if (!companyId) return;

    setRefreshStatus(prev => ({ ...prev, [section]: 'refreshing' }));

    try {
      const { data, error } = await supabase.functions.invoke('refresh-intelligence', {
        body: { companyId, companyName, section, triggeredBy: 'user_refresh' },
      });

      if (error) {
        const classified = classifyProviderError(error);
        if (classified.isFirecrawl) {
          recordProviderFailure('firecrawl', classified.errorType, classified.message);
        }
        toast({ title: 'Live refresh unavailable', description: 'Showing the most recent saved intelligence.' });
        setRefreshStatus(prev => ({ ...prev, [section]: 'failed' }));
        return;
      }

      if (data?.success) {
        toast({ title: 'Intelligence updated', description: `${SECTION_LABELS[section]} refreshed successfully.` });
        setRefreshStatus(prev => ({ ...prev, [section]: 'success' }));
        await loadCachedReports();
      } else {
        toast({ title: 'Refresh unavailable', description: 'Some live data sources are temporarily unavailable.' });
        setRefreshStatus(prev => ({ ...prev, [section]: 'failed' }));
      }
    } catch {
      toast({ title: 'Refresh unavailable', description: 'Showing the most recent saved intelligence.' });
      setRefreshStatus(prev => ({ ...prev, [section]: 'failed' }));
    }
  }, [companyId, companyName, loadCachedReports, toast]);

  /** Check if a section has any usable cached data */
  const hasCachedData = useCallback((section: IntelligenceSection): boolean => {
    const report = reports[section];
    if (!report) return false;
    const content = report.content;
    if (!content) return false;
    if (typeof content === 'object' && Object.keys(content).length === 0) return false;
    return true;
  }, [reports]);

  /** Get a section report */
  const getSection = useCallback((section: IntelligenceSection): SectionReport | null => {
    return reports[section] || null;
  }, [reports]);

  /** Whether any section is currently refreshing */
  const isAnyRefreshing = Object.values(refreshStatus).some(s => s === 'refreshing');

  return {
    reports,
    loading,
    refreshStatus,
    isAnyRefreshing,
    refreshSection,
    hasCachedData,
    getSection,
    reload: loadCachedReports,
  };
}
