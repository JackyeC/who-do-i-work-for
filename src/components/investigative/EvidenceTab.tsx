import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye, ExternalLink, Loader2, FileText, Hash, Link2
} from "lucide-react";

interface Props {
  searchQuery: string;
}

export function EvidenceTab({ searchQuery }: Props) {
  const { data: evidence, isLoading } = useQuery({
    queryKey: ["pn-evidence", searchQuery],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("power_network_evidence")
        .select(`
          *,
          relationship:relationship_id(
            relationship_type,
            description,
            source:source_entity_id(name, entity_type),
            target:target_entity_id(name, entity_type)
          ),
          document:document_id(title, external_doc_id, source_url, document_type)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="p-3 bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
        <strong className="text-primary">Evidence Chain.</strong>{" "}
        Every relationship in the archive is linked to source documents. Click evidence links to view original documents.
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : evidence?.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <Eye className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No evidence records yet. Evidence links will be created automatically when datasets are processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evidence?.map((ev: any) => (
            <Card key={ev.id} className="border-border/30">
              <CardContent className="p-4">
                {/* Relationship context */}
                {ev.relationship && (
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-foreground font-medium">
                      {ev.relationship.source?.name}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {ev.relationship.relationship_type?.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-foreground font-medium">
                      {ev.relationship.target?.name}
                    </span>
                  </div>
                )}

                {/* Evidence excerpt */}
                {ev.excerpt && (
                  <blockquote className="border-l-2 border-primary/30 pl-3 text-muted-foreground text-xs italic my-2">
                    "{ev.excerpt}"
                  </blockquote>
                )}

                {/* Document link */}
                {ev.document && (
                  <div className="flex items-center justify-between mt-3 p-2 bg-card/50 border border-border/20">
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <FileText className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      <span className="text-foreground truncate">{ev.document.title}</span>
                      {ev.document.external_doc_id && (
                        <span className="font-mono text-muted-foreground">
                          #{ev.document.external_doc_id}
                        </span>
                      )}
                      {ev.page_reference && (
                        <span className="text-muted-foreground">
                          p. {ev.page_reference}
                        </span>
                      )}
                    </div>
                    {(ev.source_url || ev.document.source_url) && (
                      <Button variant="ghost" size="sm" asChild className="shrink-0">
                        <a
                          href={ev.source_url || ev.document.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
