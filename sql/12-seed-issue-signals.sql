-- ============================================================================
-- 12-seed-issue-signals.sql
-- Issue signals for the 10 WDIWF Receipts companies
-- 3-5 signals per company, sourced from actual research data
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- META
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Meta spent $24.4M on federal lobbying in 2024 covering AI regulation, content moderation, privacy, and antitrust legislation', 'high', 24400000
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pac_spending', 'fec_filing', 'FEC (C00502906)', 'Meta PAC raised $341,607 in the 2023-24 cycle with bipartisan distribution to federal candidates', 'high', 341607
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Bloomberg / NYT', 'Meta laid off 21,000+ employees during 2022-2023 Year of Efficiency restructuring, eliminating entire teams and flattening management layers', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'government_report', 'FTC / EU DPC', 'History of major privacy enforcement actions including $5B FTC settlement (2019) and multiple EU GDPR fines totaling billions', 'high', 5000000000
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOOGLE (Alphabet Inc.)
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Alphabet spent $14.86M on federal lobbying in 2024 targeting AI regulation, antitrust, and data privacy legislation', 'high', 14860000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'sec_filing', '10-K Annual Report / Bloomberg', 'Google eliminated aspirational diversity hiring goals and removed DEI commitment from 10-K annual report in February 2025 following Trump executive order', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Reuters / The Verge', 'Google cut 25,000+ jobs since January 2023 across hardware, engineering, Cloud, and AI contractor divisions while hiring aggressively for AI roles', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'DoD CDAO / GSA', 'Active federal contractor with $200M DoD CDAO AI/cloud contract (2025), GSA Gemini integration, and Pentagon AI agent development (2026)', 'high', 200000000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'OpenSecrets', 'Google employs former DOJ officials as lobbyists; bipartisan PAC ($1.9M) supports both parties to maintain federal contract eligibility and influence AI/antitrust policy', 'high', 1902225
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AMAZON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Amazon spent $19.14M on federal lobbying in 2024 with 74% of 132 lobbyists being former government officials (revolving door)', 'high', 19140000
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Reuters / Bloomberg', 'Amazon dissolved DEI programs and eliminated hiring quotas in December 2024 — before the January 2025 Trump executive order — removing diversity references from annual report', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WA State WARN Tracker', 'Over 100,000 layoffs since 2022 including WARN Act filings for 2,303 workers (Oct 2025) and 2,198 workers (Jan 2026) in Washington state alone', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'GSA / USASpending', 'AWS holds major federal contracts including GSA contract 47QTCA19D000C and $1B in discounted cloud services to agencies through 2028', 'high', 1000000000
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pac_spending', 'fec_filing', 'FEC (C00360354)', 'Amazon PAC raised $1,583,307 in 2023-24 cycle with slight Democratic lean to candidates (50.56%) but Republican lean to PACs/parties (58.4%)', 'high', 1583307
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MICROSOFT
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Microsoft spent $10.4M on federal lobbying in 2024 with 75% of lobbyists being former government officials working on AI, NDAA, and cloud policy', 'high', 10400000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Bloomberg / The Verge', 'Microsoft removed DEI from performance reviews November 2025 and stopped publishing annual diversity report; eliminated DEI roles in summer 2024', 'high', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WARN Act Database', '55 WARN Act notices filed 2004-2025 affecting 17,000+ workers; 35,000+ total layoffs since 2023 including 6,000 in May 2025 and 9,000 in July 2025', 'high', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'DoD / GSA', 'Major federal contractor holding JWCC DoD cloud contract and GSA OneGov deal valued at $6B+ in savings for agencies (2025-2026)', 'high', 6000000000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'OpenSecrets / Reuters', '13 Biden administration officials were former Microsoft employees; company lobbied 19 specific AI and NDAA bills through revolving door connections', 'high', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BOEING
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'FAA / NTSB', 'Multiple safety incidents including 737 MAX crashes (346 deaths), Alaska Airlines door plug blowout (2024), and ongoing FAA production oversight — systemic safety culture failures documented by NTSB', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WARN Act Database', '593 WARN Act filings from 1990 to April 2025; 17,000 layoffs announced Oct/Nov 2024 representing 10% of workforce including 2,200 in Washington state January 2025', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Bloomberg / Reuters', 'Dismantled entire global DEI department October 2024 with VP Sara Liang Bowen departing Oct 31; remaining DEI programs suspended June 2025', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pac_spending', 'fec_filing', 'FEC (C00142711)', 'Boeing PAC raised $5,420,306 in 2023-24 cycle — largest of any investigated company — with 62% going to Republican candidates and 37% to Democrats', 'high', 5420306
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'DoD / USASpending', 'Active major federal contractor with ~40% of revenue from government; $12.8B DoD contract (Dec 2025) for E-4B and F-15, plus $2.47B KC-46 tanker contract', 'high', 12800000000
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BOOZ ALLEN HAMILTON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Bloomberg / The Hill', 'Closed entire DEI department February 2025 and ended all diversity programs including banning non-birth pronoun usage and bathroom access per agency rules — in response to Trump executive orders to retain federal contracts', 'high', NULL
FROM public.companies WHERE slug = 'booz-allen-hamilton'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Bloomberg / Reuters', 'Laid off 7,400+ workers in 2025-2026: 2,500 in May/June 2025 from civil division, additional rounds in October 2025, and 2,500 in January 2026 after Treasury contract cancellations', 'high', NULL
FROM public.companies WHERE slug = 'booz-allen-hamilton'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'government_report', 'Treasury / DOJ', 'Treasury canceled $21M in contracts January 2026 following data breach by former employee Charles Littlejohn who leaked taxpayer records — following Edward Snowden leak from same company in 2013', 'high', 21000000
FROM public.companies WHERE slug = 'booz-allen-hamilton'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'USASpending / FBI', '98% of revenue comes from US government contracts including $94M FBI contract (2025); lobbied NDAA, DHS/DoD appropriations, and AI legislation', 'high', 9400000000
FROM public.companies WHERE slug = 'booz-allen-hamilton'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'OpenSecrets', '63% of lobbyists in 2024 were former government officials (revolving door) including firms Akin Gump and Innovative Federal Strategies lobbying NDAA and AI bills', 'high', NULL
FROM public.companies WHERE slug = 'booz-allen-hamilton'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ACCENTURE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'sec_filing', 'CEO Memo / Bloomberg', 'CEO Julie Sweet announced sunsetting 2017 global diversity goals February 2025, ending demographic-specific career programs, pausing external diversity surveys, and removing DEI from performance criteria', 'high', NULL
FROM public.companies WHERE slug = 'accenture'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Reuters / Financial Times', 'Cut 50,000+ workers since 2023 with $865M restructuring spend: 19,000 in March 2023 announcement and 22,000+ in 2025 as AI reskilling displaces non-billable staff', 'high', 865000000
FROM public.companies WHERE slug = 'accenture'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'DoD / State Dept', 'Major federal contractor through Accenture Federal Services: $1.6B Air Force Cloud One contract (2024) and $190M State Department PEPFAR contract (2024)', 'high', 1600000000
FROM public.companies WHERE slug = 'accenture'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'OpenSecrets', '57% of lobbyists (32 of 56) in 2024 were former government officials including ex-Rep Robert L. Livingston; spent $2.98M lobbying agriculture, FDA, AI, and cyber bills', 'high', 2980000
FROM public.companies WHERE slug = 'accenture'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIZON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'public_record', 'FCC Filing / Bloomberg', 'Ended all DEI policies effective May 15, 2025 per letter to FCC Chair Brendan Carr: dissolved DEI team, removed diversity from training/websites/marketing, ended diversity bonuses and supplier programs — to secure $20B Frontier merger approval', 'high', NULL
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WARN Act Database', '61 WARN Act notices from 2000-2026 affecting 13,000+ workers; 13,000-15,000 layoffs announced November 2025 (largest in company history); converting retail stores to franchises', 'high', NULL
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Spent $11.38M on federal lobbying in 2024 with 74% of 119 lobbyists being former government officials (revolving door) working on spectrum, privacy, and NDAA legislation', 'high', 11380000
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pac_spending', 'fec_filing', 'FEC (C00186288)', 'Verizon PAC raised $2,296,056 in 2023-24 cycle with near-even bipartisan split: 50.70% Republican and 49.03% Democrat — strategic hedging across both parties', 'high', 2296056
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- T-MOBILE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Bloomberg / The Hill', 'Eliminated DEI roles and teams July 2025 and removed DEI from websites and training materials to secure FCC regulatory approvals amid Trump administration pressure', 'high', NULL
FROM public.companies WHERE slug = 't-mobile'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WARN Act Database', '20+ WARN Act notices filed from 2010-2026 including recent WA filings: 363 workers (2025) and 393 workers (2026) covering IT, sales, and end-user support divisions', 'high', NULL
FROM public.companies WHERE slug = 't-mobile'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Spent approximately $9.5M on federal lobbying in 2024 with 81% of lobbyists being former government officials (revolving door) — highest revolving door rate among telecom peers', 'high', 9500000
FROM public.companies WHERE slug = 't-mobile'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'GSA / Navy', 'Active federal contractor holding GSA contract 47QTCA22D008N and Navy Spiral 4 contract valued at $2.67B over 10 years for military wireless services', 'high', 2670000000
FROM public.companies WHERE slug = 't-mobile'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Reuters / Bloomberg', 'Cut 12,000+ workers since 2023 including 5,000 corporate and tech layoffs in 2023 and ongoing Sprint merger integration job eliminations through 2026', 'high', NULL
FROM public.companies WHERE slug = 't-mobile'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AT&T
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_policy', 'news_report', 'Bloomberg / Reuters', 'Eliminated all DEI roles, training, and quotas December 2025 shifting to merit-based policies in response to legal changes and FCC spectrum deal requirements; began scaling back March 2025', 'high', NULL
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'warn_filing', 'WARN Act Database', '134 total WARN Act filings on historical record with dozens of notices 2022-2026 across AL, FL, CA, and NJ affecting thousands of workers in network and operations divisions', 'high', NULL
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Spent $12.05M on federal lobbying in 2024 focused on spectrum legislation (S.3909, HR.3565) aligned with FCC deals and broadband policy', 'high', 12050000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pac_spending', 'fec_filing', 'FEC (C00109017)', 'AT&T PAC raised $2,440,629 in 2023-24 cycle with slight Republican lean: 53.59% to Republican candidates and 46% to Democrats', 'high', 2440629
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'DHS / USASpending', 'Active major federal contractor with $146M DHS contract for Government Emergency Telecommunications Service (GETS) and Wireless Priority Service (WPS) in 2024', 'high', 146000000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;
