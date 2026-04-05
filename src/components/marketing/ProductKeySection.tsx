import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const WHAT_WE_DO = [
  "Company profiles and “Receipts” drawn from public records (political spending, enforcement, filings, and similar sources).",
  "Tools for jobs, offer review, career planning, and coaching-style chat—all scoped to help you decide with clearer context.",
  "Live signal feeds and scores that summarize patterns in our data—not a job board rating and not legal or financial advice.",
] as const;

/**
 * Explains why users are on WDIWF, what the product does, and how to read scores / Receipts / ticker / AI.
 * Reused on the homepage (`#product-key`) and About (`#product-key-about`).
 */
export function ProductKeySection({
  sectionId = "product-key",
  className,
}: {
  sectionId?: string;
  className?: string;
}) {
  const headingId = `${sectionId}-heading`;

  return (
    <section
      id={sectionId}
      className={cn(
        "scroll-mt-28 px-6 lg:px-16 py-14 lg:py-20 bg-muted/35 border-b border-border",
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-primary shrink-0" aria-hidden />
          <p className="font-mono text-xs tracking-[0.15em] uppercase text-primary text-center">
            Why you’re here · Product key
          </p>
        </div>
        <h2
          id={headingId}
          className="font-sans text-foreground text-center font-extrabold mb-4 leading-tight"
          style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.65rem)" }}
        >
          You’re here to evaluate an employer before you commit—not to be evaluated by one.
        </h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[58ch] mx-auto mb-10">
          Most visitors are <strong className="text-foreground/90">researching a company</strong>,{" "}
          <strong className="text-foreground/90">comparing offers</strong>, or{" "}
          <strong className="text-foreground/90">preparing for interviews and negotiations</strong>. Who Do I Work For? pulls
          together public filings and workforce signals so you can see how a company actually behaves—not just how it brands itself.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-sans font-bold text-foreground text-sm mb-3 tracking-tight">What this product does</h3>
            <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
              {WHAT_WE_DO.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="text-primary font-bold shrink-0" aria-hidden>
                    ·
                  </span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-sans font-bold text-foreground text-sm mb-3 tracking-tight">Key to what you see on screen</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-foreground">Employer Clarity Score (0–100)</dt>
                <dd className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  A composite from transparency-related signals we track for that company. Higher usually means more observable
                  disclosure in our datasets—it is <strong className="text-foreground/85">not</strong> a recommendation to accept or
                  reject a job.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Receipts</dt>
                <dd className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Findings tied to primary sources (e.g. FEC, SEC, OSHA, lobbying, WARN where available). Each receipt should be
                  read in context; we surface evidence so you can interpret it.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Live ticker &amp; signal cards</dt>
                <dd className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Recent detections from our pipeline. Each headline belongs to <strong className="text-foreground/85">one employer</strong>{" "}
                  and links through to that company when you click—category, company name, and source go together.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">AI-assisted features</dt>
                <dd className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Help translate dense signals, expand job searches, or draft text from <em>your</em> inputs. AI output is labeled
                  and scoped to the screen you’re on—it does not replace reading sources or professional advice.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
