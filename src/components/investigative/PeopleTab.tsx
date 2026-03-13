import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users, Search, Loader2, FileText, Network, ChevronRight, Building2
} from "lucide-react";

interface Props {
  searchQuery: string;
}

export function PeopleTab({ searchQuery }: Props) {
  const [localSearch, setLocalSearch] = useState("");
  const effectiveSearch = searchQuery || localSearch;

  const { data: people, isLoading } = useQuery({
    queryKey: ["pn-people", effectiveSearch],
    queryFn: async () => {
      let query = (supabase as any)
        .from("power_network_entities")
        .select("*")
        .eq("entity_type", "person")
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
            placeholder="Search people..."
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
      ) : people?.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No people entities found yet. Entities will be extracted automatically from ingested documents.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {people?.map((person: any) => (
            <Card key={person.id} className="border-border/30 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground text-sm">
                      {person.name}
                    </h3>
                    {person.description && (
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {person.description}
                      </p>
                    )}
                    {person.aliases?.length > 0 && (
                      <p className="text-muted-foreground text-xs mt-1 font-mono">
                        aka: {person.aliases.join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {person.document_count} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    {person.relationship_count} connections
                  </span>
                  {person.company_id && (
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      Linked
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
