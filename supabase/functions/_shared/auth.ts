/**
 * Shared authentication helpers for edge functions.
 *
 * Usage:
 *   import { requireAuth, requireServiceRole } from '../_shared/auth.ts';
 *
 *   // For user-authenticated endpoints:
 *   const { user, supabase } = await requireAuth(req);
 *
 *   // For admin/backend-only endpoints:
 *   const { supabase } = await requireServiceRole(req);
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

/**
 * Require a valid user JWT. Returns the authenticated user and a
 * Supabase client scoped to their permissions.
 */
export async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AuthError('Invalid or expired token');
  }

  return { user, supabase };
}

/**
 * Require the service_role key. Use for backend-only / cron / admin endpoints.
 */
export async function requireServiceRole(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  if (token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    throw new AuthError('Unauthorized: service role required', 403);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  return { supabase };
}

/**
 * Standard CORS headers for edge functions.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Create a JSON error response.
 */
export function authErrorResponse(error: AuthError | Error) {
  const status = error instanceof AuthError ? error.status : 500;
  return new Response(
    JSON.stringify({ error: error.message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
