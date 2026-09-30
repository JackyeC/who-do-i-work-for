# WDIWF — Who Do I Work For?

Career intelligence built on public records, not paid reviews.

**Live site**: [wdiwf.jackyeclayton.com](https://wdiwf.jackyeclayton.com)

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, edge functions)
- Vercel (hosting, auto-deploy from main)
- Stripe (payments)

## Development

Use Node.js 24 (`nvm use`). Copy `.env.example` to `.env.local` and supply the
existing project's public Clerk key, Supabase URL, and Supabase publishable key.
These three values are required at build time; optional integrations may remain unset.

```sh
git clone https://github.com/JackyeC/who-do-i-work-for.git
cd who-do-i-work-for
npm ci
npm run dev
```

## Deploy

Confirm the repository, branch, and root directory connected to the intended
Vercel project before deploying. This checkout is not verified as the source of
`whodoiworkfor.com`; do not replace a newer deployment with this snapshot.

Vercel uses Node.js 24 from `package.json`. Set the required public environment
variables for the deployment target before building. Vite embeds them in the
bundle, so an environment correction requires a new build. Builds fail early if
a required variable is missing instead of producing a blank page at startup.

Run `npm test`, `npm run lint`, `npx tsc --noEmit -p tsconfig.app.json`, and
`npm run build` before an approved deployment. A successful build alone does not
verify Clerk connectivity or the Supabase project's health.

---

Built by [Jackye Clayton](https://jackyeclayton.com) | People Puzzles™
