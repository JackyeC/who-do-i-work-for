import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidatePersonaBuilder } from "@/components/recruiting/CandidatePersonaBuilder";
import { EVPIntelligence } from "@/components/recruiting/EVPIntelligence";
import { RecruitingInsightsDashboard } from "@/components/recruiting/RecruitingInsightsDashboard";
import { Users, Megaphone, BarChart3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecruitingIntelligence() {
  const [tab, setTab] = useState("insights");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display">
                Recruiting Intelligence
              </h1>
              <p className="text-muted-foreground text-sm">
                Talent strategy tools powered by corporate transparency signals
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="text-xs">For Recruiters</Badge>
            <Badge variant="outline" className="text-xs">EVP Strategy</Badge>
            <Badge variant="outline" className="text-xs">Talent Market Signals</Badge>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="insights" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Market Insights
            </TabsTrigger>
            <TabsTrigger value="evp" className="gap-1.5">
              <Megaphone className="w-4 h-4" />
              EVP Intelligence
            </TabsTrigger>
            <TabsTrigger value="personas" className="gap-1.5">
              <Users className="w-4 h-4" />
              Candidate Personas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <RecruitingInsightsDashboard />
          </TabsContent>
          <TabsContent value="evp">
            <EVPIntelligence />
          </TabsContent>
          <TabsContent value="personas">
            <CandidatePersonaBuilder />
          </TabsContent>
        </Tabs>

        {/* Platform framing */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-4">
            This Platform Serves
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Candidates", desc: "Evaluating job offers and employer values alignment", icon: Users },
              { title: "Recruiters", desc: "Building aligned teams with evidence-based EVP strategy", icon: Target },
              { title: "Researchers", desc: "Exploring corporate signals and influence networks", icon: BarChart3 },
            ].map((a) => (
              <div key={a.title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                <a.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 text-center italic">
            All data is sourced from public records. No conclusions are drawn. Interpretation is left to the user.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
