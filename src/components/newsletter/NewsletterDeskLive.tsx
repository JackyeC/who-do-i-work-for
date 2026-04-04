import { useState } from "react";
import { ExternalLink, Copy, Check, Radio } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DeskPublicationRow } from "@/hooks/use-latest-desk-publication";
import { SUBSTACK_NEWSLETTER_URL } from "@/content/newsletterDeskSample";

function formatDeskTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

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

const mdProse = cn(
  "max-w-none text-sm",
  "[&_p]:text-foreground/90 [&_p]:leading-relaxed [&_p]:my-3",
  "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-6 [&_h1]:mb-2",
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2",
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5",
  "[&_ul]:text-muted-foreground [&_ol]:text-muted-foreground",
  "[&_li]:mb-1.5",
  "[&_strong]:text-foreground",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_code]:text-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
);

export function NewsletterDeskLive({ row }: { row: DeskPublicationRow }) {
  const hasEmail =
    (row.email_subject && row.email_subject.trim()) ||
    (row.email_preview_text && row.email_preview_text.trim()) ||
    (row.newsletter_markdown && row.newsletter_markdown.trim());

  const socialPairs: { title: string; body: string | null }[] = [
    { title: "LinkedIn", body: row.social_linkedin },
    { title: "Bluesky", body: row.social_bluesky },
    { title: "X / Twitter", body: row.social_x },
    { title: "Instagram", body: row.social_instagram },
    { title: "Facebook", body: row.social_facebook },
  ];
  const socialFilled = socialPairs.filter((s) => s.body && s.body.trim());

  return (
    <Card className="border-primary/25 bg-card/80 backdrop-blur-sm ring-1 ring-primary/10">
      <CardContent className="p-0">
        <div className="px-5 pt-5 pb-2 border-b border-border/40">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Daily desk — live update</h2>
            <Badge className="text-[10px] font-mono uppercase tracking-wide bg-primary/15 text-primary border-primary/30">
              Live
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            Published {formatDeskTime(row.created_at)}
            {row.run_id ? (
              <>
                {" "}
                · <span className="font-mono text-[10px]">{row.run_id}</span>
              </>
            ) : null}
          </p>
        </div>

        <Tabs defaultValue="website" className="w-full">
          <div className="px-5 pt-4">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
              <TabsTrigger value="website" className="text-xs sm:text-sm py-2">
                Website brief
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm py-2" disabled={!hasEmail}>
                Email
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm py-2" disabled={socialFilled.length === 0}>
                Social
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="website" className="px-5 pb-6 pt-4 focus-visible:outline-none">
            <div className={mdProse}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{row.site_markdown ?? ""}</ReactMarkdown>
            </div>
          </TabsContent>

          <TabsContent value="email" className="px-5 pb-6 pt-4 space-y-4 focus-visible:outline-none">
            {!hasEmail ? (
              <p className="text-sm text-muted-foreground">No email fields were published for this run.</p>
            ) : (
              <>
                {(row.email_subject || row.email_preview_text) && (
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2 text-sm">
                    {row.email_subject ? (
                      <p>
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Subject</span>
                        <br />
                        <span className="font-medium text-foreground">{row.email_subject}</span>
                      </p>
                    ) : null}
                    {row.email_preview_text ? (
                      <p>
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Preview</span>
                        <br />
                        <span className="text-muted-foreground">{row.email_preview_text}</span>
                      </p>
                    ) : null}
                  </div>
                )}
                {row.newsletter_markdown ? (
                  <div className={mdProse}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{row.newsletter_markdown}</ReactMarkdown>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 items-center pt-2">
                  {SUBSTACK_NEWSLETTER_URL ? (
                    <Button asChild size="sm">
                      <a href={SUBSTACK_NEWSLETTER_URL} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                        Open Substack <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("newsletter-subscribe")?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Email signup on this page
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="social" className="px-5 pb-6 pt-4 space-y-4 focus-visible:outline-none">
            {socialFilled.length === 0 ? (
              <p className="text-sm text-muted-foreground">No social copy was published for this run.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Copy into each platform. UTMs:{" "}
                  <code className="rounded bg-muted px-1 py-0.5">newsletter/delivery/PUBLISHING.md</code>
                </p>
                {socialFilled.map((s) => (
                  <SocialBlock key={s.title} title={s.title} body={s.body!} />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
