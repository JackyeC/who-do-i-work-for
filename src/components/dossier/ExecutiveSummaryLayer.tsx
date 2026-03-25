import { Building2, Users, MapPin, Calendar, Globe, TrendingUp, Shield, Sparkles, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/CompanyLogo";

interface ExecutiveSummaryProps {
  company: {
    name: string;
    description?: string | null;
    industry: string;
    state: string;
    employee_count?: string | null;
    revenue?: string | null;
    website_url?: string | null;
    logo_url?: string | null;
    civic_footprint_score?: number;
  };
  influenceScore?: number;
  innovationScore?: number;
  stabilityScore?: number;
  attractionScore?: number;
  integrityGapScore?: number;
  laborImpactScore?: number;
  safetyAlertScore?: number;
  connectedDotsScore?: number;
}

function ScoreCard({ label, score, icon: Icon, color }: { label: string; score: number; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-border/30">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground font-mono">{score}</div>
          <div className="text-micro text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveSummaryLayer({ company, influenceScore = 0, innovationScore = 0, stabilityScore = 0, attractionScore = 0, integrityGapScore, laborImpactScore, safetyAlertScore, connectedDotsScore }: ExecutiveSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Company identity */}
      <div className="flex items-start gap-5">
        <CompanyLogo companyName={company.name} logoUrl={company.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="text-headline text-foreground">{company.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-caption text-muted-foreground">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{company.industry}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{company.state}</span>
            {company.employee_count && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{company.employee_count} employees</span>}
            {company.revenue && <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{company.revenue} revenue</span>}
          </div>
          {company.website_url && (
            <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-primary hover:underline mt-1.5">
              <Globe className="w-3 h-3" />{company.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-body text-foreground/85 leading-relaxed">{company.description}</p>
      )}

      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ScoreCard label="Integrity Gap" score={integrityGapScore ?? influenceScore} icon={Target} color="bg-amber-500/10 text-amber-600" />
        <ScoreCard label="Labor Impact" score={laborImpactScore ?? innovationScore} icon={Users} color="bg-red-500/10 text-red-600" />
        <ScoreCard label="Safety Alert" score={safetyAlertScore ?? stabilityScore} icon={Shield} color="bg-orange-500/10 text-orange-600" />
        <ScoreCard label="Connected Dots" score={connectedDotsScore ?? attractionScore} icon={Sparkles} color="bg-blue-500/10 text-blue-600" />
      </div>
    </div>
  );
}
