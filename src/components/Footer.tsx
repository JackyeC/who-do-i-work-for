import { Link } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <ClipboardCheck className="w-3 h-3 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-foreground" style={{ fontFamily: "'Source Serif 4', serif" }}>Offer Check</span>
                <span className="text-[8px] text-muted-foreground">by Jackye Clayton</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Know before you go. Review public signals about any employer before you accept the offer, buy their products, or invest your time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">Navigate</p>
              <Link to="/browse" className="block text-muted-foreground hover:text-foreground transition-colors">Browse Companies</Link>
              <Link to="/methodology" className="block text-muted-foreground hover:text-foreground transition-colors">Methodology</Link>
              <Link to="/search" className="block text-muted-foreground hover:text-foreground transition-colors">Search</Link>
              <Link to="/jobs" className="block text-muted-foreground hover:text-foreground transition-colors">Job Board</Link>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">About</p>
              <p>Data from FEC.gov, OpenSecrets, USASpending &amp; public filings.</p>
              <p>Signals reported. No conclusions drawn.</p>
              <Link to="/request-correction" className="block text-primary hover:underline">Request a Correction</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Offer Check by Jackye Clayton. All rights reserved. This tool reports publicly available data for informational purposes only. No conclusions are drawn.</p>
        </div>
      </div>
    </footer>
  );
}