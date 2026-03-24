// ---------------------------------------------------------------------------
// Where You Work Matters (WYWM) — Static company data
// Source: Burning Glass Institute + Schultz Family Foundation + Harvard Business School
// ---------------------------------------------------------------------------

export type WYWMBadgeLevel = "Platinum" | "Gold" | "None";

export interface WYWMCompany {
  name: string;
  displayName?: string;
  wywmUrl: string | null;
  overall: WYWMBadgeLevel;
  earlyCareer: WYWMBadgeLevel;
  growth: WYWMBadgeLevel;
  stability: WYWMBadgeLevel;
  industry: string;
  occupationsAssessed: number | null;
}

export const WYWM_COMPANIES: WYWMCompany[] = [
  { name: "Meta", wywmUrl: "https://www.whereyouworkmatters.org/company/Meta/?company_uid=MA1076", overall: "Gold", earlyCareer: "None", growth: "None", stability: "Platinum", industry: "Software & Technology", occupationsAssessed: 70 },
  { name: "Alphabet", displayName: "Google (Alphabet)", wywmUrl: "https://www.whereyouworkmatters.org/company/Alphabet/?company_uid=GE741", overall: "Platinum", earlyCareer: "None", growth: "Platinum", stability: "Platinum", industry: "Software & Technology", occupationsAssessed: 63 },
  { name: "Amazon", wywmUrl: "https://www.whereyouworkmatters.org/company/Amazon/?company_uid=AN85", overall: "Platinum", earlyCareer: "Gold", growth: "Platinum", stability: "Platinum", industry: "Software & Technology / Retail", occupationsAssessed: 70 },
  { name: "Microsoft", wywmUrl: "https://www.whereyouworkmatters.org/company/Microsoft/?company_uid=MT1087", overall: "Platinum", earlyCareer: "Gold", growth: "Platinum", stability: "Platinum", industry: "Software & Technology", occupationsAssessed: 60 },
  { name: "Boeing", wywmUrl: "https://www.whereyouworkmatters.org/company/Boeing/?company_uid=BG260", overall: "Platinum", earlyCareer: "Platinum", growth: "Platinum", stability: "Platinum", industry: "Aerospace & Defense", occupationsAssessed: 72 },
  { name: "Booz Allen Hamilton", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=Booz+Allen", overall: "Gold", earlyCareer: "Platinum", growth: "Gold", stability: "None", industry: "Consulting", occupationsAssessed: null },
  { name: "Accenture", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=Accenture", overall: "Platinum", earlyCareer: "Gold", growth: "Platinum", stability: "Gold", industry: "Consulting", occupationsAssessed: null },
  { name: "Verizon", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=Verizon", overall: "Platinum", earlyCareer: "None", growth: "Platinum", stability: "Platinum", industry: "Telecom", occupationsAssessed: null },
  { name: "T-Mobile", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=T-Mobile", overall: "None", earlyCareer: "None", growth: "None", stability: "None", industry: "Telecom", occupationsAssessed: null },
  { name: "AT&T", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=AT%26T", overall: "Platinum", earlyCareer: "None", growth: "Platinum", stability: "Gold", industry: "Telecom", occupationsAssessed: null },
  { name: "RTX", displayName: "Raytheon (RTX)", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=RTX", overall: "Gold", earlyCareer: "Gold", growth: "None", stability: "None", industry: "Aerospace & Defense", occupationsAssessed: null },
  { name: "Northrop Grumman", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=Northrop+Grumman", overall: "Platinum", earlyCareer: "Platinum", growth: "Platinum", stability: "Platinum", industry: "Aerospace & Defense", occupationsAssessed: null },
  { name: "Lockheed Martin", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=Lockheed+Martin", overall: "Platinum", earlyCareer: "Platinum", growth: "Platinum", stability: "Platinum", industry: "Aerospace & Defense", occupationsAssessed: null },
  { name: "General Dynamics", wywmUrl: "https://www.whereyouworkmatters.org/the-list/?query=General+Dynamics", overall: "None", earlyCareer: "Gold", growth: "None", stability: "None", industry: "Aerospace & Defense", occupationsAssessed: null },
  { name: "General Electric", wywmUrl: null, overall: "None", earlyCareer: "None", growth: "None", stability: "None", industry: "Conglomerate", occupationsAssessed: null },
  { name: "Halliburton", wywmUrl: "https://www.whereyouworkmatters.org/company/Halliburton/?company_uid=HN775", overall: "None", earlyCareer: "None", growth: "Gold", stability: "None", industry: "Oil & Gas", occupationsAssessed: null },
  { name: "JPMorgan Chase", wywmUrl: "https://www.whereyouworkmatters.org/company/JPMorgan%20Chase/?company_uid=JE889", overall: "None", earlyCareer: "None", growth: "None", stability: "Gold", industry: "Finance", occupationsAssessed: 49 },
  { name: "Goldman Sachs", wywmUrl: "https://www.whereyouworkmatters.org/company/Goldman%20Sachs/?company_uid=GS739", overall: "Gold", earlyCareer: "Platinum", growth: "Gold", stability: "None", industry: "Finance", occupationsAssessed: 50 },
  { name: "Wells Fargo", wywmUrl: "https://www.whereyouworkmatters.org/company/Wells%20Fargo/?company_uid=WO1792", overall: "Gold", earlyCareer: "None", growth: "Gold", stability: "Gold", industry: "Finance", occupationsAssessed: 54 },
  { name: "Walmart", wywmUrl: "https://www.whereyouworkmatters.org/company/Walmart/?company_uid=WT1770", overall: "Platinum", earlyCareer: "Gold", growth: "Gold", stability: "Gold", industry: "Retail", occupationsAssessed: 62 },
];

/** Slug-to-WYWM-name mapping for receipt pages */
const SLUG_TO_WYWM: Record<string, string> = {
  meta: "Meta",
  google: "Alphabet",
  amazon: "Amazon",
  microsoft: "Microsoft",
  boeing: "Boeing",
  "booz-allen-hamilton": "Booz Allen Hamilton",
  accenture: "Accenture",
  verizon: "Verizon",
  "t-mobile": "T-Mobile",
  att: "AT&T",
  rtx: "RTX",
  "northrop-grumman": "Northrop Grumman",
  "lockheed-martin": "Lockheed Martin",
  "general-dynamics": "General Dynamics",
  "general-electric": "General Electric",
  halliburton: "Halliburton",
  "jpmorgan-chase": "JPMorgan Chase",
  "goldman-sachs": "Goldman Sachs",
  "wells-fargo": "Wells Fargo",
  walmart: "Walmart",
};

/** Look up WYWM data for a receipt slug. Returns undefined if not matched. */
export function getWYWMBySlug(slug: string): WYWMCompany | undefined {
  const name = SLUG_TO_WYWM[slug];
  if (!name) return undefined;
  return WYWM_COMPANIES.find((c) => c.name === name);
}

export const WYWM_SOURCE_URL = "https://www.whereyouworkmatters.org";
export const WYWM_ATTRIBUTION =
  "Career outcome data from the Where You Work Matters List by Burning Glass Institute, Schultz Family Foundation & Harvard Business School.";
