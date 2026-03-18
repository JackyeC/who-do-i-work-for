

## Problem

The company profile page fetches rich data (executives with names/titles/donations, PAC candidates, party breakdown, revolving door connections, dark money orgs) but **never renders any of it directly**. It only passes counts to `StructuredSignalsSection`, which shows generic summary text like "2 executive(s) identified with public donation records." The click handlers (`handleExecutiveClick`, `handleCandidateClick`) and drawers exist but nothing triggers them.

## Plan

### 1. Create a `LeadershipInfluenceSection` component

A new component (`src/components/company/LeadershipInfluenceSection.tsx`) that renders the actual data in clickable, readable cards:

- **Executive Leadership** — Each exec shown as a clickable row: name, title, donation total. Clicking opens `ExecutiveDetailDrawer`.
- **PAC & Party Breakdown** — Visual bar showing R/D/Other split with dollar amounts. Clicking opens `PACDetailDrawer`.
- **Top Candidates Funded** — List of candidate names + amounts. Clicking opens `CandidateDetailDrawer`.
- **Revolving Door** — Person name, prior government role, new corporate role. Each as a readable card.
- **Dark Money Connections** — Org name, type, estimated amount, relationship.
- **Board Members** — Names, independence status (if `dbBoardMembers` data exists).

All text at `text-sm` minimum for readability. Clickable items styled with hover states and clear affordance.

### 2. Wire it into `CompanyProfile.tsx`

Add the new section between the "What We're Seeing" (StructuredSignals) section and the Innovation Signals section. Pass the already-fetched data (`dbExecutives`, `dbCandidates`, `dbPartyBreakdown`, `dbRevolvingDoor`, `dbDarkMoney`, `dbBoardMembers`) and the click handlers directly.

### 3. Files to modify/create

- **Create**: `src/components/company/LeadershipInfluenceSection.tsx`
- **Edit**: `src/pages/CompanyProfile.tsx` — import and render the new component, pass data + handlers

### 4. Accessibility

- All text `text-sm` (14px) minimum per the established accessibility standards
- High-contrast text colors using `text-foreground` for names/amounts
- Clear visual hierarchy: section headers at `text-base font-semibold`, items at `text-sm`

