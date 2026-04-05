import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";

interface Props {
  companyId: string;
  companyName: string;
}

export function DocumentedPublicRecordsSection({ companyId, companyName }: Props) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["company-public-record-items", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_public_record_items")
        .select("id, title, neutral_summary, record_type, primary_source_url, source_label, published_at, confidence, related_person_name")
        .eq("company_id", companyId)
        .order("published_at", { ascending: false });
      if (error) {
        console.warn("company_public_record_items:", error.message);
        return [];
      }
      return (data || []) as Array<{
        id: string;
        title: string;
        neutral_summary: string;
        record_type: string;
        primary_source_url: string;
        source_label: string | null;
        published_at: string | null;
        confidence: string;
        related_person_name: string | null;
      }>;
    },
    enabled: !!companyId,
  });

  if (isLoading) return null;
  if (!items?.length) return null;

  return (
    <Card className="mb-6 border-primary/15 bg-primary/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Documented public records
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          Each item summarizes only what appears in the linked primary document. {companyName} — editorial review before publication.
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <Badge variant="outline" className="text-[0.65rem] shrink-0 capitalize">
                {item.record_type.replace(/_/g, " ")}
              </Badge>
            </div>
            {item.related_person_name && (
              <p className="text-xs text-muted-foreground">Related: {item.related_person_name}</p>
            )}
            <p className="text-sm text-foreground/90 leading-relaxed">{item.neutral_summary}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.published_at && (
                <span className="text-muted-foreground">
                  {new Date(item.published_at).toLocaleDateString()}
                </span>
              )}
              {item.source_label && (
                <span className="text-muted-foreground">{item.source_label}</span>
              )}
              <a
                href={item.primary_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Primary source
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
