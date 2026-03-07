import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/sampleData";
import { useInfluenceChain } from "@/hooks/use-roi-pipeline";
import { ArrowRight, GitBranch, Loader2, DollarSign, Users, Landmark, FileCheck, RotateCcw, Globe } from "lucide-react";
import { useState } from "react";

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

const LINK_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  donation_to_member: { label: "Donation", color: "text-civic-red", icon: DollarSign },
  member_on_committee: { label: "Committee Seat", color: "text-civic-blue", icon: Users },
  committee_oversight_of_contract: { label: "Contract Oversight", color: "text-civic-green", icon: Landmark },
  lobbying_on_bill: { label: "Lobbying", color: "text-civic-yellow", icon: FileCheck },
  revolving_door: { label: "Revolving Door", color: "text-destructive", icon: RotateCcw },
  foundation_grant_to_district: { label: "Foundation Grant", color: "text-civic-green", icon: DollarSign },
  trade_association_lobbying: { label: "Trade Assoc.", color: "text-civic-yellow", icon: Users },
  dark_money_channel: { label: "Dark Money", color: "text-destructive", icon: DollarSign },
  advisory_committee_appointment: { label: "Advisory Appt.", color: "text-civic-blue", icon: Users },
  interlocking_directorate: { label: "Board Interlock", color: "text-muted-foreground", icon: Users },
  state_lobbying_contract: { label: "State Lobby", color: "text-civic-yellow", icon: Landmark },
  international_influence: { label: "International", color: "text-civic-blue", icon: Globe },
};

function getEntityStyle(type: string) {
  switch (type) {
    case "company": return "bg-primary/10 border-primary/30 text-primary";
    case "pac": case "super_pac": return "bg-civic-red/10 border-civic-red/30 text-civic-red";
    case "politician": case "member": return "bg-civic-blue/10 border-civic-blue/30 text-civic-blue";
    case "committee": return "bg-civic-yellow/10 border-civic-yellow/30 text-civic-yellow";
    case "agency": case "contract": return "bg-civic-green/10 border-civic-green/30 text-civic-green";
    case "lobbyist": case "trade_association": return "bg-muted border-border text-muted-foreground";
    default: return "bg-muted border-border text-foreground";
  }
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-1" title={`${(confidence * 100).toFixed(0)}% confidence`}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        confidence >= 0.8 ? "bg-civic-green" : confidence >= 0.5 ? "bg-civic-yellow" : "bg-civic-red"
      )} />
      <span className="text-[10px] text-muted-foreground">{(confidence * 100).toFixed(0)}%</span>
    </div>
  );
}

function EntityNode({ name, type }: { name: string; type: string }) {
  const style = getEntityStyle(type);
  return (
    <div className={cn(
      "px-3 py-2 rounded-lg border text-sm font-medium max-w-[200px] truncate",
      style
    )} title={name}>
      {name}
    </div>
  );
}

function ChainRow({ step }: { step: ChainStep }) {
  const config = LINK_TYPE_CONFIG[step.link_type] || { label: step.link_type, color: "text-muted-foreground", icon: ArrowRight };
  const LinkIcon = config.icon;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <EntityNode name={step.source_name} type={step.source_type} />
      
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <div className={cn("flex items-center gap-1", config.color)}>
          <LinkIcon className="w-3.5 h-3.5" />
          <ArrowRight className="w-3 h-3" />
        </div>
        <span className={cn("text-[10px] font-medium", config.color)}>{config.label}</span>
        {step.amount > 0 && (
          <span className="text-[10px] font-bold text-foreground">{formatCurrency(step.amount)}</span>
        )}
        <ConfidenceDot confidence={step.confidence} />
      </div>
      
      <EntityNode name={step.target_name} type={step.target_type} />
    </div>
  );
}

/** Groups chain steps into distinct paths */
function groupChains(steps: ChainStep[]): ChainStep[][] {
  // Group by unique paths: find connected sequences
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

export function InfluenceChainCard({ companyId, companyName }: { companyId: string; companyName: string }) {
  const { data: chainData, isLoading } = useInfluenceChain(companyId);
  const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set([0]));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Tracing influence chains...
        </CardContent>
      </Card>
    );
  }

  if (!chainData || chainData.length === 0) {
    return null; // Don't show if no chain data
  }

  const chains = groupChains(chainData as ChainStep[]);
  const totalAmount = (chainData as ChainStep[]).reduce((sum, s) => sum + (s.amount || 0), 0);
  const maxDepth = Math.max(...(chainData as ChainStep[]).map(s => s.step));
  const uniqueEntities = new Set([
    ...(chainData as ChainStep[]).map(s => s.source_name),
    ...(chainData as ChainStep[]).map(s => s.target_name),
  ]).size;

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
          Influence Chain Trace
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Following the money from {companyName}'s political spending through influence networks to government outcomes.
          Each connection is scored by evidence confidence.
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Chains Found</div>
            <div className="text-2xl font-bold text-foreground">{chains.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Entities Linked</div>
            <div className="text-2xl font-bold text-foreground">{uniqueEntities}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Max Depth</div>
            <div className="text-2xl font-bold text-foreground">{maxDepth} steps</div>
          </div>
        </div>

        {/* Chain paths */}
        <div className="space-y-4">
          {chains.map((chain, chainIdx) => {
            const isExpanded = expandedChains.has(chainIdx);
            const chainTotal = chain.reduce((sum, s) => sum + (s.amount || 0), 0);
            const firstStep = chain[0];
            const lastStep = chain[chain.length - 1];

            return (
              <div key={chainIdx} className="border border-border rounded-lg overflow-hidden">
                {/* Chain header */}
                <button
                  onClick={() => toggleChain(chainIdx)}
                  className="w-full flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Chain {chainIdx + 1}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate">
                      {firstStep.source_name}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {chain.length > 1 ? `${chain.length} steps` : "1 step"}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {lastStep.target_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {chainTotal > 0 && (
                      <span className="text-xs font-bold text-civic-green">{formatCurrency(chainTotal)}</span>
                    )}
                    <span className={cn("text-xs transition-transform", isExpanded ? "rotate-90" : "")}>▶</span>
                  </div>
                </button>

                {/* Expanded chain detail */}
                {isExpanded && (
                  <div className="p-4 border-t border-border bg-muted/30 space-y-3 overflow-x-auto">
                    {chain.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-3">
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                            {step.step}
                          </div>
                          {stepIdx < chain.length - 1 && (
                            <div className="w-px h-8 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <ChainRow step={step} />
                          {step.description && (
                            <p className="text-xs text-muted-foreground mt-1 ml-1">{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
          Chain analysis uses the <code className="text-[10px] bg-muted px-1 py-0.5 rounded">trace_influence_chain</code> algorithm 
          to follow documented connections up to 4 hops deep. Confidence reflects evidence quality: 
          ≥80% = direct public filings, 50-79% = inferred from patterns, &lt;50% = unverified.
        </p>
      </CardContent>
    </Card>
  );
}
