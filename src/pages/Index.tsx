import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, ArrowRight, Shield, Landmark, Building2, Briefcase,
  TrendingUp, ChevronRight, Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Index = () => {
  const [query, setQuery] = useState("");
  const [companyCount, setCompanyCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("companies").select("*", { count: "exact", head: true })
      .then(({ count }) => setCompanyCount(count || 0));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const pillars = [
    {
      icon: Landmark,
      label: "Policy",
      title: "Track legislation",
      desc: "See how bills affect industries, companies, and careers in plain English.",
      color: "text-primary",
      bg: "bg-primary/[0.08]",
      path: "/policy",
    },
    {
      icon: Building2,
      label: "Companies",
      title: "Investigate employers",
      desc: "PAC donations, lobbying, contracts, workforce signals — all linked to evidence.",
      color: "text-civic-gold",
      bg: "bg-civic-gold/[0.08]",
      path: "/browse",
    },
    {
      icon: TrendingUp,
      label: "Economy",
      title: "Read market signals",
      desc: "BLS wages, industry growth, federal spending, and labor demand data.",
      color: "text-civic-green",
      bg: "bg-civic-green/[0.08]",
      path: "/economy",
    },
    {
      icon: Briefcase,
      label: "Careers",
      title: "Discover your path",
      desc: "AI career discovery, values-aligned jobs, and offer intelligence.",
      color: "text-civic-blue",
      bg: "bg-civic-blue/[0.08]",
      path: "/check",
    },
  ];

  const flowSteps = [
    { label: "A bill is introduced", icon: Landmark, color: "text-primary" },
    { label: "Industries are affected", icon: TrendingUp, color: "text-civic-green" },
    { label: "Companies respond", icon: Building2, color: "text-civic-gold" },
    { label: "Careers shift", icon: Briefcase, color: "text-civic-blue" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 sm:pt-24 pb-12 sm:pb-16 relative">
          <motion.div initial="hidden" animate="show" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm text-foreground text-sm px-4 py-1.5 rounded-full mb-6 border border-border/40">
              <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse" />
              {companyCount.toLocaleString()} companies tracked
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={1}
              className="text-foreground mb-4 font-display leading-tight"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
            >
              How policy shapes companies,{" "}
              <span className="text-primary">and your career.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Track legislation. Investigate employers. Read economic signals. Discover where your career fits in.
            </motion.p>

            <motion.form variants={fadeUp} custom={3} onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative flex flex-col sm:flex-row gap-3 bg-card rounded-2xl p-2.5 shadow-lg border border-border/40">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a company, industry, or bill…"
                    className="pl-12 h-13 text-base border-0 shadow-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40"
                  />
                </div>
                <Button type="submit" size="lg" className="h-13 px-8 rounded-xl text-base font-semibold">
                  Search
                </Button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Flow visualization */}
      <section className="py-10 border-y border-border/30 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl mx-auto">
            <motion.p variants={fadeUp} custom={0} className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
              How everything connects
            </motion.p>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {flowSteps.map((step, i) => (
                <motion.div key={step.label} variants={fadeUp} custom={i + 1} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border/40 shadow-sm">
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                    <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 hidden sm:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="max-w-5xl mx-auto">
            <motion.h2 variants={fadeUp} custom={0} className="text-center text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
              Four layers of intelligence
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-center text-muted-foreground mb-12 text-base max-w-lg mx-auto">
              Connected data from legislation, companies, economic indicators, and career paths.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((pillar, i) => (
                <motion.div key={pillar.label} variants={fadeUp} custom={i + 2}>
                  <Card
                    className="h-full cursor-pointer group hover:shadow-md transition-all hover:-translate-y-0.5"
                    onClick={() => navigate(pillar.path)}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className={`w-10 h-10 rounded-xl ${pillar.bg} flex items-center justify-center mb-4`}>
                        <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] mb-2">{pillar.label}</Badge>
                      <h3 className="text-base font-semibold text-foreground mb-1.5 font-display group-hover:text-primary transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex-1">
                        {pillar.desc}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="w-3 h-3" />
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-civic-gold" />
              <span className="font-semibold text-foreground text-sm">Built on public records</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              FEC filings · Senate lobbying disclosures · USAspending contracts · BLS wage data · BEA industry data · SEC reports · FRED indicators.
              Every signal links to its source.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-b from-background to-primary/[0.03]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Start exploring
            </h2>
            <p className="text-muted-foreground mb-8">
              Search any company, browse legislation, or discover your next career move.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/login")} size="lg" className="h-13 px-8 rounded-xl text-base font-semibold gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate("/pricing")} size="lg" variant="outline" className="h-13 px-8 rounded-xl text-base font-semibold">
                View Pricing
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
