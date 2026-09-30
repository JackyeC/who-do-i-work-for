/** Validate public build inputs without printing their values to build logs. */
export function validatePublicEnv(env: Record<string, string | undefined>): void {
  const required = [
    "VITE_CLERK_PUBLISHABLE_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  ];
  const missing = required.filter((name) => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required public environment variables: ${missing.join(", ")}. ` +
        "Set them in .env.local for local builds or in the deployment environment before building."
    );
  }
}
