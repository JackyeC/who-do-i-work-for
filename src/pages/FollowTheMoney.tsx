import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Building2, X, ChevronRight, ExternalLink, Filter,
  DollarSign, RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

interface GraphNode {
  id: string;
  label: string;
  group: string; // "Corporation" | "PAC" | "Politician" | "Legislation" | "Industry" | "Agency" | "Committee"
  val: number;
  amount?: number;
  metadata?: Record<string, any>;
  cluster?: number;
  issueCategories?: string[];
  // force-graph internal
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  amount?: number;
  linkType: string;
  issueCategory?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ─── Constants ───

const GROUP_COLORS: Record<string, string> = {
  Corporation: "hsl(45, 80%, 55%)",     // gold
  PAC: "hsl(250, 60%, 55%)",            // indigo
  Politician: "hsl(210, 70%, 55%)",     // blue
  Legislation: "hsl(140, 55%, 45%)",    // green
  Industry: "hsl(0, 60%, 55%)",         // red
  Agency: "hsl(270, 40%, 50%)",         // purple
  Committee: "hsl(190, 50%, 50%)",      // teal
};

const GROUP_ICONS: Record<string, string> = {
  Corporation: "🏢",
  PAC: "💰",
  Politician: "🏛️",
  Legislation: "📜",
  Industry: "🏭",
  Agency: "⚖️",
  Committee: "👥",
};

const ISSUE_CATEGORIES = [
  "All",
  "Labor Rights",
  "Immigration",
  "Climate",
  "Gun Policy",
  "Civil Rights",
  "Healthcare",
  "Consumer Protection",
  "Defense",
  "Technology",
  "Education",
  "Financial Services",
  "Energy",
  "Housing",
];

// Line style by connection type
const LINK_STYLES: Record<string, { dash: number[]; color: string; label: string }> = {
  donation_to_member:           { dash: [],       color: "rgba(76, 175, 80, 0.6)",  label: "Donation" },
  trade_association_lobbying:   { dash: [6, 3],   color: "rgba(66, 133, 244, 0.6)", label: "Trade Lobbying" },
  lobbying_on_bill:             { dash: [6, 3],   color: "rgba(66, 133, 244, 0.6)", label: "Lobbied On" },
  dark_money_channel:           { dash: [2, 4],   color: "rgba(244, 67, 54, 0.5)",  label: "Dark Money" },
  member_on_committee:          { dash: [10, 5],  color: "rgba(158, 158, 158, 0.5)", label: "Committee Member" },
  committee_oversight_of_contract: { dash: [],    color: "rgba(255, 152, 0, 0.5)",  label: "Oversight" },
  revolving_door:               { dash: [3, 3],   color: "rgba(156, 39, 176, 0.5)", label: "Revolving Door" },
  foundation_grant_to_district: { dash: [],       color: "rgba(0, 188, 212, 0.5)",  label: "Grant" },
  advisory_committee_appointment: { dash: [4, 4], color: "rgba(121, 85, 72, 0.5)",  label: "Advisory Role" },
  interlocking_directorate:     { dash: [2, 2],   color: "rgba(96, 125, 139, 0.5)", label: "Board Interlock" },
  state_lobbying_contract:      { dash: [],       color: "rgba(255, 193, 7, 0.5)",  label: "State Contract" },
  international_influence:      { dash: [8, 4],   color: "rgba(233, 30, 99, 0.5)",  label: "International" },
};

function mapEntityType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("pac") || lower.includes("political_action")) return "PAC";
  if (lower.includes("politician") || lower.includes("member") || lower.includes("candidate") || lower.includes("congress")) return "Politician";
  if (lower.includes("bill") || lower.includes("legislation") || lower.includes("law")) return "Legislation";
  if (lower.includes("industry") || lower.includes("sector")) return "Industry";
  if (lower.includes("agency") || lower.includes("department") || lower.includes("government")) return "Agency";
  if (lower.includes("committee")) return "Committee";
  return "Corporation";
}

function formatAmount(amount: number | null | undefined): string {
  if (!amount) return "";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function mapLinkLabel(linkType: string): string {
  return LINK_STYLES[linkType]?.label || linkType.replace(/_/g, " ");
}

// Simple community detection: assign cluster by group + connectivity
function assignClusters(nodes: GraphNode[], links: GraphLink[]): GraphNode[] {
  // Build adjacency
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const l of links) {
    const src = typeof l.source === "string" ? l.source : (l.source as any).id;
    const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
    adj.get(src)?.add(tgt);
    adj.get(tgt)?.add(src);
  }

  // BFS connected components
  const visited = new Set<string>();
  let clusterId = 0;
  const clusterMap = new Map<string, number>();

  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const queue = [node.id];
    visited.add(node.id);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      clusterMap.set(curr, clusterId);
      for (const neighbor of adj.get(curr) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    clusterId++;
  }

  return nodes.map(n => ({ ...n, cluster: clusterMap.get(n.id) ?? 0 }));
}

