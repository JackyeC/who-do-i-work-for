import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCareerWaitlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entry, isLoading } = useQuery({
    queryKey: ["career-waitlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_waitlist")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const joinWaitlist = useMutation({
    mutationFn: async ({ reason }: { reason?: string }) => {
      const { error } = await supabase.from("career_waitlist").insert({
        user_id: user!.id,
        email: user!.email!,
        reason,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["career-waitlist"] }),
  });

  return {
    entry,
    isLoading,
    isApproved: entry?.status === "approved",
    isPending: entry?.status === "pending",
    hasJoined: !!entry,
    joinWaitlist,
  };
}
