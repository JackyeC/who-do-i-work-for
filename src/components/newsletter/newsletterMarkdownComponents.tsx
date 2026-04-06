import { useState } from "react";
import type { Components } from "react-markdown";

/**
 * Desk markdown often includes remote hero images. Third-party hosts may block
 * hotlinking or serve HTTP; we normalize, lazy-load, and fail gracefully.
 */
function MarkdownImage({
  src,
  alt,
  title,
}: {
  src?: string | null;
  alt?: string | null;
  title?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src?.trim() || failed) {
    return (
      <span
        className="my-3 block rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        {alt?.trim() ? `Image unavailable — ${alt}` : "Image unavailable (link may be blocked or expired)."}
      </span>
    );
  }

  let href = src.trim();
  if (href.startsWith("http://")) {
    href = `https://${href.slice(7)}`;
  }

  return (
    <span className="my-4 block max-w-full overflow-hidden rounded-md border border-border/40 bg-muted/10">
      <img
        src={href}
        alt={alt ?? ""}
        title={title ?? undefined}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="max-h-[min(420px,70vh)] w-full object-contain object-center"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export const newsletterMarkdownComponents: Partial<Components> = {
  a: ({ href, children }) => {
    const raw = Array.isArray(children) ? children.join("") : String(children ?? "");
    const text = raw.trim();
    const isChip =
      text.length > 0 &&
      (text.toLowerCase() === "read" ||
        text.toLowerCase() === "source" ||
        text.toLowerCase().startsWith("read ") ||
        text.length <= 22);

    if (!href) return <span className="text-muted-foreground underline underline-offset-2">{children}</span>;

    if (isChip) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-foreground/90 no-underline hover:border-primary/30 hover:bg-primary/5 transition-colors"
        >
          <span className="opacity-80">↗</span>
          <span className="truncate max-w-[18rem]">{children}</span>
        </a>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-90"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, title }) => (
    <MarkdownImage src={src} alt={alt} title={title} />
  ),
};
