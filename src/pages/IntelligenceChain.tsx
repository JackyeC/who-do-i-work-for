import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Landmark, DollarSign, Building2, Briefcase, GraduationCap,
  ChevronRight, ExternalLink, ShieldCheck, Info, MessageCircle,
  Filter, Globe, FileText
} from "lucide-react";
import { usePageSEO } from "@/hooks/use-page-seo";
import {
  CHAIN_LAYERS,
  alignmentMeta,
  confidenceColor,
  formatChainCurrency,
  getDemoChainSignals,
  type ChainLayer,
  type ChainSignal,
} from "@/lib/intelligenceChain";
import { ChainTrace, ChainLayerBadge } from "@/components/intelligence/ChainTrace";

const DEMO_COMPANY = "Koch Industries";

const LAYER_ICONS: Record<ChainLayer, typeof Landmark> = {
  policy: Landmark,
  influence: DollarSign,
  company: Building2,
  work: Briefcase,
  career: GraduationCap,
};

/* ── Signal Card ── */
function FullChainCard({ signal }: { signal: ChainSignal }) {
  const align = alignmentMeta(signal.alignmentStatus || "informational");
  const confCol = confidenceColor(signal.confidence);

  // Determine which layers this signal touches
  const layers = [...new Set(signal.chain.map(s => s.layer))];

  return (
    <div className="border border-border bg-card p-5">
      {/* Layer badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {layers.map(l => <ChainLayerBadge key={l} layer={l} />)}
        <span className={`ml-auto shrink-0 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider border ${align.color} ${align.bg} ${align.border}`}>
          {align.label}
        </span>
      </div>

      {/* Chain trace */}
      <ChainTrace steps={signal.chain} />

      {/* Summary */}
      <p className="text-sm text-foreground leading-relaxed mt-2 mb-2">{signal.summary}</p>
      {signal.amount && (
        <span className="inline-block font-mono text-sm font-semibold text-foreground">{formatChainCurrency(signal.amount)}</span>
      )}

      {/* Why it matters */}
      {signal.whyItMatters && (
        <div className="mt-3 p-3 bg-muted/30 border border-border">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground leading-relaxed">{signal.whyItMatters}</p>
          </div>
        </div>
      )}

      {/* Source + confidence */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        {signal.sourceUrl ? (
          <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[0.6rem] font-mono text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> {signal.source}
          </a>
        ) : (
          <span className="text-[0.6rem] font-mono text-muted-foreground">{signal.source}</span>
        )}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className={`w-3 h-3 ${confCol}`} strokeWidth={1.5} />
          <span className={`text-[0.55rem] font-mono uppercase tracking-widest ${confCol}`}>{signal.confidence}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
import { useAuth } from "@/contexts/AuthContext";
import { SignupGate } from "@/components/SignupGate";

export default function IntelligenceChain() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<ChainLayer | "all">("all");

  const allSignals = getDemoChainSignals(DEMO_COMPANY);

  const filteredSignals = layerFilter === "all"
    ? allSignals
    : allSignals.filter(s => s.chain.some(step => step.layer === layerFilter));

  usePageSEO({
    title: "Intelligence Chain — Policy to Career Signal Tracing",
    description: "Trace employer intelligence signals through the full chain: Policy → Influence → Company → Work → Career. Evidence-backed, source-linked.",
    path: "/intelligence-chain",
  });

  const handleSearch = () => {
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto w-full px-4 sm:px-6 py-10 lg:py-16">

        {/* Header */}
        <div className="mb-8">
          <div className="font-mono text-[0.7rem] uppercase text-primary tracking-[0.2em] mb-3">Data Architecture</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-[1.15] tracking-tight mb-3">
            Intelligence Chain
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[640px]">
            Every signal on this platform traces through a logical chain from policy activity to your career. Explore the full path.
          </p>
        </div>

        {/* Chain Model Visual */}
        <div className="bg-card border border-border p-5 mb-8">
          <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-4">Signal Architecture</div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {CHAIN_LAYERS.map((layer, i) => {
              const Icon = LAYER_ICONS[layer.id];
              return (
                <div key={layer.id} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
                  <div className="flex flex-col items-center gap-1 px-4 py-3 border border-border bg-muted/20 min-w-[100px]">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-foreground font-semibold">{layer.label}</span>
                    <span className="text-[0.55rem] text-muted-foreground text-center leading-snug max-w-[120px]">{layer.description.split(".")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="flex max-w-[520px] border border-border bg-card mb-6">
          <div className="flex items-center px-4 text-muted-foreground"><Search className="w-4 h-4" /></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter a company name..." className="flex-1 bg-transparent border-none outline-none py-3 text-foreground font-sans text-[15px] placeholder:text-muted-foreground" />
          <button onClick={handleSearch} className="bg-primary text-primary-foreground px-5 font-mono text-[0.7rem] tracking-wider uppercase font-semibold hover:brightness-110 transition-all">Search</button>
        </div>

        {/* Demo label */}
        <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-primary mb-6">
          Showing: {DEMO_COMPANY}
        </div>

        {/* Layer Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">Filter by Layer</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLayerFilter("all")}
              className={`px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-colors ${layerFilter === "all" ? "bg-primary/10 border-primary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              All Layers
            </button>
            {CHAIN_LAYERS.map(l => {
              const Icon = LAYER_ICONS[l.id];
              return (
                <button
                  key={l.id}
                  onClick={() => setLayerFilter(l.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-mono uppercase tracking-wider border transition-colors ${layerFilter === l.id ? "bg-primary/10 border-primary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-muted/30 border border-border mb-8">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This platform surfaces publicly available signals to help users understand potential relationships between companies, policy activity, and careers. Every signal includes a source link and confidence label. If no verified signal exists, it will not be shown.
          </p>
        </div>

        {/* Signals — gated for unauthenticated users */}
        {!user && (
          <SignupGate feature="full intelligence chain signals">
            <div className="space-y-4">
              <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                {filteredSignals.length} traced signal{filteredSignals.length !== 1 ? "s" : ""}
              </div>
              {filteredSignals.slice(0, 2).map(s => <FullChainCard key={s.id} signal={s} />)}
            </div>
          </SignupGate>
        )}

        {user && (
          <div className="space-y-4">
            <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
              {filteredSignals.length} traced signal{filteredSignals.length !== 1 ? "s" : ""}
            </div>
            {filteredSignals.map(s => <FullChainCard key={s.id} signal={s} />)}
            {filteredSignals.length === 0 && (
              <div className="border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No verified public signals found for this layer filter.</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 border-t border-border pt-10">
          <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground mb-4 text-center">Core Modules</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "What Am I Supporting?", path: "/what-am-i-supporting", icon: Globe },
              { label: "Company Intelligence", path: "/browse", icon: Search },
              { label: "Offer Intelligence", path: "/check", icon: FileText },
              { label: "Check the Receipts", path: "/ask-jackye", icon: MessageCircle },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center gap-2 p-4 border border-border bg-card text-left hover:border-primary transition-colors group">
                <item.icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-foreground font-semibold group-hover:text-primary transition-colors">{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-primary font-semibold mb-1">Run the chain first. Always.</div>
          <div className="text-[0.55rem] font-mono uppercase tracking-widest text-muted-foreground">Who Do I Work For — Employer Intelligence by Jackye Clayton</div>
        </div>
      </div>
    </div>
  );
}
