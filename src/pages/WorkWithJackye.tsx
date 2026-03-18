import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import jackyeHeadshot from "@/assets/jackye-headshot.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageSEO } from "@/hooks/use-page-seo";

const SERVICES = [
  {
    title: "Career Strategy Session",
    desc: "One-on-one with Jackye. We'll review your intelligence report, assess your offer, map your options, and build a decision framework. You leave with a plan.",
    for: "Candidates · Employees",
    format: "60-minute virtual session",
  },
  {
    title: "Recruiting & Talent Acquisition Advisory",
    desc: "Jackye works with your recruiting team to audit your employer promises, anticipate candidate objections, and build intelligence-backed talk tracks that close.",
    for: "Recruiters · TA Leaders",
    format: "Engagement-based",
  },
  {
    title: "HR Tech Go-to-Market Advisory",
    desc: "Positioning, messaging, and competitive intelligence for HR technology companies. Jackye helps you understand what buyers actually care about — and what they don't.",
    for: "HR Tech Founders · Sales Leaders",
    format: "Advisory retainer or project",
  },
  {
    title: "Employer Brand & Promise Strategy",
    desc: "Your Employee Value Proposition is only as strong as the data behind it. Jackye audits your employer brand against real signals and helps you close the gap between what you say and what employees experience.",
    for: "CHROs · People Leaders",
    format: "Workshop + deliverable",
  },
  {
    title: "Offer Review Intensive",
    desc: "Bring your offer letter. Jackye will break it down — compensation benchmarks, contract red flags, non-compete analysis, and negotiation strategy. You'll know exactly what to ask for.",
    for: "Candidates · Executives",
    format: "45-minute deep dive",
  },
];

export default function WorkWithJackye() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ name: "", email: "", service: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  usePageSEO({
    title: "Work With Jackye — Career Strategy & HR Advisory",
    description: "Book Jackye Clayton for career strategy, recruiting advisory, HR tech go-to-market, employer brand strategy, and offer review. 20+ years of HR expertise.",
    path: "/work-with-jackye",
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 lg:px-16 py-20 lg:py-28 max-w-[900px] mx-auto">
        <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-primary mb-4">Advisory Services</div>
        <h1 className="text-3xl lg:text-[clamp(2.2rem,4.5vw,3.2rem)] leading-tight mb-6 text-foreground">
          Work With Jackye
        </h1>
        <p className="text-body-lg text-muted-foreground mb-8 max-w-[560px]">
          The AI coach is always available. But sometimes you need the real thing — direct access to Jackye Clayton for career strategy, recruiting advisory, HR tech positioning, and offer review.
        </p>
        <div className="flex items-center gap-4 mb-12">
          <img src={jackyeHeadshot} alt="Jackye Clayton" className="w-16 h-16 object-cover shrink-0" />
          <div>
            <div className="font-serif text-base text-primary">Jackye Clayton</div>
            <div className="text-[11px] text-muted-foreground">20+ years in HR · Recruiting · Talent Strategy · HR Tech</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-6 lg:px-16 pb-20 max-w-[900px] mx-auto w-full">
        <div className="flex flex-col gap-px bg-border border border-border">
          {SERVICES.map(s => (
            <div key={s.title} className="bg-card p-6 lg:p-8">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="font-serif text-lg text-foreground">{s.title}</h3>
                <div className="font-mono text-[9px] tracking-wider uppercase text-primary shrink-0">{s.format}</div>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
              <div className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">
                For: {s.for}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interest Form */}
      <section className="px-6 lg:px-16 pb-16 max-w-[900px] mx-auto w-full">
        <div className="border border-border bg-card p-6 lg:p-10">
          <h2 className="font-serif text-xl text-foreground mb-2">Get Started</h2>
          <p className="text-[13px] text-muted-foreground mb-6 max-w-[480px]">
            Tell us what you need — we'll get back to you within 24 hours with next steps.
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--civic-green))]" />
              <div>
                <p className="text-sm font-semibold text-foreground">Request received</p>
                <p className="text-xs text-muted-foreground">We'll be in touch at {formState.email}</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!formState.name.trim() || !formState.email.trim()) return;
                setSubmitting(true);
                const { error } = await supabase.from("advisory_interest" as any).insert({
                  name: formState.name.trim(),
                  email: formState.email.trim(),
                  service_type: formState.service,
                  message: formState.message.trim() || null,
                });
                setSubmitting(false);
                if (error) {
                  toast.error("Something went wrong. Please try again.");
                } else {
                  setSubmitted(true);
                  toast.success("Request submitted!");
                }
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground mb-1.5 block">Name</label>
                  <input
                    required
                    maxLength={100}
                    value={formState.name}
                    onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    required
                    type="email"
                    maxLength={255}
                    value={formState.email}
                    onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none transition"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground mb-1.5 block">Service</label>
                <select
                  value={formState.service}
                  onChange={e => setFormState(s => ({ ...s, service: e.target.value }))}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition"
                >
                  <option value="general">General Inquiry</option>
                  {SERVICES.map(s => (
                    <option key={s.title} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground mb-1.5 block">Message (optional)</label>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={formState.message}
                  onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary outline-none transition resize-none"
                  placeholder="Tell us about your situation..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground px-7 py-3 font-mono text-[11px] font-semibold tracking-wider uppercase hover:brightness-110 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {submitting ? "Submitting…" : "Submit Request"}
                {!submitting && <ArrowRight className="w-3 h-3" />}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 lg:px-16 py-16 text-center">
        <h2 className="text-xl mb-4 text-foreground">Prefer to book directly?</h2>
        <p className="text-[13px] text-muted-foreground mb-8 max-w-[420px] mx-auto">
          Whether it's a career decision, a recruiting challenge, or an HR tech launch — Jackye brings the intelligence and the experience.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => window.open('https://calendly.com/jackyeclayton', '_blank')}
            className="border border-border text-muted-foreground px-7 py-3 font-mono text-[11px] tracking-wider uppercase hover:border-primary hover:text-primary transition-all inline-flex items-center gap-2"
          >
            Book on Calendly <ArrowRight className="w-3 h-3" />
          </button>
          <a
            href="mailto:jackye@jackyeclayton.com?subject=Advisory Request"
            className="border border-border text-muted-foreground px-7 py-3 font-mono text-[11px] tracking-wider uppercase hover:border-primary hover:text-primary transition-all inline-flex items-center gap-2"
          >
            Email Jackye
          </a>
          <button
            onClick={() => navigate("/ask-jackye")}
            className="border border-border text-muted-foreground px-7 py-3 font-mono text-[11px] tracking-wider uppercase hover:border-primary hover:text-primary transition-all"
          >
            Try Ask Jackye AI
          </button>
        </div>
      </section>
    </div>
  );
}
