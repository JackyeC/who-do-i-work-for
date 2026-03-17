import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerWaitlist } from "@/hooks/use-career-waitlist";
import { useUserRole } from "@/hooks/use-user-role";
import { CareerWaitlistGate } from "@/components/career/CareerWaitlistGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isApproved, isLoading: waitlistLoading } = useCareerWaitlist();
  const { isAdmin, isOwner, isLoading: roleLoading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins/owners bypass the waitlist
  if (roleLoading || waitlistLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-6 flex-1 flex items-center justify-center">
          <Skeleton className="h-64 w-96 rounded-xl" />
        </main>
        <Footer />
      </div>
    );
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
