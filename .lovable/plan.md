

## Fix: Edge function build error

**Problem**: `supabase/functions/company-intelligence-scan/index.ts` line 138 uses `import('npm:stripe@18.5.0')` which is incompatible with the Deno edge runtime. All other functions use `https://esm.sh/stripe@14.21.0?target=deno`.

**Fix**: One line change in `supabase/functions/company-intelligence-scan/index.ts`

Replace:
```typescript
const { default: Stripe } = await import('npm:stripe@18.5.0');
```
With:
```typescript
const { default: Stripe } = await import('https://esm.sh/stripe@14.21.0?target=deno');
```

**Scope**: 1 file, 1 line change. No database or frontend changes.

