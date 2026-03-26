import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  Shield,
  Target,
  FileText,
  PenTool,
  MessageCircle,
  DollarSign,
  CheckSquare,
  Users,
  Mail,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Send,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useDreamJobDossier, useEmailDossier, type DreamJobDossier as DossierType } from "@/hooks/use-dream-jobs";
import { useToast } from "@/hooks/use-toast";

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
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */
function CopyButton({ content, label = "Copy" }: { content: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className="h-8 text-xs rounded-lg"
      style={{ color: gold }}
    >
      {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({
  icon: Icon,
  title,
  number,
  children,
  defaultOpen = true,
}: {
  icon: any;
  title: string;
  number: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: cardBorder }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left transition-colors hover:bg-[rgba(240,192,64,0.03)]"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${gold}12` }}
        >
          <Icon className="w-4 h-4" style={{ color: gold }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: mutedText }}>
            Section {number}
          </span>
          <h2 className="text-sm font-bold" style={{ color: text }}>
            {title}
          </h2>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: mutedText }} />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedText }} />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score gauge                                                        */
/* ------------------------------------------------------------------ */
function ScoreGauge({ score, label }: { score: number | null; label: string }) {
  const s = score ?? 0;
  const color = s >= 75 ? "#4ade80" : s >= 50 ? "#f0c040" : s >= 25 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${s * 3.6}deg, rgba(255,255,255,0.06) ${s * 3.6}deg)`,
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: cardBg }}
        >
          <span className="text-sm font-bold" style={{ color, fontFamily: "DM Mono, monospace" }}>
            {score ?? "—"}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-center" style={{ color: mutedText }}>
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual section renderers                                       */
/* ------------------------------------------------------------------ */

function CompanyOverviewSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Company overview is being generated...</p>;

  return (
    <div className="space-y-4">
      {data.mission && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            Mission
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: text }}>
            {data.mission}
          </p>
        </div>
      )}

      {data.values?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Core Values
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.values.map((v: string) => (
              <span
                key={v}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: `${gold}12`, color: gold }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.culture && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            Culture
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: text }}>
            {data.culture}
          </p>
        </div>
      )}

      {data.leadership?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Leadership
          </h4>
          <div className="space-y-2">
            {data.leadership.map((leader: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: mutedText }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: text }}>
                    {leader.name}
                  </p>
                  <p className="text-xs" style={{ color: mutedText }}>
                    {leader.title} {leader.background ? `— ${leader.background}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recent_news?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Recent News
          </h4>
          <div className="space-y-2">
            {data.recent_news.map((news: any, i: number) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-sm font-semibold" style={{ color: text }}>
                  {news.headline}
                </p>
                <p className="text-xs mt-1" style={{ color: mutedText }}>
                  {news.date} — {news.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        {data.industry && (
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              Industry
            </p>
            <p className="text-sm font-semibold" style={{ color: text }}>
              {data.industry}
            </p>
          </div>
        )}
        {data.headquarters && (
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              Headquarters
            </p>
            <p className="text-sm font-semibold" style={{ color: text }}>
              {data.headquarters}
            </p>
          </div>
        )}
        {data.employee_count && (
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              Employees
            </p>
            <p className="text-sm font-semibold" style={{ color: text }}>
              {data.employee_count}
            </p>
          </div>
        )}
        {data.founded && (
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              Founded
            </p>
            <p className="text-sm font-semibold" style={{ color: text }}>
              {data.founded}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegritySnapshotSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Integrity data is being compiled...</p>;

  return (
    <div className="space-y-5">
      {/* Pillar gauges */}
      <div className="flex justify-around py-2">
        <ScoreGauge score={data.pillars?.integrity_gap?.score} label="Integrity Gap" />
        <ScoreGauge score={data.pillars?.labor_impact?.score} label="Labor Impact" />
        <ScoreGauge score={data.pillars?.safety_alert?.score} label="Safety Alert" />
        <ScoreGauge score={data.pillars?.connected_dots?.score} label="Connected Dots" />
      </div>

      {/* Findings */}
      {data.positive_findings?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#4ade80" }}>
            Positive Findings
          </h4>
          {data.positive_findings.map((f: string, i: number) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#4ade80" }} />
              <p className="text-sm" style={{ color: text }}>
                {f}
              </p>
            </div>
          ))}
        </div>
      )}

      {data.concerning_findings?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#f97316" }}>
            Areas of Concern
          </h4>
          {data.concerning_findings.map((f: string, i: number) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#f97316" }} />
              <p className="text-sm" style={{ color: text }}>
                {f}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summaries */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        {data.pac_donations_summary && (
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedText }}>
              PAC Donations
            </p>
            <p className="text-sm" style={{ color: text }}>
              {data.pac_donations_summary}
            </p>
          </div>
        )}
        {data.labor_practices_summary && (
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedText }}>
              Labor Practices
            </p>
            <p className="text-sm" style={{ color: text }}>
              {data.labor_practices_summary}
            </p>
          </div>
        )}
        {data.safety_record && (
          <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: mutedText }}>
              Safety Record
            </p>
            <p className="text-sm" style={{ color: text }}>
              {data.safety_record}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleAnalysisSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Role analysis is being generated...</p>;

  return (
    <div className="space-y-4">
      {data.role_summary && (
        <p className="text-sm leading-relaxed" style={{ color: text }}>
          {data.role_summary}
        </p>
      )}

      {data.key_responsibilities?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Key Responsibilities
          </h4>
          <ul className="space-y-1.5">
            {data.key_responsibilities.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: gold }} />
                <span className="text-sm" style={{ color: text }}>
                  {r}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.why_it_matches && (
        <div className="p-4 rounded-xl" style={{ background: `${gold}08`, border: `1px solid ${gold}15` }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            Why This Matches You
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: text }}>
            {data.why_it_matches}
          </p>
        </div>
      )}

      {data.growth_trajectory && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            Growth Trajectory
          </h4>
          <p className="text-sm" style={{ color: text }}>
            {data.growth_trajectory}
          </p>
        </div>
      )}

      {data.day_in_the_life && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            A Day in the Life
          </h4>
          <p className="text-sm" style={{ color: text }}>
            {data.day_in_the_life}
          </p>
        </div>
      )}
    </div>
  );
}

function TailoredResumeSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Resume suggestions being prepared...</p>;

  return (
    <div className="space-y-4">
      {data.professional_summary && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: gold }}>
              Tailored Professional Summary
            </h4>
            <CopyButton content={data.professional_summary} />
          </div>
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-sm leading-relaxed italic" style={{ color: text }}>
              {data.professional_summary}
            </p>
          </div>
        </div>
      )}

      {data.keywords_to_include?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            ATS Keywords to Include
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {data.keywords_to_include.map((kw: string) => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.skills_to_emphasize?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Skills to Emphasize
          </h4>
          <ul className="space-y-1">
            {data.skills_to_emphasize.map((s: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <Star className="w-3 h-3" style={{ color: gold }} />
                <span className="text-sm" style={{ color: text }}>
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.experience_framing && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: gold }}>
            How to Frame Your Experience
          </h4>
          <p className="text-sm" style={{ color: text }}>
            {data.experience_framing}
          </p>
        </div>
      )}
    </div>
  );
}

function InterviewQuestionsSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Interview questions being prepared...</p>;

  const renderQuestions = (questions: any[], type: string) => {
    if (!questions?.length) return null;

    return (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: gold }}>
          {type}
        </h4>
        <div className="space-y-3">
          {questions.map((q: any, i: number) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: text }}>
                {i + 1}. {typeof q === "string" ? q : q.question}
              </p>
              {q.guidance && (
                <p className="text-xs" style={{ color: mutedText }}>
                  💡 {q.guidance}
                </p>
              )}
              {q.purpose && (
                <p className="text-xs" style={{ color: mutedText }}>
                  🎯 {q.purpose}
                </p>
              )}
              {q.what_to_watch_for && (
                <p className="text-xs mt-1" style={{ color: "#f97316" }}>
                  ⚠️ Watch for: {q.what_to_watch_for}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderQuestions(data.company_specific, "Company-Specific Questions (10)")}
      {renderQuestions(data.behavioral, "Behavioral Questions (5)")}
      {renderQuestions(data.questions_to_ask, "Questions to Ask the Interviewer (5)")}
      {renderQuestions(data.red_flag_probes, "Red Flag Probes (Diplomatic)")}
    </div>
  );
}

function SalaryBenchmarksSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Salary data being compiled...</p>;

  const formatCurrency = (n: number | null) =>
    n ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-4">
      {data.market_range && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              Low
            </p>
            <p className="text-lg font-bold" style={{ color: text, fontFamily: "DM Mono, monospace" }}>
              {formatCurrency(data.market_range.low)}
            </p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: `${gold}08`, border: `1px solid ${gold}15` }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: gold }}>
              Median
            </p>
            <p className="text-lg font-bold" style={{ color: gold, fontFamily: "DM Mono, monospace" }}>
              {formatCurrency(data.market_range.median)}
            </p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: mutedText }}>
              High
            </p>
            <p className="text-lg font-bold" style={{ color: text, fontFamily: "DM Mono, monospace" }}>
              {formatCurrency(data.market_range.high)}
            </p>
          </div>
        </div>
      )}

      {data.location_factor && (
        <p className="text-sm" style={{ color: text }}>
          📍 {data.location_factor}
        </p>
      )}

      {data.total_comp_notes && (
        <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: mutedText }}>
            Total Compensation Notes
          </p>
          <p className="text-sm" style={{ color: text }}>
            {data.total_comp_notes}
          </p>
        </div>
      )}

      {data.negotiation_points?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Negotiation Points
          </h4>
          <ul className="space-y-1.5">
            {data.negotiation_points.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: gold }} />
                <span className="text-sm" style={{ color: text }}>
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.confidence && (
        <p className="text-xs" style={{ color: mutedText }}>
          Data confidence: {data.confidence}
        </p>
      )}
    </div>
  );
}

function PreparationChecklistSection({ data }: { data: any }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!data) return <p style={{ color: mutedText }}>Checklist being prepared...</p>;

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderChecklist = (items: any[], title: string) => {
    if (!items?.length) return null;

    return (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: gold }}>
          {title}
        </h4>
        <div className="space-y-2">
          {items.map((item: any, i: number) => {
            const key = `${title}-${i}`;
            const task = typeof item === "string" ? item : item.task;
            const checked = checkedItems[key] || false;

            return (
              <label
                key={key}
                className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleItem(key)}
                  className="mt-0.5"
                />
                <span
                  className="text-sm"
                  style={{
                    color: checked ? mutedText : text,
                    textDecoration: checked ? "line-through" : "none",
                  }}
                >
                  {task}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderChecklist(data.before_interview, "Before the Interview")}
      {renderChecklist(data.day_of, "Day Of")}
      {renderChecklist(data.after_interview, "After the Interview")}
    </div>
  );
}

