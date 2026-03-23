import { usePageSEO } from "@/hooks/use-page-seo";
import { PathfinderTracks } from "@/components/landing/PathfinderTracks";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PathfinderTracks showAll />
      </main>
      <Footer />
    </div>
  );
}
