import { useEffect, ReactNode } from "react";
import { useUserRole } from "@/hooks/use-user-role";

interface ContentProtectorProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps premium content with copy/print/screenshot protections.
 * Admins, owners, and internal testers bypass all protections.
 */
export function ContentProtector({ children, className }: ContentProtectorProps) {
  const { isAdmin, isOwner, isInternalTest } = useUserRole();
  const bypass = isAdmin || isOwner || isInternalTest;

  useEffect(() => {
    if (bypass) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".protected-content")) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".protected-content")) return;

      if ((e.ctrlKey || e.metaKey) && ["c", "p", "s", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [bypass]);

  const wrapperClassName = bypass
    ? className || ""
    : `protected-content ${className || ""}`.trim();

  return (
    <div className={wrapperClassName}>
      {children}
    </div>
  );
}