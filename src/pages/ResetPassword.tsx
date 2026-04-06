import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

export default function ResetPassword() {
  usePageSEO({
    title: "Reset password — Who Do I Work For",
    description: "Reset your password to regain access to your account.",
    path: "/reset-password",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit = useMemo(() => {
    if (!hasRecoverySession) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [hasRecoverySession, password, confirm]);

  useEffect(() => {
    let active = true;

    // Supabase sets a temporary session when arriving via recovery link.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasRecoverySession(!!data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoverySession(true);
        setReady(true);
      } else if (!session) {
        setHasRecoverySession(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err.message || "Could not update password.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-2 border border-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-headline text-2xl">Reset password</CardTitle>
            <p className="text-body text-muted-foreground leading-relaxed">
              {ready
                ? hasRecoverySession
                  ? "Choose a new password."
                  : "Open the reset link from your email to continue."
                : "Checking your reset link..."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                  disabled={!hasRecoverySession}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                  disabled={!hasRecoverySession}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 gap-2 text-base" disabled={!canSubmit || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

