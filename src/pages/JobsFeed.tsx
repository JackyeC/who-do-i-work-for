import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, MapPin, Clock, Users, Shield, X, Zap, ChevronRight,
  Building2, AlertTriangle, Bookmark, BookmarkCheck, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MockJob {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: "Remote" | "Hybrid" | "Onsite";
  postedDate: string;
  applicants: number;
  integrityScore: number;
  alignmentPct: number;
  skills: string[];
  description: string;
  whyAligns: string;
  companySummary: string;
  narrativeGap?: string;
  isAligned: boolean;
}

const MOCK_JOBS: MockJob[] = [
  {
    id: "1", title: "Senior Product Manager", company: "Patagonia", location: "Ventura, CA", type: "Hybrid",
    postedDate: "2 days ago", applicants: 47, integrityScore: 92, alignmentPct: 94, isAligned: true,
    skills: ["Product Strategy", "Sustainability", "Agile", "Stakeholder Mgmt"],
    description: "Lead product strategy for our digital commerce platform, ensuring alignment with our environmental mission. You'll work cross-functionally with engineering, design, and sustainability teams to build products that serve both customers and the planet.",
    whyAligns: "Your values around environmental impact and purpose-driven work match Patagonia's B Corp mission. Their employee activism culture aligns with your preference for organizations where workers have a voice.",
    companySummary: "B Corp certified. Donates 1% of revenue to environmental causes. Strong employee-first culture with below-market salaries offset by purpose premium.",
    narrativeGap: undefined,
  },
  {
    id: "2", title: "ML Engineer — Responsible AI", company: "Salesforce", location: "San Francisco, CA", type: "Remote",
    postedDate: "5 days ago", applicants: 132, integrityScore: 78, alignmentPct: 81, isAligned: true,
    skills: ["Python", "TensorFlow", "Ethics in AI", "MLOps"],
    description: "Build and deploy ML models with a focus on fairness, accountability, and transparency. You'll be part of the Responsible AI team ensuring our products serve all users equitably.",
    whyAligns: "Your interest in ethical technology and inclusion aligns with Salesforce's 1-1-1 model and their sustained Chief Equality Officer role.",
    companySummary: "1-1-1 model (1% product, equity, time to community). Chief Equality Officer role sustained. Fast pace with high performance expectations.",
    narrativeGap: "Recent layoffs affected 10% of workforce despite record revenue — watch for tension between stated values and cost-cutting decisions.",
  },
  {
    id: "3", title: "Operations Coordinator", company: "Best Friends Animal Society", location: "Kanab, UT", type: "Onsite",
    postedDate: "1 day ago", applicants: 23, integrityScore: 95, alignmentPct: 88, isAligned: true,
    skills: ["Operations", "Nonprofit Mgmt", "Volunteer Coordination", "Logistics"],
    description: "Support daily shelter operations and coordinate volunteer programs for our no-kill mission. Work directly with animal care teams to optimize processes and improve outcomes.",
    whyAligns: "Your mission-first orientation and desire for tangible impact match their no-kill shelter mission with measurable outcomes.",
    companySummary: "501(c)(3) with no-kill mission and measurable outcomes. High mission-passion culture. Nonprofit compensation trade-off.",
    narrativeGap: undefined,
  },
  {
    id: "4", title: "Software Engineer II", company: "NVIDIA", location: "Santa Clara, CA", type: "Hybrid",
    postedDate: "3 days ago", applicants: 289, integrityScore: 68, alignmentPct: 72, isAligned: true,
    skills: ["CUDA", "C++", "GPU Computing", "Deep Learning"],
    description: "Design and optimize GPU-accelerated computing solutions for AI workloads. Push the boundaries of parallel computing architecture.",
    whyAligns: "Your growth orientation and passion for cutting-edge technology align with NVIDIA's innovation-first culture, though work-life balance may be a tradeoff.",
    companySummary: "Top AI research investment globally. Fast-paced, high-performance culture. Work-life balance consistently flagged in reviews.",
    narrativeGap: "Innovation score is strong but work-life balance reviews are consistently below industry average.",
  },
  {
    id: "5", title: "Supply Chain Analyst", company: "Costco", location: "Issaquah, WA", type: "Onsite",
    postedDate: "1 week ago", applicants: 56, integrityScore: 82, alignmentPct: 76, isAligned: false,
    skills: ["Supply Chain", "SQL", "Data Analysis", "Inventory Mgmt"],
    description: "Analyze and optimize supply chain operations for one of the largest retailers in the world. Drive efficiency improvements across distribution networks.",
    whyAligns: "Costco's compensation leadership and low executive-to-worker pay ratio reflect your values around fair compensation, though their mission isn't explicitly stated.",
    companySummary: "Highest retail wages in sector. Low executive pay ratio. Mission not explicitly stated but behavior is consistent.",
    narrativeGap: undefined,
  },
  {
    id: "6", title: "Curriculum Designer", company: "Khan Academy", location: "Mountain View, CA", type: "Remote",
    postedDate: "4 days ago", applicants: 78, integrityScore: 96, alignmentPct: 91, isAligned: true,
    skills: ["Instructional Design", "EdTech", "Content Strategy", "Accessibility"],
    description: "Design world-class educational content that reaches millions of learners globally. Create curriculum that's accessible, engaging, and effective.",
    whyAligns: "Your belief in education equity and remote-first work preferences directly match Khan Academy's mission of free education for anyone, anywhere.",
    companySummary: "501(c)(3). Free education mission lived consistently. Remote-first culture. Nonprofit compensation without equity upside.",
    narrativeGap: undefined,
  },
  {
    id: "7", title: "Store Manager", company: "HEB", location: "San Antonio, TX", type: "Onsite",
    postedDate: "6 days ago", applicants: 34, integrityScore: 88, alignmentPct: 69, isAligned: false,
    skills: ["Retail Mgmt", "Team Leadership", "P&L", "Customer Service"],
    description: "Lead a team of 200+ associates in delivering the HEB experience. Manage operations, hiring, and community engagement for a high-volume store.",
    whyAligns: "HEB's legendary community response and employee-first culture match your stability and culture values, but geographic limitation to Texas may be a constraint.",
    companySummary: "Legendary community disaster response. Employee-first culture documented over decades. Texas-only footprint.",
    narrativeGap: undefined,
  },
  {
    id: "8", title: "Program Officer — East Africa", company: "Mercy Corps", location: "Portland, OR / Nairobi", type: "Hybrid",
    postedDate: "3 days ago", applicants: 41, integrityScore: 85, alignmentPct: 83, isAligned: true,
    skills: ["Program Mgmt", "Int'l Development", "M&E", "Stakeholder Engagement"],
    description: "Oversee humanitarian programs in East Africa with a focus on food security and resilience building. Manage local teams and report on measurable impact.",
    whyAligns: "Your mission-driven orientation and desire for global impact align with Mercy Corps' measurable humanitarian impact, though field work can be high-stress.",
    companySummary: "501(c)(3). Measurable humanitarian impact published annually. Field work can be high-stress. Strong internal purpose culture.",
    narrativeGap: undefined,
  },
];

