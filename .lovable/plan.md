

## Fix: Inconsistent Colors Across the Homepage

### Problem
The homepage (`src/pages/Index.tsx`) mixes hardcoded Tailwind colors with theme-aware tokens. This means colors won't adapt correctly between light and dark modes and look visually inconsistent.

**Specific issues in `Index.tsx`:**
- Lines 162-166: Score badges use `text-green-400`, `text-yellow-400`, `text-red-400` and their `bg-` variants instead of the civic signal tokens
- These hardcoded colors look washed out in light mode and don't match the CivicScoreCard component used elsewhere

### Fix (Index.tsx only — scoped to homepage)

Replace all hardcoded score color classes in the Featured Company Cards section:

| Current (hardcoded) | Replacement (theme token) |
|---|---|
| `bg-green-500/10 text-green-400` | `bg-civic-green/10 text-civic-green` |
| `bg-yellow-500/10 text-yellow-400` | `bg-civic-yellow/10 text-civic-yellow` |
| `bg-red-500/10 text-red-400` | `bg-civic-red/10 text-civic-red` |

These civic tokens are already defined in `index.css` and adapt to both light and dark mode automatically.

### Scope
This change is limited to **`src/pages/Index.tsx`** lines 162-166 (the featured company cards score badges). The broader codebase has similar issues in ~13 other files, but those are separate pages and should be addressed incrementally.

### No other changes
Layout, typography, and content remain untouched.

