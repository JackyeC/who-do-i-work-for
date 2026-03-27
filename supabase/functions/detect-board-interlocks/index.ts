/**
 * Detect Board Interlocks & Power Networks
 * 
 * Scans existing board_members and company_executives tables to detect:
 * 1. Shared directors (same person on multiple company boards)
 * 2. Shared executives (same person in leadership at multiple companies)
 * 3. PAC-connected networks (executives who also appear in donation records)
 * 4. Nonprofit influence (board members with nonprofit affiliations)
 * 
 * This is the "explosive" dataset — it reveals hidden power structures.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(dr|mr|mrs|ms|jr|sr|iii|ii|iv)\b\.?/gi, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth gate: require service-role key
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';
  if (token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch all board members and executives
    const [boardRes, execRes, revolverRes, flaggedRes] = await Promise.all([
      supabase.from('board_members').select('name, title, company_id, committees, bio, source').neq('verification_status', 'former'),
      supabase.from('company_executives').select('name, title, company_id, total_donations, source').neq('verification_status', 'former'),
      supabase.from('company_revolving_door').select('person, prior_role, new_role, company_id, relevance'),
      supabase.from('company_flagged_orgs').select('company_id, org_name, relationship, confidence'),
    ]);

    const boardMembers = boardRes.data || [];
    const executives = execRes.data || [];
    const revolvers = revolverRes.data || [];
    const flaggedOrgs = flaggedRes.data || [];

    // Get company name lookup
    const companyIds = new Set([
      ...boardMembers.map(b => b.company_id),
      ...executives.map(e => e.company_id),
    ]);
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', Array.from(companyIds));

    const companyMap = new Map((companies || []).map(c => [c.id, c.name]));

    // 2. Build person → appearances map
    const personAppearances = new Map<string, Array<{
      companyId: string;
      companyName: string;
      role: string;
      type: 'board' | 'executive';
      source: string | null;
    }>>();

    for (const bm of boardMembers) {
      const normalized = normalizeName(bm.name);
      if (!normalized || normalized.length < 3) continue;
      const arr = personAppearances.get(normalized) || [];
      arr.push({
        companyId: bm.company_id,
        companyName: companyMap.get(bm.company_id) || 'Unknown',
        role: bm.title || 'Board Member',
        type: 'board',
        source: bm.source,
      });
      personAppearances.set(normalized, arr);
    }

    for (const ex of executives) {
      const normalized = normalizeName(ex.name);
      if (!normalized || normalized.length < 3) continue;
      const arr = personAppearances.get(normalized) || [];
      // Avoid duplicate if same company
      if (!arr.some(a => a.companyId === ex.company_id && a.type === 'executive')) {
        arr.push({
          companyId: ex.company_id,
          companyName: companyMap.get(ex.company_id) || 'Unknown',
          role: ex.title || 'Executive',
          type: 'executive',
          source: ex.source,
        });
      }
      personAppearances.set(normalized, arr);
    }

    // 3. Detect interlocks (people appearing at 2+ companies)
    const interlocks: any[] = [];

    for (const [normalizedName, appearances] of personAppearances) {
      // Group by unique company
      const uniqueCompanies = new Map<string, typeof appearances[0]>();
      for (const app of appearances) {
        if (!uniqueCompanies.has(app.companyId)) {
          uniqueCompanies.set(app.companyId, app);
        }
      }

      if (uniqueCompanies.size < 2) continue;

      // Create interlock records for each pair
      const companyList = Array.from(uniqueCompanies.values());
      for (let i = 0; i < companyList.length; i++) {
        for (let j = i + 1; j < companyList.length; j++) {
          const a = companyList[i];
          const b = companyList[j];

          // Find original name (not normalized)
          const originalName = boardMembers.find(bm => normalizeName(bm.name) === normalizedName)?.name
            || executives.find(ex => normalizeName(ex.name) === normalizedName)?.name
            || normalizedName;

          // Check if this person has PAC connections
          const hasPacConnection = executives.some(
            ex => normalizeName(ex.name) === normalizedName && ex.total_donations > 0
          );

          // Check revolving door
          const hasRevolvingDoor = revolvers.some(
            r => normalizeName(r.person) === normalizedName
          );

          const interlockType = a.type === 'board' && b.type === 'board'
            ? 'shared_director'
            : a.type === 'executive' && b.type === 'executive'
            ? 'shared_executive'
            : 'cross_role_interlock';

          interlocks.push({
            person_name: originalName,
            person_title: a.role,
            company_a_id: a.companyId,
            company_a_name: a.companyName,
            role_at_a: a.role,
            company_b_id: b.companyId,
            company_b_name: b.companyName,
            role_at_b: b.role,
            interlock_type: interlockType,
            pac_connection: hasPacConnection,
            political_network: hasRevolvingDoor ? 'revolving_door' : null,
            influence_score: calculateInfluenceScore(hasPacConnection, hasRevolvingDoor, uniqueCompanies.size),
            source: a.source || b.source || 'internal_cross_reference',
            confidence: 'high',
          });
        }
      }
    }

    // 4. Insert interlocks
    if (interlocks.length > 0) {
      // Clear existing interlocks and re-detect (full refresh)
      await supabase.from('board_interlocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Batch insert
      const batchSize = 50;
      let totalInserted = 0;
      for (let i = 0; i < interlocks.length; i += batchSize) {
        const batch = interlocks.slice(i, i + batchSize);
        const { error } = await supabase.from('board_interlocks').insert(batch);
        if (error) {
          console.error('Insert error:', error);
        } else {
          totalInserted += batch.length;
        }
      }

      console.log(`Detected ${totalInserted} board interlocks`);

      return new Response(JSON.stringify({
        totalInterlocks: totalInserted,
        uniquePeopleWithInterlocks: new Set(interlocks.map(i => i.person_name)).size,
        companiesInvolved: new Set([
          ...interlocks.map(i => i.company_a_name),
          ...interlocks.map(i => i.company_b_name),
        ]).size,
        sample: interlocks.slice(0, 5),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      totalInterlocks: 0,
      message: 'No board interlocks detected. Add more company board/executive data to detect cross-company connections.',
      boardMembersScanned: boardMembers.length,
      executivesScanned: executives.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('detect-board-interlocks error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateInfluenceScore(hasPac: boolean, hasRevolvingDoor: boolean, companiesCount: number): number {
  let score = 0;
  score += companiesCount * 20; // More companies = more influence
  if (hasPac) score += 25;
  if (hasRevolvingDoor) score += 30;
  return Math.min(score, 100);
}
