import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useCivicImpact } from "@/hooks/use-civic-impact";
import { CIVIC_MILESTONES, milestoneToastMessage, weeklyEngagementSubcopy } from "@/lib/engagement-insights";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home, Search, Building2, PlusCircle, TrendingUp, ScanSearch, Heart,
  Briefcase, FileCheck, Map, FileText, BarChart3, Eye, Landmark, Network,
  Megaphone, Users, Target, CreditCard,
  LayoutDashboard, Zap, Bell, Settings, User,
  LogIn, LogOut, Flame, Shield,
} from "lucide-react";
import logoSquare from "@/assets/wdiwf-logo-square.png";
import logoNav from "@/assets/wdiwf-logo-nav-light.png";

/* ------------------------------------------------------------------ */
/*  Nav structure                                                      */
/* ------------------------------------------------------------------ */

/** Everything below the Home / Command center group. */
const NAV_GROUPS_TAIL = [
  {
    label: "Explore",
    items: [
      { id: "search", label: "Search Everything", icon: Search, path: "/search" },
      { id: "browse", label: "Employer Directory", icon: Building2, path: "/browse" },
      { id: "add-company", label: "Add Company", icon: PlusCircle, path: "/add-company" },
      { id: "examples", label: "Top Searched", icon: TrendingUp, path: "/examples" },
      { id: "rivalries", label: "2026 Rivalries", icon: Flame, path: "/rivalries" },
      { id: "brand-madness", label: "Brand Madness 🏆", icon: Zap, path: "/brand-madness" },
      { id: "recent-scans", label: "Recent Scans", icon: ScanSearch, path: "/search-your-employer" },
      { id: "values-search", label: "Signal Search", icon: Heart, path: "/values-search" },
    ],
  },
  {
    label: "Map My Career",
    items: [
      { id: "employer-scan", label: "Employer Scan", icon: Briefcase, path: "/check?tab=company" },
      { id: "offer-check", label: "Offer Check", icon: FileCheck, path: "/check?tab=offer" },
      { id: "career-map", label: "Career Path Explorer", icon: Map, path: "/career-map", auth: true },
      { id: "jobs", label: "Job Board", icon: Briefcase, path: "/jobs" },
    ],
  },
  {
    label: "Research",
    items: [
      { id: "receipts", label: "Evidence Receipts", icon: FileText, path: "/intelligence" },
      { id: "policy-signals", label: "Policy Signals", icon: BarChart3, path: "/intelligence?type=policy_alert" },
      { id: "signals-week", label: "Signals This Week", icon: Eye, path: "/intelligence?type=weekly_brief" },
      { id: "legislation", label: "Legislation Watch", icon: Landmark, path: "/intelligence?type=legislative_watch" },
      { id: "influence-map", label: "Influence Map", icon: Network, path: "/check?tab=candidate" },
      { id: "investigative", label: "Power Networks", icon: Shield, path: "/investigative" },
      { id: "evp-audit", label: "EVP Audit", icon: Megaphone, path: "/recruiting?tab=evp" },
      { id: "talent-dash", label: "Talent Dashboard", icon: Target, path: "/recruiting?tab=insights" },
    ],
  },
  {
    label: "My Dashboard",
    auth: true,
    items: [
      { id: "my-search", label: "My Search", icon: Briefcase, path: "/dashboard?tab=jobs" },
      { id: "intelligence", label: "Intelligence", icon: Shield, path: "/dashboard?tab=tracked" },
      { id: "auto-apply", label: "Apply", icon: Zap, path: "/dashboard?tab=auto-apply" },
      { id: "alerts", label: "Signal Alerts", icon: Bell, path: "/dashboard?tab=alerts" },
      { id: "settings-nav", label: "Settings", icon: Settings, path: "/dashboard?tab=preferences" },
      { id: "pricing", label: "Pricing & Plans", icon: CreditCard, path: "/pricing" },
    ],
  },
];

