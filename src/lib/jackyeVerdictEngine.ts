/**
 * Jackye Verdict Engine
 * Translates employer intelligence signals into a human decision layer.
 */

/* ── Types ── */

export type VerdictLevel = "Yes" | "Proceed with caution" | "Not without more answers" | "I would pause";
export type VerdictConfidence = "High" | "Medium" | "Low";
export type CoverageLevel = "High" | "Medium" | "Low";

export interface SignalInput {
  key: string;
  label: string;
  weight: number;      // percent, e.g. 25
  subscore: number;    // 0–100
  status: string;
}

export interface RedFlags {
  activeLayoffsWithin90Days: boolean;
  warnWithoutTransitionSupport: boolean;
  compensationTransparencyGaps: boolean;
  opaqueHiringTechnology: boolean;
  leadershipInstability: boolean;
  highInfluenceExposure: boolean;
}

export interface LayoffTiming {
  daysSinceLastLayoff: number | null;  // null = no layoffs
}

export interface VerdictInput {
  signals: SignalInput[];
  coveragePercent: number;   // 0–100
  redFlags: RedFlags;
  layoffTiming: LayoffTiming;
}

export interface VerdictQuestion {
  text: string;
  triggeredBy: string;  // which signal/flag triggered this question
}

export interface VerdictOutput {
  clarityScore: number;
  clarityBand: string;
  dataCoverage: CoverageLevel;
  dataCoverageDesc: string;
  verdict: VerdictLevel;
  verdictConfidence: VerdictConfidence;
  jackyeTake: string;
  questionsToAsk: VerdictQuestion[];
  redFlagCount: number;
  appliedOverrides: string[];
}

/* ── Constants ── */

const VERDICT_LEVELS: VerdictLevel[] = ["Yes", "Proceed with caution", "Not without more answers", "I would pause"];

const VERDICT_COLORS: Record<VerdictLevel, { color: string; bg: string; border: string }> = {
  "Yes": { color: "text-civic-green", bg: "bg-civic-green/10", border: "border-civic-green/30" },
  "Proceed with caution": { color: "text-civic-yellow", bg: "bg-civic-yellow/10", border: "border-civic-yellow/30" },
  "Not without more answers": { color: "text-civic-red", bg: "bg-civic-red/10", border: "border-civic-red/30" },
  "I would pause": { color: "text-civic-red", bg: "bg-civic-red/10", border: "border-civic-red/30" },
};

export function getVerdictColors(verdict: VerdictLevel) {
  return VERDICT_COLORS[verdict];
}

/* ── Score Computation ── */

function computeClarityScore(signals: SignalInput[]): number {
  return Math.round(signals.reduce((sum, s) => sum + (s.subscore * s.weight) / 100, 0));
}

function getClarityBand(score: number): string {
  if (score >= 80) return "High Clarity";
  if (score >= 60) return "Moderate Clarity";
  if (score >= 40) return "Low Clarity";
  return "Opaque / High Risk";
}

function getCoverage(percent: number): { level: CoverageLevel; desc: string } {
  if (percent >= 70) return { level: "High", desc: "Multiple verified public sources available." };
  if (percent >= 40) return { level: "Medium", desc: "Some public evidence exists, but gaps remain." };
  return { level: "Low", desc: "Limited public data. Score may not fully reflect employer quality." };
}

/* ── Base Verdict from Score ── */

function baseVerdictFromScore(score: number): VerdictLevel {
  if (score >= 80) return "Yes";
  if (score >= 60) return "Proceed with caution";
  if (score >= 40) return "Not without more answers";
  return "I would pause";
}

/* ── Downgrade ── */

function downgradeVerdict(current: VerdictLevel): VerdictLevel {
  const idx = VERDICT_LEVELS.indexOf(current);
  return VERDICT_LEVELS[Math.min(idx + 1, VERDICT_LEVELS.length - 1)];
}

/* ── Confidence ── */

function computeConfidence(signals: SignalInput[], coveragePercent: number): VerdictConfidence {
  const signalCount = signals.filter(s => s.subscore > 0).length;
  if (coveragePercent >= 70 && signalCount >= 4) return "High";
  if (coveragePercent >= 40 && signalCount >= 3) return "Medium";
  return "Low";
}

/* ── Red Flag Detection ── */

function countRedFlags(flags: RedFlags): { count: number; active: string[] } {
  const active: string[] = [];
  if (flags.activeLayoffsWithin90Days) active.push("Active layoffs within 90 days");
  if (flags.warnWithoutTransitionSupport) active.push("WARN notices without transition support");
  if (flags.compensationTransparencyGaps) active.push("Significant compensation transparency gaps");
  if (flags.opaqueHiringTechnology) active.push("Opaque hiring technology signals");
  if (flags.leadershipInstability) active.push("Major leadership instability");
  if (flags.highInfluenceExposure) active.push("Unusually high influence exposure");
  return { count: active.length, active };
}

