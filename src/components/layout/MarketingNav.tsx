import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { Button } from "@/components/ui/button";
import { isMarketingLaunch } from "@/config/marketingLaunch";

const PRIMARY_LINKS = [
  { label: "How it works", to: "/#product-key" },
  { label: "Receipts", to: "/receipts" },
  { label: "Companies", to: "/browse" },
  { label: "Tools", to: "/tools" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

const TOOLS_LINKS_BASE = [
  { label: "The Reset Room", to: "/reset-room" },
  { label: "For Companies", to: "/for-employers" },
  { label: "Methodology", to: "/methodology" },
  { label: "Recruiter Brief", to: "/recruiter-brief" },
  { label: "Mock Interview", to: "/mock-interview" },
  { label: "Career Map", to: "/career-intelligence" },
  { label: "Job Board", to: "/jobs" },
  { label: "All Tools", to: "/tools" },
] as const;

const TOOLS_LINKS_MARKETING = TOOLS_LINKS_BASE.filter(
  (l) => !["Mock Interview", "Career Map", "Job Board"].includes(l.label)
);

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isLoaded } = useClerkWithFallback();
  const toolsLinks = isMarketingLaunch ? TOOLS_LINKS_MARKETING : [...TOOLS_LINKS_BASE];

  if (!isLoaded || authLoading) {
    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 lg:px-16 py-4 w-full" aria-busy="true">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4">
          <div className="h-8 w-20 rounded bg-muted/50 animate-pulse" aria-hidden />
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
            <div className="h-4 w-14 rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-12 rounded bg-muted/40 animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-muted/40 animate-pulse" />
          </div>
          <div className="md:hidden h-9 w-9 rounded bg-muted/40 animate-pulse shrink-0" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 lg:px-16 py-4 w-full">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-0.5 shrink-0 min-w-0">
            <Link to="/" className="flex items-center">
              <span style={{ fontFamily: "Inter,sans-serif", fontWeight: 900, letterSpacing: "-0.03em", fontSize: "26px" }}>
                <span className="text-foreground">W</span>
                <span style={{ color: "#F0C040" }}>?</span>
              </span>
            </Link>
            <Link
              to="/about"
              className="font-sans text-[10px] sm:text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-wide max-w-[14rem] sm:max-w-none leading-tight"
            >
              Know who you’re working for—using public records, not vibes.
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {PRIMARY_LINKS.map((link) => {
              const isHashHome = link.to.startsWith("/#");
              const isActive =
                (!isHashHome && (location.pathname === link.to || location.pathname.startsWith(link.to + "/"))) ||
                (isHashHome && location.pathname === "/" && location.hash === link.to.slice(1));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-sans text-sm transition-colors ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Tools dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Tools <ChevronDown className="w-3 h-3" />
              </button>
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                  {toolsLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      onClick={() => setToolsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="font-sans text-sm">
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/join")} className="font-sans text-sm rounded-full px-5">
                Get Started Free
              </Button>
            )}
          </nav>
          <button
            className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 border-b border-border/50 bg-background">
          <nav className="flex flex-col gap-3">
            {PRIMARY_LINKS.map((link) => {
              const isHashHome = link.to.startsWith("/#");
              const isActive =
                (!isHashHome && location.pathname === link.to) ||
                (isHashHome && location.pathname === "/" && location.hash === link.to.slice(1));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-sm py-2 transition-colors ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-2 mb-1">Tools</p>
            {toolsLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button size="sm" variant="outline" onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="w-full mt-2">
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => { setMobileMenuOpen(false); navigate("/join"); }} className="w-full mt-2">
                Get Started Free
              </Button>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
