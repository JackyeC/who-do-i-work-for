import { useState } from "react";
import { Link } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserX, AlertTriangle, Loader2 } from "lucide-react";
import { ACCOUNT_DELETE_CONFIRMATION } from "@/lib/account-deletion";

export function AccountDeletionButton() {
  const { user, signOut } = useAuth();
  const { isFallback } = useClerkWithFallback();
  const clerk = useClerk();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }
    if (phrase.trim() !== ACCOUNT_DELETE_CONFIRMATION) {
      toast.error("Type the confirmation phrase exactly as shown.");
      return;
    }
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        body: { confirmation: ACCOUNT_DELETE_CONFIRMATION },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      queryClient.clear();
      if (!isFallback) {
        await clerk.signOut();
      }
      await signOut();
      toast.success("Your account has been deleted.");
      window.location.href = "/";
    } catch (err: unknown) {
      console.error("Account deletion error:", err);
      toast.error(err instanceof Error ? err.message : "Could not delete account.");
    } finally {
      setDeleting(false);
    }
  };

  if (!confirming) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserX className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Delete my account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your login and profile data from Who Do I Work For. Cancel active subscriptions via{" "}
                <Link to="/pricing" className="text-foreground underline underline-offset-2 hover:text-primary">
                  billing / pricing
                </Link>{" "}
                first if you pay for the service.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 shrink-0" onClick={() => setConfirming(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-destructive">This cannot be undone</p>
            <p className="text-muted-foreground">
              Your Supabase account and associated app data will be removed. If you use Clerk sign-in, you will be signed out here as well. You may still manage
              your Clerk identity from your Clerk-linked provider settings if needed until you consolidate to a single identity provider.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm">Type {ACCOUNT_DELETE_CONFIRMATION} to confirm</Label>
          <Input
            id="delete-confirm"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={ACCOUNT_DELETE_CONFIRMATION}
            autoComplete="off"
            disabled={deleting}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => { setConfirming(false); setPhrase(""); }} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting || phrase.trim() !== ACCOUNT_DELETE_CONFIRMATION}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete my account permanently"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
