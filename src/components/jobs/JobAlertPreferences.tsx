import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Save, Loader2, X, Plus, BellOff } from "lucide-react";

export function JobAlertPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const [prefs, setPrefs] = useState({
    is_active: true,
    keywords: [] as string[],
    locations: [] as string[],
    work_modes: [] as string[],
    industries: [] as string[],
    min_civic_score: 0,
    salary_only: false,
    frequency: "daily",
  });

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("job_alert_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setPrefs({
            is_active: data.is_active ?? true,
            keywords: data.keywords || [],
            locations: data.locations || [],
            work_modes: data.work_modes || [],
            industries: data.industries || [],
            min_civic_score: data.min_civic_score || 0,
            salary_only: data.salary_only || false,
            frequency: data.frequency || "daily",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !prefs.keywords.includes(kw)) {
      setPrefs(p => ({ ...p, keywords: [...p.keywords, kw] }));
      setKeywordInput("");
    }
  };

  const addLocation = () => {
    const loc = locationInput.trim();
    if (loc && !prefs.locations.includes(loc)) {
      setPrefs(p => ({ ...p, locations: [...p.locations, loc] }));
      setLocationInput("");
    }
  };

  const toggleWorkMode = (mode: string) => {
    setPrefs(p => ({
      ...p,
      work_modes: p.work_modes.includes(mode)
        ? p.work_modes.filter(m => m !== mode)
        : [...p.work_modes, mode],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      ...prefs,
    };

    const { error } = await (supabase as any)
      .from("job_alert_preferences")
      .upsert(payload, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      toast({ title: "Error saving preferences", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job alert preferences saved", description: prefs.is_active ? `You'll receive ${prefs.frequency} job alerts.` : "Alerts are currently paused." });
    }
  };

  if (!user || loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Job Alerts
        </CardTitle>
        <CardDescription>
          Get notified when new jobs matching your criteria are posted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            {prefs.is_active ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            <Label className="cursor-pointer">
              {prefs.is_active ? "Alerts active" : "Alerts paused"}
            </Label>
          </div>
          <Switch checked={prefs.is_active} onCheckedChange={v => setPrefs(p => ({ ...p, is_active: v }))} />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label>Alert Frequency</Label>
          <Select value={prefs.frequency} onValueChange={v => setPrefs(p => ({ ...p, frequency: v }))}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Keywords</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. engineer, product manager..."
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword())}
            />
            <Button type="button" size="icon" variant="outline" onClick={addKeyword}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {prefs.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {prefs.keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button onClick={() => setPrefs(p => ({ ...p, keywords: p.keywords.filter(k => k !== kw) }))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <Label>Preferred Locations</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. New York, Remote..."
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLocation())}
            />
            <Button type="button" size="icon" variant="outline" onClick={addLocation}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {prefs.locations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {prefs.locations.map(loc => (
                <Badge key={loc} variant="secondary" className="gap-1 pr-1">
                  {loc}
                  <button onClick={() => setPrefs(p => ({ ...p, locations: p.locations.filter(l => l !== loc) }))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Work Mode */}
        <div className="space-y-2">
          <Label>Work Mode</Label>
          <div className="flex gap-2">
            {["remote", "hybrid", "on-site"].map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={prefs.work_modes.includes(mode) ? "default" : "outline"}
                onClick={() => toggleWorkMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Salary only */}
        <div className="flex items-center gap-2">
          <Switch checked={prefs.salary_only} onCheckedChange={v => setPrefs(p => ({ ...p, salary_only: v }))} />
          <Label className="cursor-pointer text-sm">Only jobs with salary listed</Label>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Alert Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
