/**
 * NarrativeFeed — The Bloomberg-meets-Oprah-meets-RHOBH dashboard.
 *
 * Three acts, one scroll:
 *   Act 1: "Your Employer Right Now" — What's happening at YOUR company (Bloomberg)
 *   Act 2: "The Receipts" — Corporate drama across your watchlist (RHOBH/NYT)
 *   Act 3: "Your Move" — What you should do about it (Oprah/Martha)
 *
 * If we don't detect an employer (free email), Act 1 becomes a prompt to
 * search or connect a corporate email.
 */
import { useAuth } from "@/contexts/AuthContext";
import { usePersona } from "@/hooks/use-persona";
import { useDashboardBriefing } from "@/hooks/use-dashboard-briefing";
import { useEmployerIntelligence } from "@/hooks/use-employer-intelligence";
import DailyBriefingCard from "@/components/DailyBriefingCard";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, ArrowRight, ExternalLink, AlertTriangle, Shield,
  FileText, BookOpen, TrendingDown, Eye, Building2,
  Briefcase, Zap, ChevronRight, Flame, Target, Mic,
  Sparkles, Bell,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useProject2025LinkedCompanyIds } from "@/hooks/use-project2025-linked-companies";
import { Project2025DashboardBadge } from "@/components/project2025/Project2025DashboardBadge";
import { DashboardHeartbeat } from "@/components/dashboard/DashboardHeartbeat";
import { RecentCompanyWork } from "@/components/dashboard/RecentCompanyWork";

interface NarrativeFeedProps {
  onNavigate: (tab: string) => void;
}

/* ── Animation helper ── */
const anim = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

/* ── Score helpers ── */
function scoreColorClass(score: number) {
  if (score >= 70) return "text-civic-green";
  if (score >= 40) return "text-primary";
  return "text-destructive";
}
function scoreBgClass(score: number) {
  if (score >= 70) return "bg-civic-green/10 text-civic-green";
  if (score >= 40) return "bg-primary/10 text-primary";
  return "bg-destructive/10 text-destructive";
}
function scoreDotClass(score: number) {
  if (score >= 70) return "bg-civic-green";
  if (score >= 40) return "bg-primary";
  return "bg-destructive";
}

const SEVERITY_CLASSES: Record<string, string> = {
  red_flag: "bg-destructive/10 text-destructive border-destructive/30",
  amber_flag: "bg-civic-yellow/10 text-civic-yellow border-civic-yellow/30",
  green_badge: "bg-civic-green/10 text-civic-green border-civic-green/30",
  info: "bg-civic-blue/10 text-civic-blue border-civic-blue/30",
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 sm:p-6 bg-card border border-border/30 ${className}`}>
      {children}
    </div>
  );
}

function ActDivider({ number, title, subtitle, icon: Icon }: {
  number: string; title: string; subtitle: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/30">
          <Icon className="w-4 h-4 text-primary" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary font-mono tracking-wider">ACT {number}</span>
          </div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight leading-tight">{title}</h2>
        </div>
      </div>
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-xs text-muted-foreground/60 font-mono shrink-0">{subtitle}</span>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg animate-pulse bg-muted ${className}`} />;
}

/* ── Empty state component ── */
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="text-center py-10">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════
   NARRATIVE FEED
   ════════════════════════════════════════════════════════════ */
