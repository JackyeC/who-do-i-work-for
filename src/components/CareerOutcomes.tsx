import { ExternalLink } from "lucide-react";
import { getWYWMBySlug, WYWM_ATTRIBUTION, type WYWMBadgeLevel } from "@/data/wywmData";

function BadgePill({ level, label }: { level: WYWMBadgeLevel; label: string }) {
  const styles: Record<WYWMBadgeLevel, string> = {
    Platinum: "bg-[#F0C040]/15 text-[#F0C040] border-[#F0C040]/30",
    Gold: "bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30",
    None: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${styles[level]}`}
      >
        {level === "None" ? "Not Rated" : level}
      </span>
    </div>
  );
}

export function CareerOutcomes({ slug }: { slug: string }) {
  const data = getWYWMBySlug(slug);

  return (
    <div className="mt-12 border-t border-border pt-10">
      <p className="font-mono text-xs text-primary tracking-wider uppercase mb-1">
        Section 05
      </p>
      <h2 className="text-2xl font-bold text-foreground mb-1">
        Career Outcomes
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        How this employer pays, promotes, and retains its workforce — independently rated.
      </p>

      {!data ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Career outcome data not yet available for this employer.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall badge */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Overall WYWM Rating
                </p>
                <span
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-bold border ${
                    data.overall === "Platinum"
                      ? "bg-[#F0C040]/15 text-[#F0C040] border-[#F0C040]/30"
                      : data.overall === "Gold"
                        ? "bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30"
                        : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {data.overall === "None" ? "Not Rated" : data.overall}
                </span>
              </div>
              {data.occupationsAssessed && (
                <p className="text-xs text-muted-foreground font-mono">
                  {data.occupationsAssessed} occupations assessed
                </p>
              )}
            </div>

            {/* Archetype badges */}
            <div className="grid grid-cols-3 gap-4">
              <BadgePill level={data.earlyCareer} label="Early Career" />
              <BadgePill level={data.growth} label="Growth" />
              <BadgePill level={data.stability} label="Stability" />
            </div>
          </div>

          {/* Link + attribution */}
          {data.wywmUrl && (
            <a
              href={data.wywmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View full career outcomes <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            {WYWM_ATTRIBUTION}
          </p>
        </div>
      )}
    </div>
  );
}
