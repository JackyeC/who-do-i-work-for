import { Link } from "react-router-dom";
import {
  type SourceProfile,
  resolveSourceProfile,
  getBiasColor,
  getBiasShortLabel,
  getFactualityColor,
} from "@/lib/source-bias-map";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const METHOD_ANCHOR = "/newsletter#source-orientation";

type Variant = "default" | "compact";

export type SourceOrientationChipProps = {
  sourceName: string | null;
  /** Per-row override from `work_news.source_bias_override` (charter labels). */
  biasOverride?: string | null;
  variant?: Variant;
  className?: string;
};

function profileForProps({
  sourceName,
  biasOverride,
}: Pick<SourceOrientationChipProps, "sourceName" | "biasOverride">): SourceProfile {
  return resolveSourceProfile(sourceName, biasOverride);
}

function factualityAbbrev(f: SourceProfile["factuality"]): string {
  switch (f) {
    case "High":
      return "High";
    case "Mixed":
      return "Mixed";
    case "Low":
      return "Low";
    default:
      return "";
  }
}

/**
 * Shows outlet orientation (WDIWF desk label) + factuality; tooltip explains methodology.
 */
export function SourceOrientationChip({
  sourceName,
  biasOverride,
  variant = "default",
  className,
}: SourceOrientationChipProps) {
  const profile = profileForProps({ sourceName, biasOverride });
  const biasColor = getBiasColor(profile.bias);
  const factColor = getFactualityColor(profile.factuality);
  const shortBias = getBiasShortLabel(profile.bias);
  const factAbbrev = factualityAbbrev(profile.factuality);

  const titleParts = [
    `Outlet orientation: ${profile.bias}`,
    profile.factuality !== "Unknown" ? `Factuality (outlet tier): ${profile.factuality}` : null,
    "Receipts: how this outlet tends to frame work & labor — same label for every reader, not a verdict on this headline.",
  ].filter(Boolean);

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-1 shrink-0", className)}>
        {profile.bias !== "Unknown" && (
          <span
            className={cn(
              "font-mono text-[9px] font-semibold px-1 py-px border rounded",
              biasColor,
            )}
            style={{ borderColor: "currentColor", opacity: 0.85, lineHeight: 1 }}
            title={titleParts.join(" · ")}
          >
            {shortBias}
          </span>
        )}
        {profile.bias === "Unknown" && (
          <span
            className="font-mono text-[9px] text-muted-foreground/60 px-1"
            title="Not mapped yet — we still show the byline and link. Facts stand on their own."
          >
            —
          </span>
        )}
        {profile.factuality !== "Unknown" && (
          <span
            className={cn("font-mono text-[9px]", factColor)}
            style={{ opacity: 0.75 }}
            title={`Factuality tier: ${profile.factuality}`}
          >
            {profile.factuality === "High" ? "✓" : profile.factuality === "Mixed" ? "~" : "✗"}
          </span>
        )}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex flex-wrap items-center gap-1.5 text-[10px] font-mono tracking-wide cursor-help",
            className,
          )}
        >
          <span className={cn("font-semibold", biasColor)}>{profile.bias}</span>
          {factAbbrev ? (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className={cn("font-medium", factColor)}>{factAbbrev}</span>
            </>
          ) : null}
          <span className="text-muted-foreground/50 normal-case tracking-normal">desk label</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
        <p className="font-medium mb-1">Receipts: outlet orientation</p>
        <p className="text-muted-foreground mb-2">
          Inclusive desk rule: everyone sees the same lean label so you can judge the story with context — not a
          verdict on a person. Factuality is a general tier for the outlet. Takes (when labeled) come after the facts
          and speak to what workers and leaders here actually care about.
        </p>
        <Link
          to={METHOD_ANCHOR}
          className="text-primary underline-offset-2 hover:underline font-medium"
        >
          Read more on this page
        </Link>
      </TooltipContent>
    </Tooltip>
  );
}
