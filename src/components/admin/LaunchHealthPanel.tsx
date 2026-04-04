import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Link2, Shield, FileWarning } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export function LaunchHealthPanel() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [backfillBusy, setBackfillBusy] = useState(false);
  const [claimsBusy, setClaimsBusy] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["launch-health-stats"],
    queryFn: async () => {
      const { count: total } = await supabase.from("companies").select("id", { count: "exact", head: true });

      const { count: identityComplete } = await supabase
        .from("companies")
        .select("id", { count: "exact", head: true })
        .eq("identity_matched", true)
        .not("website_url", "is", null)
        .neq("website_url", "");

      const { count: identityMissing } = await supabase
        .from("companies")
        .select("id", { count: "exact", head: true })
        .is("website_url", null)
        .or("identity_matched.is.null,identity_matched.eq.false");

      const { count: claimsRows } = await supabase
        .from("company_corporate_claims")
        .select("id", { count: "exact", head: true });

      const { count: pendingUrls } = await supabase
        .from("company_website_suggestions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const t = total ?? 0;
      const c = identityComplete ?? 0;
      const m = identityMissing ?? 0;
      const partial = Math.max(0, t - c - m);

      return {
        total: t,
        identityComplete: c,
        identityPartial: partial,
        identityMissing: m,
        claimsRows: claimsRows ?? 0,
        pendingUrls: pendingUrls ?? 0,
      };
    },
    staleTime: 60_000,
  });

  const { data: pendingList = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["launch-health-pending-urls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_website_suggestions")
        .select("id, suggested_url, suggested_careers_url, confidence, source_note, company_id, companies(name, slug)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data || []) as {
        id: string;
        suggested_url: string;
        suggested_careers_url: string | null;
        confidence: string;
        source_note: string | null;
        company_id: string;
        companies: { name: string; slug: string } | null;
      }[];
    },
  });

  const runBackfill = async () => {
    setBackfillBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("backfill-company-websites", {
        body: { batchSize: 15 },
      });
      if (error) throw error;
      const d = data as Record<string, unknown>;
      if (d && d.success === false) throw new Error(String(d.error || "Backfill failed"));
      toast({
        title: "Website backfill batch complete",
        description: `Applied: ${d.applied_high_confidence ?? 0} · Queued review: ${d.queued_review ?? 0} · Processed: ${d.processed ?? 0}`,
      });
      await qc.invalidateQueries({ queryKey: ["launch-health-stats"] });
      await qc.invalidateQueries({ queryKey: ["launch-health-pending-urls"] });
    } catch (e: unknown) {
      toast({
        title: "Backfill failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBackfillBusy(false);
    }
  };

  const runClaimsBatch = async () => {
    setClaimsBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("batch-extract-corporate-claims", {
        body: { batchSize: 8 },
      });
      if (error) throw error;
      const d = data as Record<string, unknown>;
      if (d && d.success === false) throw new Error(String(d.error || "Claims batch failed"));
      toast({
        title: "Claims extraction batch complete",
        description: `Companies processed: ${d.processed ?? 0}`,
      });
      await qc.invalidateQueries({ queryKey: ["launch-health-stats"] });
    } catch (e: unknown) {
      toast({
        title: "Claims batch failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setClaimsBusy(false);
    }
  };

  const approveSuggestion = async (row: (typeof pendingList)[0]) => {
    try {
      const patch: Record<string, string | boolean> = {
        website_url: row.suggested_url,
        identity_matched: true,
        record_status: "identity_matched",
      };
      if (row.suggested_careers_url) patch.careers_url = row.suggested_careers_url;

      const { error: uErr } = await supabase.from("companies").update(patch).eq("id", row.company_id);
      if (uErr) throw uErr;

      const { error: sErr } = await supabase
        .from("company_website_suggestions")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (sErr) throw sErr;

      try {
        const host = new URL(row.suggested_url).hostname.replace(/^www\./, "");
        const { error: dErr } = await supabase.from("company_domains").insert({
          company_id: row.company_id,
          domain: host.toLowerCase(),
          is_primary: true,
          verified: true,
        });
        if (dErr && !String(dErr.message).toLowerCase().includes("duplicate")) console.warn(dErr.message);
      } catch { /* invalid URL */ }

      toast({ title: "Website approved", description: row.companies?.name ?? row.suggested_url });
      await qc.invalidateQueries({ queryKey: ["launch-health-stats"] });
      await qc.invalidateQueries({ queryKey: ["launch-health-pending-urls"] });
    } catch (e: unknown) {
      toast({
        title: "Approve failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const rejectSuggestion = async (id: string) => {
    const { error } = await supabase
      .from("company_website_suggestions")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Reject failed", description: error.message, variant: "destructive" });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["launch-health-pending-urls"] });
    await qc.invalidateQueries({ queryKey: ["launch-health-stats"] });
  };

  const fmt = (n: number | undefined) => n?.toLocaleString() ?? "—";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Rocket className="w-4.5 h-4.5 text-primary" /> Launch readiness
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Clear identity + official URL + attributed claims before public launch. Run batches until queues drain.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={backfillBusy}
            onClick={() => void runBackfill()}
          >
            {backfillBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            AI URL backfill (15)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={claimsBusy}
            onClick={() => void runClaimsBatch()}
          >
            {claimsBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileWarning className="w-3.5 h-3.5" />}
            Extract claims (8)
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading metrics…
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Identity · complete
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">{fmt(stats?.identityComplete)}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Identity · partial</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{fmt(stats?.identityPartial)}</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-800 dark:text-amber-200/90 font-medium">Identity · missing</p>
            <p className="text-2xl font-bold tabular-nums mt-1 text-amber-900 dark:text-amber-100">
              {fmt(stats?.identityMissing)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground font-medium">Indexed companies</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{fmt(stats?.total)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Website URL review queue</h4>
          <p className="text-xs text-muted-foreground mb-3">
            {fmt(stats?.pendingUrls)} pending · Approve to set <code className="text-[10px]">website_url</code>, domain map, and identity.
          </p>
          {pendingLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : pendingList.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No domains awaiting review.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {pendingList.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/10 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/company/${row.companies?.slug ?? row.company_id}`}
                      className="font-medium text-foreground hover:underline truncate block"
                    >
                      {row.companies?.name ?? "Company"}
                    </Link>
                    <a
                      href={row.suggested_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary break-all"
                    >
                      {row.suggested_url}
                    </a>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] font-mono uppercase">
                        {row.confidence}
                      </Badge>
                      {row.source_note && (
                        <span className="text-[10px] text-muted-foreground truncate">{row.source_note}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => void approveSuggestion(row)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => void rejectSuggestion(row.id)}>
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Corporate claims (attribution)</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Total rows in <code className="text-[10px]">company_corporate_claims</code>:{" "}
            <span className="font-mono font-medium text-foreground">{fmt(stats?.claimsRows)}</span>. Use batch extract to
            pull from official sources (requires <code className="text-[10px]">PERPLEXITY_API_KEY</code> on{" "}
            <code className="text-[10px]">extract-corporate-claims</code>).
          </p>
          <p className="text-xs text-muted-foreground">
            After migration, deploy <code className="text-[10px]">backfill-company-websites</code> and{" "}
            <code className="text-[10px]">batch-extract-corporate-claims</code> from the Supabase dashboard or CLI.
          </p>
        </div>
      </div>
    </div>
  );
}
