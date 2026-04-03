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

type EmbeddedEntity = {
  name: string;
  entity_type: string;
  primary_role: string | null;
};

type LinkRow = {
  entity_id?: string;
  relationship_type: string;
  relationship_note: string | null;
  evidence_url: string | null;
  project2025_entities: EmbeddedEntity | EmbeddedEntity[] | null;
};

function mapEntityType(raw: string | null | undefined): Project2025EntityType {
  return raw === "org" ? "org" : "person";
}

function pickEmbeddedEntity(row: LinkRow): EmbeddedEntity | null {
  const e = row.project2025_entities;
  if (!e) return null;
  const o = Array.isArray(e) ? e[0] : e;
  return o?.name ? o : null;
}

function mapLinkRow(r: LinkRow): Project2025Link | null {
  const ent = pickEmbeddedEntity(r);
  if (!ent) return null;
  return {
    entityName: ent.name,
    entityType: mapEntityType(ent.entity_type),
    primaryRole: ent.primary_role ?? null,
    relationshipType: r.relationship_type,
    relationshipNote: r.relationship_note ?? null,
    evidenceUrl: r.evidence_url ?? null,
  };
}

async function fetchLinksWithEntitiesFallback(companyId: string): Promise<Project2025Link[]> {
  const { data: links, error } = await supabase
    .from("project2025_company_links")
    .select("entity_id, relationship_type, relationship_note, evidence_url")
    .eq("company_id", companyId);

  if (error || !links?.length) {
    if (error) console.warn("getProject2025LinksForCompany fallback links", error);
    return [];
  }

  const ids = [...new Set(links.map((l) => l.entity_id as string).filter(Boolean))];
  if (ids.length === 0) return [];

  const { data: entities, error: entErr } = await supabase
    .from("project2025_entities")
    .select("id, name, entity_type, primary_role")
    .in("id", ids);

  if (entErr || !entities?.length) {
    if (entErr) console.warn("getProject2025LinksForCompany fallback entities", entErr);
    return [];
  }

  const byId = new Map(entities.map((e) => [e.id as string, e]));

  return links
    .map((l) => {
      const ent = byId.get(l.entity_id as string);
      if (!ent?.name) return null;
      return {
        entityName: ent.name,
        entityType: mapEntityType(ent.entity_type as string),
        primaryRole: (ent.primary_role as string | null) ?? null,
        relationshipType: l.relationship_type as string,
        relationshipNote: (l.relationship_note as string | null) ?? null,
        evidenceUrl: (l.evidence_url as string | null) ?? null,
      } satisfies Project2025Link;
    })
    .filter(Boolean) as Project2025Link[];
}

export async function getProject2025LinksForCompany(companyId: string): Promise<Project2025Link[]> {
  const { data, error } = await supabase
    .from("project2025_company_links")
    .select(
      `
      entity_id,
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
    console.warn("getProject2025LinksForCompany nested select", error);
    return fetchLinksWithEntitiesFallback(companyId);
  }

  const rows = (data || []) as LinkRow[];
  const mapped = rows.map(mapLinkRow).filter(Boolean) as Project2025Link[];

  if (mapped.length === 0 && rows.length > 0) {
    return fetchLinksWithEntitiesFallback(companyId);
  }

  return mapped;
}
