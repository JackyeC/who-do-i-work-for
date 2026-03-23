import { useState, lazy, Suspense, forwardRef } from "react";
import jackyeHeadshotSm from "@/assets/jackye-headshot-sm.webp";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield, ArrowRight, Eye, Brain, Rocket, CheckCircle2,
  Menu, X, FileSearch, Target, AlertTriangle, Link2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/hooks/use-page-seo";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { PathfinderTracks } from "@/components/landing/PathfinderTracks";
import { DemoCompanyProfile } from "@/components/landing/DemoCompanyProfile";

const LiveIntelligenceTicker = lazy(() => import("@/components/landing/LiveIntelligenceTicker").then(m => ({ default: m.LiveIntelligenceTicker })));
const SocialProofStrip = lazy(() => import("@/components/landing/SocialProofStrip").then(m => ({ default: m.SocialProofStrip })));
const IntelligenceDashboard = lazy(() => import("@/components/landing/IntelligenceDashboard").then(m => ({ default: m.IntelligenceDashboard })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const EmailCapture = lazy(() => import("@/components/landing/EmailCapture").then(m => ({ default: m.EmailCapture })));
const ExitIntentCapture = lazy(() => import("@/components/ExitIntentCapture").then(m => ({ default: m.ExitIntentCapture })));
const SectionReveal = lazy(() => import("@/components/landing/SectionReveal").then(m => ({ default: m.SectionReveal })));

const TRUST_SOURCES: { label: string; url: string }[] = [
  { label: "FEC Filings", url: "https://www.fec.gov/data/" },
  { label: "USASpending.gov", url: "https://www.usaspending.gov/" },
  { label: "SEC EDGAR", url: "https://www.sec.gov/edgar" },
  { label: "Senate Lobbying", url: "https://lda.senate.gov/system/public/" },
  { label: "BLS Wage Data", url: "https://www.bls.gov/oes/" },
  { label: "OpenSecrets", url: "https://www.opensecrets.org/" },
];
const STATIC_COMPANY_COUNT = 850;

/* ── Countdown timer to April 6, 2026 launch ── */
function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());

  function getTimeLeft() {
    const launch = new Date("2026-04-06T09:00:00-07:00").getTime();
    const now = Date.now();
    const diff = Math.max(0, launch - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    };
  }

  // Update every minute
  useState(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 60_000);
    return () => clearInterval(id);
  });

  if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0) return null;

  return (
    <div className="inline-flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5">
      <span className="font-mono text-xs tracking-wider uppercase text-primary-text font-semibold">
        Full platform launches in
      </span>
      <div className="flex items-center gap-1.5">
        <span className="font-data text-sm font-bold text-foreground tabular-nums">{timeLeft.days}d</span>
        <span className="text-muted-foreground/40">:</span>
        <span className="font-data text-sm font-bold text-foreground tabular-nums">{timeLeft.hours}h</span>
        <span className="text-muted-foreground/40">:</span>
        <span className="font-data text-sm font-bold text-foreground tabular-nums">{timeLeft.minutes}m</span>
      </div>
    </div>
  );
}

