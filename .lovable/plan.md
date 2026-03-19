

# Fix: Show "Not Found" State + Research Trigger on Employer Dossier Search

## Problem

When a user searches for a company that is not in the database on `/career-intelligence`, the dropdown simply shows nothing. No message, no action. The search says "Search any employer" but silently fails for unknown companies. The `CompanyResearchTrigger` component already exists and can initiate an AI research scan, but it is not wired into this page.

## Changes

### 1. Add empty-state handling in `EmployerDossierSearch.tsx`

When `results` is empty AND `loading` is false AND `query.length >= 2`, show a dropdown with:
- A message: "No results for [query]"
- A button/link: "Request an intelligence scan on this company" that either:
  - Calls `onNotFound(query)` callback to surface the `CompanyResearchTrigger` below the search bar, OR
  - Renders the `CompanyResearchTrigger` inline in the dropdown itself

### 2. Wire `CompanyResearchTrigger` into the Career Intelligence page

In `src/pages/CareerIntelligence.tsx`:
- Add state for `unknownCompanyName` 
- When the search yields no results, set `unknownCompanyName` and render `<CompanyResearchTrigger companyName={unknownCompanyName} />` below the search bar
- When `CompanyResearchTrigger` completes and publishes a company, auto-select it as the active dossier

### 3. Add `onNotFound` prop to `EmployerDossierSearch`

New optional prop `onNotFound?: (name: string) => void` that fires when a search completes with zero results. The parent page uses this to show the research trigger.

## Files Modified

- `src/components/career/EmployerDossierSearch.tsx` — add empty-state UI in dropdown + `onNotFound` callback
- `src/pages/CareerIntelligence.tsx` — handle `onNotFound`, render `CompanyResearchTrigger`, import it

