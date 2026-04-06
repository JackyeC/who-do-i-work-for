import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, Loader2, Radio } from "lucide-react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { useForensicPublications } from "@/hooks/use-forensic-publications";
import type { DeskPublicationRow } from "@/hooks/use-latest-desk-publication";
import { newsletterMarkdownComponents } from "@/components/newsletter/newsletterMarkdownComponents";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  "[&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1.5 [&_th]:bg-muted/40 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5",
  "[&_img]:max-w-full",
);

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ForensicBody({ row }: { row: DeskPublicationRow }) {
  return (
    <div className={cn(mdProse, "px-1 sm:px-2")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={newsletterMarkdownComponents}>
        {row.site_markdown ?? ""}
      </ReactMarkdown>
    </div>
  );
}

export default function IntegrityReport() {
  const { data: rows = [], isLoading, isError, error } = useForensicPublications({ limit: 25 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRow = useMemo(() => {
    if (rows.length === 0) return null;
    if (selectedId) {
      return rows.find((r) => r.id === selectedId) ?? rows[0];
    }
    return rows[0];
  }, [rows, selectedId]);

  usePageSEO({
    title: "Forensic integrity report",
    path: "/integrity-report",
    description:
      "Long-form ledger analysis — labor, procurement, preemption, and corporate accountability — with Signal Check™ and primary sources.",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/newsletter"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Back to newsletter & desk
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-serif">
              Forensic integrity report
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[65ch]">
            Long-form editions that sit <strong className="text-foreground">alongside</strong> the bi-hourly desk — same
            publishing stack, separate surface so a deep dive does not replace the daily brief. Published via{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">kind: &quot;forensic&quot;</code> and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">publish-desk-publication</code>.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading report…</span>
          </div>
        )}

        {isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-6 text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load forensic reports."}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-8 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium">No published forensic edition yet.</p>
              <p>
                Operators: run{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded text-foreground">
                  ./scripts/content-engine/publish-forensic-publication.example.sh
                </code>{" "}
                after applying the Supabase migration and deploying Edge functions. Source markdown lives in{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded text-foreground">
                  newsletter/outputs/forensic/
                </code>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && selectedRow && (
          <div className="space-y-8">
            <Card className="border-primary/25 bg-card/80 backdrop-blur-sm ring-1 ring-primary/10">
              <CardContent className="p-0">
                <div className="px-5 pt-5 pb-2 border-b border-border/40">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-primary shrink-0" />
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">Current edition</h2>
                    <Badge className="text-[10px] font-mono uppercase tracking-wide bg-primary/15 text-primary border-primary/30">
                      Forensic
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {formatTime(selectedRow.created_at)}
                    {selectedRow.run_id ? ` · ${selectedRow.run_id}` : ""}
                  </p>
                </div>
                <div className="px-4 py-5 sm:px-6 sm:py-6">
                  <ForensicBody row={selectedRow} />
                </div>
              </CardContent>
            </Card>

            {rows.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Archive</h3>
                <ul className="flex flex-col gap-2">
                  {rows.map((r) => (
                    <li key={r.id}>
                      <Button
                        type="button"
                        variant={r.id === selectedRow.id ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto py-2.5 px-3 font-normal"
                        onClick={() => setSelectedId(r.id)}
                      >
                        <span className="text-xs font-mono text-muted-foreground shrink-0 mr-3 tabular-nums">
                          {formatTime(r.created_at)}
                        </span>
                        <span className="text-sm text-left truncate">
                          {r.run_id || `Edition ${r.id.slice(0, 8)}…`}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
