#!/usr/bin/env node
/**
 * Minimal launch-readiness audit for a public website.
 *
 * - Crawls internal pages (same origin) starting from sitemap.xml if present, else "/"
 * - Collects internal link graph (a[href], link[href], script[src], img[src])
 * - Verifies internal targets return 2xx/3xx (flags 4xx/5xx)
 * - Samples external links (optional) with a conservative limit
 *
 * Usage:
 *   node scripts/site-audit.mjs https://example.com --out reports/site-audit.md
 */
import { JSDOM } from "jsdom";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const baseUrlArg = args[0];
if (!baseUrlArg || baseUrlArg.startsWith("-")) {
  console.error("Usage: node scripts/site-audit.mjs <baseUrl> [--out <path>] [--max-pages N] [--external-limit N]");
  process.exit(2);
}

const getFlag = (name, fallback) => {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const v = args[idx + 1];
  if (!v || v.startsWith("--")) return fallback;
  return v;
};

const baseUrl = new URL(baseUrlArg);
const outPath = getFlag("--out", `reports/site-audit-${new Date().toISOString().slice(0, 10)}.md`);
const maxPages = Number(getFlag("--max-pages", "500"));
const externalLimit = Number(getFlag("--external-limit", "50"));
const concurrency = Number(getFlag("--concurrency", "10"));
const seedAppPath = getFlag("--seed-app", "");

const SKIP_SCHEMES = new Set(["mailto:", "tel:", "javascript:", "data:"]);

function normalizeUrl(raw, fromUrl) {
  try {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    for (const s of SKIP_SCHEMES) if (trimmed.toLowerCase().startsWith(s)) return null;
    const u = new URL(trimmed, fromUrl);
    // Drop fragments for fetch identity.
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, { method = "GET", timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "wdiwf-launch-audit/1.0 (+link-check)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function tryGetSitemapUrls() {
  const sitemapUrl = new URL("/sitemap.xml", baseUrl);
  try {
    const res = await fetchWithTimeout(sitemapUrl, { method: "GET", timeoutMs: 20000 });
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("xml") && !ct.includes("text/plain") && !ct.includes("application/octet-stream")) return [];
    const xml = await res.text();
    const locs = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1]);
    const urls = [];
    for (const loc of locs) {
      const u = normalizeUrl(loc, sitemapUrl);
      if (u && u.origin === baseUrl.origin) urls.push(u.toString());
    }
    return Array.from(new Set(urls));
  } catch {
    return [];
  }
}

async function tryGetRoutesFromAppTsx(appPath) {
  if (!appPath) return [];
  try {
    const src = await readFile(appPath, "utf8");
    const routes = Array.from(src.matchAll(/<Route\s+path="([^"]+)"/g)).map((m) => m[1]);
    const staticRoutes = routes
      .filter((p) => p.startsWith("/"))
      .filter((p) => !p.includes(":"))
      .filter((p) => p !== "*")
      .filter((p) => !p.includes("*"));
    return Array.from(new Set(staticRoutes)).map((p) => new URL(p, baseUrl).toString());
  } catch {
    return [];
  }
}

function extractLinks(html, pageUrl) {
  const dom = new JSDOM(html, { url: pageUrl.toString() });
  const doc = dom.window.document;

  const attrs = [
    ["a", "href"],
    ["link", "href"],
    ["script", "src"],
    ["img", "src"],
  ];

  const found = [];
  for (const [sel, attr] of attrs) {
    doc.querySelectorAll(sel).forEach((el) => {
      const raw = el.getAttribute(attr);
      const u = normalizeUrl(raw, pageUrl);
      if (u) found.push(u.toString());
    });
  }

  const title = (doc.querySelector("title")?.textContent ?? "").trim();
  const metaDescription = (doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "").trim();
  const textSample = (doc.body?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 4000);

  return {
    title,
    metaDescription,
    textSample,
    links: Array.from(new Set(found)),
  };
}

function looksLikePlaceholder(text) {
  const t = text.toLowerCase();
  const needles = ["lorem ipsum", "coming soon", "todo", "tbd", "placeholder", "under construction"];
  return needles.some((n) => t.includes(n));
}

/** Simple promise pool */
async function pool(items, worker, { size }) {
  const results = new Array(items.length);
  let i = 0;
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, size) }, run));
  return results;
}

const discoveredInternal = new Set();
const toVisit = [];
const pageData = new Map(); // url -> {status, finalUrl, contentType, title, metaDescription, placeholder, links[]}
const linkEdges = []; // {from, to}
const internalTargets = new Set();
const externalTargets = new Set();

