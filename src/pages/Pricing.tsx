import { usePageSEO } from "@/hooks/use-page-seo";
import { PathfinderTracks } from "@/components/landing/PathfinderTracks";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClerkWithFallback } from "@/hooks/use-clerk-fallback";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLoaded } = useClerkWithFallback();

  usePageSEO({
    title: "Pricing — Who Do I Work For?",
    description:
      "From free career calibration to full career management. Choose your plan: Explorer (Free), Pro ($19/mo), The Dossier ($199), or Executive ($999/yr).",
    path: "/pricing",
    jsonLd: {
      "@type": "WebPage",
      name: "Pricing — Who Do I Work For?",
      description:
        "Four plans for every stage of your career intelligence journey.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "Offer", name: "The Explorer", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "Pro", price: "19", priceCurrency: "USD" },
          { "@type": "Offer", name: "The Dossier", price: "199", priceCurrency: "USD" },
          { "@type": "Offer", name: "The Executive", price: "999", priceCurrency: "USD" },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Marketing header — same as landing page */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 lg:px-16 py-4 w-full">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <span style={{ fontFamily: "Inter,sans-serif", fontWeight: 900, letterSpacing: "-0.03em", fontSize: "26px" }}>
              <span style={{ color: "#111111" }}>W</span>
              <span style={{ color: "#F0C040" }}>?</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {!authLoading && isLoaded && (
              user ? (
                <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")} className="font-sans text-btn">
                  Dashboard
                </Button>
              ) : (
                <>
                  <button onClick={() => navigate("/login")} className="font-sans text-nav text-muted-foreground hover:text-foreground transition-colors">
                    Sign in
                  </button>
                  <Button size="sm" onClick={() => navigate("/login")} className="font-sans text-btn rounded-full px-5">
                    Get started
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <PathfinderTracks showAll />

        {/* Trust footer for pricing */}
        <section className="px-6 lg:px-16 pb-16">
          <div className="max-w-[640px] mx-auto text-center">
            <div className="bg-card border border-primary/20 p-6 lg:p-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-mono text-sm tracking-[0.15em] uppercase text-primary font-semibold">Our Guarantee</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Not satisfied with your Dossier? We'll refund your purchase within 7 days — no questions asked.
                All payments processed securely through Stripe.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — same as landing page */}
      <footer className="border-t border-border px-6 lg:px-16 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1">
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
                <span style={{ color: '#111111' }}>W</span>
                <span style={{ color: '#F0C040' }}>?</span>
              </span>
              <span className="text-sm text-muted-foreground"> · by Jackye Clayton</span>
            </div>
            <div className="flex gap-6">
              <a href="/privacy" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="/methodology" className="font-mono text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">Methodology</a>
            </div>
          </div>
          <div className="border-t border-border/50 pt-4">
            <p className="font-mono text-xs tracking-wider text-muted-foreground/60 leading-relaxed max-w-[800px]">
              WDIWF reports publicly available data and does not provide character assessments, legal advice, or employment recommendations. All signals are sourced from public records and verified watchdog databases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
