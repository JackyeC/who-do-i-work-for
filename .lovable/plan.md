

## Fix: Theme Flashing Between Light and Dark Mode

**Root cause**: The `<html>` tag in `index.html` has no `class="dark"` set. The page initially renders in light mode (browser default). Then React mounts, `ThemeToggle`'s `useEffect` runs, and adds the `dark` class — causing a visible flash from light to dark.

**Fix** (2 changes):

### 1. `index.html` — Set dark class immediately
- Add `class="dark"` and `style="color-scheme: dark"` to the `<html>` tag
- Add a blocking inline `<script>` in `<head>` that reads `localStorage.theme` before any rendering occurs. If the user previously chose light mode, it removes the `dark` class immediately — no flash either way

```html
<html lang="en" class="dark" style="color-scheme: dark">
  <head>
    ...
    <script>
      (function() {
        var t = localStorage.getItem('theme');
        if (t === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      })();
    </script>
  </head>
```

### 2. `src/components/ThemeToggle.tsx` — Remove redundant init useEffect
- Delete the second `useEffect` (lines 26-38) that re-applies the theme on mount — the inline script already handles this, and the first `useEffect` covers state changes. This eliminates the double-apply that causes the flash.

