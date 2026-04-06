import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersona } from "@/hooks/use-persona";
import { PersonaQuizBanner } from "@/components/PersonaQuizBanner";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NarrativeFeed } from "@/components/dashboard/NarrativeFeed";
import { AlignedJobsList } from "@/components/jobs/AlignedJobsList";
import { PreferenceCenter } from "@/components/jobs/PreferenceCenter";
import { UserProfileForm } from "@/components/jobs/UserProfileForm";
import { TrackingDashboard } from "@/components/jobs/TrackingDashboard";
import { AutoApplySettings } from "@/components/jobs/AutoApplySettings";
import { ApplyQueueDashboard } from "@/components/jobs/ApplyQueueDashboard";
import { PurpleSquirrelOnboarding } from "@/components/jobs/PurpleSquirrelOnboarding";
import { SlotManagementDashboard } from "@/components/slots/SlotManagementDashboard";
import { UserAlertsList } from "@/components/UserAlerts";
import { MyValuesProfile } from "@/components/career/MyValuesProfile";
import { HowDoIGetThere } from "@/components/career/HowDoIGetThere";
import { OutreachIntelligence } from "@/components/career/OutreachIntelligence";
import { RelationshipDashboard } from "@/components/career/RelationshipDashboard";
import { FirstLoginOnboarding } from "@/components/FirstLoginOnboarding";
import { DataWipeButton } from "@/components/career/DataWipeButton";
import { AccountDeletionButton } from "@/components/career/AccountDeletionButton";
import { PostPurchaseUpsell } from "@/components/PostPurchaseUpsell";
import { supabase } from "@/integrations/supabase/client";
import { OfferClarityWizard } from "@/components/offer-clarity/OfferClarityWizard";
import { PremiumGate } from "@/components/PremiumGate";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { JobsFeedSection } from "@/components/dashboard/JobsFeedSection";
import { TrackerSection } from "@/components/dashboard/TrackerSection";
import { ApplyKitSection } from "@/components/dashboard/ApplyKitSection";
import { MockInterviewSection } from "@/components/dashboard/MockInterviewSection";
import { InboxSection } from "@/components/dashboard/InboxSection";
import { SavedSection } from "@/components/dashboard/SavedSection";
import { FoundingMemberRecognition } from "@/components/dashboard/FoundingMemberRecognition";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { cn } from "@/lib/utils";
import {
  Eye, Briefcase, Shield, Zap, Settings, User,
  ChevronRight,
} from "lucide-react";
import type { ElementType } from "react";

/* ═══════════════════════════════════════════════════════════
   TAB ARCHITECTURE — 5 groups, sub-tabs within each
   ═══════════════════════════════════════════════════════════ */

interface SubTab {
  id: string;
  label: string;
}

interface TabGroup {
  id: string;
  label: string;
  icon: ElementType;
  defaultTab: string;
  subtabs: SubTab[];
}

