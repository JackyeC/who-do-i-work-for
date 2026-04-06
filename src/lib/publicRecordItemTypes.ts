/**
 * Allowed `company_public_record_items.record_type` values.
 * Editorial rows must link a primary document — use these for consistency when inserting via admin SQL or future UI.
 */
export const PUBLIC_RECORD_ITEM_TYPES = [
  "court_filing",
  "deposition_excerpt",
  "investigative_docket",
  "sec_filing",
  "congressional_record",
  "law_enforcement_filing",
  "other_primary_document",
] as const;

export type PublicRecordItemType = (typeof PUBLIC_RECORD_ITEM_TYPES)[number];
