/**
 * Cleans raw entity names by stripping technical identifiers (SEC CIK, FEC IDs, etc.)
 * and converting ALL CAPS to Title Case for readability.
 */
export function cleanEntityName(name: string): string {
  if (!name) return "Unknown";
  let cleaned = name.replace(/\b(SEC\s*)?CIK[\s:#]*\d+/gi, "").trim();
  cleaned = cleaned.replace(/\(?\s*FEC\s*(ID)?[\s:#]*C\d+\s*\)?/gi, "").trim();
  cleaned = cleaned.replace(/\s*C\d{8,}\s*/g, " ").trim();
  cleaned = cleaned.replace(/\b(EIN|TIN)[\s:#]*\d[\d-]+/gi, "").trim();
  cleaned = cleaned.replace(/\bDUNS[\s:#]*\d+/gi, "").trim();
  cleaned = cleaned.replace(/\(?\s*Ticker:\s*[A-Z]+\s*\)?/gi, "").trim();
  cleaned = cleaned.replace(/[\s,\-()]+$/, "").replace(/^[\s,\-()]+/, "").trim();
  // Convert ALL CAPS to Title Case
  if (cleaned.length > 3 && cleaned === cleaned.toUpperCase()) {
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    cleaned = cleaned.replace(/\b(Pac|Llc|Inc|Ltd|Co|Corp)\b/g, m => m.toUpperCase());
  }
  return cleaned || name;
}

/**
 * Summarize long descriptions into readable text.
 */
export function summarizeDescription(
  description: string | null,
  linkType: string,
  sourceName: string,
  targetName: string
): string {
  if (!description) return "";
  if (linkType === "committee_oversight_of_contract" && description.length > 200) {
    const titleMatch = description.match(/TITLE:\s*([^\n]+)/i);
    const awardMatch = description.match(/\(Award ID:\s*([^)]+)\)/i);
    if (titleMatch) {
      const title = titleMatch[1].trim().length > 120
        ? titleMatch[1].trim().substring(0, 120) + "…"
        : titleMatch[1].trim();
      return `Federal contract: ${title}${awardMatch ? ` (${awardMatch[1]})` : ""}`;
    }
    return description.substring(0, 150) + "…";
  }
  if (linkType === "interlocking_directorate" && /SEC EDGAR/i.test(description)) {
    const tickerMatch = description.match(/Ticker:\s*([A-Z]+)/i);
    return tickerMatch
      ? `Publicly traded company (${tickerMatch[1]})`
      : "SEC filing confirms corporate identity";
  }
  if (description.length > 200) {
    return description.substring(0, 180) + "…";
  }
  return description;
}
