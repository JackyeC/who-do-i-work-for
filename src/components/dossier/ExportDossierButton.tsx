import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateDossierPdf } from "@/lib/generateDossierPdf";
import { toast } from "sonner";

interface ExportDossierButtonProps {
  companyId: string;
  companyName: string;
  company: any;
}

export function ExportDossierButton({ companyId, companyName, company }: ExportDossierButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all dossier data in parallel
      const [execRes, contractRes, valuesRes, warnRes, sentimentRes, payEquityRes] = await Promise.all([
        supabase.from("company_executives").select("*").eq("company_id", companyId),
        supabase.from("company_agency_contracts").select("*").eq("company_id", companyId),
        supabase.from("company_values_signals").select("*").eq("company_id", companyId),
        supabase.from("company_warn_notices").select("*").eq("company_id", companyId).order("notice_date", { ascending: false }),
        supabase.from("company_worker_sentiment").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(1),
        supabase.from("pay_equity_signals" as any).select("*").eq("company_id", companyId),
      ]);

      const doc = generateDossierPdf({
        company,
        executives: execRes.data || [],
        contracts: contractRes.data || [],
        valuesSignals: (valuesRes.data || []) as any[],
        warnNotices: warnRes.data || [],
        sentiment: sentimentRes.data || [],
        payEquity: (payEquityRes.data || []) as any[],
      });

      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      doc.save(`${slug}-intelligence-dossier.pdf`);
      toast.success("Intelligence Dossier PDF downloaded");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {exporting ? "Generating…" : "Export Intelligence Brief"}
    </Button>
  );
}
