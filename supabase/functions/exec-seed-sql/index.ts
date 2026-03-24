const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { sql } = await req.json();
  if (!sql) {
    return new Response(JSON.stringify({ error: 'No SQL provided' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL')!;
    const { default: postgres } = await import('https://deno.land/x/postgresjs@v3.4.4/mod.js');
    const pg = postgres(dbUrl);
    
    await pg.unsafe(sql);
    await pg.end();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
