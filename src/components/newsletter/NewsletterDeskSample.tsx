import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  deskSampleMeta,
  emailEdition,
  socialPosts,
  SUBSTACK_NEWSLETTER_URL,
  websiteBrief,
} from "@/content/newsletterDeskSample";

function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Try selecting the text manually.", variant: "destructive" });
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={copy}>
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? "Copied" : "Copy"}
    </Button>
  );
}

function SocialBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</span>
        <CopyTextButton text={body} label={title} />
      </div>
      <pre className="p-4 text-sm text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed max-h-[min(320px,50vh)] overflow-y-auto">
        {body}
      </pre>
    </div>
  );
}

/** Static sample desk — shown only when no live Supabase row is available (clearly labeled by parent). */
export function NewsletterDeskSample() {
  const sc = websiteBrief.signalCheck;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="px-5 pt-5 pb-2 border-b border-border/40">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{deskSampleMeta.title}</h2>
            <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wide">
              Sample format
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">{deskSampleMeta.note}</p>
        </div>

        <Tabs defaultValue="website" className="w-full">
          <div className="px-5 pt-4">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
              <TabsTrigger value="website" className="text-xs sm:text-sm py-2">
                Website brief
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm py-2">
                Email (Substack)
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm py-2">
                Social posts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="website" className="px-5 pb-6 pt-4 space-y-6 focus-visible:outline-none">
            <p className="text-sm text-foreground/90 leading-relaxed">{websiteBrief.deck}</p>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-foreground">{websiteBrief.lead.headline}</h3>
                {websiteBrief.lead.developing && (
                  <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30 text-[10px] uppercase tracking-wide">
                    Developing
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{websiteBrief.lead.body}</p>

              <p className="text-xs font-semibold text-foreground mb-2">Source map</p>
              <ul className="space-y-1.5 mb-3">
                {websiteBrief.sourceMap.map((s) => (
                  <li key={s.outlet} className="text-sm">
                    <span className="font-medium text-foreground">{s.outlet}</span>
                    <span className="text-muted-foreground"> — {s.bias} — </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs inline-flex items-center gap-0.5 hover:underline"
                    >
                      Read <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium text-foreground">Coverage mix:</span> {websiteBrief.coverageMix}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                <strong>DEVELOPING</strong> — {websiteBrief.developingNote}
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
              <h4 className="text-sm font-bold text-primary tracking-wide uppercase">Signal Check™</h4>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">What happened</p>
                <p className="text-sm leading-relaxed">{sc.whatHappened}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Where the coverage leans</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Left</span> → {sc.leans.left}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Center</span> → {sc.leans.center}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Right</span> → {sc.leans.right}
                  </li>
                </ul>
                <p className="text-sm mt-2 pl-2 border-l-2 border-primary/40 whitespace-pre-line">{sc.bridge1}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">What changes depending on the source</p>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  {sc.shifts.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">What’s not being said</p>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  {sc.gaps.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="text-sm mt-2 pl-2 border-l-2 border-primary/40 whitespace-pre-line">{sc.bridge2}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Who shapes what you’re reading</p>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  {sc.incentives.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="text-sm mt-2 pl-2 border-l-2 border-primary/40">{sc.bridge3}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Signal strength</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {sc.signalStrength.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">People Puzzles take</p>
                <p className="text-sm leading-relaxed">{sc.peoplePuzzles}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">The question that matters</p>
                <p className="text-sm leading-relaxed italic">{sc.question}</p>
              </div>
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/25 px-3 py-3">
                <p className="text-xs font-semibold text-foreground mb-1">Decision impact</p>
                <p className="text-sm leading-relaxed">
                  👉 <strong>What this should or could change for you this week:</strong> {sc.decisionImpact}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Jackye’s take</p>
                <p className="text-sm leading-relaxed">{sc.jackyeTake}</p>
              </div>
            </div>

            {websiteBrief.secondary.map((sec) => (
              <div key={sec.headline} className="border-t border-border/40 pt-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{sec.label}</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold">{sec.headline}</h3>
                  <Badge
                    variant="outline"
                    className={
                      sec.developing
                        ? "text-[10px] border-amber-500/40 text-amber-800 dark:text-amber-200"
                        : "text-[10px] border-emerald-500/40 text-emerald-800 dark:text-emerald-200"
                    }
                  >
                    {sec.developing ? "Developing" : "Verified"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{sec.blurb}</p>
              </div>
            ))}

            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Quick hits</p>
              <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                {websiteBrief.quickHits.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="email" className="px-5 pb-6 pt-4 space-y-4 focus-visible:outline-none">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2 text-sm">
              <p>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Subject</span>
                <br />
                <span className="font-medium text-foreground">{emailEdition.subject}</span>
              </p>
              <p>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Preview</span>
                <br />
                <span className="text-muted-foreground">{emailEdition.previewText}</span>
              </p>
            </div>
            <p className="text-sm">{emailEdition.greeting}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{emailEdition.intro}</p>
            <p className="text-xs text-muted-foreground">
              Full email body matches the Substack template (lead + Signal Check™ + sections + quick hits). Subscribe
              below for the real send.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {SUBSTACK_NEWSLETTER_URL ? (
                <Button asChild size="sm">
                  <a href={SUBSTACK_NEWSLETTER_URL} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    Open Substack <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Set <code className="rounded bg-muted px-1 py-0.5">VITE_SUBSTACK_URL</code> to show the live Substack
                  button.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("newsletter-subscribe")?.scrollIntoView({ behavior: "smooth" })}
              >
                Email signup on this page
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="social" className="px-5 pb-6 pt-4 space-y-4 focus-visible:outline-none">
            <p className="text-xs text-muted-foreground">
              Same-day burst assets (LinkedIn, Bluesky, X, Instagram). Copy and paste into each platform; UTMs live in
              <code className="mx-1 rounded bg-muted px-1 py-0.5">newsletter/delivery/PUBLISHING.md</code>.
            </p>
            <SocialBlock title="LinkedIn" body={socialPosts.linkedin} />
            <SocialBlock title="Bluesky" body={socialPosts.bluesky} />
            <SocialBlock title="X / Twitter" body={socialPosts.x} />
            <SocialBlock title="Instagram" body={socialPosts.instagram} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