// ─── Sample data ───

const SAMPLE_NODES: GraphNode[] = [
  { id: "amazon", label: "Amazon", group: "Corporation", val: 20 },
  { id: "amazon-pac", label: "Amazon PAC", group: "PAC", val: 15, amount: 1_200_000 },
  { id: "sen-cantwell", label: "Sen. Cantwell", group: "Politician", val: 10, issueCategories: ["Technology", "Consumer Protection"] },
  { id: "sen-wyden", label: "Sen. Wyden", group: "Politician", val: 10, issueCategories: ["Technology", "Civil Rights"] },
  { id: "rep-delbene", label: "Rep. DelBene", group: "Politician", val: 8, issueCategories: ["Technology"] },
  { id: "commerce-committee", label: "Commerce Committee", group: "Committee", val: 12, issueCategories: ["Technology", "Consumer Protection"] },
  { id: "finance-committee", label: "Finance Committee", group: "Committee", val: 12, issueCategories: ["Financial Services"] },
  { id: "ai-regulation-bill", label: "AI Regulation Act", group: "Legislation", val: 10, issueCategories: ["Technology", "Labor Rights"] },
  { id: "data-privacy-bill", label: "Data Privacy Act", group: "Legislation", val: 10, issueCategories: ["Consumer Protection", "Technology"] },
  { id: "tech-industry", label: "Technology", group: "Industry", val: 14, issueCategories: ["Technology"] },
  { id: "ecommerce-industry", label: "E-Commerce", group: "Industry", val: 12, issueCategories: ["Consumer Protection"] },
  { id: "dod", label: "Dept. of Defense", group: "Agency", val: 16, amount: 10_000_000, issueCategories: ["Defense"] },
];

const SAMPLE_LINKS: GraphLink[] = [
  { source: "amazon", target: "amazon-pac", label: "Funds", linkType: "donation_to_member", amount: 1_200_000 },
  { source: "amazon-pac", target: "sen-cantwell", label: "Donated to", linkType: "donation_to_member", amount: 45_000 },
  { source: "amazon-pac", target: "sen-wyden", label: "Donated to", linkType: "donation_to_member", amount: 38_000 },
  { source: "amazon-pac", target: "rep-delbene", label: "Donated to", linkType: "donation_to_member", amount: 25_000 },
  { source: "sen-cantwell", target: "commerce-committee", label: "Serves on", linkType: "member_on_committee" },
  { source: "sen-wyden", target: "finance-committee", label: "Serves on", linkType: "member_on_committee" },
  { source: "commerce-committee", target: "ai-regulation-bill", label: "Oversight", linkType: "lobbying_on_bill" },
  { source: "finance-committee", target: "data-privacy-bill", label: "Oversight", linkType: "lobbying_on_bill" },
  { source: "ai-regulation-bill", target: "tech-industry", label: "Affects", linkType: "committee_oversight_of_contract" },
  { source: "data-privacy-bill", target: "ecommerce-industry", label: "Affects", linkType: "committee_oversight_of_contract" },
  { source: "amazon", target: "dod", label: "Contract", linkType: "committee_oversight_of_contract", amount: 10_000_000 },
];

// ─── Main Component ───

