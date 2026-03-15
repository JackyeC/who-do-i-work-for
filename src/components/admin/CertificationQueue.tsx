import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, ShieldCheck, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function CertificationQueue() {
  const queryClient = useQueryClient();

  // Companies with vetted_status = 'unverified' that have been claimed (have a description or creation_source)
  const { data: pending, isLoading } = useQuery({
    queryKey: ["admin-certification-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, slug, industry, vetted_status, created_at, creation_source, logo_url")
        .eq("vetted_status", "unverified")
        .not("creation_source", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const handleAction = async (companyId: string, newStatus: "verified" | "certified") => {
    const { error } = await supabase
      .from("companies")
      .update({ vetted_status: newStatus })
      .eq("id", companyId);
    if (error) {
      toast.error("Update failed: " + error.message);
      return;
    }
    toast.success(`Company ${newStatus === "certified" ? "certified" : "verified"}!`);
    queryClient.invalidateQueries({ queryKey: ["admin-certification-queue"] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" /> Employer Certification
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Review employer claims and certification requests.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !pending?.length ? (
        <Card className="border-dashed border-border/40">
          <CardContent className="p-6 text-center">
            <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No certification requests pending.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pending.map((co: any) => (
            <Card key={co.id} className="border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{co.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {co.industry} · {co.creation_source || "Unknown source"} · {formatDistanceToNow(new Date(co.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">Unverified</Badge>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleAction(co.id, "verified")} className="text-xs gap-1 h-7 px-2">
                    <Check className="w-3 h-3" /> Verify
                  </Button>
                  <Button size="sm" onClick={() => handleAction(co.id, "certified")} className="text-xs gap-1 h-7 px-2">
                    <ShieldCheck className="w-3 h-3" /> Certify
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
