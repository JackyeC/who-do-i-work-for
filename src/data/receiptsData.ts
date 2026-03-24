// ---------------------------------------------------------------------------
// Generalized Receipts Report Data Types
// ---------------------------------------------------------------------------

export interface QuoteEntry {
  text: string;
  source: string;
  sourceUrl?: string;
}

export interface PacSummaryRow {
  metric: string;
  amount: string;
  color?: "red" | "blue";
}

export interface LobbyingYearRow {
  year: string;
  totalSpent: string;
  yoyChange: string;
  changeColor?: "red" | "amber";
}

export interface TimelineEntry {
  date: string;
  dotColor: "red" | "amber" | "green" | "muted";
  title: string;
  description: string;
  sourceUrl?: string;
  sourceLabel?: string;
}

export interface WarnFiling {
  location: string;
  employees: string;
  noticeDate: string;
  layoffDate: string;
}

export interface ProgramChange {
  program: string;
  status: string;
  badgeColor?: "red" | "amber";
}

export interface FederalContract {
  contract: string;
  agency: string;
  amount: string;
  description: string;
}

export interface ReceiptRow {
  category: string;
  finding: string;
  status: "confirmed" | "data-gap" | "research-incomplete";
}

export interface SourceEntry {
  label: string;
  links: { text: string; url: string }[];
}

export interface CompanyReportData {
  slug: string;
  companyName: string;
  ticker: string;
  location: string;
  products: string;
  reportDate: string;
  stats: { label: string; value: string; detail: string; trend?: "down" }[];

  integrityGap: {
    missionQuotes: QuoteEntry[];
    missionSourceUrl: string;
    diversityNote: string;
    pacName: string;
    fecId: string;
    pacSummary: PacSummaryRow[];
    pacSourceUrl: string;
    pacSourceLabel: string;
    pacAnalysis: string;
    lobbyingYears: LobbyingYearRow[];
    lobbyingSourceUrls: { text: string; url: string }[];
    lobbyingAnalysis: string;
    keyFindings: string[];
  };

  laborImpact: {
    deiStatus: string;
    deiDate: string;
    deiDetails: string;
    deiSourceUrls: { text: string; url: string }[];
    programChanges: ProgramChange[];
    layoffTimeline: TimelineEntry[];
    totalLayoffs: string;
    warnFilings: WarnFiling[];
    warnSourceUrl: string;
    warnSourceLabel: string;
    warnTotal: string;
    keyFindings: string[];
  };

  safetyAlert: {
    federalContractStatus: string;
    federalContracts: FederalContract[];
    contractSourceUrls: { text: string; url: string }[];
    contractAnalysis: string;
    hrcScore: string;
    hrcDetail: string;
    hrcSourceUrls: { text: string; url: string }[];
    additionalFindings: string[];
    keyFindings: string[];
  };

  connectedDots: {
    revolvingDoorPct: string;
    revolvingDoorDetail: string;
    lobbyistSourceUrls: { text: string; url: string }[];
    notableConnections: string[];
    patternsAnalysis: string;
    keyFindings: string[];
  };

  receiptsAtAGlance: ReceiptRow[];
  sources: SourceEntry[];
}

// ---------------------------------------------------------------------------
// Google (Alphabet Inc.)
// ---------------------------------------------------------------------------

