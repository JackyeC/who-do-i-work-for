import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "owner" | "internal_test" | "analyst" | "admin" | "moderator" | "user";

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });

  const hasRole = (role: AppRole) => roles.includes(role);

  return {
    roles,
    isLoading,
    hasRole,
    isOwner: hasRole("owner"),
    isInternalTest: hasRole("internal_test"),
    isAnalyst: hasRole("analyst"),
    isAdmin: hasRole("admin"),
  };
}
