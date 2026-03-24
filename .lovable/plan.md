

## Plan: Replace Job Board with Cavuno Widget Embed

### Summary
Replace the current full-page iframe in `JobBoardEmbed.tsx` with a styled page that includes a heading, descriptive subtext, and a Cavuno jobs widget embedded via `useEffect`.

### Changes — single file: `src/pages/JobBoardEmbed.tsx`

1. Keep `Header` import and `usePageSEO` hook as-is
2. Add `useEffect` and `useRef` imports from React
3. Replace the current iframe JSX with:
   - A centered heading section: "Job Board" (large bold) + the provided subtext paragraph
   - A `div` with `id="cavuno-jobs-widget"` and a `ref`
4. In `useEffect`, programmatically create an `<iframe>` with:
   - `src`: `https://who-do-i-work-for.cavuno.com/embed/jobs?limit=50`
   - `width`: `100%`
   - `style.minHeight`: `900px`
   - `style.height`: `calc(100vh - 160px)`
   - `style.border`: `none`
   - `loading`: `lazy`
   - Append to the widget div; remove on cleanup

No other files affected.