function IntegrityBadge({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 65 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border", color)}>
      <Shield className="w-3 h-3" /> {score}
    </span>
  );
}

export default function JobsFeed() {
  usePageSEO({ title: "Jobs Feed — Who Do I Work For?" });
  const { user } = useAuth();
  const [tab, setTab] = useState<"aligned" | "all">("aligned");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [passedJobs, setPassedJobs] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const passJob = (id: string) => {
    setPassedJobs(prev => new Set(prev).add(id));
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const filteredJobs = useMemo(() => {
    let jobs = MOCK_JOBS.filter(j => !passedJobs.has(j.id));
    if (tab === "aligned") jobs = jobs.filter(j => j.isAligned);
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return jobs;
  }, [tab, search, passedJobs]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jobs Feed — Who Do I Work For?</title>
      </Helmet>

      {/* Tagline bar */}
      <div className="border-b border-border/30 bg-muted/20 px-6 py-2">
        <p className="text-xs text-muted-foreground italic text-center">
          You deserve to know exactly who you work for.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Jobs Feed</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Roles aligned with your values. Not just your skills.</p>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="aligned">Aligned Roles</TabsTrigger>
              <TabsTrigger value="all">All Jobs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Job list */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No roles match your current filters.</p>
            </div>
          ) : (
            filteredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border",
                    selectedJob?.id === job.id ? "border-primary/40 bg-primary/[0.03]" : "border-border/50 hover:border-border"
                  )}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start gap-4">
                    {/* Company avatar */}
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground leading-tight">{job.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-semibold text-primary">{job.alignmentPct}% aligned</span>
                          <IntegrityBadge score={job.integrityScore} />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {job.postedDate}</span>
                        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {job.applicants} applicants</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{job.type}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.skills.slice(0, 4).map(s => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}>
                        {savedJobs.has(job.id) ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail side panel */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => { if (!open) setSelectedJob(null); }}>
        <SheetContent className="w-full sm:max-w-lg p-0">
          {selectedJob && (
            <ScrollArea className="h-full">
              <div className="p-6 space-y-5">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <SheetTitle className="text-lg font-bold leading-tight">{selectedJob.title}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-primary">{selectedJob.alignmentPct}% aligned</span>
                  <IntegrityBadge score={selectedJob.integrityScore} />
                  <Badge variant="outline" className="text-xs">{selectedJob.type}</Badge>
                </div>

                {/* Why This Aligns */}
                <div className="bg-primary/[0.05] border border-primary/10 rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">Why This Aligns</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedJob.whyAligns}</p>
                </div>

                {/* Company Integrity Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Integrity Summary</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{selectedJob.companySummary}</p>
                </div>

                {/* Narrative Gap Warning */}
                {selectedJob.narrativeGap && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Narrative Gap Detected</h4>
                      <p className="text-sm text-foreground/70 leading-relaxed">{selectedJob.narrativeGap}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => passJob(selectedJob.id)} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-1.5" /> Pass
                  </Button>
                  <Button className="flex-1 gap-1.5">
                    <Zap className="w-4 h-4" /> Apply When It Counts™
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
