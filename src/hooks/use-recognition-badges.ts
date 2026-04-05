import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserRecognitionBadgeRow = Tables<"user_recognition_badges">;

export function useRecognitionBadges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-recognition-badges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_recognition_badges")
        .select("*")
        .eq("user_id", user!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as UserRecognitionBadgeRow[];
    },
  });
}
