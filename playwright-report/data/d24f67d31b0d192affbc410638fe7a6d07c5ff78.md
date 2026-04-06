# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: launch-smoke.spec.ts >> Launch smoke: games + company search >> company search works (or fails gracefully behind auth)
- Location: tests/launch-smoke.spec.ts:104:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('textbox', { name: /search/i }).first().or(locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="company" i]').first())
Expected: visible
Error: strict mode violation: getByRole('textbox', { name: /search/i }).first().or(locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="company" i]').first()) resolved to 2 elements:
    1) <input value="" placeholder="Scan a company..." class="bg-transparent border-none outline-none text-foreground font-sans text-nav w-full placeholder:text-muted-foreground"/> aka getByRole('textbox', { name: 'Scan a company...' })
    2) <input value="" placeholder="Search any company. If it's not here yet, we'll add and research it automatically." class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h…/> aka getByRole('textbox', { name: 'Search any company. If it\'s' })

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('textbox', { name: /search/i }).first().or(locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="company" i]').first())

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e9]: Live
      - generic [ref=e10]:
        - generic [ref=e11]:
          - link "Goldman Sachs" [ref=e13] [cursor=pointer]:
            - /url: /dossier/goldman-sachs
          - generic [ref=e14]: —
          - generic [ref=e15]: Malaysian 1MDB scandal — DOJ settlement $2.9B (2020) — systemic compliance failure
          - generic [ref=e16]: (NLRB)
          - generic [ref=e17]: ·
        - generic [ref=e18]:
          - link "Starbucks" [ref=e20] [cursor=pointer]:
            - /url: /dossier/starbucks
          - generic [ref=e21]: —
          - generic [ref=e22]: $1B restructuring (2025) — 500+ store closures, 2,000 layoffs
          - generic [ref=e23]: (OSHA)
          - generic [ref=e24]: ·
        - generic [ref=e25]:
          - link "JPMorgan Chase" [ref=e27] [cursor=pointer]:
            - /url: /dossier/jpmorgan-chase
          - generic [ref=e28]: —
          - generic [ref=e29]: $328M crypto scam facilitation lawsuit (2026)
          - generic [ref=e30]: (SEC)
          - generic [ref=e31]: ·
        - generic [ref=e32]:
          - link "Goldman Sachs" [ref=e34] [cursor=pointer]:
            - /url: /dossier/goldman-sachs
          - generic [ref=e35]: —
          - generic [ref=e36]: $215M gender discrimination settlement (2023) — largest in financial services history at the time
          - generic [ref=e37]: (DOJ)
          - generic [ref=e38]: ·
        - generic [ref=e39]:
          - link "JPMorgan Chase" [ref=e41] [cursor=pointer]:
            - /url: /dossier/jpmorgan-chase
          - generic [ref=e42]: —
          - generic [ref=e43]: $151M SEC settlement (Oct 2024) for fiduciary breaches
          - generic [ref=e44]: (FTC)
          - generic [ref=e45]: ·
        - generic [ref=e46]:
          - link "Uber Technologies" [ref=e48] [cursor=pointer]:
            - /url: /dossier/uber
          - generic [ref=e49]: —
          - generic [ref=e50]: DOJ disability discrimination lawsuit seeking $125M (September 2025)
          - generic [ref=e51]: (Violation Tracker)
          - generic [ref=e52]: ·
        - generic [ref=e53]:
          - link "Alphabet Inc. (Google)" [ref=e55] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e56]: —
          - generic [ref=e57]: $118M gender discrimination settlement (June 2022)
          - generic [ref=e58]: (OpenSecrets)
          - generic [ref=e59]: ·
        - generic [ref=e60]:
          - link "Amazon" [ref=e62] [cursor=pointer]:
            - /url: /dossier/amazon
          - generic [ref=e63]: —
          - generic [ref=e64]: Wage/hour violations exceeding $100M total (Violation Tracker)
          - generic [ref=e65]: (Reuters)
          - generic [ref=e66]: ·
        - generic [ref=e67]:
          - link "Walmart" [ref=e69] [cursor=pointer]:
            - /url: /dossier/walmart
          - generic [ref=e70]: —
          - generic [ref=e71]: $100M Spark delivery driver settlement (2026, FTC deception)
          - generic [ref=e72]: (Bloomberg)
          - generic [ref=e73]: ·
        - generic [ref=e74]:
          - link "Alphabet Inc. (Google)" [ref=e76] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e77]: —
          - generic [ref=e78]: $50M racial discrimination settlement (May 2025)
          - generic [ref=e79]: (AP News)
          - generic [ref=e80]: ·
        - generic [ref=e81]:
          - link "Microsoft" [ref=e83] [cursor=pointer]:
            - /url: /dossier/microsoft
          - generic [ref=e84]: —
          - generic [ref=e85]: Activision Blizzard acquisition brought $50M gender discrimination settlement (Dec 2023)
          - generic [ref=e86]: (Washington Post)
          - generic [ref=e87]: ·
        - generic [ref=e88]:
          - link "Apple Inc." [ref=e90] [cursor=pointer]:
            - /url: /dossier/apple
          - generic [ref=e91]: —
          - generic [ref=e92]: $30.5M wage/hour class action settlement (2022)
          - generic [ref=e93]: (NLRB)
          - generic [ref=e94]: ·
        - generic [ref=e95]:
          - link "Alphabet Inc. (Google)" [ref=e97] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e98]: —
          - generic [ref=e99]: $28M pay bias settlement (March 2025)
          - generic [ref=e100]: (OSHA)
          - generic [ref=e101]: ·
        - generic [ref=e102]:
          - link "Apple Inc." [ref=e104] [cursor=pointer]:
            - /url: /dossier/apple
          - generic [ref=e105]: —
          - generic [ref=e106]: $25M DOJ employment discrimination settlement (2023) — hiring practices favoring visa workers
          - generic [ref=e107]: (SEC)
          - generic [ref=e108]: ·
        - generic [ref=e109]:
          - link "Goldman Sachs" [ref=e111] [cursor=pointer]:
            - /url: /dossier/goldman-sachs
          - generic [ref=e112]: —
          - generic [ref=e113]: Malaysian 1MDB scandal — DOJ settlement $2.9B (2020) — systemic compliance failure
          - generic [ref=e114]: (NLRB)
          - generic [ref=e115]: ·
        - generic [ref=e116]:
          - link "Starbucks" [ref=e118] [cursor=pointer]:
            - /url: /dossier/starbucks
          - generic [ref=e119]: —
          - generic [ref=e120]: $1B restructuring (2025) — 500+ store closures, 2,000 layoffs
          - generic [ref=e121]: (OSHA)
          - generic [ref=e122]: ·
        - generic [ref=e123]:
          - link "JPMorgan Chase" [ref=e125] [cursor=pointer]:
            - /url: /dossier/jpmorgan-chase
          - generic [ref=e126]: —
          - generic [ref=e127]: $328M crypto scam facilitation lawsuit (2026)
          - generic [ref=e128]: (SEC)
          - generic [ref=e129]: ·
        - generic [ref=e130]:
          - link "Goldman Sachs" [ref=e132] [cursor=pointer]:
            - /url: /dossier/goldman-sachs
          - generic [ref=e133]: —
          - generic [ref=e134]: $215M gender discrimination settlement (2023) — largest in financial services history at the time
          - generic [ref=e135]: (DOJ)
          - generic [ref=e136]: ·
        - generic [ref=e137]:
          - link "JPMorgan Chase" [ref=e139] [cursor=pointer]:
            - /url: /dossier/jpmorgan-chase
          - generic [ref=e140]: —
          - generic [ref=e141]: $151M SEC settlement (Oct 2024) for fiduciary breaches
          - generic [ref=e142]: (FTC)
          - generic [ref=e143]: ·
        - generic [ref=e144]:
          - link "Uber Technologies" [ref=e146] [cursor=pointer]:
            - /url: /dossier/uber
          - generic [ref=e147]: —
          - generic [ref=e148]: DOJ disability discrimination lawsuit seeking $125M (September 2025)
          - generic [ref=e149]: (Violation Tracker)
          - generic [ref=e150]: ·
        - generic [ref=e151]:
          - link "Alphabet Inc. (Google)" [ref=e153] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e154]: —
          - generic [ref=e155]: $118M gender discrimination settlement (June 2022)
          - generic [ref=e156]: (OpenSecrets)
          - generic [ref=e157]: ·
        - generic [ref=e158]:
          - link "Amazon" [ref=e160] [cursor=pointer]:
            - /url: /dossier/amazon
          - generic [ref=e161]: —
          - generic [ref=e162]: Wage/hour violations exceeding $100M total (Violation Tracker)
          - generic [ref=e163]: (Reuters)
          - generic [ref=e164]: ·
        - generic [ref=e165]:
          - link "Walmart" [ref=e167] [cursor=pointer]:
            - /url: /dossier/walmart
          - generic [ref=e168]: —
          - generic [ref=e169]: $100M Spark delivery driver settlement (2026, FTC deception)
          - generic [ref=e170]: (Bloomberg)
          - generic [ref=e171]: ·
        - generic [ref=e172]:
          - link "Alphabet Inc. (Google)" [ref=e174] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e175]: —
          - generic [ref=e176]: $50M racial discrimination settlement (May 2025)
          - generic [ref=e177]: (AP News)
          - generic [ref=e178]: ·
        - generic [ref=e179]:
          - link "Microsoft" [ref=e181] [cursor=pointer]:
            - /url: /dossier/microsoft
          - generic [ref=e182]: —
          - generic [ref=e183]: Activision Blizzard acquisition brought $50M gender discrimination settlement (Dec 2023)
          - generic [ref=e184]: (Washington Post)
          - generic [ref=e185]: ·
        - generic [ref=e186]:
          - link "Apple Inc." [ref=e188] [cursor=pointer]:
            - /url: /dossier/apple
          - generic [ref=e189]: —
          - generic [ref=e190]: $30.5M wage/hour class action settlement (2022)
          - generic [ref=e191]: (NLRB)
          - generic [ref=e192]: ·
        - generic [ref=e193]:
          - link "Alphabet Inc. (Google)" [ref=e195] [cursor=pointer]:
            - /url: /dossier/alphabet-inc-google
          - generic [ref=e196]: —
          - generic [ref=e197]: $28M pay bias settlement (March 2025)
          - generic [ref=e198]: (OSHA)
          - generic [ref=e199]: ·
        - generic [ref=e200]:
          - link "Apple Inc." [ref=e202] [cursor=pointer]:
            - /url: /dossier/apple
          - generic [ref=e203]: —
          - generic [ref=e204]: $25M DOJ employment discrimination settlement (2023) — hiring practices favoring visa workers
          - generic [ref=e205]: (SEC)
          - generic [ref=e206]: ·
    - banner [ref=e207]:
      - link "W? Who Do I WORK FOR ?" [ref=e208] [cursor=pointer]:
        - /url: /
        - generic [ref=e209]:
          - generic [ref=e210]: W?
          - generic [ref=e212]:
            - generic [ref=e213]: Who Do I
            - generic [ref=e214]:
              - generic [ref=e215]: WORK FOR
              - generic [ref=e216]: "?"
      - generic [ref=e217]:
        - img [ref=e218]
        - textbox "Scan a company..." [ref=e221]
      - navigation [ref=e222]:
        - link "Check a Company" [ref=e224] [cursor=pointer]:
          - /url: /offer-check
          - img [ref=e225]
          - text: Check a Company
        - link "The Work Signal" [ref=e230] [cursor=pointer]:
          - /url: /newsletter
          - img [ref=e231]
          - text: The Work Signal
        - button "My Intel" [ref=e237] [cursor=pointer]:
          - img [ref=e238]
          - text: My Intel
        - link "Signals" [ref=e241] [cursor=pointer]:
          - /url: /signal-alerts
          - img [ref=e242]
          - text: Signals
        - button "Career Map" [ref=e249] [cursor=pointer]:
          - img [ref=e250]
          - text: Career Map
          - img [ref=e253]
        - link "Pricing" [ref=e257] [cursor=pointer]:
          - /url: /pricing
          - img [ref=e258]
          - text: Pricing
        - button "···" [ref=e261] [cursor=pointer]:
          - text: ···
          - img [ref=e262]
      - generic [ref=e264]:
        - button "Toggle theme" [ref=e265] [cursor=pointer]:
          - img [ref=e266]
        - button "Sign In" [ref=e272] [cursor=pointer]
        - button "Sign Up" [ref=e273] [cursor=pointer]
        - link "Check a company →" [ref=e274] [cursor=pointer]:
          - /url: /offer-check
    - main [ref=e275]:
      - generic [ref=e277]:
        - generic [ref=e278]:
          - generic [ref=e279]:
            - img [ref=e280]
            - textbox "Search any company. If it's not here yet, we'll add and research it automatically." [ref=e283]
          - button "Search" [ref=e284] [cursor=pointer]
        - generic [ref=e285]:
          - 'link "The Home Depot Retail · GA High Concentration Connected Dots · Pending PAC: $4.2M View full report →" [ref=e286] [cursor=pointer]':
            - /url: /dossier/home-depot
            - generic [ref=e288]:
              - generic [ref=e289]:
                - generic [ref=e290]:
                  - img [ref=e292]
                  - generic [ref=e296]:
                    - heading "The Home Depot" [level=3] [ref=e297]
                    - paragraph [ref=e298]: Retail · GA
                - img [ref=e299]
              - generic [ref=e301]:
                - generic [ref=e302]:
                  - generic [ref=e304]: High Concentration
                  - generic [ref=e306]: Connected Dots · Pending
                - generic [ref=e307]:
                  - generic [ref=e308]: "PAC: $4.2M"
                  - generic [ref=e309]: View full report →
          - link "Chick-fil-A Food & Beverage · GA High Concentration Connected Dots · Pending No PAC spending View full report →" [ref=e310] [cursor=pointer]:
            - /url: /dossier/chick-fil-a
            - generic [ref=e312]:
              - generic [ref=e313]:
                - generic [ref=e314]:
                  - img [ref=e316]
                  - generic [ref=e320]:
                    - heading "Chick-fil-A" [level=3] [ref=e321]
                    - paragraph [ref=e322]: Food & Beverage · GA
                - img [ref=e323]
              - generic [ref=e325]:
                - generic [ref=e326]:
                  - generic [ref=e328]: High Concentration
                  - generic [ref=e330]: Connected Dots · Pending
                - generic [ref=e331]:
                  - generic [ref=e332]: No PAC spending
                  - generic [ref=e333]: View full report →
          - link "Hobby Lobby Retail · OK High Concentration Connected Dots · Pending No PAC spending View full report →" [ref=e334] [cursor=pointer]:
            - /url: /dossier/hobby-lobby
            - generic [ref=e336]:
              - generic [ref=e337]:
                - generic [ref=e338]:
                  - img [ref=e340]
                  - generic [ref=e344]:
                    - heading "Hobby Lobby" [level=3] [ref=e345]
                    - paragraph [ref=e346]: Retail · OK
                - img [ref=e347]
              - generic [ref=e349]:
                - generic [ref=e350]:
                  - generic [ref=e352]: High Concentration
                  - generic [ref=e354]: Connected Dots · Pending
                - generic [ref=e355]:
                  - generic [ref=e356]: No PAC spending
                  - generic [ref=e357]: View full report →
          - 'link "Alphabet (Google) Technology · CA Broad / Low Influence Connected Dots · Pending PAC: $5.1M View full report →" [ref=e358] [cursor=pointer]':
            - /url: /dossier/google
            - generic [ref=e360]:
              - generic [ref=e361]:
                - generic [ref=e362]:
                  - img [ref=e364]
                  - generic [ref=e368]:
                    - heading "Alphabet (Google)" [level=3] [ref=e369]
                    - paragraph [ref=e370]: Technology · CA
                - img [ref=e371]
              - generic [ref=e373]:
                - generic [ref=e374]:
                  - generic [ref=e376]: Broad / Low Influence
                  - generic [ref=e378]: Connected Dots · Pending
                - generic [ref=e379]:
                  - generic [ref=e380]: "PAC: $5.1M"
                  - generic [ref=e381]: View full report →
          - 'link "Walmart Retail · AR Mixed Influence Connected Dots · Pending PAC: $3.8M View full report →" [ref=e382] [cursor=pointer]':
            - /url: /dossier/walmart
            - generic [ref=e384]:
              - generic [ref=e385]:
                - generic [ref=e386]:
                  - img [ref=e388]
                  - generic [ref=e392]:
                    - heading "Walmart" [level=3] [ref=e393]
                    - paragraph [ref=e394]: Retail · AR
                - img [ref=e395]
              - generic [ref=e397]:
                - generic [ref=e398]:
                  - generic [ref=e400]: Mixed Influence
                  - generic [ref=e402]: Connected Dots · Pending
                - generic [ref=e403]:
                  - generic [ref=e404]: "PAC: $3.8M"
                  - generic [ref=e405]: View full report →
          - link "Patagonia Retail / Apparel · CA Broad / Low Influence Connected Dots · Pending No PAC spending View full report →" [ref=e406] [cursor=pointer]:
            - /url: /dossier/patagonia
            - generic [ref=e408]:
              - generic [ref=e409]:
                - generic [ref=e410]:
                  - img [ref=e412]
                  - generic [ref=e416]:
                    - heading "Patagonia" [level=3] [ref=e417]
                    - paragraph [ref=e418]: Retail / Apparel · CA
                - img [ref=e419]
              - generic [ref=e421]:
                - generic [ref=e422]:
                  - generic [ref=e424]: Broad / Low Influence
                  - generic [ref=e426]: Connected Dots · Pending
                - generic [ref=e427]:
                  - generic [ref=e428]: No PAC spending
                  - generic [ref=e429]: View full report →
          - 'link "Koch Industries Conglomerate · KS High Concentration Connected Dots · Pending PAC: $6.2M View full report →" [ref=e430] [cursor=pointer]':
            - /url: /dossier/koch-industries
            - generic [ref=e432]:
              - generic [ref=e433]:
                - generic [ref=e434]:
                  - img [ref=e436]
                  - generic [ref=e440]:
                    - heading "Koch Industries" [level=3] [ref=e441]
                    - paragraph [ref=e442]: Conglomerate · KS
                - img [ref=e443]
              - generic [ref=e445]:
                - generic [ref=e446]:
                  - generic [ref=e448]: High Concentration
                  - generic [ref=e450]: Connected Dots · Pending
                - generic [ref=e451]:
                  - generic [ref=e452]: "PAC: $6.2M"
                  - generic [ref=e453]: View full report →
          - 'link "Costco Retail · WA Broad / Low Influence Connected Dots · Pending PAC: $1.2M View full report →" [ref=e454] [cursor=pointer]':
            - /url: /dossier/costco
            - generic [ref=e456]:
              - generic [ref=e457]:
                - generic [ref=e458]:
                  - img [ref=e460]
                  - generic [ref=e464]:
                    - heading "Costco" [level=3] [ref=e465]
                    - paragraph [ref=e466]: Retail · WA
                - img [ref=e467]
              - generic [ref=e469]:
                - generic [ref=e470]:
                  - generic [ref=e472]: Broad / Low Influence
                  - generic [ref=e474]: Connected Dots · Pending
                - generic [ref=e475]:
                  - generic [ref=e476]: "PAC: $1.2M"
                  - generic [ref=e477]: View full report →
      - button "Check the Receipts" [ref=e478] [cursor=pointer]:
        - img [ref=e479]
      - generic [ref=e482]:
        - generic [ref=e483]:
          - img [ref=e484]
          - paragraph [ref=e486]:
            - text: We use essential cookies for authentication and session management. No third-party tracking cookies are used.
            - link "Privacy Policy" [ref=e487] [cursor=pointer]:
              - /url: /privacy
        - button "Accept" [ref=e488] [cursor=pointer]
    - contentinfo [ref=e489]:
      - generic [ref=e490]:
        - paragraph [ref=e491]: You deserve to know exactly who you work for.
        - generic [ref=e492]:
          - link "Start Your Audit" [ref=e493] [cursor=pointer]:
            - /url: /intelligence-check
            - text: Start Your Audit
            - img [ref=e494]
          - link "Ask Jackye" [ref=e496] [cursor=pointer]:
            - /url: /ask-jackye
      - generic [ref=e497]:
        - generic [ref=e498]:
          - generic [ref=e499]:
            - generic [ref=e500]:
              - generic [ref=e501]: W?
              - generic [ref=e503]:
                - generic [ref=e504]: Who Do I
                - generic [ref=e505]:
                  - generic [ref=e506]: WORK FOR
                  - generic [ref=e507]: "?"
            - generic [ref=e508]: · by Jackye Clayton
          - navigation [ref=e509]:
            - link "Methodology" [ref=e510] [cursor=pointer]:
              - /url: /methodology
            - link "Privacy" [ref=e511] [cursor=pointer]:
              - /url: /privacy
            - link "Terms" [ref=e512] [cursor=pointer]:
              - /url: /terms
            - link "Contact" [ref=e513] [cursor=pointer]:
              - /url: /contact
            - link "Sitemap" [ref=e514] [cursor=pointer]:
              - /url: /site-map
        - paragraph [ref=e515]: Who Do I Work For does not evaluate the content of your mission. We evaluate whether you're living it. Every mission category is verified the same way — against public data, not our opinion. We don't have a bias. We have receipts.
        - paragraph [ref=e516]: © 2026 Who Do I Work For? — Public records only. We connect the dots; you make the call.
