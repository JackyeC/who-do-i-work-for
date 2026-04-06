# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: launch-smoke.spec.ts >> Launch smoke: games + company search >> home loads without runtime errors
- Location: tests/launch-smoke.spec.ts:54:3

# Error details

```
Error: Runtime issues on /:
- requestfailed: HEAD https://tdetybqdxadmowjivtjy.supabase.co/rest/v1/scan_usage?select=id&session_id=eq.0d753820-fbdc-40a2-a49c-f6d9f521f3f6 (net::ERR_ABORTED)
- requestfailed: GET https://logo.clearbit.com/patagonia.com (net::ERR_NAME_NOT_RESOLVED)
- console.error: Failed to load resource: net::ERR_NAME_NOT_RESOLVED

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 14

- Array []
+ Array [
+   Object {
+     "detail": "HEAD https://tdetybqdxadmowjivtjy.supabase.co/rest/v1/scan_usage?select=id&session_id=eq.0d753820-fbdc-40a2-a49c-f6d9f521f3f6 (net::ERR_ABORTED)",
+     "type": "requestfailed",
+   },
+   Object {
+     "detail": "GET https://logo.clearbit.com/patagonia.com (net::ERR_NAME_NOT_RESOLVED)",
+     "type": "requestfailed",
+   },
+   Object {
+     "detail": "Failed to load resource: net::ERR_NAME_NOT_RESOLVED",
+     "type": "console.error",
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - main [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - link "W? Who Do I WORK FOR ?" [ref=e8] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]:
            - generic [ref=e10]: W?
            - generic [ref=e12]:
              - generic [ref=e13]: Who Do I
              - generic [ref=e14]:
                - generic [ref=e15]: WORK FOR
                - generic [ref=e16]: "?"
        - navigation [ref=e17]:
          - link "Intelligence Check" [ref=e18] [cursor=pointer]:
            - /url: /intelligence-check
          - link "How It Works" [ref=e19] [cursor=pointer]:
            - /url: /how-it-works
          - link "Check a Company" [ref=e20] [cursor=pointer]:
            - /url: /offer-check
          - link "About" [ref=e21] [cursor=pointer]:
            - /url: /about
          - link "Methodology" [ref=e22] [cursor=pointer]:
            - /url: /methodology
          - link "Pricing" [ref=e23] [cursor=pointer]:
            - /url: /pricing
        - link "Log in" [ref=e25] [cursor=pointer]:
          - /url: /login
      - generic [ref=e27]:
        - paragraph [ref=e28]: Audit before you say yes
        - heading "Stop applying. Start aligning." [level=1] [ref=e29]:
          - text: Stop applying.
          - text: Start aligning.
        - paragraph [ref=e30]: Every company runs a background check on you. WDIWF flips it. Pull the receipts on politics, enforcement, layoffs, and values from the public record — so you're not guessing about your next move.
        - generic [ref=e32]:
          - generic [ref=e35]:
            - generic [ref=e36]:
              - img [ref=e37]
              - textbox "Search any employer..." [ref=e40]
            - button "Run My Free Scan" [disabled] [ref=e41]:
              - text: Run My Free Scan
              - img [ref=e42]
          - generic [ref=e44]:
            - generic [ref=e45]: "Try:"
            - button "SpaceX" [ref=e46] [cursor=pointer]
            - button "Amazon" [ref=e47] [cursor=pointer]
            - button "Goldman Sachs" [ref=e48] [cursor=pointer]
            - button "Meta" [ref=e49] [cursor=pointer]
        - generic [ref=e50]:
          - button "Check an Employer Before You Apply" [ref=e51] [cursor=pointer]
          - link "See a Real Company Example" [ref=e52] [cursor=pointer]:
            - /url: /dossier/amazon
        - paragraph [ref=e53]: Built on FEC, SEC, OSHA, NLRB, BLS, and more — the public record, not the press release.
      - generic [ref=e54]:
        - generic [ref=e55]:
          - img [ref=e56]
          - generic [ref=e62]: LIVE
        - generic [ref=e63]:
          - button "LABOR A prime minister's statement about being 'on the side of the British p… via Www.gov.uk ·" [ref=e64] [cursor=pointer]:
            - generic [ref=e65]: LABOR
            - generic [ref=e66]: A prime minister's statement about being 'on the side of the British p…
            - generic [ref=e67]: via Www.gov.uk
            - generic [ref=e68]: ·
          - button "LABOR The governor is spending big money to fight the narrative that Califor… via New York Post ·" [ref=e69] [cursor=pointer]:
            - generic [ref=e70]: LABOR
            - generic [ref=e71]: The governor is spending big money to fight the narrative that Califor…
            - generic [ref=e72]: via New York Post
            - generic [ref=e73]: ·
          - button "⚠ LABOR The union postponed the strike, but the workers still voted it down. T… via Mother Jones ·" [ref=e74] [cursor=pointer]:
            - generic [ref=e75]: ⚠ LABOR
            - generic [ref=e76]: The union postponed the strike, but the workers still voted it down. T…
            - generic [ref=e77]: via Mother Jones
            - generic [ref=e78]: ·
          - button "LABOR The headline is a lot, but global supply chain disruption is real. Thi… via Theeconomiccollapseblog.com ·" [ref=e79] [cursor=pointer]:
            - generic [ref=e80]: LABOR
            - generic [ref=e81]: The headline is a lot, but global supply chain disruption is real. Thi…
            - generic [ref=e82]: via Theeconomiccollapseblog.com
            - generic [ref=e83]: ·
          - button "LABOR The New Deal funded artists directly, treating art as public infrastru… via ARTnews ·" [ref=e84] [cursor=pointer]:
            - generic [ref=e85]: LABOR
            - generic [ref=e86]: The New Deal funded artists directly, treating art as public infrastru…
            - generic [ref=e87]: via ARTnews
            - generic [ref=e88]: ·
          - button "LABOR The transcript talks about the impact of AI on the workforce and the n… via CBS News ·" [ref=e89] [cursor=pointer]:
            - generic [ref=e90]: LABOR
            - generic [ref=e91]: The transcript talks about the impact of AI on the workforce and the n…
            - generic [ref=e92]: via CBS News
            - generic [ref=e93]: ·
          - button "LABOR The OECD states gender equality is a 'prerequisite for thriving econom… via Oecd.org ·" [ref=e94] [cursor=pointer]:
            - generic [ref=e95]: LABOR
            - generic [ref=e96]: The OECD states gender equality is a 'prerequisite for thriving econom…
            - generic [ref=e97]: via Oecd.org
            - generic [ref=e98]: ·
          - button "LAYOFFS Luxury brands are seeing consumers tune out their logos. This isn't ab… via Thebespokemarketer.com ·" [ref=e99] [cursor=pointer]:
            - generic [ref=e100]: LAYOFFS
            - generic [ref=e101]: Luxury brands are seeing consumers tune out their logos. This isn't ab…
            - generic [ref=e102]: via Thebespokemarketer.com
            - generic [ref=e103]: ·
          - button "LABOR Roth IRAs are usually a smart move for retirement, but for expats, the… via 24/7 Wall St. ·" [ref=e104] [cursor=pointer]:
            - generic [ref=e105]: LABOR
            - generic [ref=e106]: Roth IRAs are usually a smart move for retirement, but for expats, the…
            - generic [ref=e107]: via 24/7 Wall St.
            - generic [ref=e108]: ·
          - button "LABOR A manager called IT for a system failure report, but it turned out age… via Twistedsifter.com ·" [ref=e109] [cursor=pointer]:
            - generic [ref=e110]: LABOR
            - generic [ref=e111]: A manager called IT for a system failure report, but it turned out age…
            - generic [ref=e112]: via Twistedsifter.com
            - generic [ref=e113]: ·
          - button "LABOR This isn't just a family conflict; it's a labor issue when an employer… via Twistedsifter.com ·" [ref=e114] [cursor=pointer]:
            - generic [ref=e115]: LABOR
            - generic [ref=e116]: This isn't just a family conflict; it's a labor issue when an employer…
            - generic [ref=e117]: via Twistedsifter.com
            - generic [ref=e118]: ·
          - button "LABOR The UK government is prioritizing short-term cost savings over long-te… via BBC News ·" [ref=e119] [cursor=pointer]:
            - generic [ref=e120]: LABOR
            - generic [ref=e121]: The UK government is prioritizing short-term cost savings over long-te…
            - generic [ref=e122]: via BBC News
            - generic [ref=e123]: ·
          - button "LABOR A prime minister's statement about being 'on the side of the British p… via Www.gov.uk ·" [ref=e124] [cursor=pointer]:
            - generic [ref=e125]: LABOR
            - generic [ref=e126]: A prime minister's statement about being 'on the side of the British p…
            - generic [ref=e127]: via Www.gov.uk
            - generic [ref=e128]: ·
          - button "LABOR The governor is spending big money to fight the narrative that Califor… via New York Post ·" [ref=e129] [cursor=pointer]:
            - generic [ref=e130]: LABOR
            - generic [ref=e131]: The governor is spending big money to fight the narrative that Califor…
            - generic [ref=e132]: via New York Post
            - generic [ref=e133]: ·
          - button "⚠ LABOR The union postponed the strike, but the workers still voted it down. T… via Mother Jones ·" [ref=e134] [cursor=pointer]:
            - generic [ref=e135]: ⚠ LABOR
            - generic [ref=e136]: The union postponed the strike, but the workers still voted it down. T…
            - generic [ref=e137]: via Mother Jones
            - generic [ref=e138]: ·
          - button "LABOR The headline is a lot, but global supply chain disruption is real. Thi… via Theeconomiccollapseblog.com ·" [ref=e139] [cursor=pointer]:
            - generic [ref=e140]: LABOR
            - generic [ref=e141]: The headline is a lot, but global supply chain disruption is real. Thi…
            - generic [ref=e142]: via Theeconomiccollapseblog.com
            - generic [ref=e143]: ·
          - button "LABOR The New Deal funded artists directly, treating art as public infrastru… via ARTnews ·" [ref=e144] [cursor=pointer]:
            - generic [ref=e145]: LABOR
            - generic [ref=e146]: The New Deal funded artists directly, treating art as public infrastru…
            - generic [ref=e147]: via ARTnews
            - generic [ref=e148]: ·
          - button "LABOR The transcript talks about the impact of AI on the workforce and the n… via CBS News ·" [ref=e149] [cursor=pointer]:
            - generic [ref=e150]: LABOR
            - generic [ref=e151]: The transcript talks about the impact of AI on the workforce and the n…
            - generic [ref=e152]: via CBS News
            - generic [ref=e153]: ·
          - button "LABOR The OECD states gender equality is a 'prerequisite for thriving econom… via Oecd.org ·" [ref=e154] [cursor=pointer]:
            - generic [ref=e155]: LABOR
            - generic [ref=e156]: The OECD states gender equality is a 'prerequisite for thriving econom…
            - generic [ref=e157]: via Oecd.org
            - generic [ref=e158]: ·
          - button "LAYOFFS Luxury brands are seeing consumers tune out their logos. This isn't ab… via Thebespokemarketer.com ·" [ref=e159] [cursor=pointer]:
            - generic [ref=e160]: LAYOFFS
            - generic [ref=e161]: Luxury brands are seeing consumers tune out their logos. This isn't ab…
            - generic [ref=e162]: via Thebespokemarketer.com
            - generic [ref=e163]: ·
          - button "LABOR Roth IRAs are usually a smart move for retirement, but for expats, the… via 24/7 Wall St. ·" [ref=e164] [cursor=pointer]:
            - generic [ref=e165]: LABOR
            - generic [ref=e166]: Roth IRAs are usually a smart move for retirement, but for expats, the…
            - generic [ref=e167]: via 24/7 Wall St.
            - generic [ref=e168]: ·
          - button "LABOR A manager called IT for a system failure report, but it turned out age… via Twistedsifter.com ·" [ref=e169] [cursor=pointer]:
            - generic [ref=e170]: LABOR
            - generic [ref=e171]: A manager called IT for a system failure report, but it turned out age…
            - generic [ref=e172]: via Twistedsifter.com
            - generic [ref=e173]: ·
          - button "LABOR This isn't just a family conflict; it's a labor issue when an employer… via Twistedsifter.com ·" [ref=e174] [cursor=pointer]:
            - generic [ref=e175]: LABOR
            - generic [ref=e176]: This isn't just a family conflict; it's a labor issue when an employer…
            - generic [ref=e177]: via Twistedsifter.com
            - generic [ref=e178]: ·
          - button "LABOR The UK government is prioritizing short-term cost savings over long-te… via BBC News ·" [ref=e179] [cursor=pointer]:
            - generic [ref=e180]: LABOR
            - generic [ref=e181]: The UK government is prioritizing short-term cost savings over long-te…
            - generic [ref=e182]: via BBC News
            - generic [ref=e183]: ·
      - generic [ref=e185]:
        - generic [ref=e186]:
          - generic [ref=e187]:
            - img [ref=e188]
            - paragraph [ref=e191]: Fully Audited
          - 'heading "Start here: verified employer intelligence" [level=2] [ref=e192]'
          - paragraph [ref=e193]: These companies have complete identity, multi-source claims, and full attribution. Every claim links to a public record.
        - generic [ref=e194]:
          - link "Boeing Aerospace & Defense Audited" [ref=e195] [cursor=pointer]:
            - /url: /company/boeing
            - img [ref=e197]
            - generic [ref=e201]:
              - paragraph [ref=e202]: Boeing
              - paragraph [ref=e203]: Aerospace & Defense
            - generic [ref=e204]:
              - img [ref=e205]
              - text: Audited
          - link "Amazon Technology Audited" [ref=e208] [cursor=pointer]:
            - /url: /company/amazon
            - img [ref=e210]
            - generic [ref=e214]:
              - paragraph [ref=e215]: Amazon
              - paragraph [ref=e216]: Technology
            - generic [ref=e217]:
              - img [ref=e218]
              - text: Audited
          - link "AT&T Telecommunications Audited" [ref=e221] [cursor=pointer]:
            - /url: /company/att
            - img [ref=e223]
            - generic [ref=e227]:
              - paragraph [ref=e228]: AT&T
              - paragraph [ref=e229]: Telecommunications
            - generic [ref=e230]:
              - img [ref=e231]
              - text: Audited
          - link "Verizon Telecommunications Audited" [ref=e234] [cursor=pointer]:
            - /url: /company/verizon
            - img [ref=e236]
            - generic [ref=e240]:
              - paragraph [ref=e241]: Verizon
              - paragraph [ref=e242]: Telecommunications
            - generic [ref=e243]:
              - img [ref=e244]
              - text: Audited
          - link "Google Technology Audited" [ref=e247] [cursor=pointer]:
            - /url: /company/google
            - img [ref=e249]
            - generic [ref=e253]:
              - paragraph [ref=e254]: Google
              - paragraph [ref=e255]: Technology
            - generic [ref=e256]:
              - img [ref=e257]
              - text: Audited
          - link "Microsoft Technology Audited" [ref=e260] [cursor=pointer]:
            - /url: /company/microsoft
            - img [ref=e262]
            - generic [ref=e266]:
              - paragraph [ref=e267]: Microsoft
              - paragraph [ref=e268]: Technology
            - generic [ref=e269]:
              - img [ref=e270]
              - text: Audited
          - link "Patagonia Retail Audited" [ref=e273] [cursor=pointer]:
            - /url: /company/patagonia
            - generic "Click to fetch company logo" [ref=e274]:
              - img [ref=e275]
            - generic [ref=e279]:
              - paragraph [ref=e280]: Patagonia
              - paragraph [ref=e281]: Retail
            - generic [ref=e282]:
              - img [ref=e283]
              - text: Audited
          - link "Meta Platforms Technology Audited" [ref=e286] [cursor=pointer]:
            - /url: /company/meta
            - img [ref=e288]
            - generic [ref=e292]:
              - paragraph [ref=e293]: Meta Platforms
              - paragraph [ref=e294]: Technology
            - generic [ref=e295]:
              - img [ref=e296]
              - text: Audited
          - link "T-Mobile Telecommunications Audited" [ref=e299] [cursor=pointer]:
            - /url: /company/tmobile
            - img [ref=e301]
            - generic [ref=e305]:
              - paragraph [ref=e306]: T-Mobile
              - paragraph [ref=e307]: Telecommunications
            - generic [ref=e308]:
              - img [ref=e309]
              - text: Audited
          - link "Accenture Consulting Audited" [ref=e312] [cursor=pointer]:
            - /url: /company/accenture
            - img [ref=e314]
            - generic [ref=e318]:
              - paragraph [ref=e319]: Accenture
              - paragraph [ref=e320]: Consulting
            - generic [ref=e321]:
              - img [ref=e322]
              - text: Audited
        - link "View all audited companies" [ref=e326] [cursor=pointer]:
          - /url: /browse?filter=fully_audited
          - text: View all audited companies
          - img [ref=e327]
      - generic [ref=e330]:
        - paragraph [ref=e331]: How It Works
        - heading "We say the quiet part out loud." [level=2] [ref=e332]
        - paragraph [ref=e333]: We already looked. You decide what to do next.
        - generic [ref=e334]:
          - link "Coming Soon 01 Define what “good” means Take the quiz. Set your deal-breakers. We build your Dream Job Profile so every match actually means something. Try it" [ref=e335] [cursor=pointer]:
            - /url: /dashboard?tab=profile
            - generic [ref=e336]: Coming Soon
            - generic [ref=e337]: "01"
            - heading "Define what “good” means" [level=3] [ref=e338]
            - paragraph [ref=e339]: Take the quiz. Set your deal-breakers. We build your Dream Job Profile so every match actually means something.
            - generic [ref=e340]:
              - text: Try it
              - img [ref=e341]
          - link "02 Investigate & match Pull the public record on any employer. Political spending, enforcement history, layoff patterns. See what lines up and where the risk is. Try it" [ref=e343] [cursor=pointer]:
            - /url: /browse
            - generic [ref=e344]: "02"
            - heading "Investigate & match" [level=3] [ref=e345]
            - paragraph [ref=e346]: Pull the public record on any employer. Political spending, enforcement history, layoff patterns. See what lines up and where the risk is.
            - generic [ref=e347]:
              - text: Try it
              - img [ref=e348]
          - link "Coming Soon 03 Apply with receipts Track what you sent and why. Auto-apply only moves when you say so. Your dossier travels with your application. Try it" [ref=e350] [cursor=pointer]:
            - /url: /dashboard?tab=tracker
            - generic [ref=e351]: Coming Soon
            - generic [ref=e352]: "03"
            - heading "Apply with receipts" [level=3] [ref=e353]
            - paragraph [ref=e354]: Track what you sent and why. Auto-apply only moves when you say so. Your dossier travels with your application.
            - generic [ref=e355]:
              - text: Try it
              - img [ref=e356]
      - generic [ref=e359]:
        - paragraph [ref=e360]: The Platform
        - heading "Built for the part nobody talks about." [level=2] [ref=e361]
        - paragraph [ref=e362]: The due diligence between "I'm interested" and "I accept." All public record. All yours.
        - generic [ref=e363]:
          - link "Employer Dossiers The full picture on any company. Political spending, enforcement actions, lobbying, leadership moves. Sourced, traceable, no editorializing." [ref=e364] [cursor=pointer]:
            - /url: /browse
            - img [ref=e366]
            - heading "Employer Dossiers" [level=3] [ref=e371]
            - paragraph [ref=e372]: The full picture on any company. Political spending, enforcement actions, lobbying, leadership moves. Sourced, traceable, no editorializing.
          - link "Coming Soon Dream Job Profile Your deal-breakers, your priorities, your definition of good. One profile that drives every match you see." [ref=e373] [cursor=pointer]:
            - /url: /dashboard?tab=profile
            - generic [ref=e374]: Coming Soon
            - img [ref=e376]
            - heading "Dream Job Profile" [level=3] [ref=e380]
            - paragraph [ref=e381]: Your deal-breakers, your priorities, your definition of good. One profile that drives every match you see.
          - link "Coming Soon Jobs Feed & Matching Roles that actually line up with what you said matters. When employer data is thin, we tell you that too." [ref=e382] [cursor=pointer]:
            - /url: /jobs-feed
            - generic [ref=e383]: Coming Soon
            - img [ref=e385]
            - heading "Jobs Feed & Matching" [level=3] [ref=e388]
            - paragraph [ref=e389]: Roles that actually line up with what you said matters. When employer data is thin, we tell you that too.
          - link "Coming Soon Auto-Apply Set your floor. Cap your volume. Nothing goes out without your say-so unless you decide otherwise." [ref=e390] [cursor=pointer]:
            - /url: /auto-apply
            - generic [ref=e391]: Coming Soon
            - img [ref=e393]
            - heading "Auto-Apply" [level=3] [ref=e395]
            - paragraph [ref=e396]: Set your floor. Cap your volume. Nothing goes out without your say-so unless you decide otherwise.
          - link "Coming Soon Applications & Dossiers Track what you sent, when, and why. Post-apply dossiers give you receipts on your own process." [ref=e397] [cursor=pointer]:
            - /url: /dashboard?tab=tracker
            - generic [ref=e398]: Coming Soon
            - img [ref=e400]
            - heading "Applications & Dossiers" [level=3] [ref=e403]
            - paragraph [ref=e404]: Track what you sent, when, and why. Post-apply dossiers give you receipts on your own process.
          - link "Coming Soon Command Center One view. Today's signals, your matches, your applications, and one suggested move. Jackye is one click away." [ref=e405] [cursor=pointer]:
            - /url: /dashboard?tab=overview
            - generic [ref=e406]: Coming Soon
            - img [ref=e408]
            - heading "Command Center" [level=3] [ref=e413]
            - paragraph [ref=e414]: One view. Today's signals, your matches, your applications, and one suggested move. Jackye is one click away.
      - generic [ref=e416]:
        - paragraph [ref=e417]: Know before you go.
        - heading "Your next move deserves receipts." [level=2] [ref=e418]
        - paragraph [ref=e419]: Every company you're considering has a public record. Now you know where to read it.
        - generic [ref=e420]:
          - button "Check an Employer Before You Apply" [ref=e421] [cursor=pointer]
          - button "Ask Jackye" [ref=e422] [cursor=pointer]
        - paragraph [ref=e423]: No spam. No selling your data. That would be ironic.
      - generic [ref=e424]:
        - generic [ref=e426]:
          - generic [ref=e427]:
            - paragraph [ref=e428]: You deserve to know exactly who you work for.
            - paragraph [ref=e429]: Built by Jackye Clayton. Facts over feelings.
          - generic [ref=e430]:
            - link "Run My Free Scan" [ref=e431] [cursor=pointer]:
              - /url: /intelligence-check
              - text: Run My Free Scan
              - img
            - link "Ask Jackye" [ref=e432] [cursor=pointer]:
              - /url: /ask-jackye
        - generic [ref=e434]:
          - generic [ref=e435]:
            - generic [ref=e436]:
              - link "W?" [ref=e437] [cursor=pointer]:
                - /url: /
                - generic [ref=e438]: W?
              - paragraph [ref=e439]: The trust layer for the world of work. Know before you go.
            - generic [ref=e440]:
              - paragraph [ref=e441]: Platform
              - navigation [ref=e442]:
                - link "Home" [ref=e443] [cursor=pointer]:
                  - /url: /
                - link "How It Works" [ref=e444] [cursor=pointer]:
                  - /url: /how-it-works
                - link "Companies" [ref=e445] [cursor=pointer]:
                  - /url: /browse
                - link "The Work Signal" [ref=e446] [cursor=pointer]:
                  - /url: /newsletter
                - link "Quick Check" [ref=e447] [cursor=pointer]:
                  - /url: /check
                - link "Pricing" [ref=e448] [cursor=pointer]:
                  - /url: /pricing
                - link "Work With Jackye" [ref=e449] [cursor=pointer]:
                  - /url: /work-with-jackye
            - generic [ref=e450]:
              - paragraph [ref=e451]: Connect
              - navigation [ref=e452]:
                - link "LinkedIn" [ref=e453] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/jackyeclayton/
                - link "Speaking" [ref=e454] [cursor=pointer]:
                  - /url: https://jackyeclayton.com/speaking
                - link "Inclusive AF Podcast" [ref=e455] [cursor=pointer]:
                  - /url: https://www.inclusiveafpodcast.com
                - link "But First, Coffee" [ref=e456] [cursor=pointer]:
                  - /url: https://wrkdefined.com/podcast/but-first-coffee
                - link "Contact" [ref=e457] [cursor=pointer]:
                  - /url: /contact
                - link "Submit a Tip" [ref=e458] [cursor=pointer]:
                  - /url: /submit-tip
            - generic [ref=e459]:
              - paragraph [ref=e460]: Legal
              - navigation [ref=e461]:
                - link "Privacy Policy" [ref=e462] [cursor=pointer]:
                  - /url: /privacy
                - link "Terms of Service" [ref=e463] [cursor=pointer]:
                  - /url: /terms
                - link "Methodology" [ref=e464] [cursor=pointer]:
                  - /url: /methodology
                - link "Data Ethics" [ref=e465] [cursor=pointer]:
                  - /url: /data-ethics
                - link "About" [ref=e466] [cursor=pointer]:
                  - /url: /about
          - generic [ref=e467]:
            - paragraph [ref=e468]: © 2026 Who Do I Work For. Created by Jackye Clayton · WDIWF
            - paragraph [ref=e469]: "Built on public records: FEC · SEC · BLS · OSHA · NLRB · Senate Lobbying"
    - button "Check the Receipts" [ref=e470] [cursor=pointer]:
      - img [ref=e471]
    - generic [ref=e474]:
      - generic [ref=e475]:
        - img [ref=e476]
        - paragraph [ref=e478]:
          - text: We use essential cookies for authentication and session management. No third-party tracking cookies are used.
          - link "Privacy Policy" [ref=e479] [cursor=pointer]:
            - /url: /privacy
      - button "Accept" [ref=e480] [cursor=pointer]
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
> 65  |     expect(issues, `Runtime issues on /:\n${issues.map((i) => `- ${i.type}: ${i.detail}`).join("\n")}`).toEqual([]);
      |                                                                                                         ^ Error: Runtime issues on /:
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