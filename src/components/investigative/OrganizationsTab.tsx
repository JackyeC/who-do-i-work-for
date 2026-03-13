import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2, Search, Loader2, FileText, Network, ChevronRight, Landmark
} from "lucide-react";

interface Props {
  searchQuery: string;
}

const ENTITY_TYPE_ICONS: Record<string, any> = {
  organization: Building2,
  company: Building2,
  foundation: Landmark,
  financial_institution: Landmark,
};

export function OrganizationsTab({ searchQuery }: Props) {
  const [localSearch, setLocalSearch] = useState("");
  const effectiveSearch = searchQuery || localSearch;

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["pn-organizations", effectiveSearch],
    queryFn: async () => {
      let query = (supabase as any)
        .from("power_network_entities")
        .select("*")
        .in("entity_type", ["organization", "company", "foundation", "financial_institution"])
        .order("relationship_count", { ascending: false })
        .limit(100);

      if (effectiveSearch) {
        query = query.ilike("name", `%${effectiveSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      {!searchQuery && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 bg-background font-mono text-sm"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : orgs?.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No organizations found yet. Entities will be extracted automatically from ingested documents.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {orgs?.map((org: any) => {
            const Icon = ENTITY_TYPE_ICONS[org.entity_type] || Building2;
            return (
              <Card key={org.id} className="border-border/30 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-primary/5 border border-primary/10 mt-0.5">
                        <Icon className="h-4 w-4 text-primary/70" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground text-sm">{org.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1 capitalize">
                          {org.entity_type.replace(/_/g, " ")}
                        </Badge>
                        {org.description && (
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{org.description}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {org.document_count} docs
                    </span>
                    <span className="flex items-center gap-1">
                      <Network className="h-3 w-3" />
                      {org.relationship_count} connections
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
