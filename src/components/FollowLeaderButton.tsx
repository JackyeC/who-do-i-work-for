import { useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FollowLeaderButtonProps {
  leaderType: "executive" | "board_member";
  leaderId: string;
  leaderName: string;
  companyId?: string;
  size?: "sm" | "default";
}

export function FollowLeaderButton({ leaderType, leaderId, leaderName, companyId, size = "sm" }: FollowLeaderButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isFollowing } = useQuery({
    queryKey: ["leader-follow", leaderType, leaderId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { count } = await (supabase as any).from("leader_follows")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("leader_type", leaderType)
        .eq("leader_id", leaderId);
      return (count || 0) > 0;
    },
  });

  const toggle = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to follow leaders.", variant: "destructive" });
        return;
      }
      if (isFollowing) {
        await (supabase as any).from("leader_follows")
          .delete()
          .eq("user_id", user.id)
          .eq("leader_type", leaderType)
          .eq("leader_id", leaderId);
        toast({ title: "Unfollowed", description: `You unfollowed ${leaderName}.` });
      } else {
        await (supabase as any).from("leader_follows").insert({
          user_id: user.id,
          leader_type: leaderType,
          leader_id: leaderId,
          leader_name: leaderName,
          company_id: companyId || null,
        });
        toast({ title: "Following", description: `You'll be notified of new signals for ${leaderName}.` });
      }
      queryClient.invalidateQueries({ queryKey: ["leader-follow", leaderType, leaderId] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size={size}
      onClick={toggle}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        <BellRing className="w-3 h-3" />
      ) : (
        <Bell className="w-3 h-3" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
