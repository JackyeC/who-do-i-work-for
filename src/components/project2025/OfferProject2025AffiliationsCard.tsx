import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProject2025LinksForCompany } from "@/lib/project2025";

interface Props {
  companyId?: string;
}

export function OfferProject2025AffiliationsCard({ companyId }: Props) {
  const { data: slug } = useQuery({
    queryKey: ["company-slug-for-p25", companyId],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("slug").eq("id", companyId!).maybeSingle();
      return data?.slug ?? null;
    },
    enabled: !!companyId,
  });

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["project2025-links", companyId],
    queryFn: () => getProject2025LinksForCompany(companyId!),
    enabled: !!companyId,
  });

  if (!companyId) return null;

  const dossierHref = slug ? `/dossier/${slug}#project2025` : null;

  return (
    <Card className="border-border/40 bg-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold flex items-center gap-2 text-foreground">
          <Network className="w-3.5 h-3.5 text-muted-foreground" />
          External network affiliations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
        {!isLoading && links.length === 0 && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            No Project 2025 affiliations found in our current data.
          </p>
        )}
        {!isLoading && links.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We found documented links between this employer (or related entities) and Project 2025 source lists.
            </p>
            {dossierHref && (
              <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                <Link to={dossierHref}>View details</Link>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
