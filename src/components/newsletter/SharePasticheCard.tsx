import { useRef, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { PosterData } from "@/hooks/use-receipts-posters-by-work-news-ids";

const NEWSLETTER_URL = "https://wdiwf.jackyeclayton.com/newsletter";

type Props = {
  headline: string;
  sourceUrl: string | null;
  poster: PosterData;
  className?: string;
};

export function SharePasticheCard({ headline, sourceUrl, poster, className }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const linkForShare = sourceUrl?.trim() || NEWSLETTER_URL;
  const caption = `${headline}\n\n${linkForShare}\n\nSatire / pastiche — WDIWF · The Daily Grind`;

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({ title: "Copied", description: "Share caption copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Try selecting the text manually.", variant: "destructive" });
    }
  };

  const webShare = async () => {
    if (!navigator.share) {
      await copyCaption();
      return;
    }
    try {
      await navigator.share({
        title: headline.slice(0, 80),
        text: `${headline}\n\n${linkForShare}`,
        url: linkForShare,
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      await copyCaption();
    }
  };

  const downloadPng = async () => {
    const el = captureRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: poster.bg || "#f5f0e6",
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `wdiwf-daily-grind-${Date.now()}.png`;
      a.click();
      toast({ title: "Saved", description: "Poster image downloaded." });
    } catch {
      toast({ title: "Download failed", description: "Try copy caption instead.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const paperTexture = {
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 45%),
      radial-gradient(circle at 80% 0%, rgba(0,0,0,0.04) 0%, transparent 40%),
      linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 30%)
    `,
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Share · satire pastiche
      </p>
      <div
        ref={captureRef}
        className="rounded-xl border-2 border-black/10 overflow-hidden shadow-md max-w-md mx-auto sm:mx-0"
        style={{
          backgroundColor: poster.bg,
          color: poster.dark,
          ...paperTexture,
        }}
      >
        <div className="px-5 pt-4 pb-1 border-b border-black/10 flex items-center justify-between gap-2">
          <span className="text-[9px] font-serif tracking-[0.2em] uppercase opacity-80">WDIWF</span>
          <span className="text-[9px] font-serif tracking-widest uppercase opacity-70">The Daily Grind</span>
        </div>
        <div className="px-5 py-5 space-y-3">
          <p className="text-center text-4xl leading-none" aria-hidden>
            {poster.emoji}
          </p>
          <p
            className="text-center font-black tracking-tight leading-none text-2xl sm:text-3xl"
            style={{ color: poster.dark }}
          >
            {poster.bigTxt}
          </p>
          <p className="text-center text-sm font-semibold opacity-90" style={{ color: poster.accent }}>
            {poster.sub}
          </p>
          <p className="text-center text-xs font-medium leading-snug px-1" style={{ color: poster.dark }}>
            {headline}
          </p>
          <div
            className="rounded-lg px-3 py-2 text-center text-[11px] font-bold tracking-wide uppercase"
            style={{ backgroundColor: `${poster.accent}33`, color: poster.dark }}
          >
            {poster.tag}
          </div>
          <p className="text-center text-sm italic leading-snug" style={{ color: poster.dark }}>
            {poster.copy}
          </p>
          <p className="text-[9px] leading-tight opacity-75 text-center px-2">
            {poster.fine} Satire / pastiche. Not an advertisement. No health, tobacco, or shock imagery.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => void copyCaption()}>
          <Copy className="w-3.5 h-3.5" />
          Copy caption
        </Button>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => void webShare()}>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5 rounded-lg"
          disabled={downloading}
          onClick={() => void downloadPng()}
        >
          <Download className="w-3.5 h-3.5" />
          {downloading ? "…" : "Download PNG"}
        </Button>
      </div>
    </div>
  );
}
