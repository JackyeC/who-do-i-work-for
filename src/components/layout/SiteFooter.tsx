import { Link } from "react-router-dom";
import { isMarketingLaunch } from "@/config/marketingLaunch";

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border px-6 lg:px-16 py-12 mt-auto">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center mb-3">
              <span
                style={{
                  fontFamily: "Inter,sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  fontSize: "22px",
                }}
              >
                <span className="text-foreground">W</span>
                <span style={{ color: "#F0C040" }}>?</span>
              </span>
            </Link>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-[32ch]">
              <strong className="font-semibold text-foreground">Who Do I Work For?</strong>{" "}
              is career intelligence by{" "}
              <a
                href="https://jackyeclayton.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Jackye Clayton
              </a>
              —so you evaluate employers with the rigor they use on you. Receipts,
              not opinions.
            </p>
            <div className="flex flex-col gap-1.5 mt-3">
              <Link
                to="/about"
                className="font-sans text-sm text-primary hover:text-primary/80 font-medium"
              >
                Meet Jackye →
              </Link>
              <Link
                to="/#product-key"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works &amp; product key →
              </Link>
              <Link
                to="/about#product-key-about"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Same guide on About →
              </Link>
            </div>
          </div>

          {/* Product & pages — every label maps to a real route in App.tsx */}
          <div>
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">
              Platform
            </p>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/#product-key" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link to="/browse" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Companies
              </Link>
              <Link to="/receipts" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Receipts
              </Link>
              {!isMarketingLaunch && (
                <>
                  <Link to="/signal-alerts" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Work signal
                  </Link>
                  <Link to="/dashboard?tab=values" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Values profile
                  </Link>
                </>
              )}
              <Link to="/strategic-offer-review" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Offer review
              </Link>
              {!isMarketingLaunch && (
                <>
                  <Link to="/auto-apply" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Auto-Apply
                  </Link>
                  <Link to="/jobs" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Job board
                  </Link>
                </>
              )}
              <Link to="/pricing" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/for-employers" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                For companies
              </Link>
              <Link to="/about" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/submit-tip" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Submit a tip
              </Link>
              <Link to="/newsletter" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                Newsletter
              </Link>
            </nav>
          </div>

          {/* Connect */}
          <div>
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">
              Connect
            </p>
            <nav className="flex flex-col gap-2">
              <a
                href="https://jackyeclayton.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                JackyeClayton.com
              </a>
              <a
                href="https://www.linkedin.com/in/jackyeclayton/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://jackyeclayton.com/speaking"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Speaking
              </a>
              <a
                href="https://www.inclusiveafpodcast.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Inclusive AF Podcast
              </a>
              <a
                href="https://wrkdefined.com/podcast/but-first-coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                But First, Coffee
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">
              Legal
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                to="/privacy-policy"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/methodology"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Methodology
              </Link>
              <Link
                to="/data-ethics"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Data Ethics
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex justify-between items-center flex-wrap gap-3">
          <p className="font-sans text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Who Do I Work For. A People Puzzles venture. Built
            because you deserve to know.
          </p>
          <p className="font-sans text-xs text-muted-foreground/50">
            Built on public records: FEC · SEC · BLS · OSHA · NLRB · Senate
            Lobbying
          </p>
        </div>
      </div>
    </footer>
  );
}