function FollowUpTimelineSection({ data }: { data: any }) {
  if (!data) return <p style={{ color: mutedText }}>Follow-up timeline being created...</p>;

  return (
    <div className="space-y-4">
      {data.timeline?.map((item: any, i: number) => (
        <div key={i} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  item.priority === "critical"
                    ? `${gold}20`
                    : item.priority === "important"
                    ? "rgba(96,165,250,0.12)"
                    : "rgba(255,255,255,0.05)",
              }}
            >
              <Clock
                className="w-4 h-4"
                style={{
                  color:
                    item.priority === "critical"
                      ? gold
                      : item.priority === "important"
                      ? "#60a5fa"
                      : mutedText,
                }}
              />
            </div>
            {i < (data.timeline?.length || 0) - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold" style={{ color: text }}>
                Day {item.day}: {item.action}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ color: mutedText, background: "rgba(255,255,255,0.04)" }}>
                {item.priority}
              </span>
            </div>
            {item.date && (
              <p className="text-xs mb-1" style={{ color: mutedText }}>
                {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
            <p className="text-sm whitespace-pre-line" style={{ color: text, opacity: 0.8 }}>
              {item.template}
            </p>
          </div>
        </div>
      ))}

      {data.tips?.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: `${gold}06`, border: `1px solid ${gold}12` }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: gold }}>
            Follow-Up Tips
          </h4>
          <ul className="space-y-1.5">
            {data.tips.map((tip: string, i: number) => (
              <li key={i} className="text-sm" style={{ color: text }}>
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function DreamJobDossier() {
  const { id } = useParams<{ id: string }>();
  const { data: dossier, isLoading } = useDreamJobDossier(id);
  const emailDossier = useEmailDossier();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
            style={{ background: `${gold}15` }}
          />
          <p className="text-sm" style={{ color: mutedText }}>
            Loading your dossier...
          </p>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: `${gold}40` }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: text }}>
            Dossier Not Found
          </h2>
          <p className="text-sm mb-4" style={{ color: mutedText }}>
            This dossier hasn't been generated yet. Apply to the job to trigger dossier creation.
          </p>
          <Link to="/dream-jobs">
            <Button className="rounded-xl" style={{ background: gold, color: bg }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <Helmet>
        <title>
          {dossier.job_title} at {dossier.company_name} — WDIWF Dossier
        </title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          to="/dream-jobs"
          className="inline-flex items-center gap-1 text-xs font-medium mb-6 transition-colors hover:opacity-80"
          style={{ color: gold }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Matches
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-[3px] font-semibold mb-2"
            style={{ color: gold }}
          >
            Interview Prep Dossier
          </p>
          <h1
            className="font-sans mb-1"
            style={{
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              color: text,
            }}
          >
            {dossier.job_title}
          </h1>
          <p className="text-lg" style={{ color: mutedText }}>
            {dossier.company_name}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="sm"
              onClick={() => emailDossier.mutate(dossier.id)}
              disabled={emailDossier.isPending}
              className="h-9 rounded-lg text-xs font-semibold"
              style={{ background: gold, color: bg }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {emailDossier.isPending ? "Sending…" : "Email to Me"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                toast({ title: "PDF generation", description: "PDF export coming soon!" });
              }}
              className="h-9 rounded-lg text-xs"
              style={{ color: gold }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section icon={Building2} title="Company Overview" number={1}>
            <CompanyOverviewSection data={dossier.company_overview} />
          </Section>

          <Section icon={Shield} title="WDIWF Integrity Snapshot" number={2}>
            <IntegritySnapshotSection data={dossier.integrity_snapshot} />
          </Section>

          <Section icon={Target} title="Role Analysis" number={3}>
            <RoleAnalysisSection data={dossier.role_analysis} />
          </Section>

          <Section icon={FileText} title="Tailored Resume Strategy" number={4}>
            <TailoredResumeSection data={dossier.tailored_resume} />
          </Section>

          <Section icon={PenTool} title="Cover Letter" number={5}>
            <div>
              <div className="flex justify-end mb-2">
                <CopyButton content={dossier.cover_letter || ""} label="Copy Letter" />
              </div>
              <div
                className="p-4 rounded-xl whitespace-pre-line text-sm leading-relaxed"
                style={{ background: "rgba(255,255,255,0.02)", color: text, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {dossier.cover_letter || "Cover letter being generated..."}
              </div>
            </div>
          </Section>

          <Section icon={MessageCircle} title="Interview Questions" number={6}>
            <InterviewQuestionsSection data={dossier.interview_questions} />
          </Section>

          <Section icon={DollarSign} title="Salary Benchmarks" number={7}>
            <SalaryBenchmarksSection data={dossier.salary_benchmarks} />
          </Section>

          <Section icon={CheckSquare} title="Preparation Checklist" number={8}>
            <PreparationChecklistSection data={dossier.preparation_checklist} />
          </Section>

          <Section icon={Users} title="References Template" number={9} defaultOpen={false}>
            <div>
              <div className="flex justify-end mb-2">
                <CopyButton content={dossier.references_template || ""} label="Copy Template" />
              </div>
              <pre
                className="p-4 rounded-xl text-sm leading-relaxed overflow-x-auto"
                style={{ background: "rgba(255,255,255,0.02)", color: text, fontFamily: "DM Mono, monospace", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px" }}
              >
                {dossier.references_template || "References template being prepared..."}
              </pre>
            </div>
          </Section>

          <Section icon={Mail} title="Thank-You Email Draft" number={10} defaultOpen={false}>
            <div>
              <div className="flex justify-end mb-2">
                <CopyButton content={dossier.thank_you_email_draft || ""} label="Copy Email" />
              </div>
              <div
                className="p-4 rounded-xl whitespace-pre-line text-sm leading-relaxed"
                style={{ background: "rgba(255,255,255,0.02)", color: text, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {dossier.thank_you_email_draft || "Thank-you email being drafted..."}
              </div>
            </div>
          </Section>

          <Section icon={Calendar} title="Follow-Up Timeline" number={11} defaultOpen={false}>
            <FollowUpTimelineSection data={dossier.follow_up_timeline} />
          </Section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs italic" style={{ color: gold }}>
            "Check the receipts. Then apply."
          </p>
          <p className="text-[10px] mt-1" style={{ color: mutedText }}>
            Generated by Who Do I Work For? — Your career intelligence platform.
          </p>
        </div>
      </div>
    </div>
  );
}
