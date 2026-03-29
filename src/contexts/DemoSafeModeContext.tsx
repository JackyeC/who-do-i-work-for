import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import type { PremiumTier } from "@/hooks/use-premium";

interface DemoSafeModeContextType {
  /** True when demo safe mode is active — masks real data, uses synthetic examples */
  isDemoSafe: boolean;
  /** Toggle manually (only available to internal_test / owner roles) */
  toggleDemoSafe: () => void;
  /** Whether the current user CAN toggle demo mode */
  canToggle: boolean;
  /** Preview tier override — when set, usePremium will return this tier's features */
  previewTier: PremiumTier | null;
  setPreviewTier: (tier: PremiumTier | null) => void;
}

const DemoSafeModeContext = createContext<DemoSafeModeContextType>({
  isDemoSafe: false,
  toggleDemoSafe: () => {},
  canToggle: false,
  previewTier: null,
  setPreviewTier: () => {},
});

export const useDemoSafeMode = () => useContext(DemoSafeModeContext);

export function DemoSafeModeProvider({ children }: { children: ReactNode }) {
  const { isInternalTest, isOwner, isLoading } = useUserRole();
  const canToggle = isInternalTest || isOwner;

  const [isDemoSafe, setDemoSafe] = useState(false);
  const [previewTier, setPreviewTierState] = useState<PremiumTier | null>(() => {
    const saved = localStorage.getItem("whodoiworkfor-preview-tier");
    return saved === "free" || saved === "candidate" || saved === "professional" ? saved : null;
  });

  // Only allow demo mode for authorized roles; reset for unauthorized users
  useEffect(() => {
    if (isLoading) return;
    if (!canToggle) {
      setDemoSafe(false);
      setPreviewTierState(null);
      localStorage.removeItem("whodoiworkfor-demo-safe");
      localStorage.removeItem("whodoiworkfor-preview-tier");
      return;
    }
    // Restore persisted preference for authorized users
    if (localStorage.getItem("whodoiworkfor-demo-safe") === "true") {
      setDemoSafe(true);
    }
    // Auto-activate for internal_test users
    if (isInternalTest && !isDemoSafe) {
      setDemoSafe(true);
      localStorage.setItem("whodoiworkfor-demo-safe", "true");
    }
  }, [isLoading, canToggle, isInternalTest]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDemoSafe = useCallback(() => {
    if (!canToggle) return;
    setDemoSafe((prev) => {
      const next = !prev;
      localStorage.setItem("whodoiworkfor-demo-safe", String(next));
      return next;
    });
  }, [canToggle]);

  const setPreviewTier = useCallback((tier: PremiumTier | null) => {
    if (!canToggle) return;
    setPreviewTierState(tier);
    if (tier) {
      localStorage.setItem("whodoiworkfor-preview-tier", tier);
    } else {
      localStorage.removeItem("whodoiworkfor-preview-tier");
    }
  }, [canToggle]);

  return (
    <DemoSafeModeContext.Provider value={{ isDemoSafe, toggleDemoSafe, canToggle, previewTier, setPreviewTier }}>
      {children}
    </DemoSafeModeContext.Provider>
  );
}
