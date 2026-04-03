import { supabase } from "@/integrations/supabase/client";

export type Project2025EntityType = "person" | "org";

export interface Project2025Link {
  entityName: string;
  entityType: Project2025EntityType;
  primaryRole: string | null;
  relationshipType: string;
  relationshipNote: string | null;
  evidenceUrl: string | null;
}

/**
 * Shape for dossier payloads that include Project 2025 rows loaded alongside company context.
 */
export interface CompanyDossierData {
  project2025Links: Project2025Link[];
}

type LinkRow = {
  relationship_type: string;
  relationship_note: string | null;
  evidence_url: string | null;
  project2025_entities: {
    name: string;
    entity_type: string;
    primary_role: string | null;
  } | null;
};

function mapEntityType(raw: string | null | undefined): Project2025EntityType {
  return raw === "org" ? "org" : "person";
}

export async function getProject2025LinksForCompany(companyId: string): Promise<Project2025Link[]> {
  const { data, error } = await supabase
    .from("project2025_company_links")
    .select(
      `
      relationship_type,
      relationship_note,
      evidence_url,
      project2025_entities (
        name,
        entity_type,
        primary_role
      )
    `,
    )
    .eq("company_id", companyId);

  if (error) {
    console.error("getProject2025LinksForCompany", error);
    return [];
  }

  const rows = (data || []) as LinkRow[];
  return rows
    .filter((r) => r.project2025_entities?.name)
    .map((r) => ({
      entityName: r.project2025_entities!.name,
      entityType: mapEntityType(r.project2025_entities!.entity_type),
      primaryRole: r.project2025_entities!.primary_role ?? null,
      relationshipType: r.relationship_type,
      relationshipNote: r.relationship_note ?? null,
      evidenceUrl: r.evidence_url ?? null,
    }));
}