function enqueueInternal(u) {
  if (discoveredInternal.has(u)) return;
  discoveredInternal.add(u);
  toVisit.push(u);
}

const sitemapSeeds = await tryGetSitemapUrls();
const appSeeds = await tryGetRoutesFromAppTsx(seedAppPath);

if (sitemapSeeds.length) sitemapSeeds.forEach(enqueueInternal);
if (appSeeds.length) appSeeds.forEach(enqueueInternal);
if (!sitemapSeeds.length && !appSeeds.length) enqueueInternal(new URL("/", baseUrl).toString());

async function auditPage(urlStr) {
  const url = new URL(urlStr);
  const res = await fetchWithTimeout(url, { method: "GET", timeoutMs: 25000 });
  const finalUrl = res.url || urlStr;
  const status = res.status;
  const contentType = res.headers.get("content-type") ?? "";

  let parsed = null;
  let bodyText = "";
  if (contentType.includes("text/html")) {
    const html = await res.text();
    parsed = extractLinks(html, new URL(finalUrl));
    bodyText = parsed.textSample;
  } else {
    // Don’t download huge binaries; keep this lightweight.
    bodyText = "";
  }

  const links = parsed?.links ?? [];
  for (const to of links) linkEdges.push({ from: urlStr, to });

  for (const to of links) {
    const u = new URL(to);
    if (u.origin === baseUrl.origin) {
      internalTargets.add(u.toString());
      enqueueInternal(u.toString());
    } else {
      externalTargets.add(u.toString());
    }
  }

  pageData.set(urlStr, {
    status,
    finalUrl,
    contentType,
    title: parsed?.title ?? "",
    metaDescription: parsed?.metaDescription ?? "",
    placeholder: parsed ? looksLikePlaceholder(bodyText) : false,
  });
}

// Crawl internal pages
let cursor = 0;
while (cursor < toVisit.length && pageData.size < maxPages) {
  const batch = toVisit.slice(cursor, Math.min(toVisit.length, cursor + concurrency));
  cursor += batch.length;
  // eslint-disable-next-line no-await-in-loop
  await pool(batch, async (u) => {
    if (pageData.has(u)) return;
    try {
      await auditPage(u);
    } catch (e) {
      pageData.set(u, {
        status: 0,
        finalUrl: u,
        contentType: "",
        title: "",
        metaDescription: "",
        placeholder: false,
        error: String(e?.message ?? e),
      });
    }
  }, { size: concurrency });
}

// Verify internal targets (including those we didn’t fetch due to maxPages)
const internalToCheck = Array.from(internalTargets).filter((u) => !pageData.has(u));
await pool(internalToCheck, async (u) => {
  try {
    const res = await fetchWithTimeout(u, { method: "GET", timeoutMs: 20000 });
    pageData.set(u, {
      status: res.status,
      finalUrl: res.url || u,
      contentType: res.headers.get("content-type") ?? "",
      title: "",
      metaDescription: "",
      placeholder: false,
      note: "checked-as-target",
    });
  } catch (e) {
    pageData.set(u, {
      status: 0,
      finalUrl: u,
      contentType: "",
      title: "",
      metaDescription: "",
      placeholder: false,
      error: String(e?.message ?? e),
      note: "checked-as-target",
    });
  }
}, { size: concurrency });

// Sample external link health (very conservative)
const externalSample = Array.from(externalTargets).slice(0, externalLimit);
const externalResults = [];
await pool(externalSample, async (u) => {
  try {
    const res = await fetchWithTimeout(u, { method: "HEAD", timeoutMs: 15000 });
    externalResults.push({ url: u, status: res.status, finalUrl: res.url || u });
  } catch {
    // Some hosts block HEAD; fall back to GET (headers only)
    try {
      const res = await fetchWithTimeout(u, { method: "GET", timeoutMs: 15000 });
      externalResults.push({ url: u, status: res.status, finalUrl: res.url || u });
    } catch (e2) {
      externalResults.push({ url: u, status: 0, finalUrl: u, error: String(e2?.message ?? e2) });
    }
  }
}, { size: Math.min(concurrency, 8) });

function fmtUrl(u) {
  try {
    const url = new URL(u);
    return url.origin === baseUrl.origin ? url.pathname + (url.search || "") : u;
  } catch {
    return u;
  }
}

