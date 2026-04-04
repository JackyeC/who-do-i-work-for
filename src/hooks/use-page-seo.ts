import { useEffect } from "react";

/** Canonical public site origin (OG, JSON-LD, share links). */
export const SITE_BASE_URL = "https://wdiwf.jackyeclayton.com";
const BASE_URL = SITE_BASE_URL;
const SITE_NAME = "Who Do I Work For?";
const DEFAULT_DESC =
  "Career intelligence by Jackye Clayton—audit a company before it becomes your problem. Evaluate employers with receipts from public records, not vibes.";
const DEFAULT_IMAGE = "https://wdiwf.jackyeclayton.com/og-image.png";

interface PageSEOProps {
  title: string;
  description?: string;
  path?: string;
  type?: string;
  image?: string;
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, any>;
}

export function usePageSEO({ title, description, path, type = "website", image, twitterCard = "summary_large_image", jsonLd }: PageSEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc = description || DEFAULT_DESC;
    const url = path ? `${BASE_URL}${path}` : BASE_URL;
    const ogImage = image || DEFAULT_IMAGE;

    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:card", twitterCard);
    setMeta("name", "twitter:image", ogImage);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD
    const existingLd = document.querySelector('script[data-page-ld]');
    if (existingLd) existingLd.remove();

    if (jsonLd) {
      const ldScript = document.createElement("script");
      ldScript.type = "application/ld+json";
      ldScript.setAttribute("data-page-ld", "true");
      ldScript.textContent = JSON.stringify({ "@context": "https://schema.org", ...jsonLd });
      document.head.appendChild(ldScript);
    }

    return () => {
      document.title = `${SITE_NAME} — Employer Intelligence by Jackye Clayton`;
      const pageLd = document.querySelector('script[data-page-ld]');
      if (pageLd) pageLd.remove();
    };
  }, [title, description, path, type, image, twitterCard, jsonLd]);
}
