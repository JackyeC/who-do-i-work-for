import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isMarketingLaunch } from "@/config/marketingLaunch";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

/**
 * When marketing launch is on, anonymous users see a hold screen instead of
 * half-finished product UI. Signed-in accounts bypass (founder demos, QA).
 */
export function MarketingLaunchProductHold({ title, description, children }: Props) {
  const { user, loading } = useAuth();

  if (!isMarketingLaunch || loading || user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/join">Get early access</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/browse">Browse companies</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