const pages = Array.from(pageData.entries()).map(([url, data]) => ({ url, ...data }));
const internalPages = pages.filter((p) => new URL(p.url).origin === baseUrl.origin);

const badInternal = internalPages.filter((p) => p.status >= 400 || p.status === 0);
const redirectInternal = internalPages.filter((p) => p.status >= 300 && p.status < 400);
const placeholderPages = internalPages.filter((p) => p.placeholder);
const missingTitle = internalPages.filter((p) => p.contentType.includes("text/html") && !p.title);
const missingDescription = internalPages.filter((p) => p.contentType.includes("text/html") && !p.metaDescription);

const reportLines = [];
reportLines.push(`# Site launch audit`);
reportLines.push(``);
reportLines.push(`- Base: ${baseUrl.toString()}`);
reportLines.push(`- Date: ${new Date().toISOString()}`);
reportLines.push(`- Crawled internal pages: ${internalPages.length}${internalPages.length >= maxPages ? " (hit max limit)" : ""}`);
reportLines.push(`- Discovered internal link targets: ${internalTargets.size}`);
reportLines.push(`- Sampled external links: ${externalResults.length} (limit ${externalLimit})`);
if (seedAppPath) reportLines.push(`- Seeded routes from: ${seedAppPath}`);
reportLines.push(``);

reportLines.push(`## Internal page health`);
reportLines.push(`- 4xx/5xx/failed: ${badInternal.length}`);
reportLines.push(`- Redirects (3xx): ${redirectInternal.length}`);
reportLines.push(`- Placeholder-suspected pages: ${placeholderPages.length}`);
reportLines.push(`- Missing <title>: ${missingTitle.length}`);
reportLines.push(`- Missing meta description: ${missingDescription.length}`);
reportLines.push(``);

if (badInternal.length) {
  reportLines.push(`### Broken / failing internal pages`);
  for (const p of badInternal.sort((a, b) => (b.status || 0) - (a.status || 0)).slice(0, 200)) {
    reportLines.push(`- ${p.status || "ERR"} ${fmtUrl(p.url)}${p.finalUrl && p.finalUrl !== p.url ? ` → ${fmtUrl(p.finalUrl)}` : ""}${p.error ? ` (${p.error})` : ""}`);
  }
  reportLines.push(``);
}

if (placeholderPages.length) {
  reportLines.push(`### Placeholder-suspected pages`);
  for (const p of placeholderPages.slice(0, 200)) reportLines.push(`- ${fmtUrl(p.url)}`);
  reportLines.push(``);
}

if (missingTitle.length) {
  reportLines.push(`### Pages missing <title>`);
  for (const p of missingTitle.slice(0, 200)) reportLines.push(`- ${fmtUrl(p.url)}`);
  reportLines.push(``);
}

if (missingDescription.length) {
  reportLines.push(`### Pages missing meta description`);
  for (const p of missingDescription.slice(0, 200)) reportLines.push(`- ${fmtUrl(p.url)}`);
  reportLines.push(``);
}

reportLines.push(`## External link sample health`);
const externalBad = externalResults.filter((r) => r.status >= 400 || r.status === 0);
reportLines.push(`- Bad/failed in sample: ${externalBad.length}`);
if (externalBad.length) {
  reportLines.push(``);
  reportLines.push(`### Bad/failed external links (sample)`);
  for (const r of externalBad.slice(0, 200)) {
    reportLines.push(`- ${r.status || "ERR"} ${r.url}${r.finalUrl && r.finalUrl !== r.url ? ` → ${r.finalUrl}` : ""}${r.error ? ` (${r.error})` : ""}`);
  }
}
reportLines.push(``);

reportLines.push(`## Notes`);
reportLines.push(`- This checks HTTP status and basic SEO metadata; it does not run client-side JS or detect runtime console errors.`);
reportLines.push(`- If you have authenticated/role-gated routes, this will only see the public experience.`);
reportLines.push(``);

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, reportLines.join("\n"), "utf8");

// Write a machine-readable snapshot too.
const jsonPath = outPath.replace(/\.md$/i, ".json");
await writeFile(
  jsonPath,
  JSON.stringify(
    {
      base: baseUrl.toString(),
      generatedAt: new Date().toISOString(),
      maxPages,
      crawledInternalCount: internalPages.length,
      discoveredInternalTargets: internalTargets.size,
      internalPages,
      externalSample: externalResults,
      edges: linkEdges,
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Wrote report: ${outPath}`);
console.log(`Wrote data:   ${jsonPath}`);
