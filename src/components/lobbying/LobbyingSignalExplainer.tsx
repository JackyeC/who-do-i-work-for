import { ExternalLink, Info } from "lucide-react";
import {
  extractLobbyingTopics,
  LOBBYING_WHAT_IT_IS,
  LOBBYING_WORKER_IMPACT,
  LOBBYING_FACTS_ONLY_NOTE,
  openSecretsLobbyingSearchUrl,
  senateLdaSearchUrl,
} from "@/lib/lobbyingSignalExplainer";
import { cn } from "@/lib/utils";

export interface LobbyingSignalExplainerProps {
  description: string;
  companyName?: string | null;
  sourceUrl?: string | null;
  variant?: "full" | "compact";
  className?: string;
}

export function LobbyingSignalExplainer({
  description,
  companyName,
  sourceUrl,
  variant = "full",
  className,
}: LobbyingSignalExplainerProps) {
  const topics = extractLobbyingTopics(description);
  const showTopics = topics.length > 0;
  const name = (companyName || "").trim();
  const validReceipt = sourceUrl && /^https?:\/\//i.test(sourceUrl);

  return (
    <div className={cn("space-y-3 text-xs text-muted-foreground leading-relaxed", className)}>
      <p className="text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
        {LOBBYING_FACTS_ONLY_NOTE}
      </p>
      {showTopics ? (
        <div>
          <p className="font-semibold text-foreground mb-1.5">Topics as stated in the source text</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-foreground/90">{description}</p>
      )}

      {variant === "full" && (
        <>
          <div className="flex gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">What this filing type records</p>
              <p>{LOBBYING_WHAT_IT_IS}</p>
            </div>
          </div>
          <div className="flex gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Budget and policy labels (descriptive)</p>
              <p>{LOBBYING_WORKER_IMPACT}</p>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Sources</span>
        {validReceipt ? (
          <a
            href={sourceUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Cited link
          </a>
        ) : null}
        {name ? (
          <>
            <a
              href={openSecretsLobbyingSearchUrl(name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              OpenSecrets search
            </a>
            <a
              href={senateLdaSearchUrl(name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Senate LDA search
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
