

## Plan: Add `/companies` — Mission-Driven Organizations Directory

### What We're Building
A new public page at `/companies` showcasing verified mission-driven organizations with rich filtering, company cards with verification badges and Reality Check scores, and a CTA to claim profiles.

### Changes

**1. Create `src/pages/Companies.tsx`**

New page with:

- **SEO**: `usePageSEO` with title "Organizations Walking the Talk" and JSON-LD CollectionPage schema.
- **Hero section**: Headline "Organizations walking the talk." / Subheadline "Every org here has been verified against public data. No bias. Just receipts."
- **CTA banner**: "Is your organization here? Claim your profile." linking to `/for-employers`.
- **Search bar** with text input filtering by name/mission.
- **Filter bar** using existing Select/multi-select components:
  - Mission Category (multi-select via popover with checkboxes): Climate, Health Equity, Education, Civic/Policy, Veterans, Faith-Based, Community/Social, Economic Justice, LGBTQ Rights, Disability Rights, Rural Development, Other
  - Verification Status: All / Verified Only
  - Organization Type: Nonprofit / B Corp / Social Enterprise / For-Purpose
  - Location: All / Remote-friendly / Northeast / Southeast / Midwest / West / Southwest
  - Company Size: All / Under 50 / 50-200 / 200-1000 / 1000+
- **Company cards grid** (responsive 1/2/3 columns), each card showing:
  - Logo placeholder (colored circle with initial)
  - Organization name
  - Mission statement (one-line truncated)
  - Mission Category tags (Badge components)
  - Reality Check Score (colored badge: green >70, yellow 50-70, red <50)
  - Verification badges: B Corp / 501c3 / Mission Verified (small shield icons)
  - "Open Roles: X" button
  - Narrative Gap amber flag icon if detected
- **Sample data**: Hardcoded array of ~8 mission-driven organizations as placeholders (matching the categories above), since no dedicated database table exists yet. This makes the page look complete immediately.
- **Empty/filtered state**: "No organizations match your filters."

**2. Update `src/App.tsx`**

- Add lazy import: `const Companies = lazy(() => import("./pages/Companies"));`
- Add route: `<Route path="/companies" element={<Companies />} />`

### Technical Notes
- Follows existing patterns from `Browse.tsx` and `NonProfitDirectory.tsx` for card layout and styling.
- Uses existing UI primitives: `Card`, `Badge`, `Button`, `Input`, `Select`.
- Multi-select for Mission Category will use a Popover with Checkbox list (similar pattern to other filter UIs in the app).
- No database changes needed — sample data hardcoded for now, ready to swap for API/DB query later.

