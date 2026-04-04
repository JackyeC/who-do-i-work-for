/**
 * Fallback desk sample — mirrors `newsletter/samples/engine-dry-run/` (fictional).
 * Live `/newsletter` desk loads from Supabase `wdiwf_desk_publications` when published; this file is UI fallback only. SUBSTACK URL via env.
 */
export const SUBSTACK_NEWSLETTER_URL =
  (import.meta.env.VITE_SUBSTACK_URL as string | undefined)?.trim() || "";

export const deskSampleMeta = {
  title: "Daily desk — website, email & social",
  note: "Sample layout matching the WDIWF content engine (Signal Check™, source map, DEVELOPING). Production runs can replace this block from `newsletter/outputs/` or an API.",
};

export const websiteBrief = {
  deck: "Today’s through-line is classification anxiety: a draft enforcement posture starts circulating, and three different shelves start telling three different stories about what it means.",
  lead: {
    headline: "Draft DOL guidance tightens IC test",
    developing: true,
    body: "Labor desks and compliance press are circling draft language that would narrow who qualifies as an independent contractor under key federal enforcement rules. We’re treating the circulation / comment framing as reportable; we’re not treating “your gig economy is over Monday” as verified — that’s narrative, not docket.",
  },
  sourceMap: [
    { outlet: "Labor Chronicle", bias: "Lean left", url: "https://example.com/labor-chronicle-ic-draft" },
    { outlet: "Metro Business Journal", bias: "Center", url: "https://example.com/mbj-dol-guidance" },
    { outlet: "HR Compliance Weekly", bias: "Center", url: "https://example.com/hrcw-contractor-test" },
    { outlet: "National Desk Wire", bias: "Center", url: "https://example.com/wire-dol-contractors" },
  ],
  coverageMix: "Left 1 · Center 3 · Right 0 (illustrative)",
  developingNote:
    "Fewer than four independent confirmations of identical core facts across our bar; business impact still clarifying. No implied finality.",
  signalCheck: {
    whatHappened:
      "Federal labor officials circulated draft language that would narrow who can be classified as an independent contractor under key enforcement rules.",
    leans: {
      left: "Emphasis on worker misclassification harms and union relevance",
      center: "Procedural focus—comment period, effective dates, legal uncertainty",
      right: "Selective pickup stressing compliance cost and gig flexibility",
    },
    bridge1: "👉 Same policy rumor. Different weight depending on where you read it.",
    shifts: [
      "Whether this is framed as a done deal or an early signal",
      "Whether the main character is the worker, the employer, or the agency",
      "Whether the risk story is wage theft vs overreach vs wait for counsel",
    ],
    gaps: [
      "How often draft guidance this early actually ships unchanged",
      "Sector-by-sector variance (tech platforms vs healthcare staffing vs trades)",
      "What state law already does in your biggest hiring metros",
    ],
    bridge2: "👉 Everyone is debating headlines.\n👉 Almost no one is showing your hiring pattern against the map.",
    incentives: [
      "Wire-heavy desks → speed; thinner on second-order HR ops detail",
      "Audience-aligned outlets → headline intensity matches reader anxiety",
      "Niche trade press → closer to compliance mechanics, slower to front-page",
    ],
    bridge3: "👉 You’re not just reading reporting. You’re reading who pays for the subscription.",
    signalStrength: [
      "High → Something was actually circulated for comment (event)",
      "Medium → Legal meaning for classification tests (depends on final rule + courts)",
      "Low → “Company X is doomed” takes (speculative this week)",
    ],
    peoplePuzzles:
      "Policy moves on paper; payroll and managers move on fear and habit. When the story is half-formed, organizations don’t freeze—they guess. The guessing shows up in job posts, contractor renewals, and “we’ll wait” emails that still change who gets paid how.",
    question:
      "If the same draft can read like salvation, catastrophe, or “call counsel Monday,” what are you reacting to—the text, or the version your feed handed you?",
    decisionImpact:
      "Pull your top 10 contractor roles and one sentence each on why they’re IC—if the answer is vibes, schedule a 20-minute talent + legal huddle before you defend the matrix in public.",
    jackyeTake:
      "The win isn’t predicting the rule—it’s denying your org the luxury of silent drift while headlines do the planning.",
  },
  secondary: [
    {
      label: "Compliance & risk",
      headline: "State pay-transparency patchwork still outruns national templates",
      developing: true,
      blurb: "Two state AG reminders on posting ranges landed this cycle; national outlets sparse. If you hire multi-state, your template job post is probably noncompliant somewhere.",
    },
    {
      label: "Workplace & culture",
      headline: "Return-to-office mandates: metrics vs morale",
      developing: false,
      blurb: "Four-plus outlets covered the same employer policy shift; disagreement is framing, not whether the memo exists. The fight isn’t RTO vs remote—it’s what gets measured when leaders declare victory.",
    },
  ],
  quickHits: [
    "NLRB docket watch: new organizing filing at a regional grocery chain",
    "Overtime threshold chatter resurfaces in trade newsletters (no final rule cited)",
    "Union contract ratification vote scheduled next week at a major airport services vendor",
  ],
};

export const emailEdition = {
  subject: "The contractor headline is loud — the rule isn’t finished",
  previewText:
    "DEVELOPING: DOL draft IC chatter. Signal Check™ + one move for your desk this week.",
  greeting: "Hi there,",
  intro: websiteBrief.deck,
  closing:
    "That’s the desk for today. If you only do one thing: name the shelf you read first—then ask whether it’s built for your payroll reality.",
  signoff: "— Jackye",
};

export const socialPosts = {
  linkedin: `DOL contractor chatter is loud already—and still half-baked.

WDIWF read: the story isn’t “what happened” yet. It’s what your org does while the headline pretends it’s final.

Signal Check™ in short:
• Left shelf: worker harm + power
• Center shelf: process + dates + counsel
• Right shelf: cost + flexibility

👉 Same draft. Different gravity by feed.

This week’s move isn’t a hot take—it’s an inventory: top contractor roles + one honest sentence each on why they’re IC. If it’s vibes, that’s the leak.

People Puzzles: policy crawls; managers sprint on fear. Guesswork shows up in payroll before it shows up in punditry.

Full brief → wdiwf.jackyeclayton.com

— Jackye`,
  bluesky: `DOL IC draft: DEVELOPING—not four-outlet verified yet.

WDIWF: map the shelves (worker harm vs process vs cost), then do the boring win—contractor role inventory + why IC. Headlines aren’t your workforce plan.

wdiwf.jackyeclayton.com`,
  x: `DEVELOPING: DOL contractor-classification draft is loud; the rule isn’t finished.

Map the shelves (worker harm / process / cost)—then do the boring win: contractor inventory + why IC.

Signal Check™ on the desk → wdiwf.jackyeclayton.com/newsletter`,
  instagram: `The headline says “it’s over.” The docket says “draft.”

Same story, different weight depending on which shelf you read first.

This week: name your top contractor roles + one honest line each on why they’re IC. If it’s vibes—that’s the leak.

People Puzzles — link in bio 🔗
wdiwf.jackyeclayton.com

#FutureOfWork #HR #LaborNews #WhoDoIWorkFor`,
};
