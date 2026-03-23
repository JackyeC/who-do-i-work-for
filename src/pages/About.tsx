import { Link } from "react-router-dom";
import { usePageSEO } from "@/hooks/use-page-seo";
import { ShieldCheck, FileText, Eye, Scale, ExternalLink, ArrowRight } from "lucide-react";
import jackyeHeadshotSm from "@/assets/jackye-headshot-sm.webp";

const CREDENTIALS = [
  "VP of Talent Acquisition & DEIB — Textio (2021–2025)",
  "DEIB Strategy Consultant — SeekOut (2020–2021)",
  "Director of Customer Success — HiringSolved (2017–2020)",
  "Associate Editor — The HR Gazette (2025–present)",
  "LinkedIn Learning Instructor — HR: Writing an Effective Job Description",
  "Co-host — Inclusive AF Podcast",
  "Forbes HR Council Member",
];

const RECOGNITION = [
  "Top 100 Human Resources Influencers — HR Executive Magazine (2021)",
  "Top HR Innovators — Pillar HR (2023)",
  "9 Powerful Women in Business You Should Know — SDHR Consulting",
  "15 Women in HR Tech to Follow — VidCruiter",
  "Top Recruitment Thought Leaders — interviewMocha Magazine",
];

const FEATURED_IN = [
  { label: "Wall Street Journal", url: "https://www.wsj.com" },
  { label: "Forbes", url: "https://councils.forbes.com/profile/Jackye-Clayton-VP-Talent-Acquisition-DEI-Textio/6ace09f5-3c07-4e10-8f39-fa02297c00b8" },
  { label: "Fortune", url: "https://fortune.com" },
  { label: "SHRM", url: "https://www.shrm.org" },
  { label: "LinkedIn Learning", url: "https://www.linkedin.com/learning/" },
];

const About = () => {
  usePageSEO({
    title: "About — Who Do I Work For? by Jackye Clayton",
    description:
      "Built by Jackye Clayton — 15+ years in talent acquisition, VP at Textio, Forbes HR Council member, LinkedIn Learning instructor. WDIWF verifies employers against public records.",
    path: "/about",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-3xl mx-auto px-6 py-20 space-y-16">
        {/* ── Hero ── */}
        <section className="flex flex-col sm:flex-row items-start gap-8">
          <img
            src={jackyeHeadshotSm}
            alt="Jackye Clayton, Founder of Who Do I Work For"
            className="w-28 h-28 object-cover shrink-0"
            width={112}
            height={112}
          />
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-primary mb-2">
              Founder & Executive Agent
            </p>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Jackye Clayton
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
              15+ years leading talent acquisition for companies like Textio, SeekOut, and HiringSolved. 
              Forbes HR Council member. LinkedIn Learning instructor. Host of the Inclusive AF Podcast. 
              I built WDIWF because candidates deserve the same intelligence that employers already have.
            </p>
          </div>
        </section>

        {/* ── The Mission ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">The Mission</h2>
          <blockquote className="border-l-4 border-primary pl-5 py-4 rounded-r-lg bg-muted/30 space-y-3">
            <p className="text-base font-semibold text-foreground leading-relaxed">
              "Every company runs a background check on you. WDIWF runs one on them."
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I've spent my career inside the recruiting machines of the biggest names in tech. 
              I know where the ghost jobs live, where the hidden budget sits, and what companies 
              say behind closed doors versus what they put on the careers page. WDIWF puts that 
              intelligence in your hands — backed by public records, not marketing copy.
            </p>
          </blockquote>
        </section>

        {/* ── Neutrality ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Our Standard</h2>
          <div className="bg-card border border-primary/20 p-6 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm tracking-[0.15em] uppercase text-primary font-semibold">
                No bias. Just receipts.
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WDIWF does not evaluate the content of your mission — we evaluate whether you're living it. 
              Faith-based. Climate-focused. Veterans. LGBTQ. Rural. Urban. Every mission category is verified 
              the same way: against public data, not our opinion.
            </p>
          </div>
        </section>

        {/* ── How it Works ── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">How It Works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: FileText,
                title: "Public records only",
                desc: "FEC filings, SEC reports, BLS wage data, OSHA citations, NLRB cases, WARN Act notices, Senate Lobbying Disclosures, and more.",
              },
              {
                icon: Eye,
                title: "Integrity Gap analysis",
                desc: "We compare what companies say on their careers page to what the public record actually shows.",
              },
              {
                icon: ShieldCheck,
                title: "Confidence-rated signals",
                desc: "Every data point carries a source type, recency, and confidence level — so you know what's verified.",
              },
              {
                icon: Scale,
                title: "No judgment, just data",
                desc: "We surface patterns. You decide what matters. Scores inform — they don't prescribe.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/40 bg-card p-5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Career & Credentials ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Career</h2>
          <ul className="space-y-2">
            {CREDENTIALS.map((c) => (
              <li key={c} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 bg-primary/60 rounded-full mt-2 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Recognition ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Recognition</h2>
          <ul className="space-y-2">
            {RECOGNITION.map((r) => (
              <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 bg-primary/60 rounded-full mt-2 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Featured In ── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Featured In</h2>
          <div className="flex flex-wrap gap-4">
            {FEATURED_IN.map((f) => (
              <a
                key={f.label}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-sm tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                {f.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border pt-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Ready to see the receipts?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start with a free company investigation. No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/receipts"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 font-mono text-sm font-semibold tracking-wider uppercase hover:brightness-110 transition-all"
            >
              See the Receipts <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 border border-border bg-card px-8 py-3.5 font-mono text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