```

# Test source

```ts
  21  |       issues.push({ type: "requestfailed(font)", detail: `${req.method()} ${req.url()} (${req.failure()?.errorText ?? "failed"})` });
  22  |       return;
  23  |     }
  24  |     issues.push({ type: "requestfailed", detail: `${req.method()} ${req.url()} (${req.failure()?.errorText ?? "failed"})` });
  25  |   });
  26  | 
  27  |   page.on("response", (res) => {
  28  |     const url = res.url();
  29  |     // Only treat same-origin API/route failures as hard signals.
  30  |     try {
  31  |       const u = new URL(url);
  32  |       if (u.origin !== baseOrigin) return;
  33  |       const status = res.status();
  34  |       if (status >= 500) issues.push({ type: "http>=500", detail: `${status} ${url}` });
  35  |       if (status >= 400 && status < 500 && !u.pathname.endsWith(".png") && !u.pathname.endsWith(".ico"))
  36  |         issues.push({ type: "http4xx", detail: `${status} ${url}` });
  37  |     } catch {
  38  |       // ignore
  39  |     }
  40  |   });
  41  | 
  42  |   return {
  43  |     getIssues: () => issues,
  44  |   };
  45  | }
  46  | 
  47  | async function goAndStabilize(page: import("@playwright/test").Page, path: string) {
  48  |   await page.goto(path, { waitUntil: "domcontentloaded" });
  49  |   // Give client-side router & data fetch a moment.
  50  |   await page.waitForTimeout(1200);
  51  | }
  52  | 
  53  | test.describe("Launch smoke: games + company search", () => {
  54  |   test("home loads without runtime errors", async ({ page, baseURL }) => {
  55  |     const baseOrigin = new URL(baseURL!).origin;
  56  |     const guard = attachRuntimeGuards(page, baseOrigin);
  57  | 
  58  |     await goAndStabilize(page, "/");
  59  |     await expect(page).toHaveTitle(/Who Do I Work For/i);
  60  | 
  61  |     // Basic “not blank” check.
  62  |     await expect(page.getByRole("main").first()).toBeVisible({ timeout: 15_000 });
  63  | 
  64  |     const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
  65  |     expect(issues, `Runtime issues on /:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  66  |   });
  67  | 
  68  |   test("games pages render and allow basic interaction", async ({ page, baseURL }) => {
  69  |     const baseOrigin = new URL(baseURL!).origin;
  70  |     const guard = attachRuntimeGuards(page, baseOrigin);
  71  | 
  72  |     const gamePaths = ["/quiz", "/brand-madness", "/rivalries", "/decision-engine"];
  73  | 
  74  |     for (const p of gamePaths) {
  75  |       await test.step(`open ${p}`, async () => {
  76  |         await goAndStabilize(page, p);
  77  |         // If route is protected, it should land somewhere sensible (often /login).
  78  |         await expect(page).not.toHaveURL(/\/undefined/);
  79  |       });
  80  | 
  81  |       await test.step(`interact on ${p}`, async () => {
  82  |         // Try a couple of “common” CTAs without hard-coding UI specifics.
  83  |         const startLike = page.getByRole("button", { name: /start|begin|play|next|continue/i }).first();
  84  |         if (await startLike.isVisible().catch(() => false)) {
  85  |           await startLike.click();
  86  |           await page.waitForTimeout(800);
  87  |         }
  88  | 
  89  |         const optionLike = page.getByRole("button", { name: /a|b|c|d/i }).first();
  90  |         if (await optionLike.isVisible().catch(() => false)) {
  91  |           await optionLike.click();
  92  |           await page.waitForTimeout(800);
  93  |         }
  94  | 
  95  |         // Not blank.
  96  |         await expect(page.locator("body")).toContainText(/./, { timeout: 10_000 });
  97  |       });
  98  |     }
  99  | 
  100 |     const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
  101 |     expect(issues, `Runtime issues on game routes:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  102 |   });
  103 | 
  104 |   test("company search works (or fails gracefully behind auth)", async ({ page, baseURL }) => {
  105 |     const baseOrigin = new URL(baseURL!).origin;
  106 |     const guard = attachRuntimeGuards(page, baseOrigin);
  107 | 
  108 |     await goAndStabilize(page, "/search");
  109 | 
  110 |     // If redirected to login, consider it “graceful” as long as page renders and no runtime errors.
  111 |     if (page.url().includes("/login")) {
  112 |       await expect(page.getByRole("main").first()).toBeVisible();
  113 |       const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
  114 |       expect(issues, `Runtime issues on auth redirect:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  115 |       return;
  116 |     }
  117 | 
  118 |     const input =
  119 |       page.getByRole("textbox", { name: /search/i }).first().or(page.locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="company" i]').first());
  120 | 
> 121 |     await expect(input).toBeVisible({ timeout: 15_000 });
      |                         ^ Error: expect(locator).toBeVisible() failed
  122 | 
  123 |     for (const q of ["google", "acme"]) {
  124 |       await test.step(`search: ${q}`, async () => {
  125 |         await input.fill(q);
  126 |         await page.keyboard.press("Enter");
  127 |         await page.waitForTimeout(1500);
  128 | 
  129 |         // Either show results, or show an empty-state / request flow; but should not blank/error.
  130 |         await expect(page.locator("body")).not.toContainText(/something went wrong|unexpected error/i);
  131 | 
  132 |         const firstResultLink = page.getByRole("link").filter({ hasText: new RegExp(q, "i") }).first();
  133 |         if (await firstResultLink.isVisible().catch(() => false)) {
  134 |           await firstResultLink.click();
  135 |           await page.waitForTimeout(1200);
  136 |           await expect(page.locator("body")).not.toContainText(/404|not found/i);
  137 |         }
  138 |       });
  139 |     }
  140 | 
  141 |     const issues = guard.getIssues().filter((i) => !i.type.includes("(font)"));
  142 |     expect(issues, `Runtime issues on /search:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
  143 |   });
  144 | });
  145 | 
  146 | 
```