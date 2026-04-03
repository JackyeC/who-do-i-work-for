import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Info, ExternalLink } from "lucide-react";
import { getProject2025LinksForCompany, type Project2025Link } from "@/lib/project2025";
import { cn } from "@/lib/utils";

function linkLine(link: Project2025Link): string {
  const role = link.primaryRole || "a contributor";
  if (link.entityType === "org") {
    return `${link.entityName} — listed in Project 2025 as ${role}. Linked to this company as ${link.relationshipType}.`;
  }
  return `${link.entityName} — named in Project 2025 as ${role}. Linked to this company as ${link.relationshipType}.`;
}

interface Props {
  companyId: string;
}

export function Project2025DossierSection({ companyId }: Props) {
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["project2025-links", companyId],
    queryFn: () => getProject2025LinksForCompany(companyId),
    enabled: !!companyId,
  });

  return (
    <Card id="project2025" className="border-border/40 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span>Project 2025 network</span>
          {!isLoading && links.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="ml-1 inline-flex text-muted-foreground hover:text-foreground"
                  aria-label="About this section"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                This section lists documented connections between this company (or related entities) and Project 2025. It is
                based on public contributor and advisory-board lists and is provided only as factual context.
              </TooltipContent>
            </Tooltip>
          )}
          <Badge variant="outline" className={cn("text-xs ml-auto", links.length > 0 ? "border-primary/30" : "")}>
            {!isLoading && links.length === 0 ? "No affiliations found" : null}
            {!isLoading && links.length > 0 ? "Affiliations detected" : null}
            {isLoading ? "…" : null}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && links.length === 0 && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            We did not find this company or its linked entities in the Project 2025 contributor or advisory-board lists we
            checked.
          </p>
        )}

        {!isLoading && links.length > 0 && (
          <ul className="space-y-3">
            {links.map((link, i) => (
              <li key={`${link.entityName}-${link.relationshipType}-${i}`} className="text-sm text-foreground leading-snug">
                <p>{linkLine(link)}</p>
                {link.evidenceUrl && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <a href={link.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground underline-offset-2 hover:underline">
                      Source: Project 2025 list
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
          Some workers care about an employer’s connections to political or policy networks when deciding where to work. This
          section shows documented links between this company (or related entities) and Project 2025, a Heritage
          Foundation–directed &apos;2025 Presidential Transition Project&apos; that includes a policy guide called The
          Conservative Promise, an advisory board of organizations, and contributor lists. We only display names and roles
          that appear in public lists we can cite. We do not rate these affiliations; they are provided so you can decide for
          yourself whether they matter to your situation.
        </p>
      </CardContent>
    </Card>
  );
}
