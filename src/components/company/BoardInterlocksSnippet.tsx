import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ExternalLink } from "lucide-react";

interface Props {
  companyId: string;
  companyName: string;
  companySlug: string;
}

export function BoardInterlocksSnippet({ companyId, companyName, companySlug }: Props) {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["board-interlocks-snippet", companyId],
    queryFn: async () => {
      const { data: asA } = await supabase
        .from("board_interlocks")
        .select("id, person_name, person_title, company_b_name, interlock_type, role_at_a, role_at_b, evidence_url")
        .eq("company_a_id", companyId)
        .limit(12);
      const { data: asB } = await supabase
        .from("board_interlocks")
        .select("id, person_name, person_title, company_a_name, interlock_type, role_at_a, role_at_b, evidence_url")
        .eq("company_b_id", companyId)
        .limit(12);
      const merged: Array<{
        id: string;
        person_name: string;
        person_title: string | null;
        other_company: string | null;
        interlock_type: string;
        role_here: string | null;
        role_other: string | null;
        evidence_url: string | null;
      }> = [];
      for (const r of asA || []) {
        merged.push({
          id: r.id,
          person_name: r.person_name,
          person_title: r.person_title,
          other_company: r.company_b_name,
          interlock_type: r.interlock_type,
          role_here: r.role_at_a,
          role_other: r.role_at_b,
          evidence_url: r.evidence_url,
        });
      }
      for (const r of asB || []) {
        merged.push({
          id: r.id,
          person_name: r.person_name,
          person_title: r.person_title,
          other_company: r.company_a_name,
          interlock_type: r.interlock_type,
          role_here: r.role_at_b,
          role_other: r.role_at_a,
          evidence_url: r.evidence_url,
        });
      }
      const seen = new Set<string>();
      return merged.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      }).slice(0, 8);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !rows?.length) return null;

  return (
    <Card className="mb-6 border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          Shared board relationships
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          People linked to {companyName} who also hold (or held) governance roles at another organization — from interlock detection on public roster data. Patterns, not accusations.
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{r.person_name}</span>
              <Badge variant="outline" className="text-[0.65rem] capitalize">
                {r.interlock_type.replace(/_/g, " ")}
              </Badge>
            </div>
            {r.other_company && (
              <p className="text-xs text-muted-foreground mt-1">
                Also tied to <span className="text-foreground/90">{r.other_company}</span>
                {r.role_other ? ` — ${r.role_other}` : ""}
              </p>
            )}
            {r.evidence_url && /^https?:\/\//i.test(r.evidence_url) && (
              <a
                href={r.evidence_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Evidence link
              </a>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
          <Link to={`/follow-the-money?company=${encodeURIComponent(companySlug)}`}>
            Follow the money
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
