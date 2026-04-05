/**
 * Sales / public-launch mode: set `VITE_PUBLIC_MARKETING_LAUNCH=true` on the host
 * (e.g. Vercel Production) so anonymous visitors see a vetted surface only.
 *
 * Test locally: `VITE_PUBLIC_MARKETING_LAUNCH=true npm run build && npm run preview`
 * Signed-in users still see full TopBar product links for demos and QA.
 */
export const isMarketingLaunch = import.meta.env.VITE_PUBLIC_MARKETING_LAUNCH === "true";