/* ── Questions Generator ── */

function generateQuestions(signals: SignalInput[], flags: RedFlags, layoff: LayoffTiming): VerdictQuestion[] {
  const questions: VerdictQuestion[] = [];

  // Signal-driven questions
  const hiring = signals.find(s => s.key === "hiring");
  if (hiring && hiring.subscore < 50) {
    questions.push({ text: "Can you share the bias audit for any AI tools used in your hiring process?", triggeredBy: "Hiring Transparency" });
    questions.push({ text: "How are candidates screened before a human reviews their application?", triggeredBy: "Hiring Transparency" });
  }

  const comp = signals.find(s => s.key === "compensation");
  if (comp && comp.subscore < 60) {
    questions.push({ text: "What is the salary band for this role, and how is it benchmarked?", triggeredBy: "Compensation Clarity" });
    questions.push({ text: "Is there a published pay equity report or internal audit?", triggeredBy: "Compensation Clarity" });
  }

  const workforce = signals.find(s => s.key === "workforce");
  if (workforce && workforce.subscore < 60) {
    questions.push({ text: "Has the company filed any WARN Act notices in the past 24 months?", triggeredBy: "Workforce Stability" });
  }

  const influence = signals.find(s => s.key === "influence");
  if (influence && influence.subscore < 50) {
    questions.push({ text: "Can you explain the company's lobbying priorities and how they affect employees?", triggeredBy: "Influence Exposure" });
  }

  const leadership = signals.find(s => s.key === "leadership");
  if (leadership && leadership.subscore < 60) {
    questions.push({ text: "What percentage of leadership roles are held by underrepresented groups?", triggeredBy: "Leadership & Culture Trust" });
    questions.push({ text: "How does the company measure and report on internal culture health?", triggeredBy: "Leadership & Culture Trust" });
  }

  // Red-flag-driven questions
  if (flags.activeLayoffsWithin90Days || (layoff.daysSinceLastLayoff !== null && layoff.daysSinceLastLayoff <= 90)) {
    questions.push({ text: "What is the current headcount plan, and is the team I'd be joining affected by recent reductions?", triggeredBy: "Recent Layoffs" });
  }
  if (flags.warnWithoutTransitionSupport) {
    questions.push({ text: "What transition support was provided to employees affected by recent layoffs?", triggeredBy: "WARN Notices" });
  }

  return questions.slice(0, 7); // cap at 7
}

/* ── Jackye's Take Generator ── */