export function NarrativeFeed({ onNavigate }: NarrativeFeedProps) {
  const { user } = useAuth();
  const { hasTakenQuiz } = usePersona();
  const { data: briefing, isLoading: briefingLoading } = useDashboardBriefing();
  const { data: employer, isLoading: employerLoading } = useEmployerIntelligence();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isLoading = briefingLoading || employerLoading;
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const firstName = briefing?.firstName || "there";

  const trackedCompanies = useMemo(() => {
    if (!briefing?.tracked?.length) return [];
    return briefing.tracked.map((t: any) => ({
      id: t.company?.id as string | undefined,
      name: t.company?.name,
      slug: t.company?.slug,
      industry: t.company?.industry,
      score: t.company?.civic_footprint_score ?? 0,
    }));
  }, [briefing?.tracked]);

  const trackedCompanyIds = useMemo(
    () => trackedCompanies.map((t) => t.id).filter(Boolean) as string[],
    [trackedCompanies],
  );
  const { data: project2025CompanySet } = useProject2025LinkedCompanyIds(trackedCompanyIds);

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-[900px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const alerts = briefing?.alerts || [];

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">

      {/* ═══ MASTHEAD — Date + greeting (Bloomberg terminal header energy) ═══ */}
      <motion.div {...anim(0)}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-bold px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-primary font-mono">
                <Eye className="w-3 h-3" /> LIVE
              </span>
              <span className="text-xs text-muted-foreground font-mono">{dateStr}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Good morning, {firstName}.
            </h1>
            {alerts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {alerts.length} signal{alerts.length !== 1 ? "s" : ""} require your attention today.
              </p>
            )}
          </div>
          <form onSubmit={handleSearch} className="flex items-center rounded-xl px-3 py-2.5 bg-muted/30 border border-border/30 w-full sm:w-72">
            <Search className="w-3.5 h-3.5 shrink-0 mr-2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search any employer..."
              className="bg-transparent border-none outline-none w-full text-xs text-foreground placeholder:text-muted-foreground/50"
            />
          </form>
        </div>
      </motion.div>

      {/* ═══ HEARTBEAT — Live pulse tiles ═══ */}
      <motion.div {...anim(0.02)} className="border-b border-border/30 pb-6">
        <DashboardHeartbeat onNavigate={onNavigate} />
      </motion.div>

      {user && (
        <motion.div {...anim(0.025)}>
          <RecentCompanyWork onNavigate={onNavigate} />
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ACT 1: YOUR EMPLOYER RIGHT NOW
          Bloomberg energy — what's happening at YOUR company
         ═══════════════════════════════════════════════════════ */}
      <motion.div {...anim(0.05)}>
        <ActDivider number="1" title="Your Employer Right Now" subtitle="bloomberg" icon={Building2} />
      </motion.div>

      {employer?.detected && employer.company ? (
        <motion.div {...anim(0.1)}>
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Link to={`/dossier/${employer.company.slug}`} className="group">
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {employer.company.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {employer.company.industry}
                  {employer.company.hq_location ? ` · ${employer.company.hq_location}` : ""}
                  {employer.company.employee_count_range ? ` · ${employer.company.employee_count_range} employees` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-extrabold font-mono ${scoreColorClass(employer.company.civic_footprint_score || 0)}`}>
                  {employer.company.civic_footprint_score || "—"}
                </div>
                <div className="text-xs text-muted-foreground">Civic Score</div>
              </div>
            </div>

            {/* Employer signals */}
            {employer.alerts.length > 0 ? (
              <div className="space-y-2 mb-4">
                {employer.alerts.map((alert: any) => (
                  <div key={alert.id} className="rounded-lg p-3 bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-xs font-bold text-destructive font-mono">
                        {alert.signal_category?.toUpperCase() || "SIGNAL"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono ml-auto">
                        {alert.date_detected ? new Date(alert.date_detected).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-snug">{alert.change_description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg p-3 bg-civic-green/5 border border-civic-green/20 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-civic-green" />
                  <p className="text-sm text-muted-foreground">
                    No active alerts on {employer.company.name} right now. We're watching.
                  </p>
                </div>
              </div>
            )}

            <Link
              to={`/dossier/${employer.company.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Full employer dossier <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </motion.div>
      ) : (
        /* No employer detected — compelling prompt to search */
        <motion.div {...anim(0.1)}>
          <EmptyState
            icon={Building2}
            title="Who do you work for?"
            description="Sign in with your work email and we'll automatically pull intelligence about your employer. Or search any company to see their public record."
            actionLabel="Search any employer"
            onAction={() => navigate("/search")}
          />
        </motion.div>
      )}


      {/* ═══════════════════════════════════════════════════════
          ACT 2: THE RECEIPTS
          RHOBH energy — corporate drama, violations, the tea
         ═══════════════════════════════════════════════════════ */}
      <motion.div {...anim(0.15)}>
        <ActDivider number="2" title="The Receipts" subtitle="the tea" icon={Flame} />
      </motion.div>

      {/* Watchlist alerts */}
      {alerts.length > 0 ? (
        <motion.div {...anim(0.2)}>
          <Card>
            <h3 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Signal Alerts on Your Watchlist
              <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold bg-destructive/10 text-destructive border border-destructive/30">
                {alerts.length} NEW
              </span>
            </h3>
            <div className="space-y-2">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg p-3 bg-muted/20 border border-border/20">
                  <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-destructive" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{alert.company_name}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {alert.signal_category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                      {alert.change_description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/50 font-mono shrink-0">
                    {alert.date_detected ? new Date(alert.date_detected).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs font-medium mt-3 flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              All signal alerts <ArrowRight className="w-3 h-3" />
            </button>
          </Card>
        </motion.div>
      ) : (
        <motion.div {...anim(0.2)}>
          <EmptyState
            icon={Bell}
            title="Your watchlist is quiet"
            description="No alerts right now. Track companies to get real-time signal alerts when something changes in the public record."
            actionLabel="Track a company"
            onAction={() => onNavigate("tracked")}
          />
        </motion.div>
      )}

      {/* Daily briefing feed — latest intelligence stories */}
      <motion.div {...anim(0.25)}>
        <DailyBriefingCard />
      </motion.div>

      {/* Tracked companies grid */}
      {trackedCompanies.length > 0 ? (
        <motion.div {...anim(0.3)}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Your Watchlist
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {trackedCompanies.length} companies
              </span>
            </div>
            <div className="space-y-1">
              {trackedCompanies.slice(0, 8).map((t: any, i: number) => (
                <Link
                  key={i}
                  to={`/dossier/${t.slug}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors group hover:bg-muted/40"
                >
                  <span className={`shrink-0 w-2 h-2 rounded-full ${scoreDotClass(t.score)}`} />
                  <span className="flex-1 min-w-0 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t.name}
                  </span>
                  {t.id && t.slug && (
                    <Project2025DashboardBadge
                      companySlug={t.slug}
                      active={project2025CompanySet?.has(t.id) ?? false}
                      className="shrink-0"
                    />
                  )}
                  <span className="text-xs text-muted-foreground hidden sm:block">{t.industry}</span>
                  <span className={`text-xs font-bold shrink-0 rounded-full px-2 py-0.5 ${scoreBgClass(t.score)}`}>
                    {t.score}
                  </span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => onNavigate("tracked")}
              className="text-xs font-medium mt-3 flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              Manage watchlist <ArrowRight className="w-3 h-3" />
            </button>
          </Card>
        </motion.div>
      ) : (
        <motion.div {...anim(0.3)}>
          <EmptyState
            icon={Eye}
            title="No companies tracked yet"
            description="Start watching companies to see their civic scores, alerts, and intelligence all in one place."
            actionLabel="Browse the directory"
            onAction={() => navigate("/browse")}
          />
        </motion.div>
      )}


      {/* ═══════════════════════════════════════════════════════
          ACT 3: YOUR MOVE
          Oprah/Martha energy — what should you DO about this
         ═══════════════════════════════════════════════════════ */}
      <motion.div {...anim(0.35)}>
        <ActDivider number="3" title="Your Move" subtitle="what to do now" icon={Target} />
      </motion.div>

      <motion.div {...anim(0.4)}>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Action card: Interview prep */}
          <Card className="group cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate("/interview-dossier")}>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-civic-blue/10">
                <FileText className="w-4 h-4 text-civic-blue" />
              </span>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Prep for your next interview
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pull the dossier on any company before you walk in. The questions they don't expect you to ask.
            </p>
          </Card>

          {/* Action card: AI mock interview */}
          <Card className="group cursor-pointer hover:border-primary/30 transition-all" onClick={() => onNavigate("mock-interview")}>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                <Mic className="w-4 h-4 text-primary" />
              </span>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                AI mock interview
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Practice with structured feedback before you're in front of a hiring panel.
            </p>
          </Card>

          {/* Action card: Offer check */}
          <Card className="group cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate("/offer-check")}>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-civic-green/10">
                <Shield className="w-4 h-4 text-civic-green" />
              </span>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Check an offer
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Run the employer through our integrity check before you sign.
            </p>
          </Card>

          {/* Action card: Career map */}
          <Card className="group cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate("/career-map")}>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                <Briefcase className="w-4 h-4 text-primary" />
              </span>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Map your career path
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              See which roles and companies align with where you want to go.
            </p>
          </Card>

          {/* Action card: Work DNA quiz */}
          <Card
            className="group cursor-pointer hover:border-primary/30 transition-all sm:col-span-2"
            onClick={() => navigate(hasTakenQuiz ? "/values-search" : "/quiz")}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-civic-yellow/10">
                <Zap className="w-4 h-4 text-civic-yellow" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {hasTakenQuiz ? "Explore values-aligned companies" : "Take the Work DNA quiz"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {hasTakenQuiz
                    ? "Your values profile is active. See which companies actually match."
                    : "5 minutes. Find out what kind of workplace you actually thrive in."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* ═══ CLOSING — The Jackye touch ═══ */}
      <motion.div {...anim(0.45)}>
        <div className="text-center py-6 border-t border-border/30">
          <p className="text-sm text-foreground font-semibold italic">
            "You deserve to know exactly who you work for."
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            I see you. I was thinking of you when I built this. — Jackye
          </p>
        </div>
      </motion.div>

    </div>
  );
}
