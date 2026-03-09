import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, HandCoins, Users, Scale, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/sampleData";
import { PartyBadge } from "@/components/PartyBadge";

interface Props {
  companyName: string;
  totalPacSpending: number;
  lobbyingSpend: number;
  topCandidates?: { name: string; party: string; amount: number }[];
  topIssuesLobbied?: string[];
  darkMoneyConnections?: number;
  flaggedOrgCount?: number;
}

export function WhatYoureSupportingCard({
  companyName,
  totalPacSpending,
  lobbyingSpend,
  topCandidates = [],
  topIssuesLobbied = [],
  darkMoneyConnections = 0,
  flaggedOrgCount = 0,
}: Props) {
  const hasActivity = totalPacSpending > 0 || lobbyingSpend > 0 || topCandidates.length > 0;

  if (!hasActivity) return null;

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-primary" />
          What You're Supporting
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you work at <strong className="text-foreground">{companyName}</strong>, your labor generates revenue that funds the following political activities. This isn't a judgment — it's a map of where the money goes.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Money flows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {totalPacSpending > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground mb-1">PAC Donations to Politicians</div>
              <div className="text-lg font-bold font-data text-foreground">{formatCurrency(totalPacSpending)}</div>
            </div>
          )}
          {lobbyingSpend > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Lobbying Congress & Agencies</div>
              <div className="text-lg font-bold font-data text-foreground">{formatCurrency(lobbyingSpend)}</div>
            </div>
          )}
        </div>

        {/* Top candidates */}
        {topCandidates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Top Politicians Funded</span>
            </div>
            <div className="space-y-1.5">
              {topCandidates.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <PartyBadge party={c.party} size="sm" />
                    <span className="text-sm text-foreground">{c.name}</span>
                  </div>
                  <span className="text-sm font-data font-medium text-foreground">{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lobbying issues */}
        {topIssuesLobbied.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Issues Being Lobbied</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topIssuesLobbied.slice(0, 8).map((issue, i) => (
                <Badge key={i} variant="outline" className="text-xs">{issue}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Risk flags */}
        {(darkMoneyConnections > 0 || flaggedOrgCount > 0) && (
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold text-foreground">Worth Knowing</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              {darkMoneyConnections > 0 && (
                <li>{darkMoneyConnections} dark money connection{darkMoneyConnections > 1 ? 's' : ''} detected — political spending through channels that don't disclose donors</li>
              )}
              {flaggedOrgCount > 0 && (
                <li>{flaggedOrgCount} connection{flaggedOrgCount > 1 ? 's' : ''} to organizations on civil rights watchlists (SPLC/ADL)</li>
              )}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          This is a summary of publicly disclosed political activity. All data comes from FEC filings, Senate lobbying disclosures, and government records. No conclusions are drawn — interpretation is left to you.
        </p>
      </CardContent>
    </Card>
  );
}
