import { forwardRef } from "react";

// Header is now replaced by the unified AppShell (AppSidebar + TopBar).
// This component is kept as a no-op to avoid breaking existing page imports.
export const Header = forwardRef<HTMLDivElement>((_, ref) => {
  return <div ref={ref} />;
});

Header.displayName = "Header";
