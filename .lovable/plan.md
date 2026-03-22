

## Plan: Replace all plain-text brand logos with W? logomark

### Locations to update

There are **3 places** where "Who Do I Work For?" appears as a visible logo/brand in a nav or header:

1. **`src/pages/Index.tsx` (lines 65-67)** — Homepage sticky header logo. Currently `<Link>` with serif font text.
2. **`src/components/layout/AppSidebar.tsx` (lines 128-140)** — Sidebar logo block with icon + text. Replace the text portion with the W? mark.
3. **`src/pages/WhoDoIWorkFor.tsx` (line 201)** — Page hero `<h1>` heading. This is a page title, not a nav logo — **skip** unless you want it changed too.

> All other occurrences (SEO titles, meta descriptions, JSON-LD, body copy, modals) are content/metadata — not logos — and will be left as-is.

### Changes

**File 1: `src/pages/Index.tsx` (lines 65-67)**
Replace the plain text Link:
```jsx
<Link to="/" className="font-serif text-foreground" style={{ fontSize: '18px', fontWeight: 700 }}>
  Who Do I Work For?
</Link>
```
With:
```jsx
<Link to="/" className="flex items-center shrink-0">
  <span style={{fontFamily:"Inter,sans-serif",fontWeight:900,letterSpacing:"-0.03em",fontSize:"26px"}}>
    <span style={{color:"#111111"}}>W</span>
    <span style={{color:"#F0C040"}}>?</span>
  </span>
</Link>
```

**File 2: `src/components/layout/AppSidebar.tsx` (lines 128-140)**
Replace the icon-box + text block with the W? mark. When sidebar is expanded, show the mark; when collapsed, show a smaller version:
```jsx
<span style={{fontFamily:"Inter,sans-serif",fontWeight:900,letterSpacing:"-0.03em",fontSize: collapsed ? "20px" : "26px"}}>
  <span style={{color:"#111111"}}>W</span>
  <span style={{color:"#F0C040"}}>?</span>
</span>
```

No other files need changes. Inter 900 is already loaded in `index.html`.

