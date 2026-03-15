/**
 * Wrapper for intelligence sections that handles:
 * - Loading state
 * - Stale data indicators
 * - Section-level failures with polished messaging
 * - Refresh buttons with status
 */

import { ReactNode } from 'react';
import { RefreshCw, Clock, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectionReport, RefreshStatus } from '@/hooks/use-company-intelligence';
import type { IntelligenceSection } from '@/lib/intelligence-provider';
import { SECTION_LABELS } from '@/lib/intelligence-provider';

interface IntelligenceSectionWrapperProps {
  section: IntelligenceSection;
  report: SectionReport | null;
  loading?: boolean;
  refreshStatus?: RefreshStatus;
  onRefresh?: () => void;
  children: ReactNode;
  showRefresh?: boolean;
}

export function IntelligenceSectionWrapper({
  section,
  report,
  loading,
  refreshStatus = 'idle',
  onRefresh,
  children,
  showRefresh = true,
}: IntelligenceSectionWrapperProps) {
  const isRefreshing = refreshStatus === 'refreshing';

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const hasData = report && report.content &&
    (typeof report.content !== 'object' || Object.keys(report.content).length > 0);

  // No data at all
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-2.5">
        <AlertTriangle className="w-6 h-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No {SECTION_LABELS[section]?.toLowerCase() || section} data available yet
        </p>
        {report?.last_error && (
          <p className="text-xs text-muted-foreground/60">
            Some live data sources are temporarily unavailable
          </p>
        )}
        {showRefresh && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Scanning…' : 'Scan Now'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Freshness / status bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isRefreshing && (
            <Badge variant="secondary" className="text-[10px] font-mono gap-1">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              Refresh in progress
            </Badge>
          )}
          {refreshStatus === 'success' && (
            <Badge variant="secondary" className="text-[10px] font-mono gap-1 border-primary/30 text-primary">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Just updated
            </Badge>
          )}
          {report.isStale && refreshStatus !== 'refreshing' && (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Clock className="w-2.5 h-2.5" />
              Using saved intelligence
            </Badge>
          )}
          {report.last_successful_update && !report.isStale && (
            <Badge variant="secondary" className="text-[10px] font-mono gap-1">
              <Database className="w-2.5 h-2.5" />
              {report.freshnessLabel}
            </Badge>
          )}
          {report.last_error && refreshStatus !== 'refreshing' && (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 border-destructive/30 text-destructive">
              Live refresh unavailable
            </Badge>
          )}
        </div>

        {showRefresh && onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground shrink-0"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        )}
      </div>

      {/* Actual content */}
      {children}
    </div>
  );
}
