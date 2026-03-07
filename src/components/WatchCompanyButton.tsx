import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WatchCompanyButtonProps {
  companyId: string;
  companyName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WatchCompanyButton({ companyId, companyName, variant = "outline", size = "sm" }: WatchCompanyButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const { data: isWatching } = useQuery({
    queryKey: ["watching", companyId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_company_watchlist")
        .select("id")
        .eq("company_id", companyId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!companyId,
  });

  const handleToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsToggling(true);
    try {
      if (isWatching) {
        await supabase
          .from("user_company_watchlist")
          .delete()
          .eq("company_id", companyId)
          .eq("user_id", user.id);
        toast({ title: "Unwatched", description: `You will no longer receive alerts for ${companyName}.` });
      } else {
        await supabase
          .from("user_company_watchlist")
          .insert({ company_id: companyId, user_id: user.id });
        toast({ title: "Watching", description: `You'll be alerted when new signals are detected for ${companyName}.` });
      }
      queryClient.invalidateQueries({ queryKey: ["watching", companyId, user.id] });
      queryClient.invalidateQueries({ queryKey: ["my-watchlist"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button variant={isWatching ? "secondary" : variant} size={size} onClick={handleToggle} disabled={isToggling} className="gap-1.5">
      {isToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isWatching ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      {isWatching ? "Watching" : "Watch"}
    </Button>
  );
}
