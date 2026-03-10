import { User, Briefcase, Lock, TrendingUp, Users } from "lucide-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useDossierLens, DossierLens } from "@/contexts/DossierLensContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const LENSES: { id: DossierLens; label: string; icon: React.ElementType }[] = [
  { id: "candidate", label: "Candidate", icon: User },
  { id: "sales", label: "Sales Intel", icon: TrendingUp },
  { id: "hr", label: "HR Strategy", icon: Users },
];

export function ViewModeToggle() {
  const { canAccessRecruiter } = useViewMode();
  const { lens, setLens } = useDossierLens();

  return (
    <div className="flex items-center bg-muted/60 rounded-xl p-0.5 border border-border/40">
      {LENSES.map(({ id, label, icon: Icon }) => {
        const isActive = lens === id;
        const isLocked = id !== "candidate" && !canAccessRecruiter;

        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => !isLocked && setLens(id)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200",
                  isActive
                    ? id === "candidate"
                      ? "bg-card text-foreground shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : isLocked
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isLocked && <Lock className="w-3 h-3" />}
                <Icon className="w-3 h-3" />
                <span className="hidden xl:inline">{label}</span>
              </button>
            </TooltipTrigger>
            {isLocked ? (
              <TooltipContent side="bottom" className="text-xs">
                Upgrade to Pro to access {label} view
              </TooltipContent>
            ) : (
              <TooltipContent side="bottom" className="text-xs">
                {label} view
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}