function generateJackyeTake(
  score: number,
  verdict: VerdictLevel,
  signals: SignalInput[],
  flags: RedFlags,
  layoff: LayoffTiming,
  coverage: CoverageLevel,
): string {
  const parts: string[] = [];

  // Helper lookups
  const weakSignals = signals.filter(s => s.subscore < 50);
  const strongSignals = signals.filter(s => s.subscore >= 70);
  const influence = signals.find(s => s.key === "influence");
  const hiring = signals.find(s => s.key === "hiring");
  const comp = signals.find(s => s.key === "compensation");
  const workforce = signals.find(s => s.key === "workforce");

  // ── 1. The Lead — candid, grounded, no bot language ──
  if (coverage === "Low") {
    parts.push("Look, there aren't enough receipts on the table here to tell you much. That's a signal in itself — silence is a choice.");
  } else if (weakSignals.length >= 3) {
    parts.push("The receipts aren't matching the rhetoric here. Facts over feelings — and the facts are thin.");
  } else if (weakSignals.length > 0) {
    parts.push(`Let's talk character, not marketing. AI can simulate competence, but these signals reveal who this company actually is when nobody's watching.`);
  } else {
    parts.push("I've seen a lot of employer profiles. This one actually has the receipts to back up the talk — and that's rare.");
  }

  // ── 2. The Analysis — specific, witty, call out contradictions ──

  // High influence but weak other signals = "all talk, no receipts"
  if (influence && influence.subscore >= 60 && weakSignals.filter(s => s.key !== "influence").length >= 2) {
    const weakLabels = weakSignals.filter(s => s.key !== "influence").map(s => s.label.toLowerCase());
    parts.push(`They've got a ${influence.subscore}/100 on Influence, which means they know how to play the game in DC — but they're ghosting us on ${weakLabels.join(" and ")}. That's all talk, no receipts.`);
  } else if (strongSignals.length > 0) {
    const strongLabels = strongSignals.map(s => `${s.label.toLowerCase()} (${s.subscore}/100)`);
    parts.push(`Strongest signals: ${strongLabels.join(", ")}. That's actual character showing through, not a press release.`);
  }

  // Specific HR tech risk callout
  if (flags.opaqueHiringTechnology || (hiring && hiring.subscore < 50)) {
    if (influence && influence.subscore >= 50) {
      parts.push("Here's what bugs me: they're spending on lobbying but haven't published a Bias Audit for their AI ranker. They'll spend money to influence policy but won't tell you how their own algorithm screens you out? That's character.");
    } else {
      parts.push("Their hiring tech is a black box. No published bias audits, no transparency on how their AI screens candidates. You deserve to know how you're being evaluated before a human ever sees your résumé.");
    }
  }

  // Compensation gaps
  if (flags.compensationTransparencyGaps || (comp && comp.subscore < 50)) {
    parts.push("The pay transparency signals are weak. If they can't tell you the band, the benchmark methodology, or show an equity audit — ask yourself why. Companies that pay fairly aren't afraid to prove it.");
  }

  // ── Layoff timing — direct, no sugarcoating ──
  if (layoff.daysSinceLastLayoff !== null && layoff.daysSinceLastLayoff <= 90) {
    parts.push(`They laid people off ${layoff.daysSinceLastLayoff} days ago. That's not ancient history — that's still warm. The team you'd join may still be processing what happened. Ask about it directly, and watch how they respond.`);
  } else if (layoff.daysSinceLastLayoff !== null && layoff.daysSinceLastLayoff <= 180) {
    parts.push("There were cuts within the last six months. The dust may have settled, but the culture impact doesn't disappear that fast. Ask about headcount trajectory and whether your role existed before the cuts.");
  }

  // ── 3. The Call to Action — not "research," but specific ──
  switch (verdict) {
    case "Yes":
      parts.push("The signals are solid. Go in strong — but still ask the questions below. Good character holds up under scrutiny; you're not being difficult, you're being smart.");
      break;
    case "Proceed with caution":
      parts.push("Before you sign anything, look at the flow of funds vs. the marketing fluff. Ask them why their PAC priorities and their handbook values don't line up. Trust is the currency here — don't spend yours blindly.");
      break;
    case "Not without more answers":
      parts.push("I wouldn't move forward until they can answer the questions below — in writing. If they dodge, that's your answer. Silence on these topics isn't an oversight; it's a strategy.");
      break;
    case "I would pause":
      parts.push("I'd pump the brakes. The signals are telling a story the careers page isn't. If you're already in process, slow it down. No offer is worth walking into a situation where the character doesn't match the pitch. Run the chain first. Always.");
      break;
  }

  return parts.join(" ");
}

/* ── Main Engine ── */

export function computeVerdict(input: VerdictInput): VerdictOutput {
  const { signals, coveragePercent, redFlags, layoffTiming } = input;

  // Score
  const clarityScore = computeClarityScore(signals);
  const clarityBand = getClarityBand(clarityScore);

  // Coverage
  const coverage = getCoverage(coveragePercent);

  // Base verdict
  let verdict = baseVerdictFromScore(clarityScore);
  const appliedOverrides: string[] = [];

  // Red flag overrides — each active flag downgrades by one level
  const { count: redFlagCount, active: activeFlags } = countRedFlags(redFlags);
  for (const flag of activeFlags) {
    const before = verdict;
    verdict = downgradeVerdict(verdict);
    if (before !== verdict) {
      appliedOverrides.push(`Downgraded from "${before}" → "${verdict}" due to: ${flag}`);
    }
  }

  // Data coverage override
  if (coverage.level === "Low") {
    const before = verdict;
    verdict = downgradeVerdict(verdict);
    if (before !== verdict) {
      appliedOverrides.push(`Downgraded from "${before}" → "${verdict}" due to low data coverage`);
    }
  }

  // Layoff timing override — 90 days forces at least "Proceed with caution"
  if (layoffTiming.daysSinceLastLayoff !== null && layoffTiming.daysSinceLastLayoff <= 90) {
    if (verdict === "Yes") {
      verdict = "Proceed with caution";
      appliedOverrides.push('Layoffs within 90 days forced verdict to at least "Proceed with caution"');
    }
  }

  // Confidence
  let confidence = computeConfidence(signals, coveragePercent);
  if (coverage.level === "Low" && confidence === "High") {
    confidence = "Medium";
  }

  // Generate outputs
  const jackyeTake = generateJackyeTake(clarityScore, verdict, signals, redFlags, layoffTiming, coverage.level);
  const questionsToAsk = generateQuestions(signals, redFlags, layoffTiming);

  return {
    clarityScore,
    clarityBand,
    dataCoverage: coverage.level,
    dataCoverageDesc: coverage.desc,
    verdict,
    verdictConfidence: confidence,
    jackyeTake,
    questionsToAsk,
    redFlagCount,
    appliedOverrides,
  };
}
