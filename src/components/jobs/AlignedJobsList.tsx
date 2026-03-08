import { useState } from "react";
import { useJobMatcher, useApplicationsTracker, MatchedJob } from "@/hooks/use-job-matcher";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ExternalLink, Briefcase, MapPin, Building2, Shield, Sparkles,
  Loader2, Copy, Check, Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-600 bg-green-50 border-green-200"
    : score >= 40 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-muted-foreground bg-muted border-border";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", color)}>
      <Shield className="w-3 h-3" />
      {score}% aligned
    </span>
  );
}

function JobCard({ job, onApply, onGenerate, applying, generating }: {
  job: MatchedJob;
  onApply: (job: MatchedJob) => void;
  onGenerate: (job: MatchedJob) => void;
  applying: boolean;
  generating: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
              <ScoreBadge score={job.alignment_score} />
            </div>
            <Link to={`/company/${job.company_slug}`} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {job.company_name}
            </Link>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              {job.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
              )}
              {job.employment_type && (
                <Badge variant="secondary" className="text-xs">{job.employment_type}</Badge>
              )}
              {job.salary_range && (
                <span className="font-medium text-foreground">{job.salary_range}</span>
              )}
              {job.department && <span>{job.department}</span>}
            </div>
            {job.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
            )}
            {job.matched_signals.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {job.matched_signals.slice(0, 5).map((sig) => (
                  <Badge key={sig} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {sig}
                  </Badge>
                ))}
                {job.matched_signals.length > 5 && (
                  <Badge variant="outline" className="text-xs">+{job.matched_signals.length - 5}</Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => onGenerate(job)}
              disabled={generating}
              variant="outline"
              className="gap-1.5"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              Auto-Fill
            </Button>
            <Button
              size="sm"
              onClick={() => onApply(job)}
              disabled={applying}
              className="gap-1.5"
            >
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
              Apply & Track
            </Button>
            {job.url && (
              <Button size="sm" variant="ghost" asChild className="gap-1.5 text-xs">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Post
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Clipboard banner for the matching statement
function PayloadBanner({ payload, onDismiss }: {
  payload: {
    matchingStatement: string;
    alignmentScore: number;
    companyName: string;
    matchedSignals: string[];
  };
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(payload.matchingStatement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/30 bg-primary/5 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Values Alignment Statement for {payload.companyName}
              </span>
              <Badge variant="secondary" className="text-xs">{payload.alignmentScore}% aligned</Badge>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {payload.matchingStatement}
            </p>
            {payload.matchedSignals.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {payload.matchedSignals.map(s => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Statement"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss} className="text-xs">
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AlignedJobsList() {
  const { data, isLoading, error } = useJobMatcher();
  const { trackApplication } = useApplicationsTracker();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [activePayload, setActivePayload] = useState<any>(null);

  const handleApply = (job: MatchedJob) => {
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    }
    trackApplication.mutate({
      company_id: job.company_id,
      job_id: job.job_id,
      job_title: job.title,
      company_name: job.company_name,
      application_link: job.url || undefined,
      alignment_score: job.alignment_score,
      matched_signals: job.matched_signals,
      status: "Submitted",
    });
  };

  const handleGenerate = async (job: MatchedJob) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    setGeneratingFor(job.job_id);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("generate-application-payload", {
        body: { company_id: job.company_id, user_id: user.id },
      });

      if (fnError) throw fnError;

      if (result?.payload) {
        setActivePayload(result.payload);

        // Open the job URL
        if (job.url) {
          window.open(job.url, "_blank", "noopener,noreferrer");
        }

        toast({ title: "Application payload generated! Copy your Values Statement below." });
      }
    } catch (e: any) {
      console.error("Payload generation error:", e);
      const msg = e?.message || "Failed to generate payload";
      if (msg.includes("429") || msg.includes("rate limit")) {
        toast({ title: "Rate limited", description: "Please try again in a moment.", variant: "destructive" });
      } else if (msg.includes("402")) {
        toast({ title: "AI credits exhausted", description: "Please add funds to continue.", variant: "destructive" });
      } else {
        toast({ title: "Generation failed", description: msg, variant: "destructive" });
      }
    } finally {
      setGeneratingFor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card><CardContent className="p-6 text-center text-destructive">
        Failed to load matched jobs. Please try again.
      </CardContent></Card>
    );
  }

  const matches = data?.matches || [];

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No matched jobs yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Set your signal preferences in the "Signal Preferences" tab, or check back as companies add job listings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activePayload && (
        <PayloadBanner payload={activePayload} onDismiss={() => setActivePayload(null)} />
      )}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {matches.length} job{matches.length !== 1 ? "s" : ""} aligned with your values
          {data?.preferences_applied ? ` · ${data.preferences_applied} signal filter${data.preferences_applied !== 1 ? "s" : ""} applied` : ""}
        </p>
      </div>
      {matches.map((job) => (
        <JobCard
          key={job.job_id}
          job={job}
          onApply={handleApply}
          onGenerate={handleGenerate}
          applying={trackApplication.isPending}
          generating={generatingFor === job.job_id}
        />
      ))}
    </div>
  );
}