export default function FollowTheMoney() {
  const navigate = useNavigate();
  const graphRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [allNodes, setAllNodes] = useState<GraphNode[]>(SAMPLE_NODES);
  const [allLinks, setAllLinks] = useState<GraphLink[]>(SAMPLE_LINKS);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(width, 300), height: Math.max(height, 300) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Filter graph by issue category
  const graphData: GraphData = useMemo(() => {
    if (activeFilter === "All") {
      const clustered = assignClusters(allNodes, allLinks);
      return { nodes: clustered, links: allLinks };
    }

    // Filter: keep nodes that have this issue category, plus connected nodes
    const relevantNodeIds = new Set<string>();
    // Nodes with matching issue
    for (const n of allNodes) {
      if (n.issueCategories?.includes(activeFilter)) relevantNodeIds.add(n.id);
    }
    // Links where either end is relevant
    const filteredLinks = allLinks.filter(l => {
      const src = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
      return relevantNodeIds.has(src) || relevantNodeIds.has(tgt) || l.issueCategory === activeFilter;
    });
    // Add all nodes from filtered links
    for (const l of filteredLinks) {
      const src = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
      relevantNodeIds.add(src);
      relevantNodeIds.add(tgt);
    }
    // Always include the root company
    if (selectedCompanyId) relevantNodeIds.add(selectedCompanyId);

    const filteredNodes = allNodes.filter(n => relevantNodeIds.has(n.id));
    const clustered = assignClusters(filteredNodes, filteredLinks);
    return { nodes: clustered, links: filteredLinks };
  }, [allNodes, allLinks, activeFilter, selectedCompanyId]);

  // Search companies
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, slug")
        .ilike("name", `%${query}%`)
        .limit(8);
      setSearchResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Load entity linkages
  const loadCompanyGraph = useCallback(async (companyId: string, companyName: string) => {
    setLoading(true);
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(companyName);
    setQuery("");
    setSearchResults([]);
    setSelectedNode(null);
    setActiveFilter("All");

    try {
      const { data: linkages } = await supabase
        .from("entity_linkages")
        .select("*")
        .eq("company_id", companyId)
        .order("amount", { ascending: false })
        .limit(100);

      if (!linkages || linkages.length === 0) {
        setAllNodes([{ id: companyId, label: companyName, group: "Corporation", val: 20 }]);
        setAllLinks([]);
        setLoading(false);
        return;
      }

      const nodeMap = new Map<string, GraphNode>();
      const links: GraphLink[] = [];

      nodeMap.set(companyId, {
        id: companyId, label: companyName, group: "Corporation", val: 20,
      });

      for (const link of linkages) {
        const srcId = link.source_entity_id || `src-${link.source_entity_name}`;
        if (!nodeMap.has(srcId) && link.source_entity_name !== companyName) {
          nodeMap.set(srcId, {
            id: srcId,
            label: link.source_entity_name,
            group: mapEntityType(link.source_entity_type),
            val: Math.max(6, Math.min(20, Math.log10((link.amount || 1000) + 1) * 3)),
            amount: link.amount || undefined,
          });
        }

        const tgtId = link.target_entity_id || `tgt-${link.target_entity_name}`;
        if (!nodeMap.has(tgtId)) {
          nodeMap.set(tgtId, {
            id: tgtId,
            label: link.target_entity_name,
            group: mapEntityType(link.target_entity_type),
            val: Math.max(6, Math.min(20, Math.log10((link.amount || 1000) + 1) * 3)),
            amount: link.amount || undefined,
          });
        }

        const sourceId = link.source_entity_name === companyName ? companyId : srcId;
        links.push({
          source: sourceId,
          target: tgtId,
          label: mapLinkLabel(link.link_type),
          amount: link.amount || undefined,
          linkType: link.link_type,
          issueCategory: link.description?.match(/issue:\s*(.+)/i)?.[1] || undefined,
        });
      }

      const nodesArr = Array.from(nodeMap.values());
      setAllNodes(assignClusters(nodesArr, links));
      setAllLinks(links);
    } catch (err) {
      console.error("Failed to load graph:", err);
    }

    setLoading(false);
  }, []);

  const resetGraph = () => {
    setSelectedCompanyId(null);
    setSelectedCompanyName("");
    setAllNodes(SAMPLE_NODES);
    setAllLinks(SAMPLE_LINKS);
    setSelectedNode(null);
    setActiveFilter("All");
  };

  // Get full influence path from hovered node (BFS traversal)
  const highlightedIds = useMemo(() => {
    if (!hoveredNode) return null;
    const ids = new Set<string>();
    const linkIds = new Set<number>();
    ids.add(hoveredNode);
    // BFS to trace full path of influence
    const queue = [hoveredNode];
    const visited = new Set<string>([hoveredNode]);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      graphData.links.forEach((l, i) => {
        const src = typeof l.source === "string" ? l.source : (l.source as any).id;
        const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
        if (src === curr && !visited.has(tgt)) {
          visited.add(tgt);
          ids.add(tgt);
          linkIds.add(i);
          queue.push(tgt);
        }
        if (tgt === curr && !visited.has(src)) {
          visited.add(src);
          ids.add(src);
          linkIds.add(i);
          queue.push(src);
        }
      });
    }
    return { nodes: ids, links: linkIds };
  }, [hoveredNode, graphData]);

  // Connected edges for selected node
  const selectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return graphData.links.filter(l => {
      const src = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
      return src === selectedNode.id || tgt === selectedNode.id;
    });
  }, [selectedNode, graphData]);

  // ─── Node paint callback ───
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const r = Math.max(4, (node.val || 8) / globalScale * 1.5);
    const color = GROUP_COLORS[node.group] || "hsl(0, 0%, 50%)";
    const isHighlighted = !highlightedIds || highlightedIds.nodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const alpha = isHighlighted ? 1 : 0.15;

    ctx.globalAlpha = alpha;

    // Glow for selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
      ctx.fillStyle = color.replace(")", ", 0.2)").replace("hsl(", "hsla(");
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Border
    if (isSelected) {
      ctx.strokeStyle = "hsl(0, 0%, 95%)";
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Icon
    const fontSize = Math.max(8, 12 / globalScale);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(GROUP_ICONS[node.group] || "●", node.x, node.y);

    // Label below
    if (globalScale > 0.6) {
      const labelSize = Math.max(7, 10 / globalScale);
      ctx.font = `600 ${labelSize}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isHighlighted ? "hsl(0, 0%, 90%)" : "hsl(0, 0%, 40%)";
      const label = node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label;
      ctx.fillText(label, node.x, node.y + r + 3);

      // Amount label
      if (node.amount && globalScale > 0.8) {
        const amtSize = Math.max(6, 8 / globalScale);
        ctx.font = `${amtSize}px system-ui, sans-serif`;
        ctx.fillStyle = isHighlighted ? "hsl(0, 0%, 70%)" : "hsl(0, 0%, 30%)";
        ctx.fillText(formatAmount(node.amount), node.x, node.y + r + 3 + labelSize + 2);
      }
    }

    ctx.globalAlpha = 1;
  }, [highlightedIds, selectedNode]);

  // ─── Link paint callback ───
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const src = link.source;
    const tgt = link.target;
    if (!src.x || !tgt.x) return;

    const style = LINK_STYLES[link.linkType] || { dash: [], color: "rgba(150, 150, 150, 0.4)", label: "" };
    const linkIdx = graphData.links.indexOf(link);
    const isHighlighted = !highlightedIds || highlightedIds.links.has(linkIdx);
    const alpha = isHighlighted ? 1 : 0.08;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.setLineDash(style.dash);

    // Thicker line = more money
    const baseWidth = link.amount ? Math.min(Math.max(Math.log10(link.amount) - 2, 0.5), 4) : 1;
    ctx.lineWidth = baseWidth / globalScale;
    ctx.strokeStyle = style.color;
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Amount label on link
    if (link.amount && globalScale > 1 && isHighlighted) {
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      const fontSize = Math.max(6, 8 / globalScale);
      ctx.font = `${fontSize}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "hsl(0, 0%, 70%)";
      ctx.fillText(formatAmount(link.amount), midX, midY - 6 / globalScale);
    }

    ctx.globalAlpha = 1;
  }, [highlightedIds, graphData.links]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <section className="border-b border-border/30 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Follow the Money</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight mb-1">
                Influence Network Map
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg">
                Trace how money flows from companies through PACs to politicians, committees, legislation, and industries. Hover to trace influence paths.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a company to map…"
                className="pl-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                  {searchResults.map(c => (
                    <button
                      key={c.id}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/50 transition-colors flex items-center gap-2"
                      onClick={() => loadCompanyGraph(c.id, c.name)}
                    >
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Topic filter bar */}
      <div className="border-b border-border/30 bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Topic:</span>
            {ISSUE_CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={activeFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(cat)}
                className="rounded-full text-xs shrink-0 h-7"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Graph Canvas */}
        <div ref={containerRef} className="flex-1 relative bg-muted/20 border-b lg:border-b-0 lg:border-r border-border/30 overflow-hidden" style={{ minHeight: 400 }}>
          {/* Active company badge */}
          {selectedCompanyName && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-card/90 backdrop-blur-sm text-foreground border border-border/40 gap-1.5 px-3 py-1.5">
                <Building2 className="w-3 h-3" />
                {selectedCompanyName}
                <button onClick={resetGraph} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Reset button */}
          <div className="absolute top-3 right-3 z-10">
            <Button variant="outline" size="icon" className="w-8 h-8 bg-card/90 backdrop-blur-sm" onClick={resetGraph}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
            {Object.entries(GROUP_COLORS).map(([group, color]) => (
              <div key={group} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border/30">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {group}
              </div>
            ))}
          </div>

          {/* Link type legend */}
          <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
            {[
              { label: "Donation", style: "border-t-2 border-solid border-[rgba(76,175,80,0.8)]" },
              { label: "Lobbying", style: "border-t-2 border-dashed border-[rgba(66,133,244,0.8)]" },
              { label: "Dark Money", style: "border-t-2 border-dotted border-[rgba(244,67,54,0.8)]" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-[10px] text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border/30">
                <div className={`w-5 ${l.style}`} />
                {l.label}
              </div>
            ))}
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
              <div className="text-sm text-muted-foreground animate-pulse">Loading influence map…</div>
            </div>
          )}

          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              const r = Math.max(6, (node.val || 8));
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fill();
            }}
            linkCanvasObject={paintLink}
            linkDirectionalParticles={(link: any) => link.amount ? 2 : 0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={(link: any) =>
              LINK_STYLES[link.linkType]?.color || "rgba(150,150,150,0.5)"
            }
            onNodeHover={(node: any) => setHoveredNode(node?.id || null)}
            onNodeClick={(node: any) => {
              const n = graphData.nodes.find(gn => gn.id === node.id);
              setSelectedNode(prev => prev?.id === node.id ? null : (n || null));
            }}
            onNodeDragEnd={(node: any) => {
              node.fx = node.x;
              node.fy = node.y;
            }}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={200}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        </div>

        {/* Detail Panel */}
        <div className="w-full lg:w-80 bg-card border-l border-border/30 overflow-y-auto">
          {selectedNode ? (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: (GROUP_COLORS[selectedNode.group] || "#888") + "22" }}
                  >
                    {GROUP_ICONS[selectedNode.group] || "●"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground font-display">{selectedNode.label}</h3>
                    <Badge variant="outline" className="text-[10px]">{selectedNode.group}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSelectedNode(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedNode.amount && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Amount</p>
                  <p className="text-lg font-bold font-display text-foreground">{formatAmount(selectedNode.amount)}</p>
                </div>
              )}

              {selectedNode.issueCategories && selectedNode.issueCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Issue Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.issueCategories.map(c => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="text-[10px] cursor-pointer"
                        onClick={() => setActiveFilter(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Connections ({selectedEdges.length})
              </h4>

              <div className="space-y-2">
                {selectedEdges.map((edge, i) => {
                  const src = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
                  const tgt = typeof edge.target === "string" ? edge.target : (edge.target as any).id;
                  const isSource = src === selectedNode.id;
                  const otherNodeId = isSource ? tgt : src;
                  const otherNode = graphData.nodes.find(n => n.id === otherNodeId);
                  if (!otherNode) return null;

                  const style = LINK_STYLES[edge.linkType];

                  return (
                    <button
                      key={i}
                      className="w-full text-left p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                      onClick={() => {
                        setSelectedNode(otherNode);
                        setHoveredNode(null);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: GROUP_COLORS[otherNode.group] }} />
                        <span className="text-sm font-medium text-foreground">{otherNode.label}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{edge.label}</span>
                        {style && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: style.color.replace("0.6", "0.15").replace("0.5", "0.15"), color: style.color.replace("0.6", "1").replace("0.5", "1") }}
                          >
                            {style.label}
                          </span>
                        )}
                        {edge.amount && (
                          <Badge variant="secondary" className="text-[10px]">{formatAmount(edge.amount)}</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedNode.group === "Corporation" && selectedCompanyId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 gap-1.5"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(selectedNode.label)}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Company Profile
                </Button>
              )}
            </div>
          ) : (
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground font-display mb-2">How to use</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Search for a company above to map its influence network. <strong>Hover</strong> any node to trace the full path of influence. <strong>Click</strong> to see details. <strong>Drag</strong> nodes to rearrange.
              </p>

              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Node types</h4>
                {Object.entries(GROUP_ICONS).map(([group, icon]) => (
                  <div key={group} className="flex items-start gap-2.5">
                    <span className="text-base">{icon}</span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{group}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connection types</h4>
                {[
                  { label: "Donation", desc: "FEC Schedule A — solid green, thicker = more $$$", color: "text-[rgba(76,175,80,1)]" },
                  { label: "Lobbying", desc: "LDA filings — dashed blue line", color: "text-[rgba(66,133,244,1)]" },
                  { label: "Board Interlock", desc: "SEC Form 4/10-K — dotted grey line", color: "text-muted-foreground" },
                  { label: "Dark Money", desc: "501(c)(4) channels — dotted red line", color: "text-destructive" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className={`w-1 h-1 rounded-full mt-1.5 ${item.color} bg-current shrink-0`} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-primary/[0.06] border border-primary/10">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Demo mode:</strong> Showing a sample Amazon influence network.
                  Search a tracked company to see real data from FEC, lobbying, and contract records.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