const TAB_GROUPS: TabGroup[] = [
  {
    id: "briefing",
    label: "Briefing",
    icon: Eye,
    defaultTab: "overview",
    subtabs: [],
  },
  {
    id: "search",
    label: "My Search",
    icon: Briefcase,
    defaultTab: "jobs",
    subtabs: [
      { id: "jobs", label: "Jobs" },
      { id: "app-tracker", label: "Tracker" },
      { id: "apply-kit", label: "Apply Kit" },
      { id: "mock-interview", label: "Interview Prep" },
      { id: "search-inbox", label: "Inbox" },
      { id: "search-saved", label: "Saved" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Shield,
    defaultTab: "tracked",
    subtabs: [
      { id: "tracked", label: "Tracked" },
      { id: "alerts", label: "Alerts" },
      { id: "values", label: "Values" },
      { id: "how", label: "Dossiers" },
      { id: "outreach", label: "Outreach" },
      { id: "relationships", label: "Network" },
    ],
  },
  {
    id: "apply",
    label: "Apply",
    icon: Zap,
    defaultTab: "auto-apply",
    subtabs: [
      { id: "auto-apply", label: "Auto-Apply" },
      { id: "tracker", label: "Applications" },
      { id: "matches", label: "Interview Kits" },
      { id: "offers", label: "Offer Checks" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    defaultTab: "preferences",
    subtabs: [
      { id: "preferences", label: "Preferences" },
      { id: "profile", label: "Profile" },
    ],
  },
];

/** Map every sub-tab ID → its parent group ID for reverse lookup. */
const TAB_TO_GROUP: Record<string, string> = {};
TAB_GROUPS.forEach((g) => {
  if (g.subtabs.length === 0) {
    TAB_TO_GROUP[g.defaultTab] = g.id;
  }
  g.subtabs.forEach((st) => {
    TAB_TO_GROUP[st.id] = g.id;
  });
});

const TAB_TITLES: Record<string, string> = {
  overview: "My Briefing",
  tracked: "Tracked Companies",
  matches: "Interview Kits",
  values: "My Values Profile",
  how: "Dossier History",
  outreach: "Outreach Intelligence",
  tracker: "Application Tracker",
  "auto-apply": "Auto-Apply",
  relationships: "Relationship Intelligence",
  offers: "My Offer Checks",
  alerts: "Signal Alerts",
  preferences: "Preferences",
  profile: "My Profile",
  jobs: "Jobs Feed",
  "app-tracker": "Tracker",
  "apply-kit": "Apply Kit",
  "mock-interview": "Mock Interview",
  "search-inbox": "Inbox",
  "search-saved": "Saved",
};

/* ═══ Sub-components ═══ */

/** Subtle path to Workplace DNA when values profile hides the main quiz banner. */
function ReaderLensFootnote() {
  const { hasTakenQuiz, personaName } = usePersona();
  return (
    <p className="mt-10 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
      <span className="mr-1">Reader lens:</span>
      <Link to="/quiz" className="text-primary hover:underline font-medium">
        {hasTakenQuiz && personaName ? `"${personaName}" — adjust` : "Set or adjust (~60 sec)"}
      </Link>
    </p>
  );
}

/** Primary group pill navigation. */
function GroupNav({
  activeGroup,
  onGroupChange,
}: {
  activeGroup: string;
  onGroupChange: (groupId: string) => void;
}) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
      {TAB_GROUPS.map((g) => {
        const Icon = g.icon;
        const active = activeGroup === g.id;
        return (
          <button
            key={g.id}
            onClick={() => onGroupChange(g.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200",
              active
                ? "bg-primary/[0.12] text-primary border border-primary/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "")} />
            {g.label}
          </button>
        );
      })}
    </nav>
  );
}

/** Secondary sub-tab strip (appears below group pills when a group has sub-tabs). */
function SubTabNav({
  group,
  activeTab,
  onTabChange,
}: {
  group: TabGroup;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  if (group.subtabs.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none border-b border-border/30 px-1">
      {group.subtabs.map((st) => {
        const active = activeTab === st.id;
        return (
          <button
            key={st.id}
            onClick={() => onTabChange(st.id)}
            className={cn(
              "relative px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {st.label}
            {active && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD — Main component
   ═══════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user, loading, subscriptionStatus } = useAuth();
  const { hasTakenQuiz } = usePersona();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const queryClient = useQueryClient();

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  /** Resolve active group from the current tab. */
  const activeGroupId = useMemo(() => TAB_TO_GROUP[tab] || "briefing", [tab]);
  const activeGroup = useMemo(
    () => TAB_GROUPS.find((g) => g.id === activeGroupId) || TAB_GROUPS[0],
    [activeGroupId]
  );

  const handleGroupChange = (groupId: string) => {
    const group = TAB_GROUPS.find((g) => g.id === groupId);
    if (group) setTab(group.defaultTab);
  };

  const { data: onboardingCompleted, isLoading: onboardingLoading } = useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user!.id)
        .maybeSingle();
      return data?.onboarding_completed ?? false;
    },
    enabled: !!user,
  });

  const { data: hasValuesProfile } = useQuery({
    queryKey: ["values-profile-exists", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_values_profile")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const creditPurchase = searchParams.get("credit_purchase");
  const [showUpsell, setShowUpsell] = useState(creditPurchase === "success");

  if (loading || onboardingLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const showOnboarding = onboardingCompleted === false;

  const dismissUpsell = () => {
    setShowUpsell(false);
    searchParams.delete("credit_purchase");
    setSearchParams(searchParams, { replace: true });
  };

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return (
          <>
            <DashboardStats />
            <div className="mt-6">
              <NarrativeFeed onNavigate={setTab} />
            </div>
            {hasValuesProfile === true && <ReaderLensFootnote />}
          </>
        );
      case "tracked":
        return <SlotManagementDashboard />;
      case "matches":
        return <AlignedJobsList />;
      case "values":
        return <MyValuesProfile />;
      case "how":
        return <HowDoIGetThere />;
      case "outreach":
        return <OutreachIntelligence />;
      case "relationships":
        return <RelationshipDashboard />;
      case "tracker":
        return <TrackingDashboard />;
      case "auto-apply": {
        const hasCompleted = !!localStorage.getItem("purpleSquirrelParams");
        if (!hasCompleted) {
          return <PurpleSquirrelOnboarding onComplete={() => setTab("auto-apply")} />;
        }
        return (
          <div className="space-y-6">
            <AutoApplySettings />
            <ApplyQueueDashboard />
          </div>
        );
      }
      case "offers":
        return (
          <div className="space-y-6">
            <PremiumGate feature="Offer Clarity Check" requiredTier="candidate">
              <OfferClarityWizard />
            </PremiumGate>
            <div className="text-center">
              <a href="/my-offer-checks" className="text-sm text-muted-foreground hover:text-primary underline transition-colors">
                View past reports →
              </a>
            </div>
          </div>
        );
      case "alerts":
        return <UserAlertsList />;
      case "preferences":
        return <PreferenceCenter />;
      case "profile":
        return (
          <div className="space-y-6">
            <UserProfileForm />
            <DataWipeButton />
            <AccountDeletionButton />
          </div>
        );
      case "jobs":
        return <JobsFeedSection />;
      case "app-tracker":
        return <TrackerSection />;
      case "apply-kit":
        return <ApplyKitSection />;
      case "mock-interview":
        return <MockInterviewSection />;
      case "search-inbox":
        return <InboxSection />;
      case "search-saved":
        return <SavedSection />;
      default:
        return (
          <>
            <DashboardStats />
            <div className="mt-6">
              <NarrativeFeed onNavigate={setTab} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Helmet>
        <title>{TAB_TITLES[tab] || "My Intelligence"} — Who Do I Work For?</title>
      </Helmet>

      {showOnboarding && (
        <FirstLoginOnboarding
          onComplete={() => {
            queryClient.setQueryData(["onboarding-status", user.id], true);
          }}
        />
      )}

      {/* ═══ DASHBOARD HEADER ═══ */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        {/* Title row */}
        <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 pb-2">
          <h1 className="text-lg font-extrabold text-foreground tracking-tight truncate min-w-0">
            {TAB_TITLES[tab] || "My Intelligence"}
          </h1>
          {subscriptionStatus?.founding_supporter && (
            <Badge
              variant="outline"
              title="The Reset Room — active subscription"
              className="shrink-0 text-[10px] font-semibold uppercase tracking-wide border-primary/40 text-primary bg-primary/10"
            >
              Reset Room
            </Badge>
          )}
          {activeGroupId !== "briefing" && (
            <button
              onClick={() => handleGroupChange("briefing")}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Eye className="w-3 h-3" />
              Back to briefing
            </button>
          )}
        </div>

        {/* Group pills */}
        <div className="px-3 sm:px-5 pb-2">
          <GroupNav activeGroup={activeGroupId} onGroupChange={handleGroupChange} />
        </div>

        {/* Sub-tab strip */}
        {activeGroup.subtabs.length > 0 && (
          <div className="px-3 sm:px-5">
            <SubTabNav group={activeGroup} activeTab={tab} onTabChange={setTab} />
          </div>
        )}
      </div>

      {/* ═══ CONTENT AREA ═══ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-[900px] mx-auto w-full">
          <FoundingMemberRecognition />
        </div>
        {!hasTakenQuiz && tab === "overview" && hasValuesProfile === false && <PersonaQuizBanner />}
        {showUpsell && <PostPurchaseUpsell onDismiss={dismissUpsell} />}
        <div className="max-w-[900px] mx-auto w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
