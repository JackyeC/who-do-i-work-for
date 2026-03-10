import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/sampleData";
import { useInfluenceChain } from "@/hooks/use-roi-pipeline";
import { PartyBadge, computeRecipientMix } from "@/components/PartyBadge";
import { Link } from "react-router-dom";
import {
  ArrowRight, GitBranch, Loader2, DollarSign, Users, Landmark,
  FileCheck, RotateCcw, Globe, ChevronDown, HelpCircle, User,
  ExternalLink, Share2, Copy, Handshake, ShieldCheck, Building2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChainStep {
  chain_id: number;
  step: number;
  source_name: string;
  source_type: string;
  link_type: string;
  target_name: string;
  target_type: string;
  amount: number;
  confidence: number;
  description: string;
}

/* ── Category definitions ── */
interface Category {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconClass: string;
  explainer: string;
  linkTypes: string[];
}

const CATEGORIES: Category[] = [
  {
    key: "money",
    title: "Money Trail",
    subtitle: "Direct political spending — where the dollars go",
    icon: DollarSign,
    iconClass: "bg-[hsl(var(--civic-red))]/10 text-[hsl(var(--civic-red))]",
    explainer: "This tracks actual money moving from the company to political candidates, PACs, and party committees. Every dollar here comes from public campaign finance filings — these are the receipts.",
    linkTypes: ["donation_to_member", "dark_money_channel", "foundation_grant_to_district"],
  },
  {
    key: "access",
    title: "Political Access",
    subtitle: "How company money buys a seat at the table",
    icon: Users,
    iconClass: "bg-[hsl(var(--civic-blue))]/10 text-[hsl(var(--civic-blue))]",
    explainer: "Politicians who receive money sit on congressional committees that control policy. This section shows which committees those politicians are on, and what topics they oversee — like healthcare, taxes, or defense spending.",
    linkTypes: ["member_on_committee", "revolving_door", "advisory_committee_appointment", "interlocking_directorate"],
  },
  {
    key: "lobbying",
    title: "Lobbying & Influence",
    subtitle: "Paid professionals working to shape laws and rules",
    icon: Handshake,
    iconClass: "bg-[hsl(var(--civic-yellow))]/10 text-[hsl(var(--civic-yellow))]",
    explainer: "Lobbying means paying someone to talk to lawmakers on your behalf. This section shows which bills, agencies, and issues the company is trying to influence — and how much they're spending to do it.",
    linkTypes: ["lobbying_on_bill", "trade_association_lobbying", "state_lobbying_contract", "international_influence"],
  },
  {
    key: "benefits",
    title: "Government Benefits",
    subtitle: "What the company gets back from government",
    icon: Building2,
    iconClass: "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))]",
    explainer: "After spending money on politics, companies often receive government contracts, subsidies, or favorable regulations. This section shows the other side of the equation — what comes back.",
    linkTypes: ["committee_oversight_of_contract"],
  },
];

/* ── Plain-language labels ── */
const LINK_TYPE_CONFIG: Record<string, { label: string; plainLabel: string; color: string; icon: React.ElementType }> = {
  donation_to_member:              { label: "Donation",            plainLabel: "Gave money to",                                    color: "text-[hsl(var(--civic-red))]",    icon: DollarSign },
  member_on_committee:             { label: "Committee Seat",      plainLabel: "Sits on a committee that oversees",                 color: "text-[hsl(var(--civic-blue))]",   icon: Users },
  committee_oversight_of_contract: { label: "Contract Oversight",  plainLabel: "That committee controls contracts for",             color: "text-[hsl(var(--civic-green))]",  icon: Landmark },
  lobbying_on_bill:                { label: "Lobbying",             plainLabel: "Paid lobbyists to influence",                       color: "text-[hsl(var(--civic-yellow))]", icon: FileCheck },
  revolving_door:                  { label: "Revolving Door",      plainLabel: "Former government official now works here",          color: "text-destructive",                icon: RotateCcw },
  foundation_grant_to_district:    { label: "Foundation Grant",    plainLabel: "Gave a charitable grant in the district of",         color: "text-[hsl(var(--civic-green))]",  icon: DollarSign },
  trade_association_lobbying:      { label: "Trade Group",         plainLabel: "Belongs to a group that lobbies for",                color: "text-[hsl(var(--civic-yellow))]", icon: Users },
  dark_money_channel:              { label: "Dark Money",          plainLabel: "Money sent through a group that doesn't disclose donors", color: "text-destructive",           icon: DollarSign },
  advisory_committee_appointment:  { label: "Advisory Role",       plainLabel: "Has a person on a government advisory panel",        color: "text-[hsl(var(--civic-blue))]",   icon: Users },
  interlocking_directorate:        { label: "Shared Board Member", plainLabel: "Shares a board member with",                         color: "text-muted-foreground",           icon: Users },
  state_lobbying_contract:         { label: "State Lobbying",      plainLabel: "Paid lobbyists in state government for",             color: "text-[hsl(var(--civic-yellow))]", icon: Landmark },
  international_influence:         { label: "International",       plainLabel: "Has influence activities in other countries",         color: "text-[hsl(var(--civic-blue))]",   icon: Globe },
};

const COMMITTEE_ISSUES: Record<string, string[]> = {
  "armed services": ["Military & defense spending"], "appropriations": ["Government spending decisions"],
  "energy and commerce": ["Energy policy", "Healthcare", "Consumer protection"],
  "energy and natural resources": ["Energy policy", "Public lands"],
  "finance": ["Taxes", "Healthcare funding", "Trade"], "judiciary": ["Immigration", "Civil rights", "Criminal justice"],
  "education and labor": ["Education", "Worker rights", "Minimum wage"],
  "education and the workforce": ["Education", "Worker rights"], "health": ["Healthcare policy"],
  "ways and means": ["Tax policy", "Social Security", "Trade"],
  "foreign affairs": ["Foreign policy", "International aid"], "foreign relations": ["Foreign policy", "Treaties"],
  "homeland security": ["Border security", "Immigration enforcement"],
  "agriculture": ["Farm policy", "Food safety", "Rural programs"],
  "banking": ["Banking rules", "Housing policy"], "commerce": ["Business regulation", "Consumer protection"],
  "environment": ["Environmental protection", "Climate policy"],
  "veterans": ["Veterans benefits", "VA healthcare"], "intelligence": ["National security", "Surveillance"],
  "budget": ["Federal budget", "Government spending"], "small business": ["Small business support", "Entrepreneurship"],
  "transportation": ["Roads", "Airlines", "Infrastructure"],
  "rules": ["How Congress operates"], "oversight": ["Government accountability", "Investigations"],
};

function getCommitteeIssues(name: string): string[] {
  const lower = name.toLowerCase();
  for (const [key, issues] of Object.entries(COMMITTEE_ISSUES)) {
    if (lower.includes(key)) return issues;
  }
  return [];
}

function cleanEntityName(name: string): string {
  if (!name) return "Unknown";
  let cleaned = name.replace(/\b(SEC\s*)?CIK[\s:#]*\d+/gi, "").trim();
  cleaned = cleaned.replace(/\(?\s*FEC\s*(ID)?[\s:#]*C\d+\s*\)?/gi, "").trim();
  cleaned = cleaned.replace(/\s*C\d{8,}\s*/g, " ").trim();
  cleaned = cleaned.replace(/\b(EIN|TIN)[\s:#]*\d[\d-]+/gi, "").trim();
  cleaned = cleaned.replace(/\bDUNS[\s:#]*\d+/gi, "").trim();
  cleaned = cleaned.replace(/[\s,\-()]+$/, "").replace(/^[\s,\-()]+/, "").trim();
  return cleaned || name;
}

const PARTY_FULL_NAMES: Record<string, string> = {
  D: "Democrat", R: "Republican", I: "Independent", L: "Libertarian", G: "Green Party",
};

function extractPartyFromDescription(description: string | null, name: string): string | null {
  if (!description) return null;
  const combined = `${name} ${description}`;
  const parenMatch = combined.match(/\(([RDILG])\b[^)]*\)/i);
  if (parenMatch) return parenMatch[1].toUpperCase();
  const bracketMatch = combined.match(/\[([RDILG])\]/i);
  if (bracketMatch) return bracketMatch[1].toUpperCase();
  if (/\brepublican\b/i.test(combined)) return "R";
  if (/\bdemocrat/i.test(combined)) return "D";
  if (/\bindependent\b/i.test(combined)) return "I";
  return null;
}

function extractLocationFromDescription(description: string | null): string | null {
  if (!description) return null;
  const stateMatch = description.match(/[RDILG]-([A-Z]{2})(?:-(\d+))?/i);
  if (stateMatch) return stateMatch[2] ? `${stateMatch[1]}-${stateMatch[2]}` : stateMatch[1];
  return null;
}

function getEntityLink(name: string, type: string): string | null {
  const cleanName = cleanEntityName(name);
  switch (type) {
    case "pac": case "super_pac":
      return `https://www.fec.gov/data/committee/?q=${encodeURIComponent(cleanName)}`;
    case "politician": case "member":
      return `https://www.fec.gov/data/candidates/?search=${encodeURIComponent(cleanName)}`;
    case "committee":
      return `https://www.congress.gov/search?q=${encodeURIComponent(cleanName)}&searchResultViewType=expanded`;
    case "agency": case "contract":
      return `https://www.usaspending.gov/search/?hash=keyword-${encodeURIComponent(cleanName)}`;
    case "lobbyist":
      return `https://lda.senate.gov/filings/public/filing/search/?search=${encodeURIComponent(cleanName)}`;
    default: return null;
  }
}

/* ── Confidence labels ── */
function ConfidenceTag({ confidence }: { confidence: number }) {
  if (confidence >= 0.8) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))]">
        ✓ Strong
      </span>
    );
  }
  if (confidence >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--civic-yellow))]/10 text-[hsl(var(--civic-yellow))]">
        ~ Likely
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      ? Possible
    </span>
  );
}

/* ── Single link item ── */
function LinkItem({ step }: { step: ChainStep }) {
  const config = LINK_TYPE_CONFIG[step.link_type] || { label: step.link_type, plainLabel: "Connected to", color: "text-muted-foreground", icon: ArrowRight };
  const targetParty = extractPartyFromDescription(step.description, step.target_name);
  const targetLocation = extractLocationFromDescription(step.description);
  const externalLink = getEntityLink(step.target_name, step.target_type);
  const isPolitician = step.target_type === "politician" || step.target_type === "member";

  // Committee issues for politicians
  const issues = isPolitician
    ? getCommitteeIssues(step.target_name)
    : step.link_type === "member_on_committee"
    ? getCommitteeIssues(step.target_name)
    : [];

  const sourceName = cleanEntityName(step.source_name);
  const targetName = cleanEntityName(step.target_name);

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-accent/30 transition-colors">
      {/* From → To pills */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary max-w-[100px] truncate">
          {sourceName}
        </span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-[100px] truncate",
          isPolitician ? "bg-[hsl(var(--civic-blue))]/10 text-[hsl(var(--civic-blue))]" : "bg-[hsl(var(--civic-green))]/10 text-[hsl(var(--civic-green))]"
        )}>
          {targetName}
        </span>
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-foreground">
            {sourceName} {config.plainLabel.toLowerCase()} {targetName}
          </span>
          {targetParty && <PartyBadge party={targetParty} entityType={step.target_type} />}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.amount > 0 && <>{formatCurrency(step.amount)} · </>}
          {targetParty && <>{PARTY_FULL_NAMES[targetParty] || targetParty}{targetLocation ? `, ${targetLocation}` : ""} · </>}
          {step.description && step.description.length < 200 ? step.description : config.label}
        </p>
        {issues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {issues.slice(0, 4).map((issue) => (
              <Link
                key={issue}
                to={`/values-search?issue=${encodeURIComponent(issue.toLowerCase().replace(/\s+/g, '_'))}`}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                {issue}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right side: confidence + link */}
      <div className="flex items-center gap-2 shrink-0">
        <ConfidenceTag confidence={step.confidence} />
        {externalLink && (
          <a href={externalLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="View source">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Category section with collapse ── */
function CategorySection({ category, steps, defaultOpen }: { category: Category; steps: ChainStep[]; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = category.icon;
  const totalAmount = steps.reduce((s, step) => s + (step.amount || 0), 0);

  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left"
      >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", category.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{category.title}</div>
          <div className="text-xs text-muted-foreground">{category.subtitle}</div>
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {steps.length} link{steps.length !== 1 ? "s" : ""}
        </Badge>
        {totalAmount > 0 && (
          <span className="text-xs font-bold text-[hsl(var(--civic-green))] shrink-0">{formatCurrency(totalAmount)}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", !isOpen && "-rotate-90")} />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-border/50">
          {/* In Plain English explainer */}
          <div className="flex gap-2.5 bg-primary/5 px-4 py-3 border-b border-border/30">
            <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">In plain English:</strong> {category.explainer}
            </p>
          </div>

          {/* Link items */}
          <div>
            {steps.map((step, i) => (
              <LinkItem key={`${step.chain_id}-${step.step}-${i}`} step={step} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Categorize steps ── */
function categorizeSteps(steps: ChainStep[]): Record<string, ChainStep[]> {
  const result: Record<string, ChainStep[]> = {};
  CATEGORIES.forEach(c => { result[c.key] = []; });

  for (const step of steps) {
    const cat = CATEGORIES.find(c => c.linkTypes.includes(step.link_type));
    if (cat) {
      result[cat.key].push(step);
    } else {
      // Default to lobbying for unmatched types
      result["lobbying"].push(step);
    }
  }

  return result;
}

function collectRecipients(steps: ChainStep[]) {
  return steps
    .filter((s) => s.link_type === "donation_to_member" || s.link_type === "dark_money_channel" || s.link_type === "foundation_grant_to_district")
    .map((s) => ({
      name: s.target_name,
      party: extractPartyFromDescription(s.description, s.target_name),
      entityType: s.target_type,
      amount: s.amount,
    }));
}

export function InfluenceChainCard({ companyId, companyName }: { companyId: string; companyName: string }) {
  const { data: chainData, isLoading } = useInfluenceChain(companyId);
  const [activeFilter, setActiveFilter] = useState("all");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Following the money trail...
        </CardContent>
      </Card>
    );
  }

  if (!chainData || chainData.length === 0) return null;

  const allSteps = chainData as ChainStep[];
  const categorized = categorizeSteps(allSteps);
  const uniqueEntities = new Set([...allSteps.map(s => s.source_name), ...allSteps.map(s => s.target_name)]).size;
  const totalSpending = allSteps.reduce((s, step) => s + (step.amount || 0), 0);
  const strongLinks = allSteps.filter(s => s.confidence >= 0.8).length;
  const linkTypes = new Set(allSteps.map(s => s.link_type)).size;
  const recipients = collectRecipients(allSteps);
  const recipientMix = computeRecipientMix(recipients);

  const filledCategories = CATEGORIES.filter(c => categorized[c.key].length > 0);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `See where ${companyName} sends political money — ${allSteps.length} connections traced`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast("Link copied!", { description: "Share this influence chain with anyone." });
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Hero / Summary banner */}
      <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-6 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[30%] w-72 h-72 rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase mb-3">
            <GitBranch className="w-3.5 h-3.5" /> Influence Chain
          </div>
          <h2 className="text-xl font-bold font-display mb-2">Where does the money go?</h2>
          <p className="text-sm opacity-90 max-w-lg leading-relaxed">
            We traced {companyName}'s political spending from start to finish. Think of it like a trail — the company sends money somewhere, it reaches politicians and groups, and those people make decisions that affect the company.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold font-display">{allSteps.length}</div>
              <div className="text-[11px] opacity-80">Connections found</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold font-display">{linkTypes}</div>
              <div className="text-[11px] opacity-80">Types of links</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold font-display">{strongLinks}</div>
              <div className="text-[11px] opacity-80">Strong matches</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-2xl font-bold font-display">{uniqueEntities}</div>
              <div className="text-[11px] opacity-80">People & groups</div>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Explainer */}
        <div className="rounded-xl border-l-4 border-primary bg-card shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">What is an Influence Chain?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An Influence Chain shows <strong className="text-foreground">how a company's political money connects to government decisions</strong>. 
            Every link is traced from public records — campaign filings, lobbying reports, and contract databases. 
            The stronger the link, the more directly the money connects to political power.
          </p>
        </div>

        {/* Recipient mix bar */}
        {recipientMix.length > 0 && (
          <div className="p-3 bg-card border border-border rounded-lg">
            <span className="text-xs font-semibold text-foreground">Who gets the money? (by political party)</span>
            <div className="flex h-3 rounded-full overflow-hidden my-2">
              {recipientMix.map((mix, i) => (
                <Link
                  key={i}
                  to={`/values-search?issue=${mix.label === "R" ? "conservative_alignment" : mix.label === "D" ? "progressive_alignment" : "bipartisan"}`}
                  className={cn(
                    "h-full transition-all hover:opacity-80",
                    mix.label === "R" ? "bg-[hsl(0,65%,50%)]" :
                    mix.label === "D" ? "bg-[hsl(218,55%,48%)]" :
                    "bg-muted-foreground/30"
                  )}
                  style={{ width: `${mix.percentage}%` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {recipientMix.map((mix, i) => (
                <Link
                  key={i}
                  to={`/values-search?issue=${mix.label === "R" ? "conservative_alignment" : mix.label === "D" ? "progressive_alignment" : "bipartisan"}`}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full inline-block",
                    mix.label === "R" ? "bg-[hsl(0,65%,50%)]" :
                    mix.label === "D" ? "bg-[hsl(218,55%,48%)]" :
                    "bg-muted-foreground/30"
                  )} />
                  {mix.percentage}% {mix.label === "R" ? "Republican" : mix.label === "D" ? "Democrat" : mix.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            )}
          >
            All Connections
          </button>
          {filledCategories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeFilter === cat.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Category sections */}
        <div className="space-y-3">
          {filledCategories
            .filter(cat => activeFilter === "all" || activeFilter === cat.key)
            .map((cat, idx) => (
              <CategorySection
                key={cat.key}
                category={cat}
                steps={categorized[cat.key]}
                defaultOpen={idx === 0 || activeFilter !== "all"}
              />
            ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            All data from public records — FEC filings, lobbying reports, USASpending.gov
          </p>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleShare}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
