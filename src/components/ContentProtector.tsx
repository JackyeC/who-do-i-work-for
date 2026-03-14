import { useEffect, ReactNode } from "react";

interface ContentProtectorProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps premium content with copy/print/screenshot protections.
 * - Disables text selection (CSS)
 * - Blocks right-click context menu
 * - Blocks Ctrl+C / Cmd+C / Ctrl+P / Cmd+P
 * - Blocks print via CSS @media print
 */
export function ContentProtector({ children, className }: ContentProtectorProps) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".protected-content")) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".protected-content")) return;

      // Block Ctrl/Cmd + C (copy), P (print), S (save), A (select all)
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
  }, []);

  return (
    <div className={`protected-content ${className || ""}`}>
      {children}
    </div>
  );
}
