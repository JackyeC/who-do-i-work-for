import { useState } from "react";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportLeadershipChangeProps {
  companyId: string;
  companyName: string;
  prefilledName?: string;
}

const CORRECTION_TYPES = [
  { value: "new_ceo", label: "New CEO" },
  { value: "new_cfo", label: "New CFO" },
  { value: "new_executive", label: "New Executive" },
  { value: "new_board_member", label: "New Board Member" },
  { value: "committee_change", label: "Committee Change" },
  { value: "departure", label: "Executive Departure" },
  { value: "title_change", label: "Title Change" },
  { value: "other", label: "Other" },
];

export function ReportLeadershipChange({
  companyId,
  companyName,
  prefilledName = "",
}: ReportLeadershipChangeProps) {
  const [open, setOpen] = useState(false);
  const [leaderName, setLeaderName] = useState(prefilledName);
  const [correctionType, setCorrectionType] = useState("other");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!leaderName.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to report leadership changes.",
          variant: "destructive",
        });
        return;
      }
      const { error } = await (supabase as any)
        .from("leadership_corrections")
        .insert({
          user_id: user.id,
          company_id: companyId,
          leader_name: leaderName.trim(),
          correction_type: correctionType,
          description: description.trim(),
          evidence_url: evidenceUrl.trim() || null,
        });
      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "Change reported",
        description:
          "Thank you. Our team will review this leadership update.",
      });
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setLeaderName("");
        setDescription("");
        setEvidenceUrl("");
        setCorrectionType("other");
      }, 1500);
    } catch (e: any) {
      toast({
        title: "Failed to submit",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1.5 text-muted-foreground"
        onClick={() => {
          setLeaderName(prefilledName);
          setOpen(true);
        }}
      >
        <Flag className="w-3 h-3" />
        Report leadership change
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              Report Leadership Change
            </DialogTitle>
            <DialogDescription>
              Flag a leadership update for {companyName}. Our team will verify
              and update the record.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--civic-green))]" />
              <p className="text-sm font-medium">Submitted for review</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Leader Name</Label>
                <Input
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Change Type</Label>
                <Select
                  value={correctionType}
                  onValueChange={setCorrectionType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CORRECTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the change…"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Evidence URL (optional)</Label>
                <Input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </div>
          )}

          {!submitted && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting || !leaderName.trim() || !description.trim()
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />{" "}
                    Submitting…
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
