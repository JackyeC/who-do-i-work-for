import { usePageSEO } from "@/hooks/use-page-seo";
import { PathfinderTracks } from "@/components/landing/PathfinderTracks";
import { Shield } from "lucide-react";

export default function Pricing() {
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
    <>
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
    </>
  );
}
