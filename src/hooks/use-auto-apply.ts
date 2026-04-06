import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePlacementToolkit } from "@/hooks/use-premium";

const PLACEMENT_UPGRADE_CODE = "PLACEMENT_TOOLKIT_REQUIRED";

function placementGateError() {
  const e = new Error(PLACEMENT_UPGRADE_CODE);
  (e as Error & { code?: string }).code = PLACEMENT_UPGRADE_CODE;
  return e;
}

export interface AutoApplySettings {
  id?: string;
  is_enabled: boolean;
  min_alignment_threshold: number;
  max_daily_applications: number;
  is_paused: boolean;
}

export interface ApplyQueueItem {
  id: string;
  job_id: string | null;
  company_id: string;
  job_title: string;
  company_name: string;
  alignment_score: number;
  matched_signals: string[];
  status: string;
  generated_payload: any;
  error_message: string | null;
  application_url: string | null;
  processed_at: string | null;
  created_at: string;
  companies?: { slug: string; name: string } | null;
}

export function useAutoApplySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["auto-apply-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auto_apply_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as (AutoApplySettings & { id: string }) | null;
    },
    enabled: !!user,
  });

  const upsert = useMutation({
    mutationFn: async (settings: Partial<AutoApplySettings>) => {
      const existing = query.data;
      if (existing?.id) {
        const { error } = await supabase
          .from("auto_apply_settings")
          .update(settings)
          .eq("id", existing.id)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("auto_apply_settings")
          .insert({ user_id: user!.id, ...settings });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-apply-settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (e: any) => {
      toast({ title: "Failed to save settings", description: e.message, variant: "destructive" });
    },
  });

  return { settings: query.data, isLoading: query.isLoading, upsert };
}

export function useApplyQueue() {
  const { user } = useAuth();
  const { hasPlacementToolkit } = usePlacementToolkit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["apply-queue", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apply_queue")
        .select("*, companies:company_id (slug, name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ApplyQueueItem[];
    },
    enabled: !!user,
  });

  const addToQueue = useMutation({
    mutationFn: async (item: {
      job_id?: string;
      company_id: string;
      job_title: string;
      company_name: string;
      alignment_score: number;
      matched_signals: string[];
      application_url?: string;
    }) => {
      if (!hasPlacementToolkit) throw placementGateError();
      const { error } = await supabase.from("apply_queue").insert({
        user_id: user!.id,
        job_id: item.job_id || null,
        company_id: item.company_id,
        job_title: item.job_title,
        company_name: item.company_name,
        alignment_score: item.alignment_score,
        matched_signals: item.matched_signals,
        application_url: item.application_url || null,
        status: "queued",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apply-queue"] });
      toast({ title: "Added to auto-apply queue" });
    },
    onError: (e: Error & { code?: string }) => {
      if (e?.message === PLACEMENT_UPGRADE_CODE || e?.code === PLACEMENT_UPGRADE_CODE) {
        toast({
          title: "Placement toolkit",
          description:
            "Queue and drafts are included with The Signal, The Match, or the Auto-Apply add-on. See Pricing to subscribe.",
        });
        return;
      }
      toast({ title: "Could not add to queue", description: e.message, variant: "destructive" });
    },
  });

  const processQueue = useMutation({
    mutationFn: async () => {
      if (!hasPlacementToolkit) throw placementGateError();
      const { data, error } = await supabase.functions.invoke("process-apply-queue", {
        body: { user_id: user!.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apply-queue"] });
      queryClient.invalidateQueries({ queryKey: ["applications-tracker"] });
      const n = data?.processed ?? 0;
      const reason = typeof data?.reason === "string" ? data.reason : null;
      toast({
        title: n > 0 ? `Generated ${n} application draft${n === 1 ? "" : "s"}` : "Queue not processed",
        description:
          n > 0
            ? "Open each row to copy your statement and apply on the employer site."
            : reason || "Check auto-apply is on, daily limit, and queued jobs meet your minimum match.",
      });
    },
    onError: (e: Error & { code?: string }) => {
      if (e?.message === PLACEMENT_UPGRADE_CODE || e?.code === PLACEMENT_UPGRADE_CODE) {
        toast({
          title: "Placement toolkit",
          description:
            "Processing the queue is included with The Signal, The Match, or the Auto-Apply add-on. See Pricing to subscribe.",
        });
        return;
      }
      toast({ title: "Queue processing failed", description: e.message, variant: "destructive" });
    },
  });

  const removeFromQueue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("apply_queue")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apply-queue"] });
    },
  });

  const todayCount = (query.data || []).filter(
    (item) =>
      item.status === "completed" &&
      item.processed_at &&
      new Date(item.processed_at).toDateString() === new Date().toDateString()
  ).length;

  return {
    queue: query.data || [],
    isLoading: query.isLoading,
    addToQueue,
    processQueue,
    removeFromQueue,
    todayCount,
    hasPlacementToolkit,
  };
}
