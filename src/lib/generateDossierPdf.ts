import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface DossierPdfData {
  company: {
    name: string;
    industry: string;
    state: string;
    description?: string | null;
    employee_count?: string | null;
    revenue?: string | null;
    website_url?: string | null;
    civic_footprint_score?: number;
  };
  executives: Array<{ name: string; title: string; total_donations: number }>;
  contracts: Array<{ agency_name: string; contract_value: number | null; contract_description: string | null; confidence: string }>;
  valuesSignals: Array<{ issue_category?: string; signal_category?: string; signal_summary?: string; evidence_text?: string; source_url?: string }>;
  warnNotices: Array<{ notice_date: string; employees_affected: number; location_state?: string | null; layoff_type?: string }>;
  sentiment: Array<{ overall_rating?: number | null; top_complaints?: any; top_praises?: any; ai_summary?: string | null }>;
  payEquity: Array<{ signal_type: string; evidence_text?: string | null; source_url?: string | null; confidence: string }>;
}

const BRAND = {
  primary: [20, 30, 70] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(doc: jsPDF, companyName: string) {
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, 210, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("WHO DO I WORK FOR?", 20, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("INTELLIGENCE DOSSIER", 20, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text(companyName, 20, 36);
}

function addSectionTitle(doc: jsPDF, y: number, title: string, layerNum: number): number {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(15, y, 180, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.accent);
  doc.text(`LAYER ${layerNum}`, 20, y + 7);
  doc.setTextColor(...BRAND.dark);
  doc.setFontSize(11);
  doc.text(title, 48, y + 7);
  return y + 16;
}

function addFooter(doc: jsPDF, pageNum: number) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Page ${i} of ${totalPages}`,
      105, 290, { align: "center" }
    );
    doc.text("civic-align.lovable.app · Confidential", 105, 294, { align: "center" });
  }
}

export function generateDossierPdf(data: DossierPdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { company, executives, contracts, valuesSignals, warnNotices, sentiment, payEquity } = data;

  // Page 1: Cover + Overview
  addHeader(doc, company.name);

  let y = 55;

  // Company overview
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.dark);
  const meta = [`Industry: ${company.industry}`, `HQ: ${company.state}`];
  if (company.employee_count) meta.push(`Employees: ${company.employee_count}`);
  if (company.revenue) meta.push(`Revenue: ${company.revenue}`);
  doc.text(meta.join("  ·  "), 20, y);
  y += 8;

  if (company.description) {
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const lines = doc.splitTextToSize(company.description, 170);
    doc.text(lines, 20, y);
    y += lines.length * 4.5 + 6;
  }

  // Score summary
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(15, y, 180, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text(`Influence Score: ${company.civic_footprint_score || 0}/100`, 25, y + 9);
  y += 22;

  // Layer 4: Influence & Policy
  y = addSectionTitle(doc, y, "Influence & Policy Signals", 4);

  if (executives.filter(e => e.total_donations > 0).length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Executive", "Title", "Political Donations"]],
      body: executives
        .filter(e => e.total_donations > 0)
        .map(e => [e.name, e.title, `$${e.total_donations.toLocaleString()}`]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.light },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (contracts.length > 0) {
    doc.autoTable({
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Agency", "Value", "Description"]],
      body: contracts.slice(0, 15).map(c => [
        c.agency_name,
        c.contract_value ? `$${c.contract_value.toLocaleString()}` : "N/A",
        (c.contract_description || "Federal contract").substring(0, 80),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.light },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Layer 6: Talent Context (WARN notices)
  if (warnNotices.length > 0) {
    y = addSectionTitle(doc, y, "Workforce Stability — WARN Notices", 6);
    doc.autoTable({
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Date", "Employees Affected", "State", "Type"]],
      body: warnNotices.slice(0, 10).map(w => [
        new Date(w.notice_date).toLocaleDateString(),
        w.employees_affected.toString(),
        w.location_state || "—",
        w.layoff_type || "Layoff",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.light },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Layer 6b: Worker Sentiment
  if (sentiment.length > 0 && sentiment[0].ai_summary) {
    y = addSectionTitle(doc, y, "Worker Sentiment", 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    const sentLines = doc.splitTextToSize(sentiment[0].ai_summary, 170);
    doc.text(sentLines, 20, y);
    y += sentLines.length * 4.5 + 8;
  }

  // Layer 7: Values Signals
  if (valuesSignals.length > 0) {
    y = addSectionTitle(doc, y, "Values & Equity Signals", 7);
    doc.autoTable({
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Category", "Signal"]],
      body: valuesSignals.slice(0, 15).map(s => [
        s.issue_category || s.signal_category || "General",
        (s.signal_summary || s.evidence_text || "").substring(0, 120),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.light },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 135 } },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Pay equity
  if (payEquity.length > 0) {
    y = addSectionTitle(doc, y, "Pay Equity & Demographics", 7);
    doc.autoTable({
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Signal", "Evidence"]],
      body: payEquity.slice(0, 10).map(p => [
        p.signal_type.substring(0, 60),
        (p.evidence_text || "").substring(0, 120),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.light },
    });
  }

  // Disclaimer page
  doc.addPage();
  addHeader(doc, company.name);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  const disclaimer = [
    "METHODOLOGY & DISCLAIMER",
    "",
    "This intelligence dossier was compiled from publicly available data sources including:",
    "• Federal Election Commission (FEC) campaign contribution records",
    "• USASpending.gov federal contract awards",
    "• SEC EDGAR corporate filings (10-K, DEF 14A, proxy statements)",
    "• Department of Labor WARN Act notices",
    "• Public sustainability and ESG reports",
    "• Published job descriptions and career pages",
    "",
    "This platform surfaces signals from public records, documented disclosures, and clearly",
    "labeled enrichment sources. It does not assign moral or legal judgments.",
    "Interpretation is left to the reader.",
    "",
    `Report generated: ${new Date().toISOString()}`,
    "civic-align.lovable.app",
  ];
  doc.text(disclaimer, 20, 60);

  addFooter(doc, 1);

  return doc;
}
