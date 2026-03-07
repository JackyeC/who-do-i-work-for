import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function useUnreadAlertCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread-alerts-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("user_alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

export function UserAlertsList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["user-alerts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_alerts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const markRead = async (alertId: string) => {
    await supabase.from("user_alerts").update({ is_read: true }).eq("id", alertId);
    queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
    queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("user_alerts").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["user-alerts"] });
    queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
  };

  if (!user) return null;

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Signal Alerts
          {unreadCount > 0 && <Badge className="text-[10px] ml-auto">{unreadCount} new</Badge>}
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs ml-2" onClick={markAllRead}>
              <Check className="w-3 h-3 mr-1" /> Mark all read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading alerts…</p>
        ) : !alerts || alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts yet. Watch companies to receive notifications when signals change.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border border-border transition-colors",
                  !alert.is_read ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/company/${alert.company_name.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-medium text-foreground hover:underline">
                        {alert.company_name}
                      </Link>
                      <Badge variant="outline" className="text-[10px]">{alert.signal_category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{alert.change_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.change_description}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {new Date(alert.date_detected).toLocaleDateString()}
                    </span>
                  </div>
                  {!alert.is_read && (
                    <Button variant="ghost" size="icon" className="shrink-0 w-6 h-6" onClick={() => markRead(alert.id)}>
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