const Index = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoaded } = useClerkWithFallback();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  usePageSEO({
    title: "Who Do I Work For? — Career Intelligence Powered by Public Records",
    description: "Free company investigations using FEC filings, SEC disclosures, OSHA violations, and lobbying records. 850+ companies tracked. Know before you apply.",
    path: "/",
    jsonLd: {
      "@type": "WebApplication",
      name: "Who Do I Work For?",
      description: "Career Intelligence platform. Audit your career, not just search for jobs.",
      applicationCategory: "BusinessApplication",
      creator: { "@type": "Person", name: "Jackye Clayton" },
      url: "https://wdiwf.jackyeclayton.com",
    },
  });

  if (!isLoaded || authLoading) return null;

  return (
    <div ref={ref} className="flex flex-col min-h-screen bg-background">
      {/* ── Site Header (Sticky) ── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 lg:px-16 py-4 w-full">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <span style={{fontFamily:"Inter,sans-serif",fontWeight:900,letterSpacing:"-0.03em",fontSize:"26px"}}>
              <span style={{color:"#111111"}}>W</span>
              <span style={{color:"#F0C040"}}>?</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/receipts" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
              Receipts
            </Link>
            <Link to="/pricing" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/methodology" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            {!authLoading && (
              user ? (
                <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="font-sans text-btn">
                  Dashboard
                </Button>
              ) : (
                <>
                  <button onClick={() => navigate("/login")} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Sign in
                  </button>
                  <Button size="sm" onClick={() => navigate("/login")} className="font-sans text-btn rounded-full px-5">
                    Get started
                  </Button>
                </>
              )
            )}
          </nav>
          <button className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 border-b border-border/50 bg-background">
          <nav className="flex flex-col gap-3 pt-2">
            <Link to="/receipts" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Receipts
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Pricing
            </Link>
            <Link to="/methodology" onClick={() => setMobileMenuOpen(false)} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              About
            </Link>
            {!authLoading && (
              user ? (
                <Button size="sm" variant="outline" onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="font-sans text-sm w-full">Dashboard</Button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-2">Sign in</button>
                  <Button size="sm" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="font-sans text-sm w-full">Get started</Button>
                </>
              )
            )}
          </nav>
        </div>
      )}

      <Suspense fallback={null}><ExitIntentCapture /></Suspense>

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Tightened copy + product proof above the fold
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center px-6 text-center pt-20 pb-16 lg:pt-28 lg:pb-20 bg-background">
        {/* Grain overlay */}
        <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>

        <div className="relative z-[1] flex flex-col items-center max-w-[720px]">
          {/* Eyebrow */}
          <p className="text-eyebrow text-primary-text" style={{ marginBottom: '16px', opacity: 0, animation: 'heroFadeIn 0.5s ease 0.15s forwards' }}>
            Career Intelligence Platform
          </p>

          {/* Headline — specific, product-forward */}
          <h1
            className="text-display text-foreground"
            style={{ animation: "heroFadeIn 0.7s ease 0.3s forwards", opacity: 0 }}
          >
            {STATIC_COMPANY_COUNT}+ companies investigated.
            <br />
            <span className="text-primary-text">Every receipt public.</span>
          </h1>

          {/* Subheadline — what it does, concretely */}
          <p
            className="font-sans text-muted-foreground text-center max-w-[560px]"
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              marginTop: "20px",
              opacity: 0,
              animation: "heroFadeIn 0.6s ease 0.7s forwards",
            }}
          >
            We pull FEC filings, lobbying records, OSHA violations, and SEC disclosures
            so you see what's real before you apply.
          </p>

          {/* CTA hierarchy: Primary → Secondary → Soft */}
          <div
            className="flex flex-col sm:flex-row items-center gap-3 mt-8"
            style={{ opacity: 0, animation: "heroFadeIn 0.5s ease 1s forwards" }}
          >
            <button
              onClick={() => navigate("/receipts")}
              className="hover-btn bg-primary text-primary-foreground font-sans text-base font-semibold px-8 py-3.5 rounded-full border-none cursor-pointer"
            >
              See the Receipts — Free
            </button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="rounded-full px-6 font-sans"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Launch countdown */}
          <div className="mt-6" style={{ opacity: 0, animation: "heroFadeIn 0.5s ease 1.3s forwards" }}>
            <LaunchCountdown />
          </div>

          {/* Product preview — mini demo card */}
          <div
            className="mt-12 w-full max-w-[600px] bg-card border border-border rounded-xl overflow-hidden shadow-lg"
            style={{ opacity: 0, animation: "heroFadeIn 0.6s ease 1.5s forwards" }}
          >
            <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--civic-yellow))]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(142,71%,45%)]/60" />
              </div>
              <span className="font-mono text-xs text-muted-foreground tracking-wider">wdiwf.jackyeclayton.com/company/example</span>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Integrity Gap", value: "High", color: "text-destructive" },
                { label: "PAC Spending", value: "$2.1M", color: "text-primary-text" },
                { label: "OSHA Flags", value: "12", color: "text-destructive" },
                { label: "Civic Score", value: "3.2/10", color: "text-foreground" },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className={`font-data text-lg font-bold tabular-nums ${metric.color}`}>{metric.value}</div>
                  <div className="font-mono text-xs text-muted-foreground tracking-wider uppercase mt-0.5">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* heroFadeIn keyframe */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Live Intelligence Ticker ── */}
      <Suspense fallback={null}>
        <LiveIntelligenceTicker />
      </Suspense>

      {/* ══════════════════════════════════════════════════════════════════
          DEMO DOSSIER — moved up: best hook right after hero
      ══════════════════════════════════════════════════════════════════ */}
      <section id="demo-dossier" className="px-6 lg:px-16 py-20 lg:py-28 bg-card border-y border-border">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-10">
            <div className="font-mono text-sm tracking-[0.2em] uppercase text-primary-text mb-3">
              This is what you won't see on a job board
            </div>
            <h2 className="text-2xl lg:text-3xl text-foreground mb-4">
              Most candidates never see this before they accept.{" "}
              <span className="text-primary-text">You should.</span>
            </h2>
          </div>
          <DemoCompanyProfile />
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => navigate("/receipts")}
              className="bg-primary text-primary-foreground px-8 py-3.5 font-sans text-sm font-semibold tracking-wide hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2"
            >
              See Real Company Receipts
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="border border-border bg-background px-8 py-3.5 font-sans text-sm tracking-wide text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all rounded-full"
            >
              Run This for a Company
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          THE FOUR PILLARS — consolidated into one clean section
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-16 py-20 lg:py-28 bg-background">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[3px] font-semibold text-primary-text mb-3">
              How It Works
            </p>
            <h2 className="text-2xl lg:text-3xl text-foreground mb-4">
              Four pillars. Full transparency.
            </h2>
            <p className="text-base text-muted-foreground max-w-[520px] mx-auto">
              We pull public records, score every company across four dimensions, and give you free, shareable reports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {[
              {
                icon: <FileSearch className="w-5 h-5 text-primary" />,
                step: "01",
                title: "Integrity Gap",
                body: "What they say vs. what FEC filings, lobbying disclosures, and workforce data show.",
              },
              {
                icon: <Target className="w-5 h-5 text-primary" />,
                step: "02",
                title: "Labor Impact",
                body: "WARN Act layoffs, workforce cuts, and hiring freezes tracked by state, date, and scale.",
              },
              {
                icon: <AlertTriangle className="w-5 h-5 text-primary" />,
                step: "03",
                title: "Safety Alert",
                body: "OSHA violations, NLRB complaints, EPA enforcement, and workplace safety records.",
              },
              {
                icon: <Link2 className="w-5 h-5 text-primary" />,
                step: "04",
                title: "Connected Dots",
                body: "PAC spending, executive donations, lobbying ties, and federal contracts. Follow the money.",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="bg-background p-6 lg:p-7">
                <span className="inline-block font-mono text-xs tracking-wider uppercase text-primary-text font-bold mb-3">
                  {pillar.step}
                </span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-primary/10">
                  {pillar.icon}
                </div>
                <h3 className="font-sans font-semibold text-[15px] text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          {/* Inline search */}
          <div className="mt-12 max-w-[560px] mx-auto text-center">
            <div className="font-sans text-sm text-muted-foreground mb-3">
              Search any company — results are free and instant
            </div>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ── Evidence Strip ── */}
      <div className="border-y border-border px-6 py-8">
        <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8 lg:gap-14 flex-wrap justify-center sm:justify-start">
            <div className="text-center sm:text-left">
              <div className="font-data text-2xl font-bold text-foreground tabular-nums">{STATIC_COMPANY_COUNT}+</div>
              <div className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Companies Tracked</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-data text-2xl font-bold text-foreground tabular-nums">6</div>
              <div className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Federal Sources</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-data text-2xl font-bold text-foreground tabular-nums">15+</div>
              <div className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Years HR Expertise</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {TRUST_SOURCES.map((src) => (
              <a
                key={src.label}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs tracking-wider uppercase text-muted-foreground/60 hover:text-primary transition-colors"
              >
                {src.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          WHAT YOU GET — Three tiers of value
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-card border-y border-border px-6 lg:px-16 py-20 lg:py-28">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <div className="font-mono text-sm tracking-[0.2em] uppercase text-primary-text mb-3">What You Get</div>
            <h2 className="text-2xl lg:text-3xl mb-4 text-foreground">
              Three layers of career intelligence.
            </h2>
            <p className="text-muted-foreground text-base max-w-[520px] mx-auto">
              Start free with The Receipts. Go deeper when you need it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
            {[
              {
                icon: Eye,
                title: "The Receipts",
                badge: "Free",
                desc: "Company investigations anyone can access. No account required.",
                signals: ["Integrity Gap Analysis", "Labor Impact Tracking", "Safety Alert Reports", "Connected Dots: PAC + Lobbying"],
                cta: "See the Receipts",
                ctaAction: () => navigate("/receipts"),
                primary: true,
              },
              {
                icon: Brain,
                title: "The Intelligence",
                badge: "From $19/mo",
                desc: "Build a career plan based on data, not vibes.",
                signals: ["Workplace DNA Calibration", "5-Year Career Mapping", "Values alignment matching", "Offer review & benchmarking"],
                cta: "Explore Plans",
                ctaAction: () => navigate("/pricing"),
                primary: false,
              },
              {
                icon: Rocket,
                title: "The Advocacy",
                badge: "From $149",
                desc: "Execute your move with clarity and support.",
                signals: ["Apply When It Counts\u2122 Placement", "Interview Intelligence Briefs", "Negotiation Coaching", "Employer verification reports"],
                cta: "See Pricing",
                ctaAction: () => navigate("/pricing"),
                primary: false,
              },
            ].map(card => (
              <div key={card.title} className="bg-background p-7 lg:p-9 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <card.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  <span className="font-mono text-xs tracking-wider uppercase text-primary-text bg-primary/8 px-2 py-0.5 rounded">
                    {card.badge}
                  </span>
                </div>
                <div className="font-sans text-base font-semibold text-foreground mb-1.5">{card.title}</div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{card.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {card.signals.map(s => (
                    <li key={s} className="text-sm text-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2} />
                      {s}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={card.primary ? "default" : "outline"}
                  onClick={card.ctaAction}
                  className="w-full rounded-full font-sans text-sm gap-1.5"
                >
                  {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          COMPARISON TABLE — Job Boards vs WDIWF
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-16 py-20 lg:py-28 max-w-[960px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="font-mono text-sm tracking-[0.2em] uppercase text-primary-text mb-3">The Difference</div>
          <h2 className="text-2xl lg:text-3xl text-foreground">
            Job boards list openings. We investigate employers.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
          <div className="bg-card p-8 lg:p-10">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Indeed / LinkedIn</div>
            <ul className="space-y-3">
              {[
                "Lists of job titles",
                "Company marketing copy",
                "Apply and pray",
                "No salary transparency",
                "No culture intelligence",
                "No negotiation support",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-8 lg:p-10 border-l-2 border-l-primary">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-primary-text mb-4">WDIWF Intelligence</div>
            <ul className="space-y-3">
              {[
                "Free investigations on every employer",
                "Four-pillar framework — Integrity, Labor, Safety, Connections",
                "Apply When It Counts\u2122 — DNA-matched placement",
                "BLS wage benchmarks + offer scoring",
                "PAC spending, lobbying, federal contracts traced",
                "Negotiation scripts + coaching",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Intelligence Dashboard ── */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted/10" />}>
        <IntelligenceDashboard />
      </Suspense>

      {/* ── Social Proof (with real logos) ── */}
      <Suspense fallback={null}>
        <SocialProofStrip />
      </Suspense>

      {/* ══════════════════════════════════════════════════════════════════
          THE JACKYE FACTOR — Authority
      ══════════════════════════════════════════════════════════════════ */}
      <Suspense fallback={null}>
        <SectionReveal>
          <section className="bg-card border-y border-border px-6 lg:px-16 py-20 lg:py-28">
            <div className="max-w-[960px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-center">
              <div>
                <img
                  src={jackyeHeadshotSm}
                  alt="Jackye Clayton, Founder of Who Do I Work For"
                  className="w-24 h-24 object-cover mb-4"
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                />
                <div className="font-serif text-xl text-primary-text mb-1">Jackye Clayton</div>
                <div className="font-mono text-sm tracking-wider uppercase text-muted-foreground">
                  Founder & Executive Agent
                </div>
              </div>
              <div>
                <blockquote className="border-l-2 border-primary pl-4 text-lg italic text-foreground leading-relaxed mb-2 font-serif" style={{ fontWeight: 400 }}>
                  "I've spent 15+ years building the hiring machines for the biggest names in Tech. I know exactly where the 'Ghost Jobs' are hidden and where the hidden budget lives. I built WDIWF to put that power in your hands."
                </blockquote>
                <div className="font-mono text-sm tracking-wider uppercase text-muted-foreground pl-4 mb-6">— Jackye Clayton, Founder & Executive Agent</div>
                <div className="flex items-center gap-3 pl-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-mono text-xs tracking-wider uppercase text-primary-text">15+ years in Talent Acquisition &middot; LinkedIn Learning Instructor &middot; HR Tech Board Member</span>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>
      </Suspense>

      {/* ── Pricing preview (first 3 tracks) ── */}
      <PathfinderTracks />

      {/* ── Methodology ── */}
      <section className="px-6 lg:px-16 py-16 lg:py-20">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl mb-4 text-foreground">Built on public records. Every signal sourced.</h2>
            <p className="text-sm text-muted-foreground max-w-[520px] mx-auto mb-6">
              FEC filings &middot; Senate lobbying &middot; USAspending &middot; BLS wage data &middot; SEC reports &middot; FRED indicators.
            </p>
            <button onClick={() => navigate("/methodology")} className="font-mono text-sm tracking-wider uppercase text-primary-text hover:underline">
              Read our methodology &rarr;
            </button>
          </div>
          <div className="bg-card border border-primary/20 p-6 lg:p-8 max-w-[640px] mx-auto rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm tracking-[0.15em] uppercase text-primary-text font-semibold">Our Standard</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Public records only. Verified watchdog data. No partisan endorsements. We connect the dots; you make the call.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ + Email ── */}
      <Suspense fallback={null}><FAQSection /></Suspense>
      <Suspense fallback={null}><EmailCapture /></Suspense>

      {/* ── Final CTA ── */}
      <section className="px-6 lg:px-16 py-24 lg:py-32 text-center">
        <h2 className="text-2xl lg:text-3xl mb-4 text-foreground">
          You deserve to know exactly who you work for.
        </h2>
        <p className="text-base text-muted-foreground max-w-[480px] mx-auto mb-8 leading-relaxed">
          Every claim sourced. Every dollar traced. Free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/receipts")}
            className="bg-primary text-primary-foreground px-8 py-3.5 font-sans text-sm font-semibold tracking-wide hover:brightness-110 transition-all rounded-full"
          >
            See the Receipts
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border border-border bg-card px-8 py-3.5 font-sans text-sm tracking-wide text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all rounded-full"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 lg:px-16 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1">
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
                <span style={{ color: '#111111' }}>W</span>
                <span style={{ color: '#F0C040' }}>?</span>
              </span>
              <span className="text-sm text-muted-foreground"> &middot; by Jackye Clayton</span>
            </div>
            <div className="flex gap-6">
              <Link to="/receipts" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Receipts</Link>
              <Link to="/pricing" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/privacy" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link to="/methodology" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Methodology</Link>
            </div>
          </div>
          <div className="border-t border-border/50 pt-4">
            <p className="font-mono text-xs tracking-wider text-muted-foreground/60 leading-relaxed max-w-[800px]">
              WDIWF reports publicly available data and does not provide character assessments, legal advice, or employment recommendations. All signals are sourced from public records and verified watchdog databases. Users should independently verify information before making employment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default Index;
