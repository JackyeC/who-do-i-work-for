/**
 * Bias Distribution — WDIWF's take on the Ground News bias breakdown.
 *
 * Shows a horizontal Left / Center / Right bar, then stacked source
 * "chips" grouped by bias column, plus an "Untracked" row.  Designed
 * for use inside Receipts reports and the timeline.
 *
 * Data comes from the source-bias-map — no external API needed.
 */

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getSourceProfile,
  getBiasColor,
  type BiasRating,
  type FactualityRating,
} from "@/lib/source-bias-map";
import { cn } from "@/lib/utils";

// ─── Types ───

interface SourceEntry {
  name: string;
  bias: BiasRating;
  factuality: FactualityRating;
}

interface BiasDistributionProps {
  /** Raw source name strings — we look up bias for each */
  sources: string[];
  /** Optional title override */
  title?: string;
  /** Compact mode for card embeds */
  compact?: boolean;
}

// ─── Bias column config ───

const BIAS_COLUMNS: {
  key: BiasRating;
  label: string;
  shortLabel: string;
  barColor: string;
  chipBg: string;
  chipBorder: string;
}[] = [
  {
    key: "Left",
    label: "Left",
    shortLabel: "L",
    barColor: "bg-blue-500",
    chipBg: "bg-blue-500/10",
    chipBorder: "border-blue-500/20",
  },
  {
    key: "Lean Left",
    label: "Lean Left",
    shortLabel: "LL",
    barColor: "bg-sky-400",
    chipBg: "bg-sky-400/10",
    chipBorder: "border-sky-400/20",
  },
  {
    key: "Center",
    label: "Center",
    shortLabel: "C",
    barColor: "bg-emerald-400",
    chipBg: "bg-emerald-400/10",
    chipBorder: "border-emerald-400/20",
  },
  {
    key: "Lean Right",
    label: "Lean Right",
    shortLabel: "LR",
    barColor: "bg-orange-400",
    chipBg: "bg-orange-400/10",
    chipBorder: "border-orange-400/20",
  },
  {
    key: "Right",
    label: "Right",
    shortLabel: "R",
    barColor: "bg-red-500",
    chipBg: "bg-red-500/10",
    chipBorder: "border-red-500/20",
  },
];

// Factuality dot colors
function factualityDot(f: FactualityRating): string {
  switch (f) {
    case "High":
      return "bg-emerald-400";
    case "Mixed":
      return "bg-amber-400";
    case "Low":
      return "bg-red-400";
    default:
      return "bg-muted-foreground/30";
  }
}

// First letter badge for a source (like Ground News logos)
function sourceInitial(name: string): string {
  // Use known abbreviations
  const abbrevs: Record<string, string> = {
    "associated press": "AP",
    "ap news": "AP",
    reuters: "R",
    bbc: "BBC",
    "bbc news": "BBC",
    cnn: "CNN",
    "fox news": "FOX",
    npr: "NPR",
    pbs: "PBS",
    cnbc: "CNBC",
    "the hill": "TH",
    "wall street journal": "WSJ",
    "the wall street journal": "WSJ",
    "new york times": "NYT",
    "the new york times": "NYT",
    "washington post": "WP",
    bloomberg: "BB",
    politico: "POL",
    axios: "AX",
    "usa today": "USA",
    vox: "VOX",
    wired: "W",
    slate: "SL",
    forbes: "F",
    "the atlantic": "ATL",
    "the guardian": "TG",
    propublica: "PP",
    breitbart: "BB",
    "daily wire": "DW",
    newsmax: "NM",
    huffpost: "HP",
    "mother jones": "MJ",
    "the verge": "TV",
    "the economist": "TE",
    "financial times": "FT",
    // Gov / OSINT
    fec: "FEC",
    "sec edgar": "SEC",
    bls: "BLS",
    lda: "LDA",
    warn: "W!",
    osha: "OSHA",
    nlrb: "NLRB",
    pacer: "PAC",
    courtlistener: "CL",
    opensecrets: "OS",
    littlesis: "LS",
    splc: "SPLC",
    adl: "ADL",
    hrc: "HRC",
    pogo: "POGO",
    gdelt: "GDL",
    newsapi: "NA",
    "ground news": "GN",
    opencorporates: "OC",
    "bureau of labor statistics": "BLS",
    gallup: "GAL",
    "pew research": "PEW",
  };
  const lower = name.toLowerCase().trim();
  if (abbrevs[lower]) return abbrevs[lower];
  // Try partial match
  for (const [k, v] of Object.entries(abbrevs)) {
    if (lower.includes(k)) return v;
  }
  // Fallback: first two chars uppercase
  return name.slice(0, 2).toUpperCase();
}

