import { Info } from "lucide-react";

const INTERPRETATIONS: Record<string, { title: string; explanation: string }> = {
  eeo1: {
    title: "No EEO-1 Data Available",
    explanation: "This company has not published EEO-1 workforce composition data. This is a low-transparency signal.",
  },
  discussion: {
    title: "Low Public Visibility",
    explanation: "No structured public discussion signals found. This may indicate a quiet or stealth corporate culture.",
  },
  jobs: {
    title: "No Active Job Openings Detected",
    explanation: "No live openings were found. This may reflect operational stability or an internal-pipeline hiring strategy.",
  },
  court_records: {
    title: "No Public Court Filings Found",
    explanation: "No public court filings were located. This is a positive signal, though absence does not guarantee no legal exposure.",
  },
  sentiment: {
    title: "No Structured Sentiment Data",
    explanation: "No structured employee sentiment data is available for this employer. Consider checking review platforms directly.",
  },
  compensation: {
    title: "Compensation Data Not Disclosed",
    explanation: "Compensation data has not been disclosed or indexed for this employer.",
  },
  benefits: {
    title: "No Benefits Data Indexed",
    explanation: "Worker benefits information has not been disclosed or indexed. This limits insight into total compensation.",
  },
  off_the_record: {
    title: "No Forum Signals Detected",
    explanation: "No recurring discussion themes were found on public forums. This company may have low online visibility among workers.",
  },
};

interface EmptyStateExplainerProps {
  type: keyof typeof INTERPRETATIONS;
  className?: string;
}

export function EmptyStateExplainer({ type, className }: EmptyStateExplainerProps) {
  const info = INTERPRETATIONS[type];
  if (!info) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border border-border/60 bg-muted/30 ${className ?? ""}`}>
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{info.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{info.explanation}</p>
      </div>
    </div>
  );
}
