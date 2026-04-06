/**
 * Plain-language context for users who see NLRB-backed signals.
 * Single source of truth for Offer Check, marketing footnotes, etc.
 */

export const NLRB_EXPLAINER_TITLE = "What is the NLRB?";

/** Short label for badges when rows include NLRB public records */
export const NLRB_RECORDS_BADGE = "Includes NLRB public records";

export const NLRB_URL = "https://www.nlrb.gov/";

export const NLRB_CASES_URL = "https://www.nlrb.gov/cases-decisions";

export const nlrbExplainerParagraphs = [
  "The National Labor Relations Board (NLRB) is a U.S. federal agency that oversees most private-sector employees’ rights to organize, union elections, and charges of unfair labor practices. Public datasets can include election filings, complaints, and case activity tied to an employer name.",
  "A filing or docket entry in these sources is not the same as a final agency finding or court judgment. Cases can settle, be withdrawn, or be dismissed before a full investigation. No matching record here does not prove a company has had no labor disputes—only that nothing showed up in the sources we checked.",
] as const;

/** Match Offer Check / workplace_enforcement rows that reference NLRB (type, description, or method). */
export function textLooksLikeNlrbSignal(
  type: string,
  description: string,
  detectionMethod?: string | null
): boolean {
  const blob = `${type} ${description} ${detectionMethod ?? ""}`.toLowerCase();
  return /\bnlrb\b/.test(blob) || blob.includes("national labor relations");
}
