import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { MAIN_SECTIONS } from "./TopBar";

function isSubItemActive(subPath: string, pathname: string, search: string) {
  const [base, qs] = subPath.split("?");
  if (qs) return pathname === base && search.includes(qs);
  return pathname === base;
}

export function ContextSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Find active section
  const activeSection = MAIN_SECTIONS.find(s => {
    if (s.id === "home") return location.pathname === "/";
    return s.matchPaths.some(p => {
      if (p === "/") return false;
      return location.pathname.startsWith(p);
    });
  });

  // Don't show sidebar for home or sections with no sub-items
  if (!activeSection || activeSection.id === "home" || activeSection.subItems.length === 0) {
    return null;
  }

  // Don't show for auth-required sections when not logged in
  if (activeSection.auth && !user) return null;

  const Icon = activeSection.icon;

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-border/30 bg-card/50 py-4 px-3">
      <div className="flex items-center gap-2 px-3 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {activeSection.label}
        </span>
      </div>
      <nav className="space-y-0.5">
        {activeSection.subItems.map(sub => {
          if ((sub as any).auth && !user) return null;
          const active = isSubItemActive(sub.path, location.pathname, location.search);
          return (
            <Link
              key={sub.path}
              to={sub.path}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "text-primary font-medium bg-primary/[0.08]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              {sub.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
