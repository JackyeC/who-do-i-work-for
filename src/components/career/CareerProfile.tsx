import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { User, Briefcase, MapPin, Code, DollarSign, Save, Loader2, Plus, X, Wifi, Monitor, Home } from "lucide-react";

export function CareerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputField, setInputField] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["career-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_career_profile")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const [form, setForm] = useState<any>(null);

  const startEditing = () => {
    setForm({
      seniority_level: profile?.seniority_level || "",
      preferred_work_mode: (profile as any)?.preferred_work_mode || "",
      salary_range_min: profile?.salary_range_min || "",
      salary_range_max: profile?.salary_range_max || "",
      job_titles: profile?.job_titles || [],
      preferred_titles: (profile as any)?.preferred_titles || [],
      skills: profile?.skills || [],
      industries: profile?.industries || [],
      preferred_locations: profile?.preferred_locations || [],
      management_scope: profile?.management_scope || "",
    });
    setEditing(true);
  };

  const addToArray = (field: string) => {
    if (!inputValue.trim()) return;
    setForm((f: any) => ({ ...f, [field]: [...(f[field] || []), inputValue.trim()] }));
    setInputValue("");
    setInputField(null);
  };

  const removeFromArray = (field: string, idx: number) => {
    setForm((f: any) => ({ ...f, [field]: f[field].filter((_: any, i: number) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!user || !form) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_career_profile")
      .update({
        seniority_level: form.seniority_level || null,
        preferred_work_mode: form.preferred_work_mode || null,
        salary_range_min: form.salary_range_min ? parseInt(form.salary_range_min) : null,
        salary_range_max: form.salary_range_max ? parseInt(form.salary_range_max) : null,
        job_titles: form.job_titles,
        preferred_titles: form.preferred_titles,
        skills: form.skills,
        industries: form.industries,
        preferred_locations: form.preferred_locations,
        management_scope: form.management_scope || null,
        auto_generated: false,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["career-profile"] });
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Loading profile...</div>;

  if (!profile) {
    return (
      <EmptyState
        icon={User}
        title="No career profile yet"
        description="Upload your resume in the Upload tab to auto-generate your career profile."
      />
    );
  }

  if (editing && form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" /> Edit Career Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seniority Level</Label>
              <Select value={form.seniority_level} onValueChange={(v) => setForm((f: any) => ({ ...f, seniority_level: v }))}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Work Mode</Label>
              <Select value={form.preferred_work_mode} onValueChange={(v) => setForm((f: any) => ({ ...f, preferred_work_mode: v }))}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Salary ($)</Label>
              <Input type="number" value={form.salary_range_min} onChange={(e) => setForm((f: any) => ({ ...f, salary_range_min: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Max Salary ($)</Label>
              <Input type="number" value={form.salary_range_max} onChange={(e) => setForm((f: any) => ({ ...f, salary_range_max: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Management Scope</Label>
            <Input value={form.management_scope} onChange={(e) => setForm((f: any) => ({ ...f, management_scope: e.target.value }))} placeholder="e.g. 5 direct reports" />
          </div>

          {/* Array fields */}
          {([
            { key: "preferred_titles", label: "Target Job Titles" },
            { key: "skills", label: "Skills" },
            { key: "industries", label: "Industries" },
            { key: "preferred_locations", label: "Preferred Locations" },
          ] as const).map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={`Add ${label.toLowerCase()}...`}
                  value={inputField === key ? inputValue : ""}
                  onFocus={() => setInputField(key)}
                  onChange={(e) => { setInputField(key); setInputValue(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToArray(key); } }}
                />
                <Button size="icon" variant="outline" onClick={() => { setInputField(key); addToArray(key); }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form[key]?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form[key].map((item: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs gap-1 pr-1">
                      {item}
                      <button onClick={() => removeFromArray(key, idx)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Read-only view
  const workModeIcons: Record<string, any> = { remote: Wifi, hybrid: Monitor, 'on-site': Home };
  const WorkIcon = (profile as any)?.preferred_work_mode ? workModeIcons[(profile as any).preferred_work_mode] : null;

  return (
    <div className="space-y-4">
      {profile.auto_generated && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
          ✨ This profile was auto-generated from your uploaded documents. Click Edit to refine it.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" /> Career Snapshot
          </CardTitle>
          <Button variant="outline" size="sm" onClick={startEditing}>Edit Profile</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.seniority_level && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seniority</p>
                <Badge variant="secondary" className="capitalize">{profile.seniority_level}</Badge>
              </div>
            )}
            {(profile as any)?.preferred_work_mode && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Work Mode Preference</p>
                <Badge variant="secondary" className="capitalize gap-1">
                  {WorkIcon && <WorkIcon className="w-3 h-3" />}
                  {(profile as any).preferred_work_mode}
                </Badge>
              </div>
            )}
          </div>

          {((profile as any)?.preferred_titles?.length > 0 || profile.job_titles?.length > 0) && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Target / Past Titles</p>
              <div className="flex flex-wrap gap-1">
                {((profile as any)?.preferred_titles || []).map((t: string, i: number) => (
                  <Badge key={`pt-${i}`} variant="default" className="text-xs">{t}</Badge>
                ))}
                {(profile.job_titles || []).map((t: string, i: number) => (
                  <Badge key={`jt-${i}`} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.skills?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Code className="w-3 h-3" /> Skills</p>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((s: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.industries?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Industries</p>
              <div className="flex flex-wrap gap-1">
                {profile.industries.map((ind: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{ind}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.preferred_locations?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Preferred Locations</p>
              <div className="flex flex-wrap gap-1">
                {profile.preferred_locations.map((loc: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{loc}</Badge>
                ))}
              </div>
            </div>
          )}

          {(profile.salary_range_min || profile.salary_range_max) && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Salary Range</p>
              <p className="text-sm text-foreground">
                {profile.salary_range_min ? `$${profile.salary_range_min.toLocaleString()}` : "N/A"} — {profile.salary_range_max ? `$${profile.salary_range_max.toLocaleString()}` : "N/A"}
              </p>
            </div>
          )}

          {profile.management_scope && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Management Scope</p>
              <p className="text-sm text-foreground">{profile.management_scope}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
