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
    topics.add("Disclosure notes prior government employment among registered lobbyists (as stated in source)");
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

export const LOBBYING_FACTS_ONLY_NOTE =
  "Facts from public filings and summaries only—no score and no judgment about the employer.";

export const LOBBYING_WHAT_IT_IS =
  "Lobbying disclosures record issues and agencies named in filings. Reported dollars pay registered lobbying firms and in-house government-affairs roles—not the same category as PAC or candidate money in FEC data. This describes what filings say, not anyone’s intent.";

export const LOBBYING_WORKER_IMPACT =
  "Companies report lobbying as operating expense; it is paid from business revenue. Filings list subject areas (for example procurement, tax, technology policy). A filing does not prove how a rule change would affect a specific person’s job—we point to disclosed topics and primary links so you can verify.";
