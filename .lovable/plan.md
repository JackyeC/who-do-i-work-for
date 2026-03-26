

## Fix: Show research option on dossier page when company slug not found

**Problem**: When the Chrome extension links to `/dossier/mars-veterinary-health-inc` and no matching company exists in the database, the page shows a dead-end "Company not found." message with no action. The `CompanyZeroState` scan trigger only appears when a company record exists but lacks dossier data.

**Solution**: Replace the empty "Company not found" state with a `CompanyZeroState`-style card that:
1. Derives a human-readable company name from the URL slug (e.g., `mars-veterinary-health-inc` → `Mars Veterinary Health Inc`)
2. Shows the Global Intelligence Scan button so users can trigger research
3. On success, reloads the page with the newly created company data

### Technical details

**File**: `src/pages/CompanyDossier.tsx` (lines 227–236)

Replace the current empty state:
```tsx
if (!company) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Company not found.</p>
      </div>
    </div>
  );
}
```

With a state that derives the company name from the slug and renders `CompanyZeroState` with an `onDiscovered` callback that navigates to the new slug:

```tsx
if (!company) {
  const derivedName = id
    ? id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "Unknown Company";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 px-6 py-16 max-w-2xl mx-auto">
        <CompanyZeroState
          companyName={derivedName}
          onDiscovered={(_, slug) => navigate(`/dossier/${slug}`)}
        />
      </div>
    </div>
  );
}
```

Also add `useNavigate` to the existing imports (it already imports `useParams` and `Link` from `react-router-dom`).

**Scope**: 1 file changed, ~10 lines modified. No database changes.

