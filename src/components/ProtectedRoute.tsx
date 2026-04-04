import { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerWaitlist } from "@/hooks/use-career-waitlist";
import { useUserRole } from "@/hooks/use-user-role";
import { CareerWaitlistGate } from "@/components/career/CareerWaitlistGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

const AUTH_GRACE_MS = 2000;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isFallback } = useClerkWithFallback();
  const location = useLocation();
  const isDossierRoute = /^\/dossier(?:\/|$)/.test(location.pathname);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }
  if (isDossierRoute) return <>{children}</>;

  if (isFallback) {
    return <ProtectedRouteInner>{children}</ProtectedRouteInner>;
  }

  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
      <SignedIn>
        <ProtectedRouteInner>{children}</ProtectedRouteInner>
      </SignedIn>
    </>
  );
}

function ProtectedRouteInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isApproved, isLoading: waitlistLoading } = useCareerWaitlist();
  const { isAdmin, isOwner, isLoading: roleLoading } = useUserRole();
  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    if (loading || user) {
      setGraceElapsed(false);
      return;
    }
    const id = setTimeout(() => setGraceElapsed(true), AUTH_GRACE_MS);
    return () => clearTimeout(id);
  }, [loading, user]);

  if (loading || roleLoading || waitlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !graceElapsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && !isOwner && !isApproved) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-6 flex-1">
          <CareerWaitlistGate />
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
