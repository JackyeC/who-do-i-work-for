import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Send,
  FileText,
  Sparkles,
  ExternalLink,
  X,
  Zap,
  ChevronRight,
  RefreshCw,
  Settings,
  Shield,
  MapPin,
  Clock,
  TrendingUp,
  Eye,
  Ban,
  Play,
  Pause,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDreamJobMatches,
  useDreamJobStats,
  useDismissMatch,
  useApplyToMatch,
  useRunDreamJobEngine,
  type DreamJobMatch,
} from "@/hooks/use-dream-jobs";
import { useAutoApplySettings } from "@/hooks/use-auto-apply";

/* ------------------------------------------------------------------ */
/*  Brand tokens                                                       */
/* ------------------------------------------------------------------ */
const bg = "#0a0a0e";
const gold = "#f0c040";
const text = "#f0ebe0";
const cardBg = "#13121a";
const cardBorder = "1px solid rgba(240,192,64,0.08)";
const mutedText = "#8a8a8a";

/* ------------------------------------------------------------------ */
/*  Score bar component                                                */
/* ------------------------------------------------------------------ */
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span style={{ color: mutedText, width: 60, flexShrink: 0 }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, score)}%`, background: color }}
        />
      </div>
      <span style={{ color: text, width: 28, textAlign: "right", fontWeight: 600, fontFamily: "DM Mono, monospace" }}>
        {score}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Integrity badge                                                    */
/* ------------------------------------------------------------------ */
function IntegrityBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? "#4ade80" : score >= 50 ? "#f0c040" : score >= 25 ? "#f97316" : "#ef4444";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : score >= 25 ? "Caution" : "Concern";

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      <Shield className="w-3 h-3" />
      {label} ({score})
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Source badge                                                       */
/* ------------------------------------------------------------------ */
function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    linkedin: "#0a66c2",
    indeed: "#2164f3",
    glassdoor: "#0caa41",
    ziprecruiter: "#00a43b",
    career_page: "#8b5cf6",
    web_search: "#6b7280",
  };
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
      style={{ background: `${colors[source] || "#6b7280"}20`, color: colors[source] || "#6b7280" }}
    >
      {source.replace("_", " ")}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Job card                                                           */
/* ------------------------------------------------------------------ */
function JobCard({
  match,
  onApply,
  onDismiss,
  applyLoading,
}: {
  match: DreamJobMatch;
  onApply: () => void;
  onDismiss: () => void;
  applyLoading: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-5 space-y-4 transition-all duration-200 hover:border-[rgba(240,192,64,0.2)]"
      style={{ background: cardBg, border: cardBorder }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-bold text-base leading-tight truncate" style={{ color: text }}>
            {match.job_title}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: mutedText }}>
            {match.company_name}
          </p>
        </div>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{ background: `${gold}10`, border: `1px solid ${gold}25` }}
        >
          <span className="text-lg font-bold" style={{ color: gold, fontFamily: "DM Mono, monospace" }}>
            {match.composite_score}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <IntegrityBadge score={match.integrity_score} />
        <SourceBadge source={match.source} />
        {match.location && (
          <span className="flex items-center gap-1 text-xs" style={{ color: mutedText }}>
            <MapPin className="w-3 h-3" />
            {match.location}
          </span>
        )}
        {match.work_mode && (
          <span className="text-xs capitalize" style={{ color: mutedText }}>
            {match.work_mode}
          </span>
        )}
        {match.salary_range && (
          <span className="text-xs font-medium" style={{ color: "#4ade80" }}>
            {match.salary_range}
          </span>
        )}
      </div>

      {/* Score bars */}
      <div className="space-y-1.5">
        <ScoreBar label="Skills" score={match.skills_match_score} color="#60a5fa" />
        <ScoreBar label="Values" score={match.values_match_score} color="#a78bfa" />
        <ScoreBar label="Integrity" score={match.integrity_score} color="#4ade80" />
      </div>

      {/* Matched skills/values */}
      {((match.matched_skills?.length || 0) > 0 || (match.matched_values?.length || 0) > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {(match.matched_skills || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}
            >
              {skill}
            </span>
          ))}
          {(match.matched_values || []).slice(0, 3).map((value) => (
            <span
              key={value}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}
            >
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {match.status === "matched" && (
          <>
            <Button
              size="sm"
              onClick={onApply}
              disabled={applyLoading}
              className="flex-1 h-9 rounded-lg font-semibold text-xs"
              style={{ background: gold, color: bg }}
            >
              <Zap className="w-3.5 h-3.5 mr-1" />
              Apply Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-9 w-9 p-0 rounded-lg"
              style={{ color: mutedText }}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        {(match.status === "queued" || match.status === "applying" || match.status === "applied") && (
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize"
            style={{
              background: match.status === "applied" ? "rgba(74,222,128,0.12)" : "rgba(240,192,64,0.12)",
              color: match.status === "applied" ? "#4ade80" : gold,
            }}
          >
            {match.status === "queued" ? "Queued for Apply" : match.status === "applying" ? "Applying…" : "Applied ✓"}
          </span>
        )}
        {match.dossier_generated && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/dream-jobs/${match.id}`)}
            className="h-9 rounded-lg text-xs"
            style={{ color: gold }}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Dossier
          </Button>
        )}
        <a href={match.source_url} target="_blank" rel="noopener noreferrer" className="ml-auto">
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg" style={{ color: mutedText }}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats bar                                                          */
/* ------------------------------------------------------------------ */
function StatsBar({ stats }: { stats: any }) {
  const items = [
    { icon: Sparkles, label: "Matched Today", value: stats.matchesToday, color: gold },
    { icon: Briefcase, label: "Total Matches", value: stats.totalMatches, color: "#60a5fa" },
    { icon: Send, label: "Applications", value: stats.applicationsSent, color: "#a78bfa" },
    { icon: FileText, label: "Dossiers", value: stats.dossiersAvailable, color: "#4ade80" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: cardBg, border: cardBorder }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${item.color}12` }}
          >
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <div>
            <p
              className="text-xl font-bold leading-none"
              style={{ color: text, fontFamily: "DM Mono, monospace" }}
            >
              {item.value}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: mutedText }}>
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings panel                                                     */
/* ------------------------------------------------------------------ */
function SettingsPanel() {
  const { query: settingsQuery, upsert } = useAutoApplySettings();
  const settings = settingsQuery.data;

  const [threshold, setThreshold] = useState(settings?.min_alignment_threshold || 60);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="rounded-2xl p-5 space-y-5" style={{ background: cardBg, border: cardBorder }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: gold }}>
          Agent Mode
        </h3>

        <div className="space-y-4">
          {[
            { mode: "auto", label: "Auto Mode", desc: "Agent applies automatically to qualifying jobs" },
            { mode: "hybrid", label: "Hybrid Mode", desc: "Agent queues jobs, you approve each one" },
            { mode: "review", label: "Review Only", desc: "Agent finds matches, you handle applications" },
          ].map((m) => (
            <button
              key={m.mode}
              onClick={() => upsert.mutate({ is_enabled: true } as any)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background:
                  (settings as any)?.mode === m.mode
                    ? `${gold}10`
                    : "transparent",
                border:
                  (settings as any)?.mode === m.mode
                    ? `1px solid ${gold}30`
                    : "1px solid transparent",
              }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  background: (settings as any)?.mode === m.mode ? gold : "rgba(255,255,255,0.1)",
                }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: text }}>
                  {m.label}
                </p>
                <p className="text-xs" style={{ color: mutedText }}>
                  {m.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Threshold slider */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: cardBg, border: cardBorder }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: gold }}>
          Minimum Match Score
        </h3>
        <Slider
          value={[threshold]}
          onValueChange={(v) => setThreshold(v[0])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-center text-lg font-bold" style={{ color: text, fontFamily: "DM Mono, monospace" }}>
          {threshold}/100
        </p>
        <p className="text-xs text-center" style={{ color: mutedText }}>
          Jobs below this score will be filtered out
        </p>
      </div>

      {/* Pause toggle */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: text }}>
              Agent Active
            </h3>
            <p className="text-xs" style={{ color: mutedText }}>
              {settings?.is_paused ? "Agent is paused" : "Agent is running"}
            </p>
          </div>
          <Switch
            checked={!settings?.is_paused}
            onCheckedChange={(checked) =>
              upsert.mutate({ is_paused: !checked } as any)
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Applied jobs section                                               */
/* ------------------------------------------------------------------ */
function AppliedJobsSection({ matches }: { matches: DreamJobMatch[] }) {
  const applied = matches.filter((m) =>
    ["queued", "applying", "applied"].includes(m.status)
  );

  if (!applied.length) {
    return (
      <div className="text-center py-12">
        <Send className="w-8 h-8 mx-auto mb-3" style={{ color: mutedText }} />
        <p className="text-sm" style={{ color: mutedText }}>
          No applications yet. Apply to your top matches to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applied.map((match) => (
        <div
          key={match.id}
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: cardBg, border: cardBorder }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: text }}>
              {match.job_title}
            </p>
            <p className="text-xs" style={{ color: mutedText }}>
              {match.company_name}
            </p>
          </div>

          {/* Status timeline */}
          <div className="flex items-center gap-1.5">
            {["queued", "applying", "applied"].map((step, i) => {
              const isActive = step === match.status;
              const isPast =
                ["queued", "applying", "applied"].indexOf(match.status) > i;
              return (
                <div key={step} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: isPast || isActive ? gold : "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? `0 0 8px ${gold}40` : "none",
                    }}
                  />
                  {i < 2 && (
                    <div
                      className="w-6 h-px"
                      style={{
                        background: isPast ? gold : "rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <span
            className="text-xs font-semibold capitalize px-2 py-1 rounded-full"
            style={{
              background: match.status === "applied" ? "rgba(74,222,128,0.12)" : `${gold}12`,
              color: match.status === "applied" ? "#4ade80" : gold,
            }}
          >
            {match.status}
          </span>

          {match.dossier_generated && (
            <Link to={`/dream-jobs/${match.id}`}>
              <Button size="sm" variant="ghost" className="h-8 text-xs" style={{ color: gold }}>
                <FileText className="w-3.5 h-3.5 mr-1" />
                Dossier
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function DreamJobs() {
  const { data: matches = [], isLoading } = useDreamJobMatches();
  const { data: stats } = useDreamJobStats();
  const dismissMatch = useDismissMatch();
  const applyToMatch = useApplyToMatch();
  const runEngine = useRunDreamJobEngine();

  const activeMatches = matches.filter(
    (m) => m.status !== "dismissed"
  );
  const matchedJobs = matches.filter((m) => m.status === "matched");

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <Helmet>
        <title>Dream Jobs — WDIWF</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p
              className="text-xs uppercase tracking-[3px] font-semibold mb-1"
              style={{ color: gold }}
            >
              Dream Job Engine
            </p>
            <h1
              className="font-sans"
              style={{
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 800,
                letterSpacing: "-2px",
                color: text,
              }}
            >
              Your Matches
            </h1>
            <p className="text-sm mt-1" style={{ color: mutedText }}>
              Stop applying. Start aligning.
            </p>
          </div>
          <Button
            onClick={() => runEngine.mutate()}
            disabled={runEngine.isPending}
            className="h-10 px-5 rounded-xl font-semibold text-sm"
            style={{ background: gold, color: bg }}
          >
            {runEngine.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {runEngine.isPending ? "Searching…" : "Find New Matches"}
          </Button>
        </div>

        {/* Stats */}
        {stats && <StatsBar stats={stats} />}

        {/* Tabs */}
        <Tabs defaultValue="matches" className="mt-8">
          <TabsList
            className="h-10 rounded-xl p-1 mb-6"
            style={{ background: cardBg, border: cardBorder }}
          >
            <TabsTrigger value="matches" className="rounded-lg text-xs font-semibold data-[state=active]:bg-[rgba(240,192,64,0.12)] data-[state=active]:text-[#f0c040]">
              Matches ({matchedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="rounded-lg text-xs font-semibold data-[state=active]:bg-[rgba(240,192,64,0.12)] data-[state=active]:text-[#f0c040]">
              Applied
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg text-xs font-semibold data-[state=active]:bg-[rgba(240,192,64,0.12)] data-[state=active]:text-[#f0c040]">
              <Settings className="w-3.5 h-3.5 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Matches tab */}
          <TabsContent value="matches">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 h-64 animate-pulse"
                    style={{ background: cardBg }}
                  />
                ))}
              </div>
            ) : matchedJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: `${gold}40` }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: text }}>
                  No matches yet
                </h3>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: mutedText }}>
                  Click "Find New Matches" to search for jobs aligned with your values, skills, and career goals.
                </p>
                <Button
                  onClick={() => runEngine.mutate()}
                  disabled={runEngine.isPending}
                  className="h-10 px-6 rounded-xl font-semibold text-sm"
                  style={{ background: gold, color: bg }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedJobs.map((match) => (
                  <JobCard
                    key={match.id}
                    match={match}
                    onApply={() => applyToMatch.mutate(match.id)}
                    onDismiss={() => dismissMatch.mutate(match.id)}
                    applyLoading={applyToMatch.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applied tab */}
          <TabsContent value="applied">
            <AppliedJobsSection matches={matches} />
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings">
            <div className="max-w-lg">
              <SettingsPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
