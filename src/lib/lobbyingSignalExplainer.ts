/**
 * Heuristics to turn lobbying issue_signal descriptions into scannable topics.
 * Falls back to full description when parsing yields nothing useful.
 */

const BILL_RE = /\b(S\.|H\.R\.|HR\.?)\s*[\d]+[A-Za-z0-9.-]*/gi;

const ISSUE_TAIL_RE =
  /\b(?:covering|including|focused on|targeting|working on|lobbying on|issues include|issues:\s*)([^.]+?)(?:\.(?:\s|$)|$)/i;

export function isLobbyingIssueSignal(issueCategory: string | null | undefined, signalType: string | null | undefined): boolean {
  const ic = (issueCategory || "").toLowerCase();
  const st = (signalType || "").toLowerCase();
  return ic === "lobbying" || st.includes("lobbying");
}

export function extractLobbyingTopics(description: string): string[] {
  const d = (description || "").trim();
  if (!d) return [];

  const topics = new Set<string>();

  for (const m of d.matchAll(BILL_RE)) {
    topics.add(m[0].replace(/\s+/g, " ").trim());
  }

  const tail = d.match(ISSUE_TAIL_RE);
  if (tail?.[1]) {
    const part = tail[1]
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    part.split(/\s*,\s*|\s+and\s+/i).forEach((chunk) => {
      const t = chunk.replace(/^[\s—\-–]+|[\s—\-–]+$/g, "").trim();
      if (t.length > 2 && t.length < 140 && !/^\$\d/.test(t)) topics.add(t);
    });
  }

  if (/\brevolving\s+door\b/i.test(d) || /\bformer\s+government\s+official/i.test(d)) {
    topics.add("Disclosure notes prior government employment among registered lobbyists (as reported in source)");
  }

  return Array.from(topics).slice(0, 12);
}

export function openSecretsLobbyingSearchUrl(companyName: string): string {
  const q = encodeURIComponent(companyName.trim() || "company");
  return `https://www.opensecrets.org/federal-lobbying/clients/search?q=${q}`;
}

export function senateLdaSearchUrl(companyName: string): string {
  const q = encodeURIComponent(companyName.trim() || "company");
  return `https://lda.senate.gov/filings/public/filing/search/?q=${q}`;
}

/** Definition of what LDA-style data is—no opinion on whether activity is good or bad. */
export const LOBBYING_WHAT_IT_IS =
  "Lobbying disclosures record issues and agencies named in filings. Reported dollars pay registered lobbying firms and in-house government-affairs roles—not the same line item as PAC or candidate contributions (those appear under FEC data). This describes filing categories, not intent.";

/** Factual chain only: budgets and policy domains; no claim about this employer’s motives or how you should feel. */
export const LOBBYING_WORKER_IMPACT =
  "Companies report lobbying as part of operating expense; that spending is paid from revenue from normal business activity. Filings list subject areas (e.g. procurement, tax, technology policy). Whether a rule change helps or hurts a given job is not something a disclosure proves—we show what was filed so you can read the sources yourself.";

/** One-line stance for list UIs */
export const LOBBYING_FACTS_ONLY_NOTE =
  "Facts from public filings and summaries only—no score, no verdict on the employer.";
