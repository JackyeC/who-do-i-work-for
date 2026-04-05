import { Link } from "react-router-dom";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Mic, Users, Briefcase, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RESET_ROOM } from "@/config/resetRoom";

export default function ResetRoom() {
  usePageSEO({
    title: `${RESET_ROOM.title} — Who Do I Work For?`,
    description: `${RESET_ROOM.tagline} Monthly live ${RESET_ROOM.liveSessionName} with Q&A, replay, and straight talk on employers, public records, and hiring tech — for seekers and recruiters.`,
    path: "/reset-room",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <section className="max-w-[800px] mx-auto px-6 lg:px-16 pt-16 pb-10">
          <p className="font-mono text-xs tracking-[0.15em] uppercase text-primary mb-3">Community</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            {RESET_ROOM.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{RESET_ROOM.tagline}</p>
          <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/40 pl-4 mb-8">
            A place to reset how you think about work: whether you&apos;re searching for a role or searching for
            candidates. Same table, same standards — public records, not spin — plus room to ask what you&apos;re
            stuck on.
          </p>

          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-base font-bold text-foreground">Monthly live session</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              We run the call as <strong className="text-foreground">{RESET_ROOM.liveSessionName}</strong> — group
              video, Q&amp;A, and a replay or recap after each session. You can subscribe on{" "}
              <Link to="/pricing" className="text-primary hover:underline font-medium">
                Pricing
              </Link>{" "}
              ($15/mo when checkout is live; Founding Supporters window may apply).
            </p>
            <ul className="text-sm text-foreground space-y-2">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Job seekers: reading employers, interviews, and offers with receipts-backed context</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Recruiters &amp; TA: candidate conversations, process, and hiring AI without the brochure talk</span>
              </li>
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="rounded-xl border border-border/80 p-5 bg-muted/20">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">If you&apos;re job searching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bring questions on employers, applications, and how to use the platform so you don&apos;t guess alone.
              </p>
            </div>
            <div className="rounded-xl border border-border/80 p-5 bg-muted/20">
              <Briefcase className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">If you&apos;re hiring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Align on how candidates read you, what the public record shows, and how to run a fair, credible search.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button asChild className="rounded-full">
              <Link to="/pricing">
                View pricing <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/contact">Contact</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
              <Link to="/join">Join the list</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
