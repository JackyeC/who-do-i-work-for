import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { ArrowRight } from "lucide-react";

const ARTICLES = [
  {
    title: "Platinum Employers, Paper Trails: Why Career Growth Data Isn't the Full Story",
    date: "March 24, 2026",
    excerpt:
      "The Where You Work Matters List just dropped 1,750 employer ratings. But career outcomes without integrity context is like a salary without benefits\u2026",
    slug: "platinum-employers-paper-trails",
  },
  {
    title: "Meta's Integrity Gap: What the PAC Data Tells Us",
    date: "March 2026",
    excerpt:
      "155 WARN filings, a disbanded DEI team, and $341K in PAC spending. Here's what the receipts reveal\u2026",
    slug: "meta-integrity-gap",
  },
  {
    title: "The One-Way Mirror Problem: Why Companies Interview You, But You Can't Interview Them",
    date: "Coming Soon",
    excerpt:
      "Every company runs background checks on candidates. WDIWF runs one on them.",
    slug: null,
  },
  {
    title: "Sector Is Not Destiny: Why Industry Alone Won't Tell You Where to Work",
    date: "Coming Soon",
    excerpt:
      "Retail companies at the top, tech companies at the bottom. The data challenges everything you assumed.",
    slug: null,
  },
];

export default function Insights() {
  const [email, setEmail] = useState("");

  usePageSEO({
    title: "Insights — Intelligence That Moves Careers",
    description:
      "Career intelligence, employer analysis, and editorial from WDIWF. Data-driven insights on the companies that shape your career.",
    path: "/insights",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <p className="font-mono text-xs tracking-[0.15em] uppercase text-primary mb-4">
          Insights
        </p>
        <h1
          className="font-sans text-foreground leading-[1.1] mb-4"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 800 }}
        >
          Intelligence That Moves Careers
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[52ch] mb-14">
          Data-driven analysis of employer behavior, career outcomes, and the integrity gaps that matter.
        </p>

        {/* Article Cards — 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {ARTICLES.map((article) => (
            <article
              key={article.title}
              className="rounded-lg bg-card border border-border overflow-hidden"
              style={{ borderTop: "3px solid #F0C040" }}
            >
              <div className="p-7">
                <p className="font-mono text-xs text-muted-foreground mb-3">
                  {article.date}
                </p>
                <h2 className="font-sans text-foreground font-bold text-lg leading-snug mb-3">
                  {article.title}
                </h2>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                {article.slug ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary cursor-pointer hover:brightness-110 transition-all">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground/50">
                    Coming Soon
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="text-center max-w-[480px] mx-auto">
          <h2
            className="font-sans text-foreground leading-[1.1] mb-3"
            style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 800 }}
          >
            Get weekly intelligence drops
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Employer analysis, career data, and the receipts that matter — delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-foreground font-sans text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 font-sans text-sm font-semibold rounded-lg hover:brightness-110 transition-all whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="font-sans text-xs text-muted-foreground/50 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
