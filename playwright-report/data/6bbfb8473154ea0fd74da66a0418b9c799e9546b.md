# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: launch-smoke.spec.ts >> Launch smoke: games + company search >> games pages render and allow basic interaction
- Location: tests/launch-smoke.spec.ts:68:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /start|begin|play|next|continue/i }).first()
    - locator resolved to <button disabled class="quiz-focus-ring" aria-label="Go to next question">Next →</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    116 × waiting for element to be visible, enabled and stable
        - element is not enabled
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link "W? Who Do I WORK FOR ?" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]:
          - generic [ref=e7]: W?
          - generic [ref=e9]:
            - generic [ref=e10]: Who Do I
            - generic [ref=e11]:
              - generic [ref=e12]: WORK FOR
              - generic [ref=e13]: "?"
      - generic [ref=e14]:
        - img [ref=e15]
        - textbox "Scan a company..." [ref=e18]
      - navigation [ref=e19]:
        - link "Check a Company" [ref=e21] [cursor=pointer]:
          - /url: /offer-check
          - img [ref=e22]
          - text: Check a Company
        - link "The Work Signal" [ref=e27] [cursor=pointer]:
          - /url: /newsletter
          - img [ref=e28]
          - text: The Work Signal
        - button "My Intel" [ref=e34] [cursor=pointer]:
          - img [ref=e35]
          - text: My Intel
        - link "Signals" [ref=e38] [cursor=pointer]:
          - /url: /signal-alerts
          - img [ref=e39]
          - text: Signals
        - button "Career Map" [ref=e46] [cursor=pointer]:
          - img [ref=e47]
          - text: Career Map
          - img [ref=e50]
        - link "Pricing" [ref=e54] [cursor=pointer]:
          - /url: /pricing
          - img [ref=e55]
          - text: Pricing
        - button "···" [ref=e58] [cursor=pointer]:
          - text: ···
          - img [ref=e59]
      - generic [ref=e61]:
        - button "Toggle theme" [ref=e62] [cursor=pointer]:
          - img [ref=e63]
        - button "Sign In" [ref=e69] [cursor=pointer]
        - button "Sign Up" [ref=e70] [cursor=pointer]
        - link "Check a company →" [ref=e71] [cursor=pointer]:
          - /url: /offer-check
    - main [ref=e72]:
      - generic [ref=e73]:
        - img
        - generic [ref=e74]:
          - generic [ref=e75]: Question 1 of 7
          - 'progressbar "Quiz progress: question 1 of 7" [ref=e76]'
        - generic [ref=e77]:
          - generic [ref=e79]:
            - heading "Why are you looking at this company right now?" [level=2] [ref=e80]
            - radiogroup "Choose one answer" [ref=e81]:
              - radio "I'm considering working there" [ref=e82] [cursor=pointer]
              - radio "I work in recruiting or talent" [ref=e83] [cursor=pointer]
              - radio "I'm researching it — for work, study, or a story" [ref=e84] [cursor=pointer]
              - radio "I work there — or I make decisions there" [ref=e85] [cursor=pointer]
            - button "Go to next question" [disabled] [ref=e87]: Next →
            - button "Already took the quiz? Reset and start over." [ref=e89] [cursor=pointer]
          - generic [ref=e91]:
            - heading "The last time a company disappointed you — what was the thing you missed?" [level=2] [ref=e92]
            - radiogroup "Choose one answer" [ref=e93]:
              - radio "The culture was nothing like what they described" [ref=e94] [cursor=pointer]
              - radio "The stability wasn't there — layoffs, chaos, restructuring" [ref=e95] [cursor=pointer]
              - radio "The leadership didn't reflect the values they claimed" [ref=e96] [cursor=pointer]
              - radio "The numbers didn't add up — comp, growth, ROI" [ref=e97] [cursor=pointer]
            - generic [ref=e98]:
              - button "Go to previous question" [ref=e99] [cursor=pointer]: ← Back
              - button "Go to next question" [disabled] [ref=e100]: Next →
          - generic [ref=e102]:
            - heading "When you research a company, where do you usually start?" [level=2] [ref=e103]
            - radiogroup "Choose one answer" [ref=e104]:
              - radio "Glassdoor, Reddit, employee reviews" [ref=e105] [cursor=pointer]
              - radio "LinkedIn — who works there, who left, who got promoted" [ref=e106] [cursor=pointer]
              - radio "News, lawsuits, regulatory filings" [ref=e107] [cursor=pointer]
              - radio "Their own site, investor relations, annual reports" [ref=e108] [cursor=pointer]
            - generic [ref=e109]:
              - button "Go to previous question" [ref=e110] [cursor=pointer]: ← Back
              - button "Go to next question" [disabled] [ref=e111]: Next →
          - generic [ref=e113]:
            - heading "Have you ever felt like the real decisions at a company were made by a network you couldn't see — and couldn't join?" [level=2] [ref=e114]
            - radiogroup "Choose one answer" [ref=e115]:
              - radio "Yes — and I want to know how to spot it before I commit" [ref=e116] [cursor=pointer]
              - radio "Yes — I've seen it from the inside and it cost people" [ref=e117] [cursor=pointer]
              - radio "I suspect it but I don't know how to verify it" [ref=e118] [cursor=pointer]
              - radio "I want data on this — not just gut feeling" [ref=e119] [cursor=pointer]
            - generic [ref=e120]:
              - button "Go to previous question" [ref=e121] [cursor=pointer]: ← Back
              - button "Go to next question" [disabled] [ref=e122]: Next →
          - generic [ref=e124]:
            - heading "How much do you trust what a company says publicly about itself?" [level=2] [ref=e125]
            - generic [ref=e126]:
              - 'slider "Trust level: Balanced — context matters" [ref=e127]': "50"
              - generic [ref=e128]:
                - generic [ref=e129]: Not at all — I verify everything
                - generic [ref=e130]: Mostly — I give benefit of the doubt
              - paragraph [ref=e131]: Balanced — context matters
            - generic [ref=e132]:
              - button "Go to previous question" [ref=e133] [cursor=pointer]: ← Back
              - button "Go to next question" [disabled] [ref=e134]: Next →
          - generic [ref=e136]:
            - heading "What's riding on getting this right for you?" [level=2] [ref=e137]
            - radiogroup "Choose one answer" [ref=e138]:
              - radio "My next job — I need to make the right call" [ref=e139] [cursor=pointer]
              - radio "My pipeline — I'm selling to or partnering with this company" [ref=e140] [cursor=pointer]
              - radio "My research — I need citation-ready, defensible data" [ref=e141] [cursor=pointer]
              - radio "My organization — I need to know what our talent sees" [ref=e142] [cursor=pointer]
            - generic [ref=e143]:
              - button "Go to previous question" [ref=e144] [cursor=pointer]: ← Back
              - button "Go to next question" [disabled] [ref=e145]: Next →
          - generic [ref=e147]:
            - heading "Would it change your decision about a company if you knew the leadership team mostly hired from the same 3 schools, the same previous company, or their own personal network?" [level=2] [ref=e148]
            - radiogroup "Choose one answer" [ref=e149]:
              - radio "Absolutely — that's a red flag I need to see" [ref=e150] [cursor=pointer]
              - radio "It depends — I'd want to understand the pattern" [ref=e151] [cursor=pointer]
              - radio "Not necessarily — good networks produce good hires" [ref=e152] [cursor=pointer]
              - radio "I want this data regardless — it reveals power structure" [ref=e153] [cursor=pointer]
            - generic [ref=e154]:
              - button "Go to previous question" [ref=e155] [cursor=pointer]: ← Back
              - button "See my profile" [disabled] [ref=e156]
      - button "Check the Receipts" [ref=e158] [cursor=pointer]:
        - img [ref=e159]
      - generic [ref=e162]:
        - generic [ref=e163]:
          - img [ref=e164]
          - paragraph [ref=e166]:
            - text: We use essential cookies for authentication and session management. No third-party tracking cookies are used.
            - link "Privacy Policy" [ref=e167] [cursor=pointer]:
              - /url: /privacy
        - button "Accept" [ref=e168] [cursor=pointer]
    - contentinfo [ref=e169]:
      - generic [ref=e170]:
        - paragraph [ref=e171]: You deserve to know exactly who you work for.
        - generic [ref=e172]:
          - link "Start Your Audit" [ref=e173] [cursor=pointer]:
            - /url: /intelligence-check
            - text: Start Your Audit
            - img [ref=e174]
          - link "Ask Jackye" [ref=e176] [cursor=pointer]:
            - /url: /ask-jackye
      - generic [ref=e177]:
        - generic [ref=e178]:
          - generic [ref=e179]:
            - generic [ref=e180]:
              - generic [ref=e181]: W?
              - generic [ref=e183]:
                - generic [ref=e184]: Who Do I
                - generic [ref=e185]:
                  - generic [ref=e186]: WORK FOR
                  - generic [ref=e187]: "?"
            - generic [ref=e188]: · by Jackye Clayton
          - navigation [ref=e189]:
            - link "Methodology" [ref=e190] [cursor=pointer]:
              - /url: /methodology
            - link "Privacy" [ref=e191] [cursor=pointer]:
              - /url: /privacy
            - link "Terms" [ref=e192] [cursor=pointer]:
              - /url: /terms
            - link "Contact" [ref=e193] [cursor=pointer]:
              - /url: /contact
            - link "Sitemap" [ref=e194] [cursor=pointer]:
              - /url: /site-map
        - paragraph [ref=e195]: Who Do I Work For does not evaluate the content of your mission. We evaluate whether you're living it. Every mission category is verified the same way — against public data, not our opinion. We don't have a bias. We have receipts.
        - paragraph [ref=e196]: © 2026 Who Do I Work For? — Public records only. We connect the dots; you make the call.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | type Issue = { type: string; detail: string };
  4   | 
  5   | function attachRuntimeGuards(page: import("@playwright/test").Page, baseOrigin: string) {
  6   |   const issues: Issue[] = [];
  7   | 
  8   |   page.on("pageerror", (err) => {
  9   |     issues.push({ type: "pageerror", detail: String(err) });
  10  |   });
  11  | 
  12  |   page.on("console", (msg) => {
  13  |     if (msg.type() === "error") issues.push({ type: "console.error", detail: msg.text() });
  14  |   });
  15  | 
  16  |   page.on("requestfailed", (req) => {
  17  |     const u = new URL(req.url());
  18  |     // Fonts often fail in headless runs due to network policies; capture but don't fail the test on them.
  19  |     const isFont = u.hostname.includes("fonts.googleapis.com") || u.hostname.includes("fonts.gstatic.com");
  20  |     if (isFont) {
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
> 85  |           await startLike.click();
      |                           ^ Error: locator.click: Test timeout of 60000ms exceeded.
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
  121 |     await expect(input).toBeVisible({ timeout: 15_000 });
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