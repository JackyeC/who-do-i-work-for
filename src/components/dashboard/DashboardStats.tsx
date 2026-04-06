import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Target, Bell, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [apps, alerts, values, growth] = await Promise.all([
        supabase.from("applications_tracker").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        (supabase as any).from("user_alerts").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_read", false),
        (supabase as any).from("user_values_profile").select("id").eq("user_id", user!.id).maybeSingle(),
        (supabase as any).from("employee_growth_tracker").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        applications: apps.count || 0,
        unreadAlerts: alerts.count || 0,
        hasValues: !!values.data,
        growthTracks: growth.count || 0,
      };
    },
    enabled: !!user,
  });

  const cards = [
    {
      label: "Applications",
      value: stats?.applications ?? 0,
      icon: Briefcase,
      color: "text-civic-blue",
      bg: "bg-civic-blue/[0.08]",
      borderAccent: "border-civic-blue/10",
    },
    {
      label: "Growth Tracks",
      value: stats?.growthTracks ?? 0,
      icon: Target,
      color: "text-civic-green",
      bg: "bg-civic-green/[0.08]",
      borderAccent: "border-civic-green/10",
    },
    {
      label: "Unread Alerts",
      value: stats?.unreadAlerts ?? 0,
      icon: Bell,
      color: stats?.unreadAlerts ? "text-destructive" : "text-civic-gold",
      bg: stats?.unreadAlerts ? "bg-destructive/[0.08]" : "bg-civic-gold/[0.08]",
      borderAccent: stats?.unreadAlerts ? "border-destructive/10" : "border-civic-gold/10",
    },
    {
      label: "Values Profile",
      value: stats?.hasValues ? "Active" : "—",
      icon: CheckCircle2,
      color: stats?.hasValues ? "text-civic-green" : "text-muted-foreground",
      bg: stats?.hasValues ? "bg-civic-green/[0.08]" : "bg-muted/50",
      borderAccent: stats?.hasValues ? "border-civic-green/10" : "border-border/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "bg-card rounded-xl border p-4 transition-shadow hover:shadow-sm",
            card.borderAccent
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
              {card.label}
            </span>
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", card.bg)}>
              <card.icon className={cn("w-3.5 h-3.5", card.color)} />
            </div>
          </div>
          <p className={cn(
            "text-xl font-bold text-foreground leading-none tracking-tight",
            typeof card.value === "number" && "font-mono"
          )}>
            {card.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
