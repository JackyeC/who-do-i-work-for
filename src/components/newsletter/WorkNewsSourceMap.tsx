import { ExternalLink } from "lucide-react";
import { SourceOrientationChip } from "@/components/newsletter/SourceOrientationChip";
import type { WorkNewsSourceMapEntry } from "@/hooks/use-work-news";
import { cn } from "@/lib/utils";

export function WorkNewsSourceMap({
  entries,
  className,
}: {
  entries: WorkNewsSourceMapEntry[];
  className?: string;
}) {
  if (!entries.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/30 bg-muted/15 px-3 py-2.5 space-y-2",
        className,
      )}
    >
      <p className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-foreground">
        Source map
      </p>
      <ul className="space-y-2">
        {entries.map((e, i) => (
          <li key={`${e.name}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {e.url ? (
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary inline-flex items-center gap-1"
              >
                {e.name}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ) : (
              <span className="font-medium text-foreground">{e.name}</span>
            )}
            <SourceOrientationChip
              sourceName={e.name}
              biasOverride={e.bias}
              variant="compact"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
