import { useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // Read initial state from the DOM — already correct from the inline script in index.html.
  // Do NOT re-apply on mount (no useEffect) to avoid flash.
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.style.backgroundColor = "#0a0a0e";
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.style.backgroundColor = "#f7f5f0";
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

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
