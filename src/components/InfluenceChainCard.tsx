import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/sampleData";
import { useInfluenceChain } from "@/hooks/use-roi-pipeline";
import { PartyBadge, computeRecipientMix } from "@/components/PartyBadge";
import {
  ArrowRight, GitBranch, Loader2, DollarSign, Users, Landmark,
  FileCheck, RotateCcw, Globe, ChevronDown, ChevronRight, HelpCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

/* ── Plain-language labels for every link type ── */
const LINK_TYPE_CONFIG: Record<string, { label: string; plainLabel: string; color: string; icon: React.ElementType }> = {
  donation_to_member:            { label: "Donation",           plainLabel: "Gave money to",              color: "text-[hsl(var(--civic-red))]",    icon: DollarSign },
  member_on_committee:           { label: "Committee Seat",     plainLabel: "Sits on a committee that oversees", color: "text-[hsl(var(--civic-blue))]",   icon: Users },
  committee_oversight_of_contract: { label: "Contract Oversight", plainLabel: "That committee controls contracts for", color: "text-[hsl(var(--civic-green))]", icon: Landmark },
  lobbying_on_bill:              { label: "Lobbying",            plainLabel: "Paid lobbyists to influence", color: "text-[hsl(var(--civic-yellow))]", icon: FileCheck },
  revolving_door:                { label: "Revolving Door",     plainLabel: "Former government official now works here", color: "text-destructive", icon: RotateCcw },
  foundation_grant_to_district:  { label: "Foundation Grant",   plainLabel: "Gave a charitable grant in the district of", color: "text-[hsl(var(--civic-green))]", icon: DollarSign },
  trade_association_lobbying:    { label: "Trade Group",        plainLabel: "Belongs to a group that lobbies for",       color: "text-[hsl(var(--civic-yellow))]", icon: Users },
  dark_money_channel:            { label: "Dark Money",         plainLabel: "Money sent through a group that doesn't disclose donors", color: "text-destructive", icon: DollarSign },
  advisory_committee_appointment:{ label: "Advisory Role",      plainLabel: "Has a person on a government advisory panel", color: "text-[hsl(var(--civic-blue))]", icon: Users },
  interlocking_directorate:      { label: "Shared Board Member",plainLabel: "Shares a board member with",  color: "text-muted-foreground", icon: Users },
  state_lobbying_contract:       { label: "State Lobbying",     plainLabel: "Paid lobbyists in state government for",    color: "text-[hsl(var(--civic-yellow))]", icon: Landmark },
  international_influence:       { label: "International",      plainLabel: "Has influence activities in other countries", color: "text-[hsl(var(--civic-blue))]", icon: Globe },
};

/* ── Plain-language entity type labels ── */
const ENTITY_TYPE_LABELS: Record<string, string> = {
  company: "Company",
  pac: "Political fund (PAC)",
  super_pac: "Outside spending group",
  politician: "Politician",
  member: "Member of Congress",
  committee: "Congressional committee",
  agency: "Government agency",
  contract: "Government contract",
  lobbyist: "Lobbyist",
  trade_association: "Industry group",
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

function getEntityStyle(type: string) {
  switch (type) {
    case "company": return "bg-primary/10 border-primary/30 text-primary";
    case "pac": case "super_pac": return "bg-[hsl(var(--civic-red))]/10 border-[hsl(var(--civic-red))]/30 text-[hsl(var(--civic-red))]";
    case "politician": case "member": return "bg-[hsl(var(--civic-blue))]/10 border-[hsl(var(--civic-blue))]/30 text-[hsl(var(--civic-blue))]";
    case "committee": return "bg-[hsl(var(--civic-yellow))]/10 border-[hsl(var(--civic-yellow))]/30 text-[hsl(var(--civic-yellow))]";
    case "agency": case "contract": return "bg-[hsl(var(--civic-green))]/10 border-[hsl(var(--civic-green))]/30 text-[hsl(var(--civic-green))]";
    case "lobbyist": case "trade_association": return "bg-muted border-border text-muted-foreground";
    default: return "bg-muted border-border text-foreground";
  }
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const label = confidence >= 0.8 ? "Strong evidence" : confidence >= 0.5 ? "Some evidence" : "Weak evidence";
  return (
    <div className="flex items-center gap-1" title={label}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        confidence >= 0.8 ? "bg-[hsl(var(--civic-green))]" : confidence >= 0.5 ? "bg-[hsl(var(--civic-yellow))]" : "bg-[hsl(var(--civic-red))]"
      )} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function EntityNode({ name, type, party, location }: { name: string; type: string; party?: string | null; location?: string | null }) {
  const style = getEntityStyle(type);
  const plainType = ENTITY_TYPE_LABELS[type] || type.replace(/_/g, " ");
  const showParty = type !== "company" && type !== "agency" && type !== "contract";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-1.5 max-w-[260px] cursor-default", style)}>
          <span className="truncate">{name}</span>
          {showParty && <PartyBadge party={party} entityType={type} />}
          {location && <span className="text-[9px] text-muted-foreground shrink-0">{location}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{plainType}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ChainRow({ step }: { step: ChainStep }) {
  const config = LINK_TYPE_CONFIG[step.link_type] || { label: step.link_type, plainLabel: "Connected to", color: "text-muted-foreground", icon: ArrowRight };
  const LinkIcon = config.icon;
  const targetParty = extractPartyFromDescription(step.description, step.target_name);
  const targetLocation = extractLocationFromDescription(step.description);
  const sourceParty = extractPartyFromDescription(step.description, step.source_name);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 flex-wrap cursor-default">
          <EntityNode name={step.source_name} type={step.source_type} party={sourceParty} />
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className={cn("flex items-center gap-1", config.color)}>
              <LinkIcon className="w-3.5 h-3.5" />
              <ArrowRight className="w-3 h-3" />
            </div>
            <span className={cn("text-[10px] font-medium text-center max-w-[120px] leading-tight", config.color)}>{config.plainLabel}</span>
            {step.amount > 0 && (
              <span className="text-[10px] font-bold text-foreground">{formatCurrency(step.amount)}</span>
            )}
            <ConfidenceDot confidence={step.confidence} />
          </div>
          <EntityNode name={step.target_name} type={step.target_type} party={targetParty} location={targetLocation} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1">
        <p className="font-semibold">{step.source_name} → {step.target_name}</p>
        {step.amount > 0 && <p>Amount: {formatCurrency(step.amount)}</p>}
        {step.description && <p>{step.description}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

function groupChains(steps: ChainStep[]): ChainStep[][] {
  const chains: ChainStep[][] = [];
  let currentChain: ChainStep[] = [];
  let lastTarget = "";
  for (const step of steps) {
    if (currentChain.length === 0 || step.source_name === lastTarget) {
      currentChain.push(step);
      lastTarget = step.target_name;
    } else {
      if (currentChain.length > 0) chains.push(currentChain);
      currentChain = [step];
      lastTarget = step.target_name;
    }
  }
  if (currentChain.length > 0) chains.push(currentChain);
  return chains;
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
  const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set([0]));

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

  const chains = groupChains(chainData as ChainStep[]);
  const allSteps = chainData as ChainStep[];
  const uniqueEntities = new Set([...allSteps.map(s => s.source_name), ...allSteps.map(s => s.target_name)]).size;

  const recipients = collectRecipients(allSteps);
  const recipientMix = computeRecipientMix(recipients);

  const toggleChain = (idx: number) => {
    setExpandedChains(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          Where Does the Money Go?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This shows how {companyName} spends money on politics — and what happens after.
          Think of it like a trail: the company sends money somewhere, that money reaches a politician or group,
          and that politician or group has power over government decisions.
        </p>
      </CardHeader>
      <CardContent>
        {/* Plain-language "how to read this" box */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/40 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">How to read this</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>Each row below is a <strong className="text-foreground">money trail</strong> we found in public records.</p>
            <p>It shows: <strong className="text-foreground">who sent money</strong> → <strong className="text-foreground">where it went</strong> → <strong className="text-foreground">what that person or group controls</strong>.</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-border/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--civic-green))]" /> Strong evidence — from official filings</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--civic-yellow))]" /> Some evidence — connects the dots</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(var(--civic-red))]" /> Weak evidence — possible but not confirmed</span>
            </div>
          </div>
        </div>

        {/* Summary stats — plain language */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{chains.length}</div>
            <div className="text-xs text-muted-foreground">Money trail{chains.length !== 1 ? "s" : ""} found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{uniqueEntities}</div>
            <div className="text-xs text-muted-foreground">People & groups involved</div>
          </div>
        </div>

        {/* Recipient Mix Summary — plain language */}
        {recipientMix.length > 0 && (
          <div className="p-3 bg-card border border-border rounded-lg mb-5">
            <span className="text-xs font-semibold text-foreground">Who gets the money? (by political party)</span>
            <div className="flex h-3 rounded-full overflow-hidden my-2">
              {recipientMix.map((mix, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full transition-all",
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
                <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={cn(
                    "w-2 h-2 rounded-full inline-block",
                    mix.label === "R" ? "bg-[hsl(0,65%,50%)]" :
                    mix.label === "D" ? "bg-[hsl(218,55%,48%)]" :
                    "bg-muted-foreground/30"
                  )} />
                  {mix.percentage}% {mix.label === "R" ? "Republican" : mix.label === "D" ? "Democrat" : mix.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chain paths — plain language headers */}
        <div className="space-y-3">
          {chains.map((chain, chainIdx) => {
            const isExpanded = expandedChains.has(chainIdx);
            const chainTotal = chain.reduce((sum, s) => sum + (s.amount || 0), 0);
            const firstStep = chain[0];
            const lastStep = chain[chain.length - 1];
            const lastParty = extractPartyFromDescription(lastStep.description, lastStep.target_name);

            return (
              <div key={chainIdx} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleChain(chainIdx)}
                  className="w-full flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {chainIdx + 1}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate">
                      {firstStep.source_name}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {chain.length} {chain.length === 1 ? "step" : "steps"}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {lastStep.target_name}
                    </span>
                    <PartyBadge party={lastParty} entityType={lastStep.target_type} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {chainTotal > 0 && (
                      <span className="text-xs font-bold text-[hsl(var(--civic-green))]">{formatCurrency(chainTotal)}</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-border bg-muted/30 space-y-3 overflow-x-auto">
                    {chain.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-3">
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                            {step.step}
                          </div>
                          {stepIdx < chain.length - 1 && <div className="w-px h-8 bg-border" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <ChainRow step={step} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground mt-4 border-t border-border pt-3">
          All of this comes from public records — campaign finance filings, lobbying reports, and government contract databases.
          We connect the dots so you can see how money moves from a company to the people who make government decisions.
        </p>
      </CardContent>
    </Card>
  );
}
