import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Shield, AlertTriangle, Users, Eye, TrendingUp, Share2, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { usePageSEO } from "@/hooks/use-page-seo";

const DEMO_SCORES = [
  { label: "Employer Clarity Score", value: "6.2 / 10", status: "Moderate", icon: Shield, color: "text-civic-yellow" },
  { label: "Offer Risk Level", value: "Medium", status: "2 flags detected", icon: AlertTriangle, color: "text-civic-yellow" },
  { label: "Hiring Transparency", value: "Low", status: "AI tools detected, no audit published", icon: Eye, color: "text-civic-red" },
  { label: "Workforce Stability", value: "Stable", status: "No WARN notices in 12 months", icon: Users, color: "text-civic-green" },
  { label: "Influence Exposure", value: "Significant", status: "$5.2M lobbying · PAC active", icon: TrendingUp, color: "text-civic-red" },
];

function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = "Would you work here? Check the employer intelligence before you sign.";

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-label uppercase text-muted-foreground">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        aria-label="Share on X/Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button
        onClick={copyLink}
        className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-civic-green" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function WouldYouWorkHere() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  usePageSEO({
    title: "Would You Work Here? — Free Employer Intelligence Check",
    description: "Check any employer's clarity score, offer risk, hiring transparency, workforce stability, and political influence exposure. Free employer intelligence by Jackye Clayton.",
    path: "/would-you-work-here",
    jsonLd: {
      "@type": "WebPage",
      name: "Would You Work Here?",
      description: "Free employer intelligence check. See what the data says about any company before you accept an offer.",
      isPartOf: { "@type": "WebApplication", name: "Who Do I Work For?" },
    },
  });

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 lg:px-16 py-20 lg:py-28 text-center max-w-[800px] mx-auto">
        <div className="font-mono text-label uppercase text-primary mb-4">Employer Intelligence Check</div>
        <h1 className="text-3xl lg:text-[clamp(2.4rem,5vw,3.6rem)] leading-tight mb-6 text-foreground">
          Would You Work Here?
        </h1>
        <p className="text-body-lg text-muted-foreground mb-8 max-w-[520px] mx-auto">
          Before you say yes, run the intelligence. See what the data says about any employer — influence exposure, offer risks, workforce signals, and more.
        </p>

        {/* Share */}
        <div className="flex justify-center mb-10">
          <ShareButtons />
        </div>

        {/* Search */}
        <div className="flex max-w-[500px] mx-auto border border-border bg-card">
          <div className="flex items-center px-4 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter a company name..."
            className="flex-1 bg-transparent border-none outline-none py-3.5 text-foreground font-sans text-body placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground px-5 font-mono text-label tracking-wider uppercase font-semibold hover:brightness-110 transition-all"
          >
            Scan
          </button>
        </div>
      </section>

      {/* Demo Scorecard */}
      <section className="px-6 lg:px-16 pb-20 max-w-[800px] mx-auto w-full">
        <div className="bg-card border border-border relative">
          <div className="absolute -top-2.5 left-4 bg-background px-2 font-mono text-micro uppercase text-primary tracking-widest">
            Sample Report · Koch Industries
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-px bg-border border border-border">
              {DEMO_SCORES.map(s => (
                <div key={s.label} className="bg-card p-4 flex items-center gap-4">
                  <s.icon className={`w-5 h-5 ${s.color} shrink-0`} strokeWidth={1.5} />
                  <div className="flex-1">
                    <div className="font-mono text-label tracking-wider uppercase text-muted-foreground">{s.label}</div>
                    <div className={`font-data text-lg font-bold ${s.color}`}>{s.value}</div>
                  </div>
                  <div className="text-body text-muted-foreground text-right max-w-[240px]">{s.status}</div>
                </div>
              ))}
            </div>

            {/* Jackye's Verdict */}
            <div className="mt-4 p-4 border-l-2 border-primary bg-primary/[0.04]">
              <div className="font-mono text-micro tracking-wider uppercase text-primary mb-2">Jackye's Verdict</div>
              <p className="text-body text-foreground leading-relaxed">
                This company has significant political exposure and undisclosed AI hiring tools. The offer itself isn't bad — but the non-compete is unusually broad and the salary sits below market. You have leverage here. Use it. And ask about the AI screening before your next interview.
              </p>
              <div className="font-mono text-micro tracking-wider uppercase text-muted-foreground mt-3 italic">
                — Run the chain first. Always.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 lg:px-16 py-16 text-center">
        <h2 className="text-xl mb-4 text-foreground">Get the full picture.</h2>
        <p className="text-body text-muted-foreground mb-8 max-w-[440px] mx-auto">
          Run a full employer intelligence scan or upload an offer letter for analysis.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate("/browse")}
            className="bg-primary text-primary-foreground px-7 py-3 font-mono text-label font-semibold tracking-wider uppercase hover:brightness-110 transition-all flex items-center gap-2"
          >
            Run Employer Scan <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/check")}
            className="border border-border text-muted-foreground px-7 py-3 font-mono text-label tracking-wider uppercase hover:border-primary hover:text-primary transition-all"
          >
            Upload Offer Letter
          </button>
        </div>
      </section>
    </div>
  );
}
