

## Upgrade Employer Post-Payment Onboarding Flow

### What Exists Now

The current `EmployerVerificationPending.tsx` page has:
- 3 steps: Payment Received, Upload Docs, Jackye Review
- A basic file upload form
- A 3-point transparency audit reference
- References $499/yr (needs updating to $599/yr)
- **Missing**: Identity verification step, Connection Chain review step, "Schedule Jackye Audit" call booking, job credit status badge, Founding Partner branding/tone

### What Needs to Change

Upgrade `EmployerVerificationPending.tsx` into the full "Founding Partner Success & Onboarding" experience:

#### 1. Rebrand the Page Header
- Change title to: "Welcome, Founding Partner. You are officially leading the movement for workforce transparency."
- Update price reference from $499/yr to $599/yr
- Add the Gold Shield icon prominently

#### 2. Expand to 4-Step Audit Checklist
| Step | Label | Description | Interaction |
|---|---|---|---|
| 1 | Verify Identity | Confirm account is linked to a corporate email domain | Auto-check against user email |
| 2 | Submit Disclosure Docs | Upload DEI report, ESG statement, or Employee Handbook | Existing file upload (keep) |
| 3 | Review Connection Chain | Review current public-data findings for your company, prepare Official Response | Link to `/follow-the-money` or company profile |
| 4 | Schedule Jackye Audit | Book a 15-min intro call to finalize Certification | External Calendly/booking link button |

#### 3. Add Job Credit Status Badge
- Display: "5 Value-Aligned Job Credits Active" badge card below the checklist
- Pull from `employer_profiles.job_credits` if available, otherwise show static "5"

#### 4. Add Timeline Notice
- Card at bottom: "Your Gold Shield and Job Posts will go live globally within 24 hours of document submission and Jackye's manual review."

#### 5. Update Pricing Reference
- Fix $499 to $599 throughout the page

### Files Changed

| File | Change |
|---|---|
| `src/pages/EmployerVerificationPending.tsx` | Full rewrite of content, 4-step checklist, job credit badge, timeline, branding |

### No Database Changes Required
The existing `employer_profiles` table and `career_docs` storage bucket already support this flow.

