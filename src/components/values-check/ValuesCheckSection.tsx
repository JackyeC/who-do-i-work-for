import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Shield, AlertTriangle, Info, ChevronDown, ChevronUp,
  Filter, Crosshair, Heart, Hammer, Leaf, Rainbow, Vote,
  Scale, Users, Globe, BookOpen, Stethoscope, ShoppingCart,
  DollarSign, Megaphone, Building2, UserCheck, Link2, Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ValuesSignalCard } from "./ValuesSignalCard";
import { ValuesEmptyState } from "./ValuesEmptyState";

export const ISSUE_AREAS = [
  { key: "gun_policy", label: "Gun Policy", icon: Crosshair, color: "text-destructive" },
  { key: "reproductive_rights", label: "Reproductive Rights", icon: Heart, color: "text-[hsl(var(--civic-red))]" },
  { key: "labor_rights", label: "Labor Rights", icon: Hammer, color: "text-[hsl(var(--civic-blue))]" },
  { key: "climate", label: "Climate", icon: Leaf, color: "text-[hsl(var(--civic-green))]" },
  { key: "civil_rights", label: "Civil Rights", icon: Scale, color: "text-primary" },
  { key: "lgbtq_rights", label: "LGBTQ+ Rights", icon: Rainbow, color: "text-[hsl(var(--civic-yellow))]" },
  { key: "voting_rights", label: "Voting Rights", icon: Vote, color: "text-primary" },
  { key: "immigration", label: "Immigration", icon: Globe, color: "text-[hsl(var(--civic-blue))]" },
  { key: "education", label: "Education", icon: BookOpen, color: "text-[hsl(var(--civic-green))]" },
  { key: "healthcare", label: "Healthcare", icon: Stethoscope, color: "text-[hsl(var(--civic-red))]" },
  { key: "consumer_protection", label: "Consumer Protection", icon: ShoppingCart, color: "text-[hsl(var(--civic-yellow))]" },
] as const;

export const SIGNAL_CATEGORIES = [
  { key: "political_giving", label: "Political Giving", icon: DollarSign },
  { key: "lobbying", label: "Lobbying Activity", icon: Megaphone },
  { key: "outside_spending", label: "Outside Spending / Influence", icon: Target },
  { key: "executive_activity", label: "Executive / Leadership", icon: UserCheck },
  { key: "trade_association", label: "Trade Associations", icon: Building2 },
  { key: "ownership_link", label: "Ownership / Entity Links", icon: Link2 },
  { key: "issue_alignment", label: "Issue Alignment", icon: Scale },
] as const;

export interface ValuesCheckSignal {
  id: string;
  issue_area: string;
  signal_category: string;
  signal_title: string;
  signal_description: string | null;
  source_name: string;
  source_type: string | null;
  source_url: string | null;
  related_person_name: string | null;
  related_entity_name: string | null;
  matched_entity_type: string | null;
  amount: number | null;
  year: number | null;
  confidence_score: number;
  confidence_label: string;
  verification_status: string;
  evidence_json: any;
}

interface ValuesCheckSectionProps {
  companyName: string;
  companyId: string;
  signals: ValuesCheckSignal[];
  isLoading?: boolean;
  onGenerateSignals?: () => void;
  isGenerating?: boolean;
}

function getConfidenceBadge(label: string) {
  const map: Record<string, { text: string; className: string }> = {
    high: { text: "High confidence", className: "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" },
    medium: { text: "Medium confidence", className: "bg-[hsl(var(--civic-yellow))]/10 text-[hsl(var(--civic-yellow))] border-[hsl(var(--civic-yellow))]/30" },
    low: { text: "Low confidence", className: "bg-muted text-muted-foreground border-border" },
  };
  return map[label] || map.medium;
}

function getVerificationBadge(status: string) {
  const map: Record<string, { text: string; className: string }> = {
    verified: { text: "Verified against primary records", className: "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" },
    cross_checked: { text: "Verified against primary records", className: "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))] border-[hsl(var(--civic-green))]/30" },
    partially_verified: { text: "Partial evidence found", className: "bg-[hsl(var(--civic-yellow))]/10 text-[hsl(var(--civic-yellow))] border-[hsl(var(--civic-yellow))]/30" },
    third_party: { text: "Third-party summary pending verification", className: "bg-[hsl(var(--civic-blue))]/10 text-[hsl(var(--civic-blue))] border-[hsl(var(--civic-blue))]/30" },
    unverified: { text: "Limited evidence available", className: "bg-muted text-muted-foreground border-border" },
  };
  return map[status] || map.unverified;
}

export function ValuesCheckSection({
  companyName,
  companyId,
  signals,
  isLoading,
  onGenerateSignals,
  isGenerating,
}: ValuesCheckSectionProps) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "selected">("all");
  const [issueFilterExpanded, setIssueFilterExpanded] = useState(true);

  const filteredSignals = useMemo(() => {
    if (filterMode === "all" || !selectedIssue) return signals;
    return signals.filter((s) => s.issue_area === selectedIssue);
  }, [signals, selectedIssue, filterMode]);

  const signalsByCategory = useMemo(() => {
    const grouped: Record<string, ValuesCheckSignal[]> = {};
    for (const s of filteredSignals) {
      if (!grouped[s.signal_category]) grouped[s.signal_category] = [];
      grouped[s.signal_category].push(s);
    }
    return grouped;
  }, [filteredSignals]);

  const issueAreaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of signals) {
      counts[s.issue_area] = (counts[s.issue_area] || 0) + 1;
    }
    return counts;
  }, [signals]);

  const overallStrength = useMemo(() => {
    if (signals.length === 0) return "none";
    const avg = signals.reduce((sum, s) => sum + s.confidence_score, 0) / signals.length;
    if (avg >= 0.7) return "strong";
    if (avg >= 0.4) return "moderate";
    return "limited";
  }, [signals]);

  const strengthLabel: Record<string, { text: string; color: string }> = {
    none: { text: "No signals found", color: "text-muted-foreground" },
    limited: { text: "Limited evidence", color: "text-[hsl(var(--civic-yellow))]" },
    moderate: { text: "Moderate evidence", color: "text-[hsl(var(--civic-blue))]" },
    strong: { text: "Strong evidence", color: "text-[hsl(var(--civic-green))]" },
  };

  const activeIssues = ISSUE_AREAS.filter((ia) => issueAreaCounts[ia.key] > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      id="values-check"
    >
      <Card className="overflow-hidden border-[hsl(var(--civic-gold-muted))]/30 shadow-luxury">
        {/* Gold accent stripe */}
        <div className="h-1 bg-gradient-to-r from-[hsl(var(--civic-gold))] via-[hsl(var(--civic-gold-muted))] to-transparent" />

        <CardContent className="p-0">
          {/* Header */}
          <div className="p-7 pb-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-[hsl(var(--civic-gold-light))] flex items-center justify-center shrink-0 border border-primary/10">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
                  Values Check
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
                  Review political, lobbying, and leadership signals connected to the issues that matter to you.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant="outline" className={cn("text-xs font-medium", strengthLabel[overallStrength].color)}>
                  {strengthLabel[overallStrength].text}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {signals.length} signal{signals.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              If this issue matters to you, review {companyName}'s political spending, executive donations,
              lobbying activity, trade association ties, and other public policy signals before making a career or purchasing decision.
            </p>
          </div>

          <Separator />

          {/* Issue Area Filter */}
          <div className="p-7">
            <button
              onClick={() => setIssueFilterExpanded(!issueFilterExpanded)}
              className="w-full flex items-center justify-between group cursor-pointer mb-1"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Issue Areas
                </p>
                {selectedIssue && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Filtered
                  </Badge>
                )}
              </div>
              {issueFilterExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {issueFilterExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3 mt-3">
                    <button
                      onClick={() => { setFilterMode("all"); setSelectedIssue(null); }}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-all",
                        filterMode === "all"
                          ? "border-primary/30 bg-primary/5 text-foreground font-medium"
                          : "border-border/40 text-muted-foreground hover:border-primary/15"
                      )}
                    >
                      Show all
                    </button>
                    <span className="text-[10px] text-muted-foreground">or select an issue:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {ISSUE_AREAS.map((issue) => {
                      const Icon = issue.icon;
                      const count = issueAreaCounts[issue.key] || 0;
                      const isSelected = selectedIssue === issue.key;
                      return (
                        <button
                          key={issue.key}
                          onClick={() => {
                            setSelectedIssue(isSelected ? null : issue.key);
                            setFilterMode(isSelected ? "all" : "selected");
                          }}
                          className={cn(
                            "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 relative",
                            isSelected
                              ? "border-primary/30 bg-primary/5 shadow-sm"
                              : "border-border/40 bg-card hover:border-primary/15 hover:bg-primary/[0.02]"
                          )}
                        >
                          <Icon className={cn("w-4 h-4 shrink-0", issue.color)} />
                          <span className="text-xs font-medium text-foreground">{issue.label}</span>
                          {count > 0 && (
                            <span className="absolute top-1.5 right-2 text-[9px] font-bold text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator />

          {/* Signal Categories */}
          <div className="p-7 space-y-6">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
              Signal Evidence
            </p>

            {filteredSignals.length === 0 ? (
              <ValuesEmptyState
                hasAnySignals={signals.length > 0}
                selectedIssue={selectedIssue ? ISSUE_AREAS.find(i => i.key === selectedIssue)?.label : null}
                onGenerate={onGenerateSignals}
                isGenerating={isGenerating}
              />
            ) : (
              SIGNAL_CATEGORIES.map((cat) => {
                const catSignals = signalsByCategory[cat.key];
                if (!catSignals || catSignals.length === 0) return null;
                const CatIcon = cat.icon;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <CatIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
                        <span className="text-[10px] text-muted-foreground">{catSignals.length} signal{catSignals.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 ml-10">
                      {catSignals.map((signal) => (
                        <ValuesSignalCard
                          key={signal.id}
                          signal={signal}
                          getConfidenceBadge={getConfidenceBadge}
                          getVerificationBadge={getVerificationBadge}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Issue Tags Summary */}
          {activeIssues.length > 0 && (
            <>
              <Separator />
              <div className="p-7">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                  Connected Issue Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeIssues.map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <button
                        key={issue.key}
                        onClick={() => { setSelectedIssue(issue.key); setFilterMode("selected"); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-card hover:border-primary/20 hover:bg-primary/[0.03] transition-all text-xs font-medium text-foreground"
                      >
                        <Icon className={cn("w-3 h-3", issue.color)} />
                        {issue.label}
                        <span className="text-[9px] text-muted-foreground ml-0.5">({issueAreaCounts[issue.key]})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* CTA + Explanation */}
          <div className="p-7 space-y-5">
            {onGenerateSignals && signals.length === 0 && (
              <Button
                onClick={onGenerateSignals}
                disabled={isGenerating}
                variant="premium"
                size="lg"
                className="w-full gap-2"
              >
                <Shield className="w-4 h-4" />
                {isGenerating ? "Generating Values Signals..." : "Generate Values Check"}
              </Button>
            )}

            {/* Context note */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              This section is designed to help users make informed decisions using public-record signals.
              It does not assign moral or legal judgments. It surfaces evidence for review.
            </p>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/30">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Signals shown here are based on public filings, political contribution records, lobbying disclosures,
                trade association links, executive activity, and related public data where available.
              </p>
            </div>

            {/* Limited evidence warning */}
            {signals.length > 0 && overallStrength === "limited" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--civic-yellow))]/5 border border-[hsl(var(--civic-yellow))]/20">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--civic-yellow))] shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/70 leading-relaxed">
                  <span className="font-semibold text-foreground">Limited evidence available.</span>{" "}
                  Some signal categories have not been fully scanned or may have insufficient public data. Review with caution.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
