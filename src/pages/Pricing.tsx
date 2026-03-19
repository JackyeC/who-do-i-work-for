import { usePageSEO } from "@/hooks/use-page-seo";
import { Helmet } from "react-helmet-async";
import { Check, Shield, Target, Eye, ArrowRight, Search, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    icon: <Search className="w-5 h-5" style={{ color: "#f0c040" }} />,
    popular: false,
    cta: "Start Free",
    ctaLink: "/join",
    features: [
      "Look up any company's integrity score",
      "See red flags before you apply",
      "Limited to 3 lookups/month",
    ],
  },
  {
    name: "Job Seeker",
    price: "$29",
    period: "/month",
    icon: <Eye className="w-5 h-5" style={{ color: "#f0c040" }} />,
    popular: false,
    cta: "Join Waitlist",
    ctaLink: "/hire",
    features: [
      "Auto-apply to up to 10 jobs per month",
      "Full dossier for every application: company intel, who's there, how to prepare, questions to ask, custom cover letter",
      "Only applies to companies that pass YOUR integrity threshold",
      "Weekly status updates on all applications",
    ],
  },
  {
    name: "Active Seeker",
    price: "$79",
    period: "/month",
    icon: <Zap className="w-5 h-5" style={{ color: "#f0c040" }} />,
    popular: true,
    cta: "Join Waitlist",
    ctaLink: "/hire",
    features: [
      "Everything in Job Seeker",
      "Up to 50 auto-applications per month",
      "Priority matching to new roles within 24hrs of posting",
      "Interview prep notes updated as you progress",
    ],
  },
  {
    name: "Recruiter",
    price: "$79",
    period: "/month",
    icon: <Target className="w-5 h-5" style={{ color: "#f0c040" }} />,
    popular: false,
    cta: "Join Waitlist",
    ctaLink: "/hire",
    features: [
      "AI-powered value alignment matching",
      "Company integrity pre-screening on every job",
      "Candidate pipeline dashboard",
      "50 integrity checks/month",
    ],
  },
  {
    name: "Employer Verified",
    price: "$349",
    period: "/month",
    icon: <Shield className="w-5 h-5" style={{ color: "#f0c040" }} />,
    popular: false,
    cta: "Join Waitlist",
    ctaLink: "/hire",
    features: [
      "Full company integrity audit",
      "Verified badge on all job postings",
      "Attract values-aligned candidates only",
      "Quarterly re-audit",
      "Priority matching in candidate search",
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  usePageSEO({
    title: "Pricing — Who Works For You?",
    description:
      "Choose your plan. Free for candidates, $79/mo for recruiters, $349/mo for verified employers. Values-aligned hiring starts here.",
    path: "/pricing",
    jsonLd: {
      "@type": "WebPage",
      name: "Pricing — Who Works For You?",
      description: "Candidate, Recruiter, and Employer Verified plans for values-aligned hiring.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "Job Seeker", price: "29", priceCurrency: "USD" },
          { "@type": "Offer", name: "Active Seeker", price: "79", priceCurrency: "USD" },
          { "@type": "Offer", name: "Recruiter", price: "79", priceCurrency: "USD" },
          { "@type": "Offer", name: "Employer Verified", price: "349", priceCurrency: "USD" },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0e" }}>
      <Helmet>
        <title>Pricing — Who Works For You?</title>
      </Helmet>

      {/* Grain overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
        <filter id="pricing-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pricing-grain)" />
      </svg>

      <div className="relative z-[1] flex-1 flex flex-col items-center px-6 py-20">
        {/* Header */}
        <p
          className="text-xs uppercase tracking-[3px] font-semibold mb-4"
          style={{ color: "#f0c040" }}
        >
          Pricing
        </p>
        <h1
          className="font-sans text-center leading-[1.08] mb-4"
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-2px",
            color: "#f0ebe0",
          }}
        >
          Hire with integrity. Price it simply.
        </h1>
        <p
          className="text-center max-w-lg mb-14"
          style={{ fontSize: "17px", color: "#b8b4a8", lineHeight: 1.7 }}
        >
          Whether you're a candidate, recruiter, or employer — pick the plan that matches how you hire.
        </p>

        {/* Candidate Tiers */}
        <p className="text-xs uppercase tracking-[3px] font-semibold mb-5" style={{ color: "#f0c040" }}>
          For Candidates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] w-full mb-12">
          {tiers.slice(0, 3).map((tier) => (
            <TierCard key={tier.name} tier={tier} navigate={navigate} />
          ))}
        </div>

        {/* Employer / Recruiter Tiers */}
        <p className="text-xs uppercase tracking-[3px] font-semibold mb-5" style={{ color: "#f0c040" }}>
          For Recruiters & Employers
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[640px] w-full">
          {tiers.slice(3).map((tier) => (
            <TierCard key={tier.name} tier={tier} navigate={navigate} />
          ))}
        </div>

        {/* Bottom note */}
        <p
          className="text-center mt-12"
          style={{ fontSize: "13px", color: "#7a7590" }}
        >
          All plans include access to verified federal data sources. No long-term contracts.
        </p>
      </div>
    </div>
  );
}