export const GOOGLE_REPORT: CompanyReportData = {
  slug: "google",
  companyName: "ALPHABET INC. (GOOGLE)",
  ticker: "NASDAQ: GOOGL",
  location: "Mountain View, CA",
  products: "Google Search, YouTube, Android, Cloud, Waymo",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$1.9M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$14.9M", detail: "2024 total" },
    { label: "WARN Filings", value: "Disputed", detail: "Cal-WARN ~100 Apr 2025" },
    { label: "HRC Score", value: "100", detail: "Pre-2025; likely changed", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "Our mission is to organize the world\u2019s information and make it universally accessible and useful.", source: "Google Mission Statement, about.google" },
      { text: "We are committed to significantly increasing the leadership representation of underrepresented groups.", source: "Google Diversity Report, 2022 (discontinued)" },
    ],
    missionSourceUrl: "https://about.google",
    diversityNote: "Google published diversity reports annually from 2014 to 2022 \u2014 then stopped. The company eliminated aspirational diversity hiring goals (30% leadership representation by 2025) and removed DEI commitment language from its annual report/10-K in February 2025.",
    pacName: "GOOGLE INC. NETPAC",
    fecId: "C00428623",
    pacSummary: [
      { metric: "Total Raised", amount: "$1,902,225" },
      { metric: "% to Republicans", amount: "50.47%", color: "red" },
      { metric: "% to Democrats", amount: "48.51%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/google-inc/C00428623/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Google PAC 2023\u20132024",
    pacAnalysis: "Google\u2019s PAC spending shifted to 50.47% Republican in 2023\u20132024, a notable shift for a company long perceived as leaning Democratic. Bipartisan PAC giving supports federal contract positioning.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$14,450,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$14,860,000", yoyChange: "+2.8%", changeColor: "amber" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?id=D000067823" },
    ],
    lobbyingAnalysis: "Google spent $14.9M on federal lobbying in 2024, focused heavily on AI regulation, antitrust defense, and content moderation policy. The company hires ex-DOJ officials for antitrust lobbying.",
    keyFindings: [
      "Diversity report series discontinued after 11 years (2014\u20132022).",
      "Hiring targets for underrepresented groups eliminated February 2025, citing \u2018legal landscape changes.\u2019",
      "PAC spending tilted 50.47% Republican in 2023\u20132024 cycle, supporting bipartisan federal contract positioning.",
      "Heavy lobbying on AI regulation/antitrust ($14.9M in 2024).",
    ],
  },

  laborImpact: {
    deiStatus: "Scaled back",
    deiDate: "February 2025",
    deiDetails: "Eliminated aspirational diversity hiring goals (30% leadership representation by 2025), removed DEI commitment from annual report/10-K, reviewing grants/training/programs due to Trump executive order as federal contractor. Employee Resource Groups (ERGs) maintained.",
    deiSourceUrls: [
      { text: "CNBC, February 2025", url: "https://www.cnbc.com/2025/02/05/google-scraps-diversity-aspirations-as-a-federal-contractor.html" },
      { text: "SAN.com DEI report", url: "https://san.com/cc/google-drops-diversity-pledge-shifts-dei-hiring-strategy/" },
    ],
    programChanges: [
      { program: "Diversity hiring goals (30% leadership rep)", status: "Eliminated", badgeColor: "red" },
      { program: "DEI commitment in annual report/10-K", status: "Removed", badgeColor: "red" },
      { program: "Diversity report series (2014\u20132022)", status: "Discontinued", badgeColor: "red" },
      { program: "DEI grants and training programs", status: "Under review", badgeColor: "amber" },
      { program: "Employee Resource Groups (ERGs)", status: "Maintained" },
    ],
    layoffTimeline: [
      { date: "Jan 2023", dotColor: "red", title: "12,000 employees laid off (~6% of workforce)", description: "CEO Sundar Pichai cited \u2018economic reality\u2019 and over-hiring during pandemic growth. Affected every major division." },
      { date: "2024", dotColor: "red", title: "Thousands cut across Hardware, Engineering", description: "Targeted layoffs in YouTube content ops, Pixel hardware team, and recruiting organization." },
      { date: "2025", dotColor: "red", title: "2,000+ (Cloud, AI contractors, Global Business)", description: "Ongoing buyouts and restructuring; net headcount relatively stable due to AI hiring offsetting cuts." },
      { date: "Apr 2025", dotColor: "amber", title: "Cal-WARN dispute: ~100 employees, Mountain View", description: "Disputed California WARN Act filing for approximately 100 workers." },
    ],
    totalLayoffs: "~25,000+ total layoffs from 2022\u20132026, though net headcount has remained relatively stable due to offsetting AI/ML hiring.",
    warnFilings: [],
    warnSourceUrl: "",
    warnSourceLabel: "",
    warnTotal: "None found in national database; disputed Cal-WARN claim for ~100 in Mountain View, April 2025.",
    keyFindings: [
      "25,000+ workers laid off across multiple waves (2023\u20132025) while simultaneously hiring for AI roles.",
      "DEI programs scaled back in February 2025 as a direct response to federal contractor obligations under Trump executive orders.",
      "Diversity reports discontinued after 11 consecutive years of publication.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active",
    federalContracts: [
      { contract: "DoD CDAO", agency: "Department of Defense", amount: "$200M", description: "AI/cloud capabilities for Chief Digital and AI Office (2025)" },
      { contract: "GSA Gemini", agency: "General Services Administration", amount: "Undisclosed", description: "Gemini AI integration for federal agencies (2025)" },
      { contract: "Pentagon AI", agency: "Department of Defense", amount: "Undisclosed", description: "AI agents for defense applications (2026)" },
    ],
    contractSourceUrls: [
      { text: "Google Cloud DoD Blog", url: "https://cloud.google.com/blog/topics/public-sector/google-public-sector-awarded-200-million-contract-to-accelerate-ai-and-cloud-capabilities-across-department-of-defenses-chief-digital-and-artificial-intelligence-office-cdao" },
    ],
    contractAnalysis: "Google is an active federal contractor with significant DoD and GSA awards. Federal contract status creates compliance obligations under executive orders affecting DEI programs.",
    hrcScore: "100",
    hrcDetail: "Scored 100 on HRC Corporate Equality Index through 2024. Status unclear for 2025\u20132026 following DEI rollback.",
    hrcSourceUrls: [],
    additionalFindings: [
      "Antitrust ruling: Found to hold illegal monopoly in search (August 2024, DOJ v. Google).",
      "ADF Viewpoint Diversity Score: 12% (2025 index).",
      "OSHA complaint filed at Google data center facility in 2023 regarding contractor working conditions.",
    ],
    keyFindings: [
      "$200M+ in active DoD AI/cloud contracts creates direct federal compliance pressure on DEI policy.",
      "Antitrust monopoly ruling (DOJ v. Google, August 2024) compounds regulatory exposure.",
      "DEI rollback coincided directly with Trump January 2025 executive order affecting federal contractors.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "High",
    revolvingDoorDetail: "Multiple former Google policy leads now hold positions at FTC, FCC, and White House OSTP. Company hires ex-DOJ officials for antitrust lobbying.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Google PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/google-inc/C00428623/summary/2024" },
      { text: "OpenSecrets \u2014 Google Lobbying", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?id=D000067823" },
    ],
    notableConnections: [
      "PAC donated to members on both Judiciary and Commerce committees overseeing tech regulation.",
      "53% of lobbying spend in 2024 directed at AI regulation \u2014 pushing for federal preemption of state-level AI laws.",
      "8 external lobbying firms retained in 2024, spending $14.9M.",
      "Former Google policy leads now holding positions at FTC, FCC, and White House OSTP.",
      "Board interlocks: Stanford University (multiple board members hold faculty/trustee positions).",
    ],
    patternsAnalysis: "Bipartisan PAC/lobbying supports federal contracts; DEI scaled back post-Trump January 2025 executive order; heavy lobbying on AI regulation/antitrust ($14M+/yr), hires ex-DOJ; patterns: policy compliance for contracts, revolving door influence.",
    keyFindings: [
      "Bipartisan PAC spending strategically positioned to maintain federal contract relationships across administrations.",
      "AI lobbying spend ($14.9M) and revolving door hires create direct influence on regulation that affects Google\u2019s core business.",
      "DEI rollback is functionally a compliance move driven by federal contract requirements, not an organic policy decision.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $1.9M in 2023\u20132024", finding: "50.47% to Republicans", status: "confirmed" },
    { category: "Lobbying: $14.9M (2024)", finding: "Focused on AI regulation, antitrust", status: "confirmed" },
    { category: "Diversity reports stopped after 11 years", finding: "Last published: 2022 data", status: "confirmed" },
    { category: "DEI hiring goals eliminated Feb 2025", finding: "30% leadership target dropped", status: "confirmed" },
    { category: "25,000+ layoffs (2023\u20132025)", finding: "Net headcount stable due to AI hiring", status: "confirmed" },
    { category: "Active DoD/GSA contracts ($200M+)", finding: "AI/cloud federal contractor", status: "confirmed" },
    { category: "DOJ antitrust monopoly ruling (Aug 2024)", finding: "Illegal monopoly in search", status: "confirmed" },
    { category: "HRC CEI Score: 100 (pre-2025)", finding: "Post-DEI rollback status unclear", status: "data-gap" },
    { category: "ADF Viewpoint Diversity Score: 12%", finding: "2025 index", status: "confirmed" },
    { category: "Revolving door: ex-Google at FTC, FCC, OSTP", finding: "Policy influence pipeline", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Google PAC 2023\u20132024", url: "https://www.opensecrets.org/political-action-committees-pacs/google-inc/C00428623/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets Lobbying", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?id=D000067823" }] },
    { label: "DEI Rollback", links: [{ text: "CNBC, February 2025", url: "https://www.cnbc.com/2025/02/05/google-scraps-diversity-aspirations-as-a-federal-contractor.html" }, { text: "SAN.com", url: "https://san.com/cc/google-drops-diversity-pledge-shifts-dei-hiring-strategy/" }] },
    { label: "Layoffs", links: [{ text: "AI Loss Tracker", url: "https://ailoss.co/layoffs/google-layoffs-2023-onwards/" }] },
    { label: "Federal Contracts", links: [{ text: "Google Cloud DoD", url: "https://cloud.google.com/blog/topics/public-sector/google-public-sector-awarded-200-million-contract-to-accelerate-ai-and-cloud-capabilities-across-department-of-defenses-chief-digital-and-artificial-intelligence-office-cdao" }] },
  ],
};

// ---------------------------------------------------------------------------
// Amazon
// ---------------------------------------------------------------------------

export const AMAZON_REPORT: CompanyReportData = {
  slug: "amazon",
  companyName: "AMAZON.COM, INC.",
  ticker: "NASDAQ: AMZN",
  location: "Seattle, WA",
  products: "AWS, Marketplace, Prime, Alexa, Whole Foods",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$1.58M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$19.1M", detail: "2024 total" },
    { label: "WARN Filings", value: "4,500+", detail: "WA state 2025\u20132026" },
    { label: "HRC Score", value: "100", detail: "Pre-2025; status unclear", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We strive to be Earth\u2019s most customer-centric company.", source: "Amazon Leadership Principles, aboutamazon.com" },
      { text: "Diversity and inclusion are good for business \u2014 and more fundamentally \u2014 simply right.", source: "Amazon DEI page, 2023 (removed)" },
    ],
    missionSourceUrl: "https://www.aboutamazon.com/about-us",
    diversityNote: "Amazon eliminated explicit hiring quotas, dissolved certain DEI roles and programs, and removed diversity references from its 2024 annual report. The company shifted to \u2018inclusive leadership\u2019 training amid legal pressures and Trump administration executive orders.",
    pacName: "AMAZON.COM INC. PAC",
    fecId: "C00360354",
    pacSummary: [
      { metric: "Total Raised", amount: "$1,583,307" },
      { metric: "% to Republicans (candidates)", amount: "49.44%", color: "red" },
      { metric: "% to Democrats (candidates)", amount: "50.56%", color: "blue" },
      { metric: "% to Republican PACs/parties", amount: "58.4%", color: "red" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/amazon-com/C00360354/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Amazon PAC 2023\u20132024",
    pacAnalysis: "Amazon\u2019s PAC shows a split pattern: roughly even to candidates (50.56% Dem), but 58.4% Republican to PACs/parties. This dual approach supports bipartisan influence while tilting party-level support rightward.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$19,990,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$19,140,000", yoyChange: "-4.3%" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000023883" },
      { text: "OpenSecrets Lobbying 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000023883" },
    ],
    lobbyingAnalysis: "Amazon spent ~$19M annually on federal lobbying (2023\u20132024), focused on internet/AI regulation, antitrust, and labor issues. The company employs 132+ lobbyists with a 74% revolving door rate.",
    keyFindings: [
      "DEI page removed from public website; diversity references stripped from 2024 annual report.",
      "PAC candidate giving roughly balanced but party/PAC giving tilts 58.4% Republican.",
      "Lobbying spend ~$19M/yr focused on antitrust, AI regulation, and labor policy.",
      "DEI rollback coincides with Trump EO 14173 (Jan 2025) ending DEI preferences in federal contracts.",
    ],
  },

  laborImpact: {
    deiStatus: "Scaled back / integrated",
    deiDate: "December 2024",
    deiDetails: "Eliminated explicit hiring quotas, dissolved certain DEI roles and programs, removed diversity references from 2024 annual report; shifted to \u2018inclusive leadership\u2019 training and general policies amid legal pressures and Trump admin EO (January 2025).",
    deiSourceUrls: [
      { text: "Diversity.com DEI Update", url: "https://diversity.com/post/amazon-dei-rollback-impact-updates-2025" },
      { text: "HR Consulting DEI EO", url: "https://www.hr-consulting-group.com/hr-news/the-state-of-dei-programs" },
    ],
    programChanges: [
      { program: "Explicit hiring quotas", status: "Eliminated", badgeColor: "red" },
      { program: "DEI-specific roles", status: "Dissolved", badgeColor: "red" },
      { program: "Diversity references in annual report", status: "Removed", badgeColor: "red" },
      { program: "DEI public web page", status: "Removed", badgeColor: "red" },
      { program: "Inclusive leadership training", status: "Replaced DEI programs" },
    ],
    layoffTimeline: [
      { date: "Nov 2022\u2013Mar 2023", dotColor: "red", title: "27,000 layoffs across two major waves", description: "First wave (Nov 2022): 18,000 employees. Second wave (Mar 2023): 9,000 additional cuts in AWS, Twitch, advertising, PXT." },
      { date: "2024", dotColor: "muted", title: "Smaller rounds: hundreds in AWS, advertising", description: "Continued targeted restructuring across business units." },
      { date: "Oct 2025", dotColor: "red", title: "~14,000 + up to 30,000 targeted corporate", description: "Major corporate layoffs announced; WARN filed for 2,303 in Washington state.", sourceUrl: "https://www.geekwire.com/2026/amazon-confirms-16000-more-job-cuts-bringing-total-layoffs-to-30000-since-october/", sourceLabel: "GeekWire" },
      { date: "Jan 2026", dotColor: "red", title: "16,000 additional cuts (total 30K since Oct 2025)", description: "WARN filed for 2,198 in Washington state. Total since October 2025: ~30,000.", sourceUrl: "https://www.geekwire.com/2026/amazon-confirms-16000-more-job-cuts-bringing-total-layoffs-to-30000-since-october/", sourceLabel: "GeekWire, 2026" },
      { date: "Mar 2026", dotColor: "amber", title: "~100 robotics division", description: "Additional small-round cuts in robotics division." },
    ],
    totalLayoffs: ">100,000 total layoffs from 2022\u20132026 across all divisions. Corporate cuts of 30,000 since October 2025 represent the most recent wave.",
    warnFilings: [
      { location: "Washington state", employees: "2,303", noticeDate: "10/2025", layoffDate: "12/2025" },
      { location: "Washington state", employees: "2,198", noticeDate: "01/2026", layoffDate: "03/2026" },
    ],
    warnSourceUrl: "https://www.geekwire.com/2026/amazon-confirms-16000-more-job-cuts-bringing-total-layoffs-to-30000-since-october/",
    warnSourceLabel: "GeekWire \u2014 Amazon Layoffs 2026",
    warnTotal: "Multiple WARN filings in WA state: 2,303 (Oct 2025), 2,198 (Jan 2026). Total WARN-tracked: 4,500+.",
    keyFindings: [
      "100,000+ employees laid off from 2022\u20132026; 30,000 corporate since October 2025 alone.",
      "DEI programs \u2018wound down\u2019 internally in December 2024; public DEI page removed.",
      "WARN filings track 4,500+ employees in Washington state (2025\u20132026).",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor",
    federalContracts: [
      { contract: "47QTCA19D000C", agency: "GSA", amount: "$1B+ discounts", description: "AWS GovCloud services for federal agencies through 2028" },
    ],
    contractSourceUrls: [
      { text: "GSA eLibrary \u2014 AWS", url: "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=47QTCA19D000C&contractorName=AMAZON+WEB+SERVICES%2C+INC.&executeQuery=YES" },
    ],
    contractAnalysis: "Amazon is the largest federal cloud contractor in tech. AWS GovCloud is critical infrastructure for federal agencies. Contract status creates direct compliance pressure on DEI under federal executive orders.",
    hrcScore: "100",
    hrcDetail: "Perfect score in 2023\u20132024 HRC Corporate Equality Index. Status for 2025\u20132026 unclear following DEI rollback.",
    hrcSourceUrls: [],
    additionalFindings: [
      "OSHA cited Amazon 17 times for warehouse safety violations (2022\u20132024), including ergonomic hazards and pace-of-work injuries.",
      "Injury rates at Amazon warehouses documented as 2\u00d7 industry average per Strategic Organizing Center annual reports.",
      "FTC antitrust complaint filed September 2023, alleging monopoly maintenance practices.",
      "Amazon Labor Union (ALU) won historic election at Staten Island JFK8; ongoing organizing at multiple warehouses.",
    ],
    keyFindings: [
      "Largest federal cloud contractor creates maximum compliance pressure on DEI and labor policy.",
      "Warehouse safety record (17 OSHA citations, 2\u00d7 injury rate) presents ongoing risk.",
      "FTC antitrust complaint (2023) + federal contract dependence = dual regulatory exposure.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "74%+",
    revolvingDoorDetail: "74%+ of Amazon\u2019s 132 lobbyists in 2023 were former government officials (revolving door).",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Amazon Lobbyists 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=D000023883" },
    ],
    notableConnections: [
      "132 lobbyists retained in 2023; ~$20M annual lobbying on internet/AI issues.",
      "Partnerships with Trump administration on AI infrastructure (U.S. Tech Force 2025).",
      "PAC contributions to Commerce and Labor committee members across both parties.",
      "Former Amazon executives serving on federal advisory boards for commerce and logistics.",
      "DEI rollback coincides with EO 14173 (Jan 2025) ending DEI preferences in federal contracting.",
    ],
    patternsAnalysis: "Heavy revolving door (74%+), $20M annual lobbying, and strategic partnerships with the Trump administration on AI create a mutually reinforcing influence system: federal contracts drive lobbying, lobbying shapes regulation, regulation shapes contract terms.",
    keyFindings: [
      "74%+ revolving door rate among 132 lobbyists creates deep federal influence pipeline.",
      "DEI rollback is functionally a contract compliance decision driven by EO 14173.",
      "U.S. Tech Force 2025 partnership positions Amazon as a political ally, not just a vendor.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $1.58M in 2023\u20132024", finding: "Split: 50.56% Dem candidates, 58.4% Rep PACs", status: "confirmed" },
    { category: "Lobbying: $19.1M (2024)", finding: "132 lobbyists, 74% revolving door", status: "confirmed" },
    { category: "DEI programs wound down Dec 2024", finding: "Public DEI page removed", status: "confirmed" },
    { category: "100,000+ total layoffs (2022\u20132026)", finding: "30,000 corporate since Oct 2025", status: "confirmed" },
    { category: "WARN: 4,500+ in WA (2025\u20132026)", finding: "2,303 + 2,198 filings", status: "confirmed" },
    { category: "Active GSA/AWS federal contractor", finding: "$1B+ in agency discounts through 2028", status: "confirmed" },
    { category: "OSHA: 17 warehouse safety citations", finding: "2\u00d7 industry injury rate", status: "confirmed" },
    { category: "HRC CEI: 100 (pre-2025)", finding: "Post-DEI status unclear", status: "data-gap" },
    { category: "FTC antitrust complaint (Sep 2023)", finding: "Monopoly maintenance allegations", status: "confirmed" },
    { category: "Amazon Labor Union organizing", finding: "Multiple warehouse elections", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Amazon PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/amazon-com/C00360354/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000023883" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000023883" }] },
    { label: "DEI Rollback", links: [{ text: "Diversity.com", url: "https://diversity.com/post/amazon-dei-rollback-impact-updates-2025" }, { text: "HR Consulting Group", url: "https://www.hr-consulting-group.com/hr-news/the-state-of-dei-programs" }] },
    { label: "Layoffs 2026", links: [{ text: "GeekWire", url: "https://www.geekwire.com/2026/amazon-confirms-16000-more-job-cuts-bringing-total-layoffs-to-30000-since-october/" }] },
    { label: "Federal Contracts", links: [{ text: "GSA eLibrary \u2014 AWS", url: "https://www.gsaelibrary.gsa.gov/ElibMain/home.do/contractorInfo.do?contractNumber=47QTCA19D000C&contractorName=AMAZON+WEB+SERVICES%2C+INC.&executeQuery=YES" }] },
    { label: "Lobbyists", links: [{ text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=D000023883" }] },
  ],
};

// ---------------------------------------------------------------------------
// Microsoft
// ---------------------------------------------------------------------------

export const MICROSOFT_REPORT: CompanyReportData = {
  slug: "microsoft",
  companyName: "MICROSOFT CORPORATION",
  ticker: "NASDAQ: MSFT",
  location: "Redmond, WA",
  products: "Windows, Azure, Office 365, Teams, Xbox, LinkedIn",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$2.06M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$10.4M", detail: "2024 total" },
    { label: "WARN Filings", value: "55", detail: "2004\u20132025 (17K affected)" },
    { label: "HRC Score", value: "100", detail: "Since 2005" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "Our mission is to empower every person and every organization on the planet to achieve more.", source: "Microsoft Mission Statement, microsoft.com" },
      { text: "We\u2019re committed to creating a diverse and inclusive environment for our employees, customers, and communities.", source: "Microsoft D&I Report, 2024" },
    ],
    missionSourceUrl: "https://www.microsoft.com/en-us/about",
    diversityNote: "Microsoft published annual D&I reports through 2024 but announced in November 2025 it would not publish a traditional diversity report. The company also removed DEI from performance reviews and eliminated 2 DEI roles in summer 2024 as \u2018redundant.\u2019",
    pacName: "MICROSOFT CORPORATION PAC",
    fecId: "C00227546",
    pacSummary: [
      { metric: "Total Raised", amount: "$2,061,317" },
      { metric: "% to Republicans", amount: "53%", color: "red" },
      { metric: "% to Democrats", amount: "45%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/microsoft-corp/C00227546/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Microsoft PAC 2023\u20132024",
    pacAnalysis: "Microsoft\u2019s PAC tilted 53% Republican in the 2023\u20132024 cycle. This slight Republican lean aligns with the company\u2019s significant federal contract portfolio.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$10,500,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$10,400,000", yoyChange: "-1%" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000115" },
      { text: "OpenSecrets Lobbying 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000115" },
    ],
    lobbyingAnalysis: "Microsoft lobbied on AI/NDAA bills 19 times (KOSA), maintaining $10M+ annual spend. 75% of lobbyists are revolving door hires. 13 Biden administration officials were former Microsoft employees.",
    keyFindings: [
      "No traditional diversity report published for 2025 (announced November 2025).",
      "DEI removed from performance reviews; 2 DEI roles eliminated summer 2024.",
      "PAC 53% Republican aligns with major federal contract positioning.",
      "75% revolving door lobbyists; 13 Biden officials ex-Microsoft.",
    ],
  },

  laborImpact: {
    deiStatus: "Scaled back",
    deiDate: "November 2025",
    deiDetails: "Removed DEI from performance reviews (November 2025); no annual D&I report for 2025 (announced November 2025); 2 DEI roles eliminated summer 2024 as \u2018redundant.\u2019",
    deiSourceUrls: [
      { text: "ESG Dive, Nov 2025", url: "https://www.esgdive.com/news/microsoft-ditches-publishing-traditional-diversity-and-inclusion-report-t/806441/" },
      { text: "Microsoft D&I Report 2024", url: "https://www.microsoft.com/en-us/diversity/inside-microsoft/annual-report" },
    ],
    programChanges: [
      { program: "DEI in performance reviews", status: "Removed", badgeColor: "red" },
      { program: "Annual D&I report (published since 2014)", status: "Discontinued for 2025", badgeColor: "red" },
      { program: "Dedicated DEI roles (2 positions)", status: "Eliminated summer 2024", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "2023", dotColor: "red", title: "~10,000 employees laid off", description: "Broad restructuring across divisions." },
      { date: "2024", dotColor: "red", title: "~3,000 gaming division cuts", description: "Post-Activision Blizzard acquisition restructuring." },
      { date: "May 2025", dotColor: "red", title: "6,000 employees", description: "Continued efficiency-driven reductions." },
      { date: "Jul 2025", dotColor: "red", title: "9,000 employees", description: "Largest single wave; affected multiple divisions." },
    ],
    totalLayoffs: "~35,000+ total layoffs from 2023\u20132025 across all divisions, driven by AI reallocation and post-acquisition restructuring.",
    warnFilings: [
      { location: "Multiple states", employees: "17,000+ (55 notices)", noticeDate: "2004\u20132025", layoffDate: "Various" },
    ],
    warnSourceUrl: "https://www.warntracker.com/company/microsoft",
    warnSourceLabel: "WARN Tracker \u2014 Microsoft",
    warnTotal: "55 WARN notices filed from 2004\u20132025, affecting 17,000+ total employees. Many concentrated in 2023\u20132025.",
    keyFindings: [
      "35,000+ employees laid off in 2023\u20132025 while simultaneously investing billions in AI infrastructure.",
      "DEI program changes framed as \u2018operational efficiency\u2019 rather than political pressure response.",
      "55 WARN notices tracking 17,000+ affected workers across multiple states.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor",
    federalContracts: [
      { contract: "JWCC", agency: "Department of Defense", amount: "Multi-billion", description: "Joint Warfighting Cloud Capability" },
      { contract: "OneGov", agency: "GSA", amount: "$6B+ savings", description: "Enterprise licensing deal for federal agencies (2025\u20132026)" },
    ],
    contractSourceUrls: [
      { text: "USASpending \u2014 Microsoft", url: "https://www.usaspending.gov/recipient/dd77b7c3-663e-cb91-229f-5766a50e9b7f-P/all" },
    ],
    contractAnalysis: "Microsoft is one of the largest federal IT contractors. The JWCC cloud contract and $6B+ OneGov enterprise deal create massive dependency between the company and federal agencies.",
    hrcScore: "100/100",
    hrcDetail: "Perfect score on HRC Corporate Equality Index since 2005 (through 2024 report).",
    hrcSourceUrls: [
      { text: "Microsoft D&I Report 2024", url: "https://www.microsoft.com/en-us/diversity/inside-microsoft/annual-report" },
    ],
    additionalFindings: [
      "Supports U.S. AI leadership positioning vs. China as key policy argument for favorable regulation.",
    ],
    keyFindings: [
      "Multi-billion federal contract portfolio (JWCC, OneGov $6B+) creates strong compliance incentive for DEI policy shifts.",
      "HRC 100/100 score maintained since 2005, but D&I report discontinued for 2025.",
      "Federal contract dependency positions Microsoft to align with administration priorities regardless of party.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "75%",
    revolvingDoorDetail: "75% of Microsoft\u2019s lobbyists are revolving door hires. 13 Biden administration officials were former Microsoft employees.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Microsoft Lobbyists", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=d000000115" },
      { text: "Politico Revolving Door", url: "https://www.politico.com/newsletters/politico-influence/2023/07/05/the-revolving-door-between-microsoft-and-the-biden-administration-00104786" },
    ],
    notableConnections: [
      "13 Biden administration officials were former Microsoft employees (Politico, July 2023).",
      "Lobbied AI/NDAA bills 19 times including KOSA (Kids Online Safety Act).",
      "PAC slight Republican lean aligns with federal contract positioning.",
    ],
    patternsAnalysis: "75% revolving door rate and 13 ex-employees in Biden administration demonstrate systematic talent-pipeline influence. Combined with multi-billion contracts, Microsoft has built institutional relationships that persist across administrations.",
    keyFindings: [
      "13 Biden officials ex-Microsoft represents one of the deepest revolving door pipelines in tech.",
      "PAC spending and lobbying strategically aligned with federal contract portfolio.",
      "DEI policy shifts track administration changes, confirming compliance-driven approach.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $2.06M in 2023\u20132024", finding: "53% to Republicans", status: "confirmed" },
    { category: "Lobbying: $10.4M (2024)", finding: "75% revolving door lobbyists", status: "confirmed" },
    { category: "D&I report discontinued for 2025", finding: "Published annually since 2014", status: "confirmed" },
    { category: "DEI removed from performance reviews", finding: "November 2025", status: "confirmed" },
    { category: "35,000+ layoffs (2023\u20132025)", finding: "AI reallocation + post-acquisition", status: "confirmed" },
    { category: "55 WARN notices (2004\u20132025)", finding: "17,000+ affected employees", status: "confirmed" },
    { category: "Active major federal contractor", finding: "JWCC, OneGov $6B+", status: "confirmed" },
    { category: "HRC CEI: 100/100 since 2005", finding: "Through 2024 report", status: "confirmed" },
    { category: "13 Biden officials ex-Microsoft", finding: "Revolving door pipeline", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Microsoft PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/microsoft-corp/C00227546/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000115" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000115" }] },
    { label: "DEI Changes", links: [{ text: "ESG Dive, Nov 2025", url: "https://www.esgdive.com/news/microsoft-ditches-publishing-traditional-diversity-and-inclusion-report-t/806441/" }] },
    { label: "WARN Filings", links: [{ text: "WARN Tracker", url: "https://www.warntracker.com/company/microsoft" }] },
    { label: "Federal Contracts", links: [{ text: "USASpending", url: "https://www.usaspending.gov/recipient/dd77b7c3-663e-cb91-229f-5766a50e9b7f-P/all" }] },
    { label: "Revolving Door", links: [{ text: "Politico, July 2023", url: "https://www.politico.com/newsletters/politico-influence/2023/07/05/the-revolving-door-between-microsoft-and-the-biden-administration-00104786" }, { text: "OpenSecrets Lobbyists", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=d000000115" }] },
  ],
};

// ---------------------------------------------------------------------------
// Boeing
// ---------------------------------------------------------------------------

export const BOEING_REPORT: CompanyReportData = {
  slug: "boeing",
  companyName: "THE BOEING COMPANY",
  ticker: "NYSE: BA",
  location: "Arlington, VA",
  products: "Commercial Airplanes, Defense & Space, Global Services",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$5.42M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$11.9M", detail: "2024 total" },
    { label: "WARN Filings", value: "593", detail: "1990\u20132025" },
    { label: "HRC Score", value: "100", detail: "2023\u20132025" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We connect and protect people around the world every day. And we do it with some of the most advanced technologies, services, and talent available.", source: "Boeing Values, boeing.com" },
      { text: "We value human life and well-being above all else and take action accordingly.", source: "Boeing Code of Conduct" },
    ],
    missionSourceUrl: "https://www.boeing.com/company/general-info",
    diversityNote: "Boeing dismantled its global DEI department in October 2024, merging staff into the HR talent team. VP of Global Equity, Diversity & Inclusion Sara Liang Bowen departed October 31, 2024. Further DEI programs suspended June 2025.",
    pacName: "BOEING COMPANY PAC",
    fecId: "C00142711",
    pacSummary: [
      { metric: "Total Raised", amount: "$5,420,306" },
      { metric: "% to Republicans", amount: "62%", color: "red" },
      { metric: "% to Democrats", amount: "37%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/boeing-co/C00142711/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Boeing PAC 2023\u20132024",
    pacAnalysis: "Boeing\u2019s PAC is one of the largest corporate PACs, heavily tilting Republican (62%). This aligns with the company\u2019s dependency on defense contracts (~40% of 2023 revenue from DoD).",
    lobbyingYears: [
      { year: "2023", totalSpent: "$14,490,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$11,930,000", yoyChange: "-17.7%", changeColor: "red" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000100" },
    ],
    lobbyingAnalysis: "Boeing\u2019s $11.9M lobbying spend in 2024 declined from $14.5M in 2023, possibly reflecting reputational damage from safety crises. 72% of lobbyists are revolving door hires, including former Senator Trent Lott.",
    keyFindings: [
      "Global DEI department dismantled October 2024; VP Sara Liang Bowen departed.",
      "PAC raised $5.42M \u2014 62% to Republicans, one of the largest corporate PACs.",
      "~40% of 2023 revenue from Department of Defense contracts.",
      "Lobbying declined 17.7% amid safety crisis reputational damage.",
    ],
  },

  laborImpact: {
    deiStatus: "Dismantled",
    deiDate: "October 2024",
    deiDetails: "Global DEI department dismantled October 2024, staff merged into HR talent team. VP Sara Liang Bowen departed October 31, 2024. Additional DEI programs suspended June 2025.",
    deiSourceUrls: [
      { text: "Bloomberg, Oct 2024", url: "https://www.bloomberg.com/news/articles/2024-10-31/boeing-dismantles-diversity-team-as-pressure-builds-on-new-ceo" },
    ],
    programChanges: [
      { program: "Global DEI department", status: "Dismantled", badgeColor: "red" },
      { program: "VP Global Equity, Diversity & Inclusion", status: "Role eliminated; Sara Liang Bowen departed", badgeColor: "red" },
      { program: "DEI staff", status: "Merged into HR talent team", badgeColor: "red" },
      { program: "Additional DEI programs", status: "Suspended June 2025", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "Oct\u2013Nov 2024", dotColor: "red", title: "17,000 announced (10% of workforce)", description: "Massive restructuring driven by production delays, safety crises, and financial pressure." },
      { date: "Jan 2025", dotColor: "red", title: "2,200 in Washington state", description: "WARN notices filed for Washington facilities." },
      { date: "Feb 2025", dotColor: "muted", title: "400 additional in Washington", description: "Continued reductions in Puget Sound operations." },
      { date: "Feb 2026", dotColor: "muted", title: "300 defense division", description: "Defense & Space segment reductions." },
    ],
    totalLayoffs: "~25,000+ total layoffs announced from 2024\u20132026. Initial 17,000 represented 10% of the entire workforce.",
    warnFilings: [
      { location: "Multiple states", employees: "593 filings total", noticeDate: "1990\u20132025", layoffDate: "Various" },
      { location: "Washington state", employees: "2,200", noticeDate: "01/2025", layoffDate: "03/2025" },
    ],
    warnSourceUrl: "https://www.warntracker.com/company/boeing",
    warnSourceLabel: "WARN Tracker \u2014 Boeing",
    warnTotal: "593 total WARN notices from 1990\u20132025, with heavy concentration in 2024\u20132025.",
    keyFindings: [
      "25,000+ layoffs from 2024\u20132026, driven by production/safety crises, not just efficiency.",
      "DEI department dismantled amid overlapping safety, production, and executive pressures.",
      "593 WARN notices over 35 years, with highest recent concentration during safety crisis.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor (~40% revenue)",
    federalContracts: [
      { contract: "E-4B / F-15", agency: "Department of Defense", amount: "$12.8B", description: "December 2025 DoD award for E-4B and F-15 programs" },
      { contract: "KC-46", agency: "Department of Defense", amount: "$2.47B", description: "KC-46 tanker program (2025)" },
    ],
    contractSourceUrls: [
      { text: "Yahoo Finance \u2014 Boeing DoD 2026", url: "https://finance.yahoo.com/news/just-time-2026-boeing-wins-102500939.html" },
    ],
    contractAnalysis: "Boeing is one of the largest defense contractors globally, with ~40% of 2023 revenue from DoD. Defense dependency creates strong institutional pressure to align with administration priorities.",
    hrcScore: "100/100",
    hrcDetail: "Perfect score on HRC Corporate Equality Index through 2025, per 1792 Exchange.",
    hrcSourceUrls: [
      { text: "1792 Exchange \u2014 Boeing", url: "https://1792exchange.com/pdf/?c_id=989" },
    ],
    additionalFindings: [
      "Multiple NTSB investigations into 737 MAX safety failures (2018\u20132024).",
      "Department of Justice plea agreement over 737 MAX crashes (January 2021).",
      "Ongoing whistleblower cases regarding production quality at Renton and Everett facilities.",
    ],
    keyFindings: [
      "$15B+ in DoD contracts in 2025 alone creates total dependency on federal relationship.",
      "Safety crisis (NTSB investigations, DOJ plea) compounds pressure on corporate governance.",
      "DEI dismantlement amid safety crisis raises questions about priorities and resource allocation.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "72%",
    revolvingDoorDetail: "72% of Boeing\u2019s lobbyists in 2023 were former government officials, including former Senator Trent Lott (at Crossroads Strategies).",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Boeing Lobbyists 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=d000000100" },
    ],
    notableConnections: [
      "Hired former Deputy Secretary of State Steven Biegun as SVP Global Policy (2023).",
      "Former Senator Trent Lott lobbies for Boeing through Crossroads Strategies.",
      "Heavy defense lobbying aligns with multi-billion-dollar DoD/NASA contracts.",
      "DEI dismantled amid judicial scrutiny over safety/compliance failures.",
      "PAC 62% Republican lean aligns with defense spending priorities.",
    ],
    patternsAnalysis: "Boeing\u2019s revolving door (72%), Republican-leaning PAC (62%), and massive defense contracts create a circular dependency: contracts fund lobbying, lobbying secures contracts, and policy compliance shapes corporate decisions including DEI.",
    keyFindings: [
      "72% revolving door rate + former Deputy Secretary of State hire demonstrate deep government influence.",
      "PAC/lobbying spending strategically aligned with defense contract requirements.",
      "DEI dismantlement during safety crisis suggests compliance-driven prioritization over workplace culture.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $5.42M in 2023\u20132024", finding: "62% to Republicans", status: "confirmed" },
    { category: "Lobbying: $11.9M (2024)", finding: "72% revolving door lobbyists", status: "confirmed" },
    { category: "Global DEI department dismantled Oct 2024", finding: "VP Sara Liang Bowen departed", status: "confirmed" },
    { category: "25,000+ layoffs (2024\u20132026)", finding: "10% workforce reduction announced", status: "confirmed" },
    { category: "593 WARN notices (1990\u20132025)", finding: "Heavy concentration 2024\u20132025", status: "confirmed" },
    { category: "Active major DoD contractor (~40% revenue)", finding: "$12.8B + $2.47B in 2025 alone", status: "confirmed" },
    { category: "HRC CEI: 100/100 through 2025", finding: "Per 1792 Exchange", status: "confirmed" },
    { category: "NTSB/DOJ safety investigations", finding: "737 MAX + production quality", status: "confirmed" },
    { category: "Former Deputy Sec. State Biegun hired", finding: "SVP Global Policy 2023", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Boeing PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/boeing-co/C00142711/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000100" }] },
    { label: "DEI Dismantlement", links: [{ text: "Bloomberg, Oct 2024", url: "https://www.bloomberg.com/news/articles/2024-10-31/boeing-dismantles-diversity-team-as-pressure-builds-on-new-ceo" }] },
    { label: "WARN Filings", links: [{ text: "WARN Tracker", url: "https://www.warntracker.com/company/boeing" }] },
    { label: "DoD Contracts", links: [{ text: "Yahoo Finance 2026", url: "https://finance.yahoo.com/news/just-time-2026-boeing-wins-102500939.html" }] },
    { label: "Lobbyists", links: [{ text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2023&id=d000000100" }] },
    { label: "HRC Score", links: [{ text: "1792 Exchange", url: "https://1792exchange.com/pdf/?c_id=989" }] },
  ],
};

// ---------------------------------------------------------------------------
// Booz Allen Hamilton
// ---------------------------------------------------------------------------

export const BOOZ_ALLEN_REPORT: CompanyReportData = {
  slug: "booz-allen-hamilton",
  companyName: "BOOZ ALLEN HAMILTON HOLDING CORP.",
  ticker: "NYSE: BAH",
  location: "McLean, VA",
  products: "Management Consulting, IT, Defense/Intel Analytics",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$360K", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$1.67M", detail: "2024 total" },
    { label: "Layoffs", value: "~7,400+", detail: "2025\u20132026" },
    { label: "HRC Score", value: "100\u2192Withdrew", detail: "Post-DEI dismantle", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We empower people to change the world.", source: "Booz Allen Hamilton Careers, boozallen.com" },
      { text: "We believe that fostering a diverse and inclusive workplace is essential to driving innovation and delivering the best outcomes for our clients.", source: "Booz Allen Hamilton D&I page (pre-2025)" },
    ],
    missionSourceUrl: "https://www.boozallen.com/about.html",
    diversityNote: "Booz Allen closed its entire DEI department in February 2025, ended all programs, removed diversity goals for employees/executives, eliminated DEI references from communications/training, and banned non-birth pronouns/bathrooms per agency rules \u2014 all in response to Trump executive orders to retain federal contracts.",
    pacName: "BOOZ ALLEN HAMILTON PAC",
    fecId: "C00709816",
    pacSummary: [
      { metric: "Total Raised", amount: "$359,654" },
      { metric: "% to Republicans", amount: "53.94%", color: "red" },
      { metric: "% to Democrats", amount: "44.13%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/booz-allen-hamilton/C00709816/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Booz Allen PAC 2023\u20132024",
    pacAnalysis: "Booz Allen\u2019s PAC tilts slightly Republican (53.94%), consistent with a company that derives 98% of revenue from government contracts. Bipartisan giving hedges across administrations.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$620,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$1,670,000", yoyChange: "+169%", changeColor: "red" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobby 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2024&id=D000032046" },
      { text: "OpenSecrets Lobby 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000032046" },
    ],
    lobbyingAnalysis: "Lobbying spend surged 169% from 2023 to 2024 ($620K to $1.67M), potentially driven by increased federal contract competition and policy shifts. Lobbied on NDAA, DHS/DoD appropriations, and AI bills.",
    keyFindings: [
      "Entire DEI department closed February 2025 in direct response to Trump executive orders.",
      "98% of revenue from government contracts creates total dependency on federal compliance.",
      "Lobbying spend surged 169% year-over-year (2023\u20132024).",
      "WorldPride sponsorship withdrawn post-DEI closure.",
    ],
  },

  laborImpact: {
    deiStatus: "Dismantled",
    deiDate: "February 2025",
    deiDetails: "Closed DEI department, ended all programs, removed diversity goals, eliminated DEI references in communications/training, banned non-birth pronouns/bathrooms per agency rules. Announced by Chief People Officer Aimee George Leary in company town hall.",
    deiSourceUrls: [
      { text: "Bloomberg, Feb 2025", url: "https://www.bloomberg.com/news/articles/2025-02-07/booz-allen-scraps-dei-programs-in-reaction-to-trump-orders" },
      { text: "The Advocate \u2014 WorldPride", url: "https://www.advocate.com/news/booz-allen-hamilton-worldpride-sponsorship" },
      { text: "USA Today", url: "https://www.usatoday.com/story/money/2025/12/09/trump-dei-rollback-list-backlash/87457060007/" },
    ],
    programChanges: [
      { program: "DEI department (entire)", status: "Closed", badgeColor: "red" },
      { program: "All DEI programs", status: "Ended", badgeColor: "red" },
      { program: "Diversity goals (employees/executives)", status: "Removed", badgeColor: "red" },
      { program: "DEI references in comms/training", status: "Eliminated", badgeColor: "red" },
      { program: "Non-birth pronoun/bathroom policies", status: "Banned per agency rules", badgeColor: "red" },
      { program: "WorldPride sponsorship", status: "Withdrawn", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "May\u2013Jun 2025", dotColor: "red", title: "~2,500 employees (7% of workforce)", description: "Mainly civil business division due to contract slowdowns.", sourceUrl: "https://www.reddit.com/r/cscareerquestions/comments/1ktrprg/booz_allen_lays_off_2500_employees/", sourceLabel: "Reddit/WSJ" },
      { date: "Oct 2025", dotColor: "red", title: "Additional senior exec + staff cuts", description: "Further reductions targeting $150M savings amid revenue decline.", sourceUrl: "https://virginiabusiness.com/booz-allen-hamilton-announces-new-round-of-layoffs/", sourceLabel: "Virginia Business" },
      { date: "Jan 2026", dotColor: "red", title: "2,500 more (~7% again)", description: "After Treasury canceled $21M in contracts over data breach by former employee Charles Littlejohn." },
    ],
    totalLayoffs: "~7,400+ total layoffs in 2025\u20132026, driven by contract slowdowns, revenue decline, and Treasury contract cancellation.",
    warnFilings: [],
    warnSourceUrl: "",
    warnSourceLabel: "",
    warnTotal: "No WARN filings found. Virginia-headquartered companies may use different reporting mechanisms.",
    keyFindings: [
      "7,400+ employees laid off in 2025\u20132026 \u2014 multiple waves tied to contract losses.",
      "Treasury canceled $21M in contracts after Charles Littlejohn data breach, triggering January 2026 layoffs.",
      "DEI closure is the most comprehensive in corporate America: banned pronouns, ended all programs, withdrew sponsorships.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor (98% revenue from gov)",
    federalContracts: [
      { contract: "FBI ITSSS-2 ECS", agency: "FBI", amount: "$94M", description: "SCOR-17 task order (2025)" },
    ],
    contractSourceUrls: [
      { text: "OrangeSlices \u2014 FBI Contract", url: "https://orangeslices.ai/booz-allen-hamilton-scores-94m-fbi-itsss-2-ecs-scor-17-task-win/" },
      { text: "Treasury Contract Cancellation", url: "https://home.treasury.gov/news/press-releases/sb0371" },
    ],
    contractAnalysis: "98% of revenue from government contracts makes Booz Allen the most government-dependent company in this report. Treasury contract cancellation ($21M) over the Littlejohn data breach demonstrates how security failures directly impact revenue.",
    hrcScore: "100 \u2192 Withdrew",
    hrcDetail: "Scored 100 on HRC CEI in prior years (90 in 2023\u201324, 100 earlier). Withdrew from surveys post-DEI dismantle.",
    hrcSourceUrls: [
      { text: "1792 Exchange \u2014 Booz Allen", url: "https://1792exchange.com/pdf/?c_id=1067" },
    ],
    additionalFindings: [
      "Charles Littlejohn (former employee) convicted of leaking IRS tax data, leading to Treasury contract cancellation.",
      "Edward Snowden was a former Booz Allen contractor, highlighting recurring insider security risk.",
    ],
    keyFindings: [
      "98% government revenue dependency means DEI closure was existential compliance, not optional.",
      "Treasury contract cancellation ($21M) over insider breach shows direct security\u2192revenue impact.",
      "Snowden + Littlejohn scandals highlight recurring insider risk for a company handling classified data.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "63%",
    revolvingDoorDetail: "63% of Booz Allen\u2019s 2024 lobbyists are former government officials, including firms like Akin Gump and Innovative Federal Strategies.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Booz Allen Lobbyists 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2024&id=D000032046" },
      { text: "OpenSecrets \u2014 Bills Lobbied", url: "https://www.opensecrets.org/orgs/booz-allen-hamilton/lobbying?id=D000032046" },
    ],
    notableConnections: [
      "Lobbied NDAA, DHS/DoD appropriations, AI bills (VET AI Act, Workforce for AI Trust Act).",
      "AI/tech leader for defense/intelligence community.",
      "PAC bipartisan but slight Republican lean (53.94%).",
      "DEI dismantle + layoffs tied to Trump-era contract risks/funding shifts.",
    ],
    patternsAnalysis: "Booz Allen demonstrates the clearest case of policy compliance driving corporate decisions: 98% revenue from government \u2192 Trump DEI EOs \u2192 total DEI closure \u2192 contract preservation. The Littlejohn/Snowden incidents show the other side: when compliance fails, contracts are lost.",
    keyFindings: [
      "63% revolving door rate enables direct influence on NDAA and intelligence community contracts.",
      "98% government dependency creates the most extreme compliance pressure of any company in this report.",
      "DEI closure\u2013contract preservation link is the clearest documented case of political compliance driving corporate policy.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $360K in 2023\u20132024", finding: "53.94% to Republicans", status: "confirmed" },
    { category: "Lobbying: $1.67M (2024)", finding: "+169% YoY increase", status: "confirmed" },
    { category: "DEI department closed Feb 2025", finding: "Most comprehensive corporate DEI closure", status: "confirmed" },
    { category: "WorldPride sponsorship withdrawn", finding: "Post-DEI closure", status: "confirmed" },
    { category: "~7,400+ layoffs (2025\u20132026)", finding: "Contract slowdowns + Treasury cancellation", status: "confirmed" },
    { category: "98% revenue from government contracts", finding: "Maximum federal dependency", status: "confirmed" },
    { category: "Treasury canceled $21M contracts", finding: "Littlejohn data breach", status: "confirmed" },
    { category: "HRC CEI: 100 \u2192 Withdrew", finding: "Post-DEI dismantle", status: "confirmed" },
    { category: "Non-birth pronoun/bathroom ban", finding: "Per agency rules", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Booz Allen PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/booz-allen-hamilton/C00709816/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2024&id=D000032046" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000032046" }] },
    { label: "DEI Closure", links: [{ text: "Bloomberg, Feb 2025", url: "https://www.bloomberg.com/news/articles/2025-02-07/booz-allen-scraps-dei-programs-in-reaction-to-trump-orders" }, { text: "The Advocate", url: "https://www.advocate.com/news/booz-allen-hamilton-worldpride-sponsorship" }] },
    { label: "Treasury Contracts", links: [{ text: "Treasury.gov", url: "https://home.treasury.gov/news/press-releases/sb0371" }] },
    { label: "FBI Contract", links: [{ text: "OrangeSlices", url: "https://orangeslices.ai/booz-allen-hamilton-scores-94m-fbi-itsss-2-ecs-scor-17-task-win/" }] },
  ],
};

// ---------------------------------------------------------------------------
// Accenture
// ---------------------------------------------------------------------------

export const ACCENTURE_REPORT: CompanyReportData = {
  slug: "accenture",
  companyName: "ACCENTURE PLC",
  ticker: "NYSE: ACN",
  location: "Dublin, Ireland (U.S. HQ: New York, NY)",
  products: "Consulting, Technology, Operations, Accenture Federal Services",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$175K", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$2.98M", detail: "2024 total" },
    { label: "Layoffs", value: "~50,000+", detail: "2023\u20132026" },
    { label: "HRC Score", value: "100\u2192Paused", detail: "16th year; paused 2025", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We embrace the power of change to create value and shared success for our clients, people, shareholders, partners and communities.", source: "Accenture Purpose, accenture.com" },
      { text: "Inclusion and diversity are fundamental to our culture and core values.", source: "Accenture I&D page, pre-2025" },
    ],
    missionSourceUrl: "https://www.accenture.com/us-en/about/company-index",
    diversityNote: "CEO Julie Sweet announced in February 2025 that Accenture would sunset its 2017 global diversity goals (described as \u2018largely achieved\u2019), end demographic-specific career programs, pause external diversity surveys, and stop using DEI criteria in performance evaluations \u2014 in response to U.S. political changes including Trump executive orders.",
    pacName: "ACCENTURE PAC",
    fecId: "C00300707",
    pacSummary: [
      { metric: "Total Raised", amount: "$175,476" },
      { metric: "% to Republicans", amount: "51.19%", color: "red" },
      { metric: "% to Democrats", amount: "48.81%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/accenture/C00300707/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Accenture PAC 2023\u20132024",
    pacAnalysis: "Accenture\u2019s PAC is relatively small but nearly 50/50 bipartisan (51.19% R). Employee donations lean Democratic. The near-even split reflects the company\u2019s global posture and federal contractor status.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$2,695,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$2,980,000", yoyChange: "+10.6%", changeColor: "amber" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000786" },
      { text: "OpenSecrets Lobbying 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000786" },
    ],
    lobbyingAnalysis: "Accenture\u2019s lobbying includes ag/FDA appropriations, AI/cyber/tax bills. 57% of lobbyists (32/56) are revolving door hires, including former Rep. Robert L. Livingston.",
    keyFindings: [
      "All 2017 diversity goals \u2018sunsetted\u2019 February 2025 \u2014 affecting 800,000+ employees globally.",
      "External diversity surveys paused; DEI removed from performance evaluations.",
      "Bipartisan PAC (51% R) with Democratic-leaning employee donations.",
      "57% revolving door lobbyists including former congressman.",
    ],
  },

  laborImpact: {
    deiStatus: "Scaled back / sunset",
    deiDate: "February 2025",
    deiDetails: "CEO Julie Sweet memo: sunsetting 2017 global diversity goals (described as \u2018largely achieved\u2019), ending demographic-specific career programs, pausing external diversity surveys, removing DEI from performance criteria. Framed as response to U.S. political changes including Trump EOs.",
    deiSourceUrls: [
      { text: "Fox Business, Feb 2025", url: "https://www.foxbusiness.com/politics/accenture-dropping-corporate-dei-policies" },
    ],
    programChanges: [
      { program: "2017 global diversity goals", status: "Sunset", badgeColor: "red" },
      { program: "Demographic-specific career programs", status: "Ended", badgeColor: "red" },
      { program: "External diversity surveys", status: "Paused", badgeColor: "amber" },
      { program: "DEI in performance evaluations", status: "Removed", badgeColor: "red" },
      { program: "HRC CEI participation (16th year)", status: "Paused 2025", badgeColor: "amber" },
    ],
    layoffTimeline: [
      { date: "Mar 2023", dotColor: "red", title: "19,000 employees announced", description: "18-month reduction focused on non-billable roles. $1.5B restructuring charge.", sourceUrl: "https://www.cnn.com/2023/03/23/business/accenture-job-cuts-19000", sourceLabel: "CNN, March 2023" },
      { date: "2024\u20132025", dotColor: "red", title: "22,000+ across two quarters", description: "Headcount dropped from 801K to 779K; $865M restructuring for AI reskilling.", sourceUrl: "https://www.linkedin.com/posts/ravi-teja-8b901164_accenture-job-cuts-clear-the-room-for-reskilling-activity-7385564250406170625-Z8GV", sourceLabel: "LinkedIn analysis" },
      { date: "Ongoing", dotColor: "amber", title: "AI-related bench/performance cuts", description: "Continuous restructuring tied to AI automation replacing consulting roles." },
    ],
    totalLayoffs: "~50,000+ total layoffs from 2023\u20132026. The largest consulting firm restructuring, driven by AI transformation and efficiency mandates.",
    warnFilings: [],
    warnSourceUrl: "",
    warnSourceLabel: "",
    warnTotal: "No WARN filings found. As an Ireland-headquartered global company, U.S. WARN requirements may apply differently.",
    keyFindings: [
      "50,000+ employees affected by layoffs (2023\u20132026) \u2014 largest consulting firm restructuring.",
      "DEI goals sunset affects 800,000+ employees globally across 120+ countries.",
      "Layoffs framed as \u2018AI reskilling\u2019 \u2014 replace human consultants with automation.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor",
    federalContracts: [
      { contract: "Cloud One", agency: "U.S. Air Force", amount: "$1.6B", description: "Cloud One task order via Accenture Federal Services (2024)" },
      { contract: "PEPFAR", agency: "State Department", amount: "$190M", description: "PEPFAR health program support (2024)" },
    ],
    contractSourceUrls: [
      { text: "Accenture Newsroom \u2014 Air Force Cloud One", url: "https://newsroom.accenture.com/news/2024/accenture-federal-services-wins-1-6-billion-u-s-air-force-cloud-one-task-order" },
      { text: "Accenture Federal Services", url: "https://www.accenture.com/us-en/industries/accenture-federal-services" },
    ],
    contractAnalysis: "Accenture Federal Services operates as a separate U.S. entity specifically for government work. Major contracts ($1.6B Air Force, $190M State Dept) create significant compliance pressure.",
    hrcScore: "100 (16th year; paused 2025)",
    hrcDetail: "Perfect score for 16 consecutive years on HRC CEI. Paused participation in 2025 following DEI rollback.",
    hrcSourceUrls: [],
    additionalFindings: [],
    keyFindings: [
      "$1.6B Air Force Cloud One contract demonstrates federal dependence through Accenture Federal Services.",
      "16 consecutive years of HRC 100 score, now paused \u2014 demonstrates reversal speed.",
      "Global company applying U.S. political pressure to worldwide DEI policies affecting 800K employees.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "57%",
    revolvingDoorDetail: "57% of Accenture\u2019s lobbyists (32/56) in 2024 are revolving door hires, including former Rep. Robert L. Livingston.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Accenture Lobbyists 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2024&id=D000000786" },
    ],
    notableConnections: [
      "Former Rep. Robert L. Livingston among revolving door lobbyists.",
      "Lobbied ag/FDA appropriations, AI/cybersecurity/tax bills.",
      "Bipartisan PAC near 50/50 but employee donations lean Democratic.",
      "DEI rollback post-Trump EOs while maintaining major federal contracts.",
    ],
    patternsAnalysis: "Accenture demonstrates how a global company headquartered in Ireland applies U.S. political pressures worldwide: Trump EOs targeting federal contractors led to global DEI policy changes affecting employees in 120+ countries.",
    keyFindings: [
      "U.S. political pressure applied globally: Irish-headquartered company changed DEI policies across 120+ countries.",
      "57% revolving door rate enables influence on federal contract decisions.",
      "DEI rollback explicitly framed as response to \u2018U.S. political changes\u2019 \u2014 most transparent compliance rationale.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $175K in 2023\u20132024", finding: "51.19% Republican, nearly even", status: "confirmed" },
    { category: "Lobbying: $2.98M (2024)", finding: "57% revolving door lobbyists", status: "confirmed" },
    { category: "All diversity goals \u2018sunsetted\u2019 Feb 2025", finding: "800K+ employees affected globally", status: "confirmed" },
    { category: "HRC CEI 100 for 16 years \u2192 Paused", finding: "2025 participation paused", status: "confirmed" },
    { category: "50,000+ layoffs (2023\u20132026)", finding: "AI reskilling restructuring", status: "confirmed" },
    { category: "Active Air Force/State Dept contractor", finding: "$1.6B Cloud One + $190M PEPFAR", status: "confirmed" },
    { category: "No WARN filings found", finding: "Ireland HQ; different requirements", status: "data-gap" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Accenture PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/accenture/C00300707/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000786" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000786" }] },
    { label: "DEI Rollback", links: [{ text: "Fox Business, Feb 2025", url: "https://www.foxbusiness.com/politics/accenture-dropping-corporate-dei-policies" }] },
    { label: "Layoffs 2023", links: [{ text: "CNN, March 2023", url: "https://www.cnn.com/2023/03/23/business/accenture-job-cuts-19000" }] },
    { label: "Federal Contracts", links: [{ text: "Accenture Newsroom \u2014 Air Force", url: "https://newsroom.accenture.com/news/2024/accenture-federal-services-wins-1-6-billion-u-s-air-force-cloud-one-task-order" }] },
    { label: "Lobbyists", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2024&id=D000000786" }] },
  ],
};

// ---------------------------------------------------------------------------
// Verizon
// ---------------------------------------------------------------------------

export const VERIZON_REPORT: CompanyReportData = {
  slug: "verizon",
  companyName: "VERIZON COMMUNICATIONS INC.",
  ticker: "NYSE: VZ",
  location: "New York, NY",
  products: "Wireless, Fios, Business Solutions, TracFone",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$2.3M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$11.4M", detail: "2024 total" },
    { label: "WARN Filings", value: "61", detail: "2000\u20132026 (13K+ affected)" },
    { label: "HRC Score", value: "Withdrew", detail: "Previously 100%", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We create the networks that move the world forward.", source: "Verizon Purpose, verizon.com" },
      { text: "Our V Team is a diverse group of people from different backgrounds who bring their unique perspectives to our work.", source: "Verizon Careers, pre-2025" },
    ],
    missionSourceUrl: "https://www.verizon.com/about",
    diversityNote: "Verizon ended all DEI policies effective May 15, 2025, per letter to FCC Chair Carr: dissolved DEI team/HR department (staff reassigned), removed DEI from training/websites/marketing, ended diversity bonuses/goals/supplier programs \u2014 all to secure $20B Frontier Communications merger approval.",
    pacName: "TURQUOISE PAC (VERIZON)",
    fecId: "C00186288",
    pacSummary: [
      { metric: "Total Raised", amount: "$2,296,056" },
      { metric: "% to Republicans", amount: "50.70%", color: "red" },
      { metric: "% to Democrats", amount: "49.03%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/turquoise-pac/C00186288/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 Verizon PAC 2023\u20132024",
    pacAnalysis: "Verizon\u2019s PAC is nearly perfectly balanced (50.70% R / 49.03% D), reflecting a classic utility company bipartisan approach to maintaining regulatory relationships across administrations.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$12,482,060", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$11,380,000", yoyChange: "-8.8%" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000079" },
      { text: "OpenSecrets Lobbying 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000079" },
    ],
    lobbyingAnalysis: "Verizon\u2019s $11.4M lobbying spend focused on spectrum policy, privacy legislation, and NDAA. 74% of lobbyists (88/119 in 2024) are former government officials.",
    keyFindings: [
      "DEI eliminated as an explicit condition for FCC merger approval of $20B Frontier deal.",
      "Nearly perfect PAC balance (50.7% R / 49% D) \u2014 classic telecom regulatory hedge.",
      "74% revolving door among 119 lobbyists in 2024.",
      "DEI dissolved DEI team, ended diversity bonuses/goals/supplier programs.",
    ],
  },

  laborImpact: {
    deiStatus: "Dismantled",
    deiDate: "May 2025",
    deiDetails: "Ended DEI policies effective May 15, 2025 per letter to FCC Chair Brendan Carr: dissolved DEI team/HR department, removed DEI from training/websites/marketing, ended diversity bonuses/goals/supplier programs. Explicitly tied to $20B Frontier Communications merger approval.",
    deiSourceUrls: [
      { text: "NPR, May 2025", url: "https://www.npr.org/2025/05/19/nx-s1-5402863/verizon-fcc-frontier-dei-trump" },
    ],
    programChanges: [
      { program: "DEI team/HR department", status: "Dissolved; staff reassigned", badgeColor: "red" },
      { program: "DEI in training/websites/marketing", status: "Removed", badgeColor: "red" },
      { program: "Diversity bonuses and goals", status: "Ended", badgeColor: "red" },
      { program: "Supplier diversity programs", status: "Ended", badgeColor: "red" },
      { program: "HRC CEI participation", status: "Withdrawn", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "2023", dotColor: "red", title: "~12,000 employees", description: "Major restructuring across telecom operations." },
      { date: "2024", dotColor: "muted", title: "<6,000", description: "Continued reductions in retail and corporate.", sourceUrl: "https://www.lightreading.com/ai-machine-learning/at-t-and-verizon-cut-another-15-3k-jobs-in-2024-as-ai-advanced", sourceLabel: "LightReading" },
      { date: "Nov 2025", dotColor: "red", title: "13,000\u201315,000 (largest ever)", description: "Largest layoff in company history; CEO Schulman cited \u2018cost reductions\u2019 and telecom competition.", sourceUrl: "https://fortune.com/2025/11/14/verizon-job-cuts-15000-ceo-schulman-cost-reductions-telecom-competition/", sourceLabel: "Fortune, Nov 2025" },
      { date: "Mar 2026", dotColor: "amber", title: "Ongoing; stores converting to franchises", description: "Retail stores being converted to franchise model, displacing employees." },
    ],
    totalLayoffs: "~40,000+ total layoffs from 2023\u20132026. November 2025 wave of 13\u201315K was the largest in company history.",
    warnFilings: [
      { location: "California", employees: "139 + 54", noticeDate: "11/2025", layoffDate: "01/2026" },
      { location: "Washington", employees: "165", noticeDate: "2025", layoffDate: "2025" },
      { location: "New Jersey", employees: "80 + 183", noticeDate: "2023", layoffDate: "2023" },
    ],
    warnSourceUrl: "https://www.warntracker.com/company/verizon",
    warnSourceLabel: "WARN Tracker \u2014 Verizon",
    warnTotal: "61 WARN notices from 2000\u20132026, affecting 13,000+ employees total.",
    keyFindings: [
      "40,000+ layoffs (2023\u20132026); November 2025 wave was the largest in company history.",
      "DEI dismantlement explicitly tied to FCC merger approval for $20B Frontier acquisition.",
      "61 WARN notices tracking 13,000+ affected workers across multiple states.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active (GSA EIS, FEMA, wireless)",
    federalContracts: [
      { contract: "GSA EIS", agency: "General Services Administration", amount: "Multi-year", description: "Enterprise Infrastructure Solutions for federal telecommunications" },
      { contract: "FEMA/MAA", agency: "FEMA", amount: "Ongoing", description: "Wireless/emergency communications services" },
    ],
    contractSourceUrls: [
      { text: "Verizon Federal Contracts", url: "https://www.verizon.com/business/solutions/public-sector/federal-government/contracts/" },
    ],
    contractAnalysis: "Verizon is a major federal telecommunications provider through GSA Enterprise Infrastructure Solutions. Federal contracts create compliance pressure, but DEI elimination was uniquely tied to FCC merger approval rather than contract compliance.",
    hrcScore: "Withdrew post-2025",
    hrcDetail: "Previously scored 100% on HRC CEI. Withdrew from participation following DEI dismantlement.",
    hrcSourceUrls: [],
    additionalFindings: [
      "FCC Chair Brendan Carr directly linked DEI elimination to merger approval.",
      "Frontier Communications $20B acquisition was the largest telecom M&A of 2025.",
    ],
    keyFindings: [
      "DEI elimination was a direct regulatory condition \u2014 FCC Chair linked it to $20B merger approval.",
      "This represents a new model: regulatory bodies using approval power to force DEI elimination.",
      "Federal telecom contracts create ongoing compliance pressure beyond the Frontier deal.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "74%",
    revolvingDoorDetail: "74% of Verizon\u2019s lobbyists (88/119 in 2024) are former government officials.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 Verizon Summary", url: "https://www.opensecrets.org/orgs/verizon-communications/summary?id=D000000079" },
      { text: "OpenSecrets \u2014 Verizon Lobbyists", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2022&id=D000000079" },
    ],
    notableConnections: [
      "119 lobbyists retained in 2024 \u2014 one of the largest corporate lobbying operations.",
      "Lobbied spectrum/privacy/NDAA bills; spectrum policy directly affects merger approvals.",
      "Balanced PAC (50.7% R) maintains relationships across administrations for regulatory approvals.",
      "DEI dismantled despite fed contracts \u2014 FCC approval took priority over federal contractor obligations.",
    ],
    patternsAnalysis: "Verizon shows how regulatory capture works in telecom: 119 lobbyists, 74% revolving door, $11.4M lobbying spend \u2192 FCC merger approval \u2192 DEI elimination as a condition. The PAC\u2019s near-perfect 50/50 split ensures regulatory relationships survive administration changes.",
    keyFindings: [
      "74% revolving door rate among 119 lobbyists \u2014 among the highest in corporate America.",
      "FCC-forced DEI elimination for merger approval is a new precedent in regulatory politics.",
      "PAC 50/50 strategy + massive lobbying creates bipartisan regulatory influence.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $2.3M in 2023\u20132024", finding: "50.70% Republican (nearly even)", status: "confirmed" },
    { category: "Lobbying: $11.4M (2024)", finding: "119 lobbyists, 74% revolving door", status: "confirmed" },
    { category: "DEI eliminated for FCC merger approval", finding: "$20B Frontier deal condition", status: "confirmed" },
    { category: "DEI team dissolved May 15, 2025", finding: "Letter to FCC Chair Carr", status: "confirmed" },
    { category: "40,000+ layoffs (2023\u20132026)", finding: "13\u201315K largest-ever wave Nov 2025", status: "confirmed" },
    { category: "61 WARN notices (2000\u20132026)", finding: "13,000+ affected", status: "confirmed" },
    { category: "HRC CEI: Previously 100% \u2192 Withdrew", finding: "Post-DEI dismantle", status: "confirmed" },
    { category: "Active GSA/FEMA telecom contractor", finding: "Enterprise Infrastructure Solutions", status: "confirmed" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 Verizon PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/turquoise-pac/C00186288/summary/2024" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000079" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=D000000079" }] },
    { label: "DEI Elimination", links: [{ text: "NPR, May 2025", url: "https://www.npr.org/2025/05/19/nx-s1-5402863/verizon-fcc-frontier-dei-trump" }] },
    { label: "Layoffs", links: [{ text: "Fortune, Nov 2025", url: "https://fortune.com/2025/11/14/verizon-job-cuts-15000-ceo-schulman-cost-reductions-telecom-competition/" }, { text: "LightReading", url: "https://www.lightreading.com/ai-machine-learning/at-t-and-verizon-cut-another-15-3k-jobs-in-2024-as-ai-advanced" }] },
    { label: "WARN Filings", links: [{ text: "WARN Tracker", url: "https://www.warntracker.com/company/verizon" }] },
    { label: "Federal Contracts", links: [{ text: "Verizon Federal", url: "https://www.verizon.com/business/solutions/public-sector/federal-government/contracts/" }] },
    { label: "Lobbyists", links: [{ text: "OpenSecrets Summary", url: "https://www.opensecrets.org/orgs/verizon-communications/summary?id=D000000079" }] },
  ],
};

// ---------------------------------------------------------------------------
// T-Mobile
// ---------------------------------------------------------------------------

export const TMOBILE_REPORT: CompanyReportData = {
  slug: "t-mobile",
  companyName: "T-MOBILE US, INC.",
  ticker: "NASDAQ: TMUS",
  location: "Bellevue, WA",
  products: "Wireless, Home Internet, Metro by T-Mobile, Sprint",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$1.34M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "~$9.5M", detail: "2024 est." },
    { label: "WARN Filings", value: "20+", detail: "2010\u20132026" },
    { label: "HRC Score", value: "100", detail: "Historical; likely changed", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "T-Mobile is America\u2019s largest, fastest, and most awarded 5G network.", source: "T-Mobile About, t-mobile.com" },
      { text: "We are committed to creating an environment where everyone can bring their whole selves to work.", source: "T-Mobile Diversity page, pre-2025" },
    ],
    missionSourceUrl: "https://www.t-mobile.com/about-us",
    diversityNote: "T-Mobile eliminated DEI roles/teams and removed DEI from websites/training in July 2025 to secure FCC approvals for two pending deals amid Trump administration pressure.",
    pacName: "T-MOBILE USA PAC",
    fecId: "C00361758",
    pacSummary: [
      { metric: "Total Raised", amount: "$1,336,169" },
      { metric: "% to Republicans", amount: "49%", color: "red" },
      { metric: "% to Democrats", amount: "50%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/t-mobile-usa/C00361758/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 T-Mobile PAC 2023\u20132024",
    pacAnalysis: "T-Mobile\u2019s PAC is nearly perfectly balanced (49% R / 50% D), typical for telecom companies seeking to maintain FCC relationships across administrations.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$9,600,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "~$9,500,000", yoyChange: "~flat" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets \u2014 T-Mobile PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/t-mobile-usa/C00361758/summary/2024" },
      { text: "Senate LDA Filings 2023", url: "https://lda.senate.gov/filings/public/filing/search/?registrant=T-Mobile&report_year=2023" },
    ],
    lobbyingAnalysis: "T-Mobile\u2019s ~$9.5M annual lobbying spend focuses on spectrum policy and telecom regulation. 81% of lobbyists are revolving door hires from government positions.",
    keyFindings: [
      "DEI eliminated for FCC approval of $4.4B US Cellular deal.",
      "Near-perfect 50/50 PAC split \u2014 maintaining bipartisan FCC relationships.",
      "81% revolving door lobbyists \u2014 highest rate among telecoms in this report.",
      "DEI removed from websites/training July 2025.",
    ],
  },

  laborImpact: {
    deiStatus: "Dismantled",
    deiDate: "July 2025",
    deiDetails: "Eliminated DEI roles/teams, removed DEI from websites/training to secure FCC approvals amid Trump administration pressure for pending deals.",
    deiSourceUrls: [
      { text: "USA Today, Jul 2025", url: "https://www.usatoday.com/story/money/2025/07/09/why-tmobile-ended-dei/84523745007/" },
      { text: "Reuters, Jul 2025", url: "https://www.reuters.com/sustainability/society-equity/t-mobile-ending-dei-programs-it-seeks-fcc-approval-two-deals-2025-07-09/" },
    ],
    programChanges: [
      { program: "DEI roles and teams", status: "Eliminated", badgeColor: "red" },
      { program: "DEI on websites/training", status: "Removed", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "Aug 2023", dotColor: "red", title: "5,000 corporate/tech employees", description: "Major restructuring of corporate and technology divisions.", sourceUrl: "https://www.npr.org/2023/08/24/1195707345/t-mobile-layoffs", sourceLabel: "NPR, August 2023" },
      { date: "2025", dotColor: "muted", title: "IT layoffs: 121 WA + sales/business cuts", description: "WARN filed for 121 IT workers in Washington; additional sales reductions." },
      { date: "2026", dotColor: "amber", title: "393 WA; end-user support reductions", description: "WARN filed for 393 in Washington state; ongoing restructuring." },
    ],
    totalLayoffs: "~12,000+ total layoffs from 2023\u20132026 across corporate, IT, and sales divisions.",
    warnFilings: [
      { location: "Washington state", employees: "363 + 393", noticeDate: "2025\u20132026", layoffDate: "Various" },
      { location: "NJ, TN, IL", employees: "Various", noticeDate: "2023", layoffDate: "2023" },
    ],
    warnSourceUrl: "https://www.warntracker.com/company/t-mobile",
    warnSourceLabel: "WARN Tracker \u2014 T-Mobile",
    warnTotal: "20+ WARN notices from 2010\u20132026 across WA, NJ, TN, and IL.",
    keyFindings: [
      "12,000+ employees affected by layoffs (2023\u20132026).",
      "DEI elimination explicitly tied to FCC deal approvals (same pattern as Verizon).",
      "WARN filings concentrated in WA state (headquarters region).",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active GSA/DoD contractor",
    federalContracts: [
      { contract: "47QTCA22D008N", agency: "GSA", amount: "Multi-year", description: "Federal telecommunications services" },
      { contract: "Navy Spiral 4", agency: "U.S. Navy", amount: "$2.67B / 10yr", description: "Wireless services for U.S. Navy" },
    ],
    contractSourceUrls: [
      { text: "T-Mobile Navy Contract", url: "https://www.t-mobile.com/news/business/t-mobile-selected-by-u-s-navy-for-2-67-billion-10-year-contract" },
    ],
    contractAnalysis: "T-Mobile\u2019s $2.67B Navy contract is one of the largest telecom-military deals. Combined with GSA contracts, federal work creates significant compliance pressure.",
    hrcScore: "100 (historical)",
    hrcDetail: "Historical perfect score on HRC CEI. Status likely changed post-DEI dismantlement in July 2025.",
    hrcSourceUrls: [],
    additionalFindings: [
      "T-Mobile maintains a \u2018Responsible AI\u2019 policy for internal AI use.",
    ],
    keyFindings: [
      "$2.67B Navy contract demonstrates significant federal dependency for a consumer telecom company.",
      "FCC approval pressure for US Cellular deal drove DEI elimination \u2014 same mechanism as Verizon/Frontier.",
      "Federal contract + FCC regulatory dependency creates dual compliance pressure.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "81%",
    revolvingDoorDetail: "81% of T-Mobile\u2019s lobbyists are revolving door hires from government positions \u2014 the highest rate among telecoms in this report.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 T-Mobile Lobbyists", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2022&id=D000022272" },
    ],
    notableConnections: [
      "81% revolving door rate \u2014 highest among telecoms.",
      "Heavy telecom lobbying (~$9M/yr) focused on spectrum policy.",
      "PAC nearly perfectly bipartisan (49% R / 50% D).",
      "Navy/DoD contracts alongside consumer telecom business.",
    ],
    patternsAnalysis: "T-Mobile follows the same Verizon pattern: FCC deal approval \u2192 DEI elimination as condition. The 81% revolving door rate enables deep regulatory influence. $2.67B Navy contract + GSA work creates federal dependency that reinforces compliance pressure.",
    keyFindings: [
      "81% revolving door rate is the highest among telecoms \u2014 deep government influence pipeline.",
      "FCC-deal-for-DEI-elimination pattern identical to Verizon, establishing industry precedent.",
      "Bipartisan PAC + revolving door + Navy contract = comprehensive regulatory influence system.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $1.34M in 2023\u20132024", finding: "49% R / 50% D (nearly even)", status: "confirmed" },
    { category: "Lobbying: ~$9.5M (2024)", finding: "81% revolving door lobbyists", status: "confirmed" },
    { category: "DEI eliminated for FCC approval Jul 2025", finding: "$4.4B US Cellular deal", status: "confirmed" },
    { category: "12,000+ layoffs (2023\u20132026)", finding: "Corporate, IT, sales divisions", status: "confirmed" },
    { category: "20+ WARN notices (2010\u20132026)", finding: "WA, NJ, TN, IL", status: "confirmed" },
    { category: "Active GSA + $2.67B Navy contract", finding: "Federal telecom provider", status: "confirmed" },
    { category: "HRC CEI: 100 (historical)", finding: "Post-DEI status likely changed", status: "data-gap" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 T-Mobile PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/t-mobile-usa/C00361758/summary/2024" }] },
    { label: "DEI Elimination", links: [{ text: "USA Today, Jul 2025", url: "https://www.usatoday.com/story/money/2025/07/09/why-tmobile-ended-dei/84523745007/" }, { text: "Reuters, Jul 2025", url: "https://www.reuters.com/sustainability/society-equity/t-mobile-ending-dei-programs-it-seeks-fcc-approval-two-deals-2025-07-09/" }] },
    { label: "Layoffs", links: [{ text: "NPR, August 2023", url: "https://www.npr.org/2023/08/24/1195707345/t-mobile-layoffs" }] },
    { label: "WARN Filings", links: [{ text: "WARN Tracker", url: "https://www.warntracker.com/company/t-mobile" }] },
    { label: "Navy Contract", links: [{ text: "T-Mobile Newsroom", url: "https://www.t-mobile.com/news/business/t-mobile-selected-by-u-s-navy-for-2-67-billion-10-year-contract" }] },
    { label: "Lobbyists", links: [{ text: "OpenSecrets", url: "https://www.opensecrets.org/federal-lobbying/clients/lobbyists?cycle=2022&id=D000022272" }] },
    { label: "Senate LDA", links: [{ text: "LDA Filings 2023", url: "https://lda.senate.gov/filings/public/filing/search/?registrant=T-Mobile&report_year=2023" }] },
  ],
};

// ---------------------------------------------------------------------------
// AT&T
// ---------------------------------------------------------------------------

export const ATT_REPORT: CompanyReportData = {
  slug: "att",
  companyName: "AT&T INC.",
  ticker: "NYSE: T",
  location: "Dallas, TX",
  products: "Wireless, Fiber, FirstNet, Business Solutions, DirecTV",
  reportDate: "March 2026",
  stats: [
    { label: "PAC Raised", value: "$2.44M", detail: "2023\u201324 cycle" },
    { label: "Lobbying", value: "$12.1M", detail: "2024 total" },
    { label: "WARN Filings", value: "134", detail: "Historical; dozens 2022\u20132026" },
    { label: "HRC Score", value: "Dropped", detail: "No longer participates", trend: "down" },
  ],

  integrityGap: {
    missionQuotes: [
      { text: "We connect people with greater possibility.", source: "AT&T Purpose, att.com" },
      { text: "Our commitment to inclusion is not just the right thing to do \u2014 it\u2019s how we stay ahead.", source: "AT&T Diversity page, pre-2025" },
    ],
    missionSourceUrl: "https://about.att.com",
    diversityNote: "AT&T eliminated all DEI roles, training, and quotas. In a December 2025 letter to the FCC, the company stated: \u2018DEI does not exist at AT&T.\u2019 The company shifted to merit-based policies in response to legal changes and FCC requirements for spectrum deals. Scaling back began in March 2025.",
    pacName: "AT&T INC. PAC",
    fecId: "C00109017",
    pacSummary: [
      { metric: "Total Raised", amount: "$2,440,629" },
      { metric: "% to Republicans", amount: "53.59%", color: "red" },
      { metric: "% to Democrats", amount: "46.00%", color: "blue" },
    ],
    pacSourceUrl: "https://www.opensecrets.org/political-action-committees-pacs/at-t-inc/C00109017/summary/2024",
    pacSourceLabel: "OpenSecrets \u2014 AT&T PAC 2023\u20132024",
    pacAnalysis: "AT&T\u2019s PAC tilts slightly Republican (53.59%), consistent with a legacy telecom company maintaining bipartisan regulatory relationships while leaning toward the party more favorable to deregulation.",
    lobbyingYears: [
      { year: "2023", totalSpent: "$12,060,000", yoyChange: "\u2014" },
      { year: "2024", totalSpent: "$12,050,000", yoyChange: "Flat" },
    ],
    lobbyingSourceUrls: [
      { text: "OpenSecrets Lobbying 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000076" },
      { text: "OpenSecrets Lobbying 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=d000000076" },
    ],
    lobbyingAnalysis: "AT&T maintains a consistent $12M annual lobbying spend focused on spectrum legislation (S.3909, HR.3565) that directly aligns with FCC deals requiring DEI elimination.",
    keyFindings: [
      "\u2018DEI does not exist at AT&T\u2019 \u2014 FCC letter December 2025.",
      "PAC 53.59% Republican; $12M annual lobbying on spectrum policy.",
      "DEI elimination tied to FCC requirements for spectrum deal approvals.",
      "Scaling back DEI began March 2025; full elimination by December 2025.",
    ],
  },

  laborImpact: {
    deiStatus: "Dismantled",
    deiDate: "December 2025",
    deiDetails: "Eliminated all DEI roles, training, quotas; shifted to merit-based. In response to legal changes and FCC requirements for spectrum deal. Began scaling back March 2025. FCC letter stated: \u2018DEI does not exist at AT&T.\u2019",
    deiSourceUrls: [
      { text: "Reuters, Dec 2025", url: "https://www.reuters.com/sustainability/society-equity/att-commits-ending-dei-programs-2025-12-02/" },
      { text: "NY Post, Dec 2025", url: "https://nypost.com/2025/12/03/business/atampt-vows-to-scrap-dei-policies-including-worker-training-that-called-racism-uniquely-white-trait/" },
    ],
    programChanges: [
      { program: "All DEI roles", status: "Eliminated", badgeColor: "red" },
      { program: "DEI training", status: "Eliminated", badgeColor: "red" },
      { program: "Hiring quotas", status: "Eliminated", badgeColor: "red" },
      { program: "HRC CEI participation", status: "Dropped", badgeColor: "red" },
    ],
    layoffTimeline: [
      { date: "2022\u20132023", dotColor: "muted", title: "Multiple WARN notices across states", description: "NJ: ~256 total (multiple filings); AL: 23; various smaller rounds." },
      { date: "2024", dotColor: "muted", title: "CA multiple small; NJ 100+", description: "Continued reductions across corporate and technical roles." },
      { date: "2025", dotColor: "red", title: "AL 73, FL 88+138, CA 47+8+15+22+34", description: "Significant WARN-tracked layoffs across multiple states." },
    ],
    totalLayoffs: "~5,000+ WARN-tracked; total higher including non-WARN layoffs. Net workforce decline noted across multiple years.",
    warnFilings: [
      { location: "Alabama", employees: "73", noticeDate: "2025", layoffDate: "2025" },
      { location: "Florida", employees: "88 + 138", noticeDate: "2025", layoffDate: "2025" },
      { location: "California", employees: "47 + 8 + 15 + 22 + 34", noticeDate: "2025", layoffDate: "2025" },
      { location: "New Jersey", employees: "100+", noticeDate: "2024", layoffDate: "2024" },
    ],
    warnSourceUrl: "https://www.warntracker.com/company/at-t",
    warnSourceLabel: "WARN Tracker \u2014 AT&T",
    warnTotal: "134 total historical WARN notices; dozens in 2022\u20132026 period.",
    keyFindings: [
      "134 historical WARN notices with heavy 2025 concentration across AL, FL, CA.",
      "DEI elimination is total: \u2018DEI does not exist at AT&T\u2019 per FCC letter.",
      "Layoff pattern shows steady multi-state reductions rather than single massive events.",
    ],
  },

  safetyAlert: {
    federalContractStatus: "Active major contractor",
    federalContracts: [
      { contract: "GETS/WPS", agency: "Department of Homeland Security", amount: "$146M", description: "Government Emergency Telecommunications Service / Wireless Priority Service (2024)" },
    ],
    contractSourceUrls: [
      { text: "AT&T DHS Contract", url: "https://about.att.com/story/2024/department-of-homeland-security.html" },
    ],
    contractAnalysis: "AT&T\u2019s DHS emergency telecommunications contract positions the company as critical infrastructure for government communications. This dependency creates ongoing compliance pressure.",
    hrcScore: "No longer participates",
    hrcDetail: "Dropped HRC CEI participation post-DEI dismantlement. HRC 2026 participation fell 65% among Fortune 500.",
    hrcSourceUrls: [],
    additionalFindings: [
      "HRC Corporate Equality Index saw 65% drop in Fortune 500 participation in 2026.",
      "Heavy spectrum lobbying (S.3909, HR.3565) aligns with FCC deals requiring DEI elimination.",
    ],
    keyFindings: [
      "$146M DHS contract for emergency telecommunications demonstrates critical infrastructure role.",
      "HRC CEI Fortune 500 participation dropped 65% in 2026 \u2014 AT&T part of mass exodus.",
      "Spectrum lobbying directly connected to FCC deal approvals that required DEI elimination.",
    ],
  },

  connectedDots: {
    revolvingDoorPct: "Historical",
    revolvingDoorDetail: "AT&T has a long history of revolving door lobbying, with former government officials working as company lobbyists and AT&T executives moving to government positions.",
    lobbyistSourceUrls: [
      { text: "OpenSecrets \u2014 AT&T Bills Lobbied", url: "https://www.opensecrets.org/orgs/at-t-inc/lobbying?id=D000000076&lobbillscycle=2024" },
    ],
    notableConnections: [
      "Heavy spectrum lobbying on S.3909 and HR.3565 \u2014 directly tied to FCC deal requirements.",
      "PAC bipartisan but slight Republican lean (53.59%).",
      "Ongoing federal contracts position AT&T as critical government communications infrastructure.",
      "AI governance maintained as internal policy despite DEI elimination.",
    ],
    patternsAnalysis: "AT&T follows the telecom pattern (Verizon, T-Mobile): FCC deal approval drives DEI elimination. The \u2018DEI does not exist at AT&T\u2019 statement represents the most absolute corporate DEI repudiation in this report.",
    keyFindings: [
      "\u2018DEI does not exist at AT&T\u2019 is the most categorical corporate DEI repudiation documented.",
      "Spectrum lobbying \u2192 FCC deal approval \u2192 DEI elimination represents a clear influence chain.",
      "Telecom pattern (Verizon, T-Mobile, AT&T) establishes FCC DEI elimination as industry standard.",
    ],
  },

  receiptsAtAGlance: [
    { category: "PAC raised $2.44M in 2023\u20132024", finding: "53.59% to Republicans", status: "confirmed" },
    { category: "Lobbying: $12.1M (2024)", finding: "Spectrum legislation focus", status: "confirmed" },
    { category: "\u2018DEI does not exist at AT&T\u2019", finding: "FCC letter December 2025", status: "confirmed" },
    { category: "All DEI roles/training/quotas eliminated", finding: "Scaling back began March 2025", status: "confirmed" },
    { category: "134 WARN notices (historical)", finding: "Dozens in 2022\u20132026", status: "confirmed" },
    { category: "Active DHS contractor ($146M GETS/WPS)", finding: "Critical emergency comms infrastructure", status: "confirmed" },
    { category: "HRC CEI: No longer participates", finding: "Part of 65% Fortune 500 drop", status: "confirmed" },
    { category: "Revolving door lobbying", finding: "Historical pattern, spectrum focus", status: "research-incomplete" },
  ],

  sources: [
    { label: "PAC Data", links: [{ text: "OpenSecrets \u2014 AT&T PAC", url: "https://www.opensecrets.org/political-action-committees-pacs/at-t-inc/C00109017/summary/2024" }, { text: "FEC", url: "https://www.fec.gov/data/committee/C00109017/" }] },
    { label: "Lobbying", links: [{ text: "OpenSecrets 2024", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2024&id=D000000076" }, { text: "OpenSecrets 2023", url: "https://www.opensecrets.org/federal-lobbying/clients/summary?cycle=2023&id=d000000076" }] },
    { label: "DEI Elimination", links: [{ text: "Reuters, Dec 2025", url: "https://www.reuters.com/sustainability/society-equity/att-commits-ending-dei-programs-2025-12-02/" }, { text: "NY Post, Dec 2025", url: "https://nypost.com/2025/12/03/business/atampt-vows-to-scrap-dei-policies-including-worker-training-that-called-racism-uniquely-white-trait/" }] },
    { label: "WARN Filings", links: [{ text: "WARN Tracker", url: "https://www.warntracker.com/company/at-t" }] },
    { label: "Federal Contracts", links: [{ text: "AT&T DHS", url: "https://about.att.com/story/2024/department-of-homeland-security.html" }] },
    { label: "Bills Lobbied", links: [{ text: "OpenSecrets", url: "https://www.opensecrets.org/orgs/at-t-inc/lobbying?id=D000000076&lobbillscycle=2024" }] },
  ],
};

// ---------------------------------------------------------------------------
// Lookup map by slug
// ---------------------------------------------------------------------------

export const COMPANY_REPORTS: Record<string, CompanyReportData> = {
  google: GOOGLE_REPORT,
  amazon: AMAZON_REPORT,
  microsoft: MICROSOFT_REPORT,
  boeing: BOEING_REPORT,
  "booz-allen-hamilton": BOOZ_ALLEN_REPORT,
  accenture: ACCENTURE_REPORT,
  verizon: VERIZON_REPORT,
  "t-mobile": TMOBILE_REPORT,
  att: ATT_REPORT,
};
