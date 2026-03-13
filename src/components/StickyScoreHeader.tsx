import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface StickyScoreHeaderProps {
  companyName: string;
  score: number;
  ticker?: string | null;
  industry: string;
  /** ID of the scroll container, or use window */
  scrollRef?: React.RefObject<HTMLElement>;
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-[hsl(var(--civic-green))]";
  if (score >= 45) return "text-[hsl(var(--civic-yellow))]";
  return "text-destructive";
}

function getOfferRisk(score: number) {
  if (score >= 65) return { level: "Low", color: "text-[hsl(var(--civic-green))]", bg: "bg-[hsl(var(--civic-green))]/10" };
  if (score >= 40) return { level: "Moderate", color: "text-[hsl(var(--civic-yellow))]", bg: "bg-[hsl(var(--civic-yellow))]/10" };
  return { level: "Elevated", color: "text-destructive", bg: "bg-destructive/10" };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "intelligence", label: "Intelligence" },
  { id: "leadership", label: "Leadership" },
  { id: "workforce", label: "Workforce" },
  { id: "compensation", label: "Pay" },
  { id: "stability", label: "Stability" },
  { id: "influence", label: "Influence" },
  { id: "values", label: "Values" },
];

export function StickyScoreHeader({ companyName, score, ticker, industry }: StickyScoreHeaderProps) {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 320);

      // Determine active section
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${SECTIONS[i].id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const risk = getOfferRisk(score);

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm"
        >
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Score bar */}
            <div className="flex items-center justify-between h-11 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-foreground text-sm truncate">{companyName}</span>
                {ticker && <Badge variant="outline" className="font-mono text-[10px] shrink-0">{ticker}</Badge>}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground">Score</span>
                  <span className={cn("text-sm font-black tabular-nums", getScoreColor(score))}>{score}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium", risk.bg, risk.color)}>
                  <AlertTriangle className="w-3 h-3" />
                  Offer Risk: {risk.level}
                </div>
              </div>
            </div>

            {/* Section nav */}
            <div className="flex items-center gap-0.5 -mb-px overflow-x-auto scrollbar-none">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors border-b-2",
                    activeSection === s.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
