import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DreamJobMatch {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  company_id: string | null;
  source: string;
  source_url: string;
  location: string | null;
  salary_range: string | null;
  work_mode: string | null;
  description: string | null;
  posted_date: string | null;
  skills_match_score: number;
  values_match_score: number;
  integrity_score: number;
  composite_score: number;
  matched_values: string[] | null;
  matched_skills: string[] | null;
  status: string;
  applied_at: string | null;
  dossier_generated: boolean;
  dossier_url: string | null;
  dossier_emailed: boolean;
  dossier_emailed_at: string | null;
  raw_listing: any;
  created_at: string;
  updated_at: string;
}

export interface DreamJobDossier {
  id: string;
  user_id: string;
  search_result_id: string;
  company_name: string;
  job_title: string;
  company_overview: any;
  integrity_snapshot: any;
  role_analysis: any;
  tailored_resume: any;
  cover_letter: string | null;
  interview_questions: any;
  salary_benchmarks: any;
  preparation_checklist: any;
  references_template: string | null;
  thank_you_email_draft: string | null;
  follow_up_timeline: any;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DreamJobStats {
  totalMatches: number;
  applicationsSent: number;
  dossiersAvailable: number;
  matchesToday: number;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch all matched jobs for the current user, sorted by composite score */
export function useDreamJobMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dream-job-matches", user?.id],
    queryFn: async (): Promise<DreamJobMatch[]> => {
      const { data, error } = await supabase
        .from("dream_job_search_results")
        .select("*")
        .eq("user_id", user!.id)
        .order("composite_score", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as DreamJobMatch[];
    },
    enabled: !!user,
  });
}

/** Fetch a single dossier by search_result_id */
export function useDreamJobDossier(searchResultId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dream-job-dossier", searchResultId],
    queryFn: async (): Promise<DreamJobDossier | null> => {
      const { data, error } = await supabase
        .from("dream_job_dossiers")
        .select("*")
        .eq("search_result_id", searchResultId!)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as DreamJobDossier | null;
    },
    enabled: !!user && !!searchResultId,
  });
}

/** Aggregate stats for the dashboard */
export function useDreamJobStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dream-job-stats", user?.id],
    queryFn: async (): Promise<DreamJobStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total matches
      const { count: totalMatches } = await supabase
        .from("dream_job_search_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .neq("status", "dismissed");

      // Applications sent
      const { count: applicationsSent } = await supabase
        .from("dream_job_search_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("status", ["applied", "queued", "applying"]);

      // Dossiers available
      const { count: dossiersAvailable } = await supabase
        .from("dream_job_dossiers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // Matches today
      const { count: matchesToday } = await supabase
        .from("dream_job_search_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", today.toISOString());

      return {
        totalMatches: totalMatches || 0,
        applicationsSent: applicationsSent || 0,
        dossiersAvailable: dossiersAvailable || 0,
        matchesToday: matchesToday || 0,
      };
    },
    enabled: !!user,
  });
}

/** Dismiss a matched job */
export function useDismissMatch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from("dream_job_search_results")
        .update({ status: "dismissed", updated_at: new Date().toISOString() })
        .eq("id", matchId)
        .eq("user_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream-job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["dream-job-stats"] });
      toast({ title: "Job dismissed", description: "This match has been removed from your list." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

/** Trigger application for a matched job */
export function useApplyToMatch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (matchId: string) => {
      // Update status to queued
      const { error: updateErr } = await supabase
        .from("dream_job_search_results")
        .update({ status: "queued", updated_at: new Date().toISOString() })
        .eq("id", matchId)
        .eq("user_id", user!.id);

      if (updateErr) throw updateErr;

      // Trigger dossier generation
      const { data, error: fnErr } = await supabase.functions.invoke(
        "generate-dossier",
        {
          body: { search_result_id: matchId, user_id: user!.id },
        }
      );

      if (fnErr) {
        console.error("Dossier generation error:", fnErr);
        // Non-fatal — the job is still queued
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dream-job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["dream-job-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dream-job-dossier"] });
      toast({
        title: "Application queued",
        description: "Your dossier is being generated. We'll prepare your interview kit.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

/** Run the dream job engine to find new matches */
export function useRunDreamJobEngine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "dream-job-engine",
        {
          body: { user_id: user!.id },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["dream-job-matches"] });
      queryClient.invalidateQueries({ queryKey: ["dream-job-stats"] });
      toast({
        title: "Search complete",
        description: data?.message || "New matches are available.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    },
  });
}

/** Email a dossier to the user */
export function useEmailDossier() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dossierId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "email-dossier",
        {
          body: { dossier_id: dossierId },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Dossier emailed",
        description: data?.message || "Check your inbox for the interview prep kit.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Email failed", description: err.message, variant: "destructive" });
    },
  });
}