// ─── Component ───

export function BiasDistribution({
  sources,
  title,
  compact = false,
}: BiasDistributionProps) {
  // Classify each source
  const classified = useMemo(() => {
    const seen = new Set<string>();
    const result: SourceEntry[] = [];
    const untracked: string[] = [];

    for (const raw of sources) {
      const key = raw.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      const profile = getSourceProfile(raw);
      if (profile.bias === "Unknown") {
        untracked.push(raw);
      } else {
        result.push({ name: raw, bias: profile.bias, factuality: profile.factuality });
      }
    }

    return { tracked: result, untracked };
  }, [sources]);

  // Group by bias
  const groups = useMemo(() => {
    const map = new Map<BiasRating, SourceEntry[]>();
    for (const col of BIAS_COLUMNS) map.set(col.key, []);
    for (const s of classified.tracked) {
      map.get(s.bias)?.push(s);
    }
    return map;
  }, [classified.tracked]);

  // Compute percentages (combine Left+Lean Left → "L", Center → "C", Right+Lean Right → "R")
  const total = classified.tracked.length;
  const leftCount =
    (groups.get("Left")?.length || 0) + (groups.get("Lean Left")?.length || 0);
  const centerCount = groups.get("Center")?.length || 0;
  const rightCount =
    (groups.get("Right")?.length || 0) +
    (groups.get("Lean Right")?.length || 0);

  const leftPct = total > 0 ? Math.round((leftCount / total) * 100) : 0;
  const rightPct = total > 0 ? Math.round((rightCount / total) * 100) : 0;
  const centerPct = total > 0 ? 100 - leftPct - rightPct : 0;

  // Determine dominant
  const dominant =
    centerPct >= leftPct && centerPct >= rightPct
      ? "Center"
      : leftPct >= rightPct
      ? "Left-leaning"
      : "Right-leaning";

  if (total === 0 && classified.untracked.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        compact ? "p-3" : "p-5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title || "Source Bias Distribution"}
        </h3>
        <Badge
          variant="outline"
          className="text-xs font-mono text-muted-foreground"
        >
          {total} source{total !== 1 ? "s" : ""} tracked
        </Badge>
      </div>

      {/* Headline stat */}
      {total > 0 && (
        <p
          className={cn(
            "text-muted-foreground mb-3",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <span className="font-medium text-foreground">{centerPct}%</span> of
          sources are Center-rated ·{" "}
          <span className="text-foreground">{dominant}</span> coverage overall
        </p>
      )}

      {/* ─── Bias Bar ─── */}
      {total > 0 && (
        <div className="flex h-7 rounded-lg overflow-hidden mb-4 border border-border/40">
          {leftPct > 0 && (
            <div
              className="flex items-center justify-center bg-blue-500/80 text-white text-xs font-mono font-medium transition-all"
              style={{ width: `${leftPct}%` }}
            >
              {leftPct >= 8 && `L ${leftPct}%`}
            </div>
          )}
          {centerPct > 0 && (
            <div
              className="flex items-center justify-center bg-emerald-400/20 text-emerald-400 text-xs font-mono font-medium border-x border-border/20 transition-all"
              style={{ width: `${centerPct}%` }}
            >
              {centerPct >= 8 && `C ${centerPct}%`}
            </div>
          )}
          {rightPct > 0 && (
            <div
              className="flex items-center justify-center bg-red-500/60 text-white text-xs font-mono font-medium transition-all"
              style={{ width: `${rightPct}%` }}
            >
              {rightPct >= 8 && `R ${rightPct}%`}
            </div>
          )}
        </div>
      )}

      {/* ─── Source Columns ─── */}
      {!compact && total > 0 && (
        <div className="flex gap-1 mb-4">
          {BIAS_COLUMNS.map((col) => {
            const items = groups.get(col.key) || [];
            if (items.length === 0) {
              // Empty column — just show a dim slot
              return (
                <div
                  key={col.key}
                  className="flex-1 rounded-lg bg-muted/20 min-h-[48px] flex items-center justify-center"
                >
                  <span className="text-[10px] text-muted-foreground/30 font-mono">
                    {col.shortLabel}
                  </span>
                </div>
              );
            }
            return (
              <div
                key={col.key}
                className={cn(
                  "flex-1 rounded-lg flex flex-col items-center gap-1.5 py-2 px-1",
                  col.chipBg,
                  "border",
                  col.chipBorder
                )}
              >
                {/* Column label */}
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">
                  {col.shortLabel}
                </span>
                {/* Source chips */}
                {items.map((src) => (
                  <div
                    key={src.name}
                    className="relative group"
                    title={`${src.name} — ${src.bias} · Factuality: ${src.factuality}`}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold border transition-transform hover:scale-110",
                        "bg-card border-border/60 text-foreground"
                      )}
                    >
                      {sourceInitial(src.name)}
                    </div>
                    {/* Factuality dot */}
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card",
                        factualityDot(src.factuality)
                      )}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Compact source list ─── */}
      {compact && total > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {classified.tracked.map((src) => (
            <Badge
              key={src.name}
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", getBiasColor(src.bias))}
              title={`${src.bias} · ${src.factuality} factuality`}
            >
              {src.name}
            </Badge>
          ))}
        </div>
      )}

      {/* ─── Untracked Sources ─── */}
      {classified.untracked.length > 0 && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">
            Untracked bias ({classified.untracked.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {classified.untracked.map((name) => (
              <Badge
                key={name}
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-muted-foreground/50"
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ─── Jackye's take ─── */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-primary font-medium">How to read this:</span>{" "}
          We show you where the information comes from so you can judge it
          yourself. Government records (FEC, SEC, BLS) don't have a political
          lean — they're the legal record. Media sources get rated by AllSides,
          Ad Fontes Media, and MBFC. The green dot means high factuality, yellow
          means mixed, red means low. No source is perfect — that's why we show
          you all of them.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact inline bias bar — for use in cards and list items.
 * Shows just the L/C/R bar with percentages.
 */
export function BiasBar({ sources }: { sources: string[] }) {
  const stats = useMemo(() => {
    let left = 0;
    let center = 0;
    let right = 0;
    let total = 0;

    for (const raw of sources) {
      const profile = getSourceProfile(raw);
      if (profile.bias === "Unknown") continue;
      total++;
      if (profile.bias === "Left" || profile.bias === "Lean Left") left++;
      else if (profile.bias === "Center") center++;
      else right++;
    }

    return {
      total,
      leftPct: total > 0 ? Math.round((left / total) * 100) : 0,
      centerPct:
        total > 0
          ? 100 -
            Math.round((left / total) * 100) -
            Math.round((right / total) * 100)
          : 0,
      rightPct: total > 0 ? Math.round((right / total) * 100) : 0,
    };
  }, [sources]);

  if (stats.total === 0) return null;

  return (
    <div className="flex h-2 rounded-full overflow-hidden border border-border/30">
      {stats.leftPct > 0 && (
        <div
          className="bg-blue-500/70"
          style={{ width: `${stats.leftPct}%` }}
        />
      )}
      {stats.centerPct > 0 && (
        <div
          className="bg-emerald-400/30"
          style={{ width: `${stats.centerPct}%` }}
        />
      )}
      {stats.rightPct > 0 && (
        <div
          className="bg-red-500/50"
          style={{ width: `${stats.rightPct}%` }}
        />
      )}
    </div>
  );
}
