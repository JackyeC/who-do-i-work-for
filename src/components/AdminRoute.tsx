import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, isOwner, isLoading } = useUserRole();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isOwner)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
