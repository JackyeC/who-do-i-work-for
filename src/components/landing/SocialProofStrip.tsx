import { SectionReveal } from "@/components/landing/SectionReveal";

const platforms: { label: string; url: string }[] = [
  { label: "LinkedIn Learning", url: "https://www.linkedin.com/learning/" },
  { label: "HR Tech Conference", url: "https://www.hrtechnologyconference.com/" },
  { label: "Recruiting Daily", url: "https://recruitingdaily.com/" },
  { label: "SHRM", url: "https://www.shrm.org/" },
  { label: "TAtech", url: "https://www.tatech.org/" },
  { label: "ERE Media", url: "https://www.ere.net/" },
];

const pillars = [
  { stat: "15+", label: "Years in Talent Acquisition" },
  { stat: "Board Member", label: "HR Technology Advisory" },
  { stat: "LinkedIn Learning", label: "Published Instructor" },
];

export function SocialProofStrip() {
  return (
    <SectionReveal>
      <div className="border-y border-border px-6 lg:px-16 py-14 lg:py-16">
        <div className="max-w-[960px] mx-auto flex flex-col gap-10">
          {/* Row 1 — Platform badges (styled, not plain text) */}
          <div className="flex flex-col items-center gap-4">
            <span className="font-mono text-sm tracking-[0.2em] uppercase text-muted-foreground/50">
              Featured In
            </span>
            <div className="flex items-center justify-center gap-3 lg:gap-4 flex-wrap">
              {platforms.map((p) => (
                <a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-muted/30 font-sans text-sm font-medium text-foreground/70 hover:border-primary/40 hover:text-primary transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {/* Row 2 — Three proof pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {pillars.map((p) => (
              <div key={p.label} className="text-center">
                <div className="font-data text-2xl font-bold text-foreground mb-1">
                  {p.stat}
                </div>
                <div className="font-mono text-sm tracking-wider uppercase text-muted-foreground">
                  {p.label}
                </div>
              </div>
            ))}
          </div>

          {/* Row 3 — Credibility quote */}
          <div className="max-w-[540px] mx-auto">
            <blockquote className="border-l-2 border-primary pl-4">
              <p className="font-serif italic text-base text-foreground/80 leading-relaxed mb-2">
                "Jackye doesn't just understand recruiting — she understands the systems behind it."
              </p>
              <cite className="font-mono text-sm tracking-wider uppercase text-muted-foreground not-italic">
                — Industry Peer, HR Technology Leader
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