function isPathActive(itemPath: string, locationPathname: string, locationSearch: string) {
  const [base, qs] = itemPath.split("?");
  if (qs) {
    return locationPathname === base && locationSearch.includes(qs);
  }
  // Exact match for home
  if (base === "/") return locationPathname === "/";
  return locationPathname.startsWith(base);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CIVIC_MILESTONE_TOAST_KEY = "wdiwf_civic_milestones_toast";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { data: civic, isLoading: civicLoading } = useCivicImpact();

  const navGroups = useMemo(() => {
    const homeGroup = {
      label: "Home",
      items: user
        ? [
            { id: "command-center", label: "Command center", icon: LayoutDashboard, path: "/dashboard" },
            { id: "site-home", label: "Site home", icon: Home, path: "/" },
          ]
        : [{ id: "home", label: "Home", icon: Home, path: "/" }],
    };
    return [homeGroup, ...NAV_GROUPS_TAIL];
  }, [user]);

  const weeklyTip = useMemo(
    () => (user ? weeklyEngagementSubcopy(user.id) : ""),
    [user]
  );

  useEffect(() => {
    if (!user || civic === undefined) return;
    const n = civic.signalsUncovered;
    let shown: number[] = [];
    try {
      const raw = localStorage.getItem(CIVIC_MILESTONE_TOAST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      shown = Array.isArray(parsed) ? parsed.filter((x: unknown) => typeof x === "number") : [];
    } catch {
      shown = [];
    }
    const eligible = CIVIC_MILESTONES.filter((m) => n >= m && !shown.includes(m));
    if (eligible.length === 0) return;
    const m = eligible[eligible.length - 1]!;
    const msg = milestoneToastMessage(m);
    if (msg) toast.success(msg);
    const next = [...new Set([...shown, ...eligible])].sort((a, b) => a - b);
    localStorage.setItem(CIVIC_MILESTONE_TOAST_KEY, JSON.stringify(next));
  }, [user, civic]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* ── Logo ── */}
      <SidebarHeader className="p-3">
        <Link to="/" className="flex items-center group">
          {collapsed ? (
            <img src={logoSquare} alt="W?" className="w-8 h-8 rounded-lg" />
          ) : (
            <img src={logoNav} alt="Who Do I Work For?" className="h-8" />
          )}
        </Link>
      </SidebarHeader>

      {/* ── Nav groups ── */}
      <SidebarContent className="px-2">
        {navGroups.map((group) => {
          // Hide auth-required groups for logged-out users
          if ((group as any).auth && !user) return null;
          const groupHasActive = group.items.some((item) =>
            isPathActive(item.path, location.pathname, location.search)
          );

          return (
            <SidebarGroup key={group.label}>
              {group.label !== "Home" && (
                <SidebarGroupLabel className="text-xs uppercase tracking-[0.14em] text-muted-foreground/50 font-semibold px-3">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    if ((item as any).auth && !user) return null;
                    const active = isPathActive(item.path, location.pathname, location.search);
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "transition-all duration-150 rounded-lg",
                            active
                              ? "bg-primary/[0.08] text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Link to={item.path}>
                            <item.icon
                              className={cn(
                                "w-4 h-4 shrink-0",
                                active ? "text-primary" : ""
                              )}
                            />
                            {!collapsed && <span>{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* ── Footer: Civic Impact + Auth ── */}
      <SidebarFooter className="p-3 space-y-2">
        {/* Civic Impact counter */}
        {user && !collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-civic-gold/10 to-primary/5 border border-civic-gold/15 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-3.5 h-3.5 text-civic-gold" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                My Civic Impact
              </span>
            </div>
            <p className="text-lg font-bold text-foreground font-display leading-none">
              {civicLoading ? "—" : civic?.signalsUncovered ?? 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">signals uncovered</span>
            </p>
            {(civic?.employersTracked ?? 0) > 0 && (
              <p className="text-[11px] text-muted-foreground mt-2">
                {civic!.employersTracked} employer
                {civic!.employersTracked === 1 ? "" : "s"} on your watchlist
              </p>
            )}
            {weeklyTip && (
              <p className="text-[11px] text-muted-foreground/90 mt-2 leading-snug border-t border-civic-gold/10 pt-2">
                {weeklyTip}
              </p>
            )}
          </div>
        )}

        {user ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn(
              "w-full justify-start gap-2 text-muted-foreground hover:text-destructive rounded-lg",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && "Sign Out"}
          </Button>
        ) : (
          <Link to="/login">
            <Button
              variant="default"
              size="sm"
              className={cn("w-full gap-2 rounded-xl", collapsed && "px-0")}
            >
              <LogIn className="w-4 h-4" />
              {!collapsed && "Sign In"}
            </Button>
          </Link>
        )}

        {!user && !collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            Sign in for auto-apply, alerts & career tools
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
