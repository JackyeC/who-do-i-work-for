import { lazy, Suspense, type ElementType } from "react";
import { Link } from "react-router-dom";
import { useJobMatcher, useApplicationsTracker } from "@/hooks/use-job-matcher";
import { useApplyQueue } from "@/hooks/use-auto-apply";
import {
  Briefcase, ClipboardList, Mic, Radio, Sparkles, ArrowRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LiveIntelligenceTicker = lazy(() =>
  import("@/components/landing/LiveIntelligenceTicker").then((m) => ({ default: m.LiveIntelligenceTicker }))
);

interface DashboardHeartbeatProps {
  onNavigate: (tab: string) => void;
}

function PulseTile({
  title,
  subtitle,
  icon: Icon,
  onClick,
  className,
}: {
  title: string;
  subtitle: string;
  icon: ElementType;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/40 bg-card/80 p-4 text-left transition-all hover:border-primary/35 hover:bg-card hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">{subtitle}</p>
          <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * Top-of-overview “heartbeat”: live work-news ticker + four rails into
 * matches, applications, auto-apply, and mock interview — so the dashboard
 * feels like a daily destination, not a settings dump.
 */
export function DashboardHeartbeat({ onNavigate }: DashboardHeartbeatProps) {
  const { data: jobData, isLoading: jobsLoading } = useJobMatcher();
  const { applications, isLoading: appsLoading } = useApplicationsTracker();
  const { queue, isLoading: queueLoading, todayCount } = useApplyQueue();

  const matches = jobData?.matches ?? [];
  const topMatches = matches.slice(0, 2);
  const matchSubtitle =
    jobsLoading
      ? "Loading your matches…"
      : matches.length === 0
        ? "Add your values and preferences — we’ll surface roles worth your energy."
        : topMatches.length
          ? `${topMatches.map((m) => m.title).join(" · ")}${matches.length > 2 ? ` +${matches.length - 2} more` : ""}`
          : `${matches.length} role${matches.length === 1 ? "" : "s"} aligned with your profile`;

  const activeApps = applications.filter((a) =>
    ["Submitted", "Interviewing", "Offered"].includes(a.status)
  );
  const appSubtitle =
    appsLoading
      ? "Loading applications…"
      : activeApps.length === 0
        ? "Track where you’ve applied and what stage you’re in — one calm view."
        : `${activeApps.length} active · latest: ${activeApps[0]?.job_title ?? "your roles"}`;

  const queued = queue.filter((q) => q.status === "queued" || q.status === "processing").length;
  const queueSubtitle =
    queueLoading
      ? "Loading pipeline…"
      : queued > 0
        ? `${queued} in queue — payloads and matching statements generate here before anything sends.`
        : todayCount > 0
          ? `${todayCount} completed today — open Auto-Apply to copy materials or track what went out.`
          : "Queue is clear. Add roles from Matches or the job board when you’re ready.";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
        <Radio className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
        <span>Live pulse · world-of-work wire</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30 bg-background/50">
        <Suspense
          fallback={<div className="h-9 animate-pulse bg-muted/40 border-b border-border/20" aria-hidden />}
        >
          <LiveIntelligenceTicker />
        </Suspense>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PulseTile
          icon={Briefcase}
          title={jobsLoading ? "Matches" : matches.length ? `${matches.length} strong match${matches.length === 1 ? "" : "es"}` : "Job matches"}
          subtitle={matchSubtitle}
          onClick={() => onNavigate("matches")}
        />
        <PulseTile
          icon={ClipboardList}
          title={
            appsLoading
              ? "Applications"
              : activeApps.length > 0
                ? `${activeApps.length} application${activeApps.length === 1 ? "" : "s"} in motion`
                : "Application tracker"
          }
          subtitle={appSubtitle}
          onClick={() => onNavigate("tracker")}
        />
        <PulseTile
          icon={Zap}
          title="Auto-apply & materials"
          subtitle={queueSubtitle}
          onClick={() => onNavigate("auto-apply")}
        />
        <PulseTile
          icon={Mic}
          title="AI interview practice"
          subtitle="Run a realistic mock with coaching — tighten your story before the real conversation."
          onClick={() => onNavigate("mock-interview")}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border/50 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <p className="text-xs text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">Briefing & dossiers</span>
            {" — "}Your latest intelligence summary and application-ready context live in one place.
          </p>
        </div>
        <Link
          to="/briefing"
          className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-primary hover:text-primary/85"
        >
          Open briefing <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
