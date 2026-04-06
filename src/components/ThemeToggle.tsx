import { useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle that READS the current state from the DOM (set by the inline
 * script in index.html) rather than re-applying it on mount. This prevents
 * the dark class from being removed and re-added during React hydration.
 */
export function ThemeToggle() {
  // Initialize from the DOM truth — the inline <script> in index.html
  // has already set the correct class before React mounts.
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
        root.style.backgroundColor = "#0A0A0E";
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
        root.style.backgroundColor = "#f7f5f0";
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  return (
    <button
      onClick={toggle}
      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
