-- Seed issue signals and public stances for existing companies.
-- Run in Supabase SQL Editor as a standalone migration.
-- Uses ON CONFLICT to avoid duplicates when re-run.
-- The "gap" column on company_public_stances has CHECK (gap IN ('aligned','mixed','contradictory')) DEFAULT 'mixed'.

-- ═══════════════════════════════════════════════════════════════════
-- ISSUE SIGNALS
-- Schema: entity_id (FK→companies.id), issue_category, signal_type,
--         source_dataset, description, source_url, confidence_score,
--         amount
-- ═══════════════════════════════════════════════════════════════════

-- Helper: We use a DO block with a temp function to look up company IDs by slug
-- so this file is self-contained.

DO $$
DECLARE
  v_home_depot UUID;
  v_chick_fil_a UUID;
  v_hobby_lobby UUID;
  v_google UUID;
  v_walmart UUID;
  v_patagonia UUID;
  v_koch UUID;
  v_costco UUID;
  v_starbucks UUID;
  v_amazon UUID;
  v_meta UUID;
  v_apple UUID;
  v_jpmorgan UUID;
  v_boeing UUID;
  v_exxon UUID;
  v_disney UUID;
  v_nike UUID;
  v_uber UUID;
  v_tesla UUID;
  v_pfizer UUID;
BEGIN
  -- Look up existing company IDs by slug; NULL if company doesn't exist yet
  SELECT id INTO v_home_depot FROM companies WHERE slug = 'home-depot';
  SELECT id INTO v_chick_fil_a FROM companies WHERE slug = 'chick-fil-a';
  SELECT id INTO v_hobby_lobby FROM companies WHERE slug = 'hobby-lobby';
  SELECT id INTO v_google FROM companies WHERE slug = 'google';
  SELECT id INTO v_walmart FROM companies WHERE slug = 'walmart';
  SELECT id INTO v_patagonia FROM companies WHERE slug = 'patagonia';
  SELECT id INTO v_koch FROM companies WHERE slug = 'koch-industries';
  SELECT id INTO v_costco FROM companies WHERE slug = 'costco';
  SELECT id INTO v_starbucks FROM companies WHERE slug = 'starbucks';
  SELECT id INTO v_amazon FROM companies WHERE slug = 'amazon';
  SELECT id INTO v_meta FROM companies WHERE slug = 'meta';
  SELECT id INTO v_apple FROM companies WHERE slug = 'apple';
  SELECT id INTO v_jpmorgan FROM companies WHERE slug = 'jpmorgan-chase';
  SELECT id INTO v_boeing FROM companies WHERE slug = 'boeing';
  SELECT id INTO v_exxon FROM companies WHERE slug = 'exxon-mobil' ;
  SELECT id INTO v_disney FROM companies WHERE slug = 'disney';
  SELECT id INTO v_nike FROM companies WHERE slug = 'nike';
  SELECT id INTO v_uber FROM companies WHERE slug = 'uber';
  SELECT id INTO v_tesla FROM companies WHERE slug = 'tesla';
  SELECT id INTO v_pfizer FROM companies WHERE slug = 'pfizer';

  -- ─── HOME DEPOT ───────────────────────────────────────────────
  IF v_home_depot IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'Corporate PAC contributed to Republican candidates at 70/30 R/D split', 'high', 4200000),
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC donation to Sen. Ted Cruz campaign committee', 'high', 15000),
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC donation to Sen. Marsha Blackburn', 'high', 12000),
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC donation to Rep. Jim Jordan', 'high', 10000),
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC donation to Sen. Jon Ossoff', 'high', 8000),
    (v_home_depot, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC donation to Rep. Lucy McBath', 'high', 5000),
    (v_home_depot, 'Executive Giving', 'fec_individual', 'FEC', 'Co-founder Bernard Marcus personal donations to Senate Leadership Fund', 'high', 18000000),
    (v_home_depot, 'Executive Giving', 'fec_individual', 'FEC', 'Bernard Marcus donation to Club for Growth', 'high', 7000000),
    (v_home_depot, 'Executive Giving', 'fec_individual', 'FEC', 'Bernard Marcus donation to Republican National Committee', 'high', 5000000),
    (v_home_depot, 'Lobbying', 'lda_filing', 'Senate LDA', 'Federal lobbying on retail regulation, trade policy, and labor law', 'high', 3100000),
    (v_home_depot, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on tax reform and tariff policy', 'high', 850000),
    (v_home_depot, 'Government Contracts', 'usaspending', 'USAspending', 'Federal supply contracts for facilities maintenance', 'high', 450000000),
    (v_home_depot, 'Subsidies', 'state_incentive', 'Good Jobs First', 'State and local tax incentives and subsidies for distribution centers', 'medium', 180000000),
    (v_home_depot, 'DEI', 'public_statement', 'Corporate Reports', 'Publicly committed to DEI initiatives while co-founder funds opposing organizations', 'medium', NULL),
    (v_home_depot, 'Anti-Union', 'nlrb_filing', 'NLRB', 'History of opposing unionization efforts at retail locations', 'medium', NULL),
    (v_home_depot, 'Dark Money', 'irs_990', 'IRS 990', 'Co-founder linked to Club for Growth, a 501(c)(4) that does not fully disclose donors', 'high', 7000000),
    (v_home_depot, 'Revolving Door', 'public_record', 'OpenSecrets', 'Former CEO Craig Menear moved to National Retail Federation board', 'high', NULL),
    (v_home_depot, 'Trade Association', 'membership', 'Public Records', 'Member of National Retail Federation which lobbies on labor and trade policy', 'high', NULL),
    (v_home_depot, 'Trade Association', 'membership', 'Public Records', 'Member of U.S. Chamber of Commerce', 'high', NULL),
    (v_home_depot, 'Project 2025', 'keyword_match', 'Heritage Foundation', 'PAC recipient Sen. Marsha Blackburn supports Project 2025 agenda', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── CHICK-FIL-A ─────────────────────────────────────────────
  IF v_chick_fil_a IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_chick_fil_a, 'Executive Giving', 'fec_individual', 'FEC', 'Chairman Dan Cathy personal donations to National Christian Foundation', 'high', 5000000),
    (v_chick_fil_a, 'Executive Giving', 'fec_individual', 'FEC', 'Dan Cathy donations to Fellowship of Christian Athletes', 'high', 2000000),
    (v_chick_fil_a, 'Executive Giving', 'fec_individual', 'FEC', 'Dan Cathy donations to Focus on the Family', 'high', 1500000),
    (v_chick_fil_a, 'Dark Money', 'irs_990', 'IRS 990', 'National Christian Foundation operates as donor-advised fund obscuring ultimate recipients', 'high', 5000000),
    (v_chick_fil_a, 'LGBTQ+ Rights', 'public_statement', 'Public Records', 'Company stated in 2019 it would stop donating to anti-LGBTQ+ organizations', 'high', NULL),
    (v_chick_fil_a, 'LGBTQ+ Rights', 'irs_990', 'IRS 990', 'Chairman personal giving continues to fund organizations classified as anti-LGBTQ+', 'high', NULL),
    (v_chick_fil_a, 'LGBTQ+ Rights', 'splc_designation', 'SPLC', 'Focus on the Family classified as anti-LGBTQ+ by Southern Poverty Law Center', 'high', NULL),
    (v_chick_fil_a, 'Religious Liberty', 'public_statement', 'Public Records', 'Company frames its business around Christian values and Sunday closures', 'high', NULL),
    (v_chick_fil_a, 'Trade Association', 'membership', 'Public Records', 'Member of National Restaurant Association', 'high', NULL),
    (v_chick_fil_a, 'Labor Practices', 'keyword_match', 'Public Reports', 'Reports of franchise-level wage and labor practice issues', 'low', NULL),
    (v_chick_fil_a, 'Reproductive Rights', 'irs_990', 'IRS 990', 'Foundation giving linked to organizations opposing reproductive healthcare access', 'medium', NULL),
    (v_chick_fil_a, 'Workplace Discrimination', 'legal_filing', 'EEOC', 'Multiple discrimination complaints filed against franchise operators', 'medium', NULL),
    (v_chick_fil_a, 'Political Influence', 'keyword_match', 'OpenSecrets', 'Cathy family among top individual donors to conservative causes nationally', 'high', 8500000),
    (v_chick_fil_a, 'Supply Chain', 'public_report', 'Corporate Reports', 'Animal welfare concerns raised by advocacy organizations', 'low', NULL),
    (v_chick_fil_a, 'Corporate Governance', 'keyword_match', 'Public Records', 'Family-controlled private company with limited external board oversight', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── HOBBY LOBBY ──────────────────────────────────────────────
  IF v_hobby_lobby IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_hobby_lobby, 'Reproductive Rights', 'legal_filing', 'Supreme Court', 'Successfully sued to avoid covering contraceptives (Burwell v. Hobby Lobby, 2014)', 'high', NULL),
    (v_hobby_lobby, 'Reproductive Rights', 'irs_990', 'IRS 990', 'Funds organizations that advocate for further restrictions on reproductive rights', 'high', NULL),
    (v_hobby_lobby, 'Executive Giving', 'fec_individual', 'FEC', 'CEO David Green personal donations to religious and conservative organizations', 'high', 4200000),
    (v_hobby_lobby, 'Executive Giving', 'irs_990', 'IRS 990', 'Green family foundation giving to organizations opposing LGBTQ+ rights', 'high', 2800000),
    (v_hobby_lobby, 'Religious Liberty', 'legal_filing', 'Public Records', 'Landmark Supreme Court case establishing corporate religious exemptions', 'high', NULL),
    (v_hobby_lobby, 'LGBTQ+ Rights', 'splc_designation', 'SPLC', 'CEO donations go to organizations classified as anti-LGBTQ+ by civil rights watchdogs', 'high', NULL),
    (v_hobby_lobby, 'Dark Money', 'irs_990', 'IRS 990', 'Donations flow through family foundation to opaque 501(c)(4) organizations', 'medium', 3500000),
    (v_hobby_lobby, 'Cultural Artifacts', 'legal_filing', 'DOJ', 'Company fined $3M for smuggling Iraqi cultural artifacts (2017)', 'high', 3000000),
    (v_hobby_lobby, 'Cultural Artifacts', 'legal_filing', 'DOJ', 'Returned thousands of smuggled artifacts including cuneiform tablets', 'high', NULL),
    (v_hobby_lobby, 'Museum of the Bible', 'public_record', 'Public Records', 'Green family founded Museum of the Bible in Washington DC', 'high', NULL),
    (v_hobby_lobby, 'Labor Practices', 'keyword_match', 'Public Reports', 'Starting wage historically below industry average for retail', 'medium', NULL),
    (v_hobby_lobby, 'Healthcare', 'legal_filing', 'Public Records', 'Employee healthcare plans exclude contraceptive coverage per court ruling', 'high', NULL),
    (v_hobby_lobby, 'Corporate Governance', 'keyword_match', 'Public Records', 'Privately held, family-controlled corporation with no external oversight', 'high', NULL),
    (v_hobby_lobby, 'Political Influence', 'keyword_match', 'OpenSecrets', 'Green family among top donors to evangelical and conservative political causes', 'high', NULL),
    (v_hobby_lobby, 'Supply Chain', 'public_report', 'Public Reports', 'Products sourced from countries with poor labor standards', 'low', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── GOOGLE (Alphabet) ────────────────────────────────────────
  IF v_google IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_google, 'PAC Spending', 'fec_disbursement', 'FEC', 'Google NetPAC contributes to both parties with 55/45 D/R split', 'high', 5800000),
    (v_google, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC contributions to House Energy and Commerce Committee members', 'high', 420000),
    (v_google, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC contributions to Senate Commerce Committee members', 'high', 380000),
    (v_google, 'Lobbying', 'lda_filing', 'Senate LDA', 'Among the top corporate lobbying spenders in the United States', 'high', 13000000),
    (v_google, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on AI regulation, Section 230, and antitrust policy', 'high', 5200000),
    (v_google, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying against strict data privacy regulations', 'high', 3800000),
    (v_google, 'Antitrust', 'legal_filing', 'DOJ', 'DOJ antitrust case alleging illegal monopoly in search and advertising', 'high', NULL),
    (v_google, 'Antitrust', 'legal_filing', 'DOJ', 'Found guilty of maintaining illegal monopoly in search (2024 ruling)', 'high', NULL),
    (v_google, 'Data Privacy', 'legal_filing', 'FTC', 'Multiple privacy violation settlements and fines globally', 'high', 391500000),
    (v_google, 'Data Privacy', 'keyword_match', 'Public Records', 'Lobbies heavily against strict privacy regulations despite public support for privacy', 'high', NULL),
    (v_google, 'Climate', 'public_statement', 'Corporate Reports', 'Committed to carbon-free energy by 2030', 'high', NULL),
    (v_google, 'Climate', 'keyword_match', 'Public Records', 'Member of Chamber of Commerce which has opposed climate legislation', 'medium', NULL),
    (v_google, 'Trade Association', 'membership', 'Public Records', 'Member of U.S. Chamber of Commerce', 'high', NULL),
    (v_google, 'Trade Association', 'membership', 'Public Records', 'Member of Internet Association (now TechNet)', 'high', NULL),
    (v_google, 'AI Ethics', 'public_statement', 'Corporate Reports', 'Published AI Principles but faced employee protests over military AI contracts', 'medium', NULL),
    (v_google, 'Government Contracts', 'usaspending', 'USAspending', 'Federal cloud computing and technology services contracts', 'high', 2800000000),
    (v_google, 'Labor Practices', 'nlrb_filing', 'NLRB', 'NLRB complaints related to employee terminations after organizing activities', 'medium', NULL),
    (v_google, 'Labor Practices', 'keyword_match', 'Public Reports', 'Significant layoffs affecting 12,000+ employees in 2023', 'high', NULL),
    (v_google, 'Tax Policy', 'public_report', 'Tax Foundation', 'Complex international tax structure utilized to reduce effective tax rate', 'medium', NULL),
    (v_google, 'Executive Compensation', 'sec_filing', 'SEC', 'CEO compensation package among highest in tech industry', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── WALMART ──────────────────────────────────────────────────
  IF v_walmart IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_walmart, 'PAC Spending', 'fec_disbursement', 'FEC', 'Walmart PAC is one of the largest corporate PACs in the US', 'high', 6500000),
    (v_walmart, 'PAC Spending', 'fec_disbursement', 'FEC', 'PAC spending split approximately 60/40 Republican/Democrat', 'high', 6500000),
    (v_walmart, 'Executive Giving', 'fec_individual', 'FEC', 'Walton family personal political donations', 'high', 15000000),
    (v_walmart, 'Executive Giving', 'fec_individual', 'FEC', 'Jim Walton donations to conservative candidates and PACs', 'high', 4200000),
    (v_walmart, 'Executive Giving', 'fec_individual', 'FEC', 'Alice Walton donations including school choice advocacy', 'high', 3500000),
    (v_walmart, 'Lobbying', 'lda_filing', 'Senate LDA', 'Federal lobbying on trade policy, labor law, and retail regulation', 'high', 8200000),
    (v_walmart, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying against federal minimum wage increase legislation', 'high', 2100000),
    (v_walmart, 'Government Contracts', 'usaspending', 'USAspending', 'Federal supply and procurement contracts', 'high', 890000000),
    (v_walmart, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Cumulative state and local subsidies for stores and distribution centers', 'high', 1200000000),
    (v_walmart, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Extensive history of opposing unionization efforts at stores', 'high', NULL),
    (v_walmart, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Multiple NLRB complaints related to union-busting activities', 'high', NULL),
    (v_walmart, 'Labor Practices', 'keyword_match', 'Public Reports', 'Wages historically below living wage in many markets', 'high', NULL),
    (v_walmart, 'Labor Practices', 'legal_filing', 'Court Records', 'Multiple class-action wage theft and discrimination lawsuits', 'high', NULL),
    (v_walmart, 'Sustainability', 'public_statement', 'Corporate Reports', 'Project Gigaton emissions reduction commitment', 'high', NULL),
    (v_walmart, 'Sustainability', 'keyword_match', 'Public Records', 'Member of trade associations that have opposed climate legislation', 'medium', NULL),
    (v_walmart, 'Gender Discrimination', 'legal_filing', 'Supreme Court', 'Dukes v. Walmart class-action sex discrimination case (2011)', 'high', NULL),
    (v_walmart, 'Trade Association', 'membership', 'Public Records', 'Member of National Retail Federation', 'high', NULL),
    (v_walmart, 'Trade Association', 'membership', 'Public Records', 'Member of U.S. Chamber of Commerce', 'high', NULL),
    (v_walmart, 'Gun Policy', 'public_statement', 'Public Records', 'Removed certain firearms and ammunition from stores after mass shootings', 'high', NULL),
    (v_walmart, 'Healthcare', 'keyword_match', 'Public Reports', 'Significant number of employees rely on Medicaid and public assistance', 'medium', NULL),
    (v_walmart, 'Supply Chain', 'public_report', 'Public Reports', 'Ongoing supply chain labor standards concerns in global sourcing', 'medium', NULL),
    (v_walmart, 'Opioid Crisis', 'legal_filing', 'DOJ', 'Settlement with DOJ over pharmacy role in opioid crisis', 'high', 3100000000),
    (v_walmart, 'Dark Money', 'irs_990', 'IRS 990', 'Walton Family Foundation supports school choice and charter school expansion', 'high', 600000000),
    (v_walmart, 'Revolving Door', 'public_record', 'OpenSecrets', 'Multiple former government officials on lobbying team', 'medium', NULL),
    (v_walmart, 'Tax Policy', 'public_report', 'ITEP', 'Effective tax rate lower than statutory rate through various deductions', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── PATAGONIA ────────────────────────────────────────────────
  IF v_patagonia IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_patagonia, 'Climate', 'public_statement', 'Corporate Reports', 'Company mission: "We''re in business to save our home planet"', 'high', NULL),
    (v_patagonia, 'Climate', 'public_statement', 'Corporate Reports', 'Transferred ownership to environmental nonprofit Holdfast Collective', 'high', NULL),
    (v_patagonia, 'Climate', 'irs_990', 'IRS 990', 'All profits donated to environmental nonprofits through ownership structure', 'high', NULL),
    (v_patagonia, 'Executive Giving', 'fec_individual', 'FEC', 'CEO donations focused on environmental conservation organizations', 'high', 50000),
    (v_patagonia, 'Labor Practices', 'public_statement', 'Corporate Reports', 'Certified B Corporation with strong labor and environmental standards', 'high', NULL),
    (v_patagonia, 'Labor Practices', 'public_statement', 'Corporate Reports', 'On-site childcare and family-friendly workplace policies', 'high', NULL),
    (v_patagonia, 'Supply Chain', 'public_report', 'Corporate Reports', 'Published supply chain transparency reports with factory audits', 'high', NULL),
    (v_patagonia, 'Supply Chain', 'public_report', 'Corporate Reports', 'Fair Trade Certified sewing for many product lines', 'high', NULL),
    (v_patagonia, 'Political Activism', 'public_statement', 'Public Records', 'Sued the Trump administration over Bears Ears monument reduction', 'high', NULL),
    (v_patagonia, 'Political Activism', 'public_statement', 'Public Records', 'Donated $10M tax cut savings to environmental groups', 'high', 10000000),
    (v_patagonia, 'Sustainability', 'public_statement', 'Corporate Reports', 'Worn Wear program promotes product repair over replacement', 'high', NULL),
    (v_patagonia, 'Sustainability', 'public_statement', 'Corporate Reports', '1% for the Planet founding member', 'high', NULL),
    (v_patagonia, 'Corporate Governance', 'public_record', 'Public Records', 'Ownership transferred to Patagonia Purpose Trust and Holdfast Collective', 'high', NULL),
    (v_patagonia, 'Voting Rights', 'public_statement', 'Public Records', 'Closed stores on Election Day to encourage employee voting', 'high', NULL),
    (v_patagonia, 'Environmental Grants', 'irs_990', 'Corporate Reports', 'Annual environmental grants program funding grassroots organizations', 'high', 20000000)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── KOCH INDUSTRIES ──────────────────────────────────────────
  IF v_koch IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_koch, 'PAC Spending', 'fec_disbursement', 'FEC', 'KOCHPAC contributions overwhelmingly to Republican candidates', 'high', 3200000),
    (v_koch, 'Executive Giving', 'fec_individual', 'FEC', 'Koch family personal donations to conservative causes and candidates', 'high', 25000000),
    (v_koch, 'Dark Money', 'irs_990', 'IRS 990', 'Koch network of organizations spent $400M+ on elections and policy advocacy', 'high', 400000000),
    (v_koch, 'Dark Money', 'irs_990', 'IRS 990', 'Americans for Prosperity (Koch-founded) is a major 501(c)(4) political operation', 'high', 100000000),
    (v_koch, 'Dark Money', 'irs_990', 'IRS 990', 'Stand Together (formerly Koch Seminar Network) coordinates donor conferences', 'high', NULL),
    (v_koch, 'Lobbying', 'lda_filing', 'Senate LDA', 'Among the top corporate lobbying spenders on energy, environment, and tax policy', 'high', 12000000),
    (v_koch, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying against EPA regulations and climate legislation', 'high', 5000000),
    (v_koch, 'Climate', 'public_report', 'Public Reports', 'Spent billions opposing climate legislation and funding climate skepticism', 'high', NULL),
    (v_koch, 'Climate', 'keyword_match', 'Academic Research', 'Major funder of organizations questioning climate science consensus', 'high', NULL),
    (v_koch, 'Climate', 'public_statement', 'Corporate Reports', 'Has acknowledged need for energy innovation publicly', 'medium', NULL),
    (v_koch, 'Criminal Justice Reform', 'public_statement', 'Public Records', 'Funded bipartisan criminal justice reform through Stand Together', 'high', NULL),
    (v_koch, 'Deregulation', 'keyword_match', 'Public Records', 'Major funder of organizations promoting deregulation across sectors', 'high', NULL),
    (v_koch, 'Anti-Union', 'keyword_match', 'Public Records', 'Koch network funds organizations opposing union protections', 'high', NULL),
    (v_koch, 'Trade Association', 'membership', 'Public Records', 'Major funder of American Legislative Exchange Council (ALEC)', 'high', NULL),
    (v_koch, 'Trade Association', 'membership', 'Public Records', 'Connected to Cato Institute (co-founded by Charles Koch)', 'high', NULL),
    (v_koch, 'Environmental Violations', 'legal_filing', 'EPA', 'History of environmental violations and fines from Koch Industries subsidiaries', 'high', 30000000),
    (v_koch, 'Environmental Violations', 'legal_filing', 'EPA', 'Koch subsidiary fined for 300+ oil spills across multiple states', 'high', NULL),
    (v_koch, 'Revolving Door', 'public_record', 'OpenSecrets', 'Koch network recruits from government agencies and Congressional staff', 'high', NULL),
    (v_koch, 'Education Policy', 'irs_990', 'IRS 990', 'Koch foundations fund university programs promoting free-market economics', 'high', 200000000),
    (v_koch, 'Tax Policy', 'keyword_match', 'Public Records', 'Major lobbying force behind the 2017 Tax Cuts and Jobs Act', 'high', NULL),
    (v_koch, 'Healthcare', 'keyword_match', 'Public Records', 'Koch network spent heavily to oppose the Affordable Care Act', 'high', NULL),
    (v_koch, 'Project 2025', 'keyword_match', 'Heritage Foundation', 'Koch-affiliated organizations have connections to Heritage Foundation policy network', 'medium', NULL),
    (v_koch, 'Voter Suppression', 'public_report', 'Brennan Center', 'AFP has advocated for voter ID laws criticized as suppressive by civil rights groups', 'medium', NULL),
    (v_koch, 'Corporate Governance', 'keyword_match', 'Public Records', 'Privately held — minimal public financial disclosure', 'high', NULL),
    (v_koch, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Koch subsidiaries have received significant state and federal subsidies', 'medium', 195000000)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── COSTCO ───────────────────────────────────────────────────
  IF v_costco IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_costco, 'PAC Spending', 'fec_disbursement', 'FEC', 'Costco PAC is modest relative to company size, leans slightly Democrat', 'high', 1200000),
    (v_costco, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on trade, retail, and healthcare policy', 'high', 1800000),
    (v_costco, 'Labor Practices', 'public_statement', 'Corporate Reports', 'Known for above-average wages and benefits for retail industry', 'high', NULL),
    (v_costco, 'Labor Practices', 'public_statement', 'Corporate Reports', 'Starting wage significantly above federal minimum', 'high', NULL),
    (v_costco, 'Labor Practices', 'public_statement', 'Corporate Reports', 'Provides healthcare benefits to part-time employees', 'high', NULL),
    (v_costco, 'Sustainability', 'public_statement', 'Corporate Reports', 'Committed to reducing packaging waste and carbon footprint', 'medium', NULL),
    (v_costco, 'Supply Chain', 'public_report', 'Corporate Reports', 'Kirkland brand supply chain transparency initiatives', 'medium', NULL),
    (v_costco, 'Trade Association', 'membership', 'Public Records', 'Member of National Retail Federation', 'high', NULL),
    (v_costco, 'DEI', 'public_statement', 'Corporate Reports', 'Board voted to maintain DEI programs despite activist pressure', 'high', NULL),
    (v_costco, 'DEI', 'sec_filing', 'SEC', 'Shareholders overwhelmingly voted to support DEI initiatives (98%)', 'high', NULL),
    (v_costco, 'Executive Compensation', 'sec_filing', 'SEC', 'CEO compensation lower relative to peers in retail industry', 'high', NULL),
    (v_costco, 'Corporate Governance', 'sec_filing', 'SEC', 'Strong shareholder engagement and board independence', 'high', NULL),
    (v_costco, 'Animal Welfare', 'public_report', 'Advocacy Groups', 'Cage-free egg commitment and animal welfare standards', 'medium', NULL),
    (v_costco, 'Healthcare', 'public_statement', 'Corporate Reports', 'Comprehensive employee healthcare including vision and dental', 'high', NULL),
    (v_costco, 'Employee Retention', 'public_report', 'Public Reports', 'Employee turnover significantly lower than retail industry average', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── STARBUCKS ────────────────────────────────────────────────
  IF v_starbucks IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_starbucks, 'PAC Spending', 'fec_disbursement', 'FEC', 'Starbucks PAC contributions split roughly evenly between parties', 'high', 820000),
    (v_starbucks, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on food safety, trade policy, and labor regulation', 'high', 2400000),
    (v_starbucks, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Over 100 NLRB complaints filed related to union-busting activities', 'high', NULL),
    (v_starbucks, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Allegations of retaliatory firings of union organizers', 'high', NULL),
    (v_starbucks, 'Anti-Union', 'legal_filing', 'NLRB', 'NLRB ordered reinstatement of fired workers at multiple locations', 'high', NULL),
    (v_starbucks, 'Labor Practices', 'keyword_match', 'Public Reports', 'Workers United union campaign organizing hundreds of stores', 'high', NULL),
    (v_starbucks, 'Labor Practices', 'public_statement', 'Corporate Reports', 'Offers benefits including tuition coverage and healthcare to part-time workers', 'high', NULL),
    (v_starbucks, 'DEI', 'public_statement', 'Corporate Reports', 'Comprehensive DEI commitments including racial equity goals', 'high', NULL),
    (v_starbucks, 'DEI', 'keyword_match', 'Public Reports', 'Closed stores for racial bias training after Philadelphia incident', 'high', NULL),
    (v_starbucks, 'Climate', 'public_statement', 'Corporate Reports', 'Committed to 50% reduction in carbon emissions by 2030', 'high', NULL),
    (v_starbucks, 'Supply Chain', 'public_report', 'Corporate Reports', 'C.A.F.E. Practices supply chain verification program', 'high', NULL),
    (v_starbucks, 'Healthcare', 'public_statement', 'Corporate Reports', 'Historically progressive healthcare benefits including for part-time workers', 'high', NULL),
    (v_starbucks, 'Executive Compensation', 'sec_filing', 'SEC', 'New CEO Brian Niccol compensation package exceeding $100M', 'high', NULL),
    (v_starbucks, 'Trade Association', 'membership', 'Public Records', 'Member of National Restaurant Association', 'high', NULL),
    (v_starbucks, 'Israel-Palestine', 'public_statement', 'Public Records', 'Sued Workers United over social media post on Israel-Palestine conflict', 'high', NULL),
    (v_starbucks, 'Community Impact', 'public_statement', 'Corporate Reports', 'Community store program in underserved neighborhoods', 'medium', NULL),
    (v_starbucks, 'Workplace Safety', 'osha_filing', 'OSHA', 'Worker safety complaints at multiple locations related to staffing', 'medium', NULL),
    (v_starbucks, 'Government Contracts', 'usaspending', 'USAspending', 'Military base and government facility food service contracts', 'medium', 45000000),
    (v_starbucks, 'Tax Policy', 'public_report', 'ITEP', 'International tax structure scrutinized in European markets', 'medium', NULL),
    (v_starbucks, 'Revolving Door', 'public_record', 'OpenSecrets', 'Former government officials on government affairs team', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── AMAZON ───────────────────────────────────────────────────
  IF v_amazon IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_amazon, 'PAC Spending', 'fec_disbursement', 'FEC', 'Amazon PAC contributions split between both parties', 'high', 4500000),
    (v_amazon, 'Lobbying', 'lda_filing', 'Senate LDA', 'Among the top corporate lobbying spenders in the US', 'high', 21000000),
    (v_amazon, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on antitrust, labor, tax, and technology regulation', 'high', 8000000),
    (v_amazon, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Aggressive anti-union campaigns at warehouse facilities', 'high', NULL),
    (v_amazon, 'Anti-Union', 'nlrb_filing', 'NLRB', 'NLRB found Amazon violated labor law in Bessemer, AL union vote', 'high', NULL),
    (v_amazon, 'Labor Practices', 'osha_filing', 'OSHA', 'High warehouse injury rates significantly above industry average', 'high', NULL),
    (v_amazon, 'Labor Practices', 'keyword_match', 'Public Reports', 'Worker surveillance and productivity monitoring controversies', 'high', NULL),
    (v_amazon, 'Government Contracts', 'usaspending', 'USAspending', 'AWS holds massive federal cloud computing contracts including CIA', 'high', 10000000000),
    (v_amazon, 'Government Contracts', 'usaspending', 'USAspending', 'NSA cloud computing infrastructure contract', 'high', 10000000000),
    (v_amazon, 'Tax Policy', 'public_report', 'ITEP', 'Paid zero federal income tax in 2017 and 2018 on billions in profits', 'high', NULL),
    (v_amazon, 'Antitrust', 'legal_filing', 'FTC', 'FTC antitrust lawsuit alleging anti-competitive marketplace practices', 'high', NULL),
    (v_amazon, 'Data Privacy', 'legal_filing', 'FTC', 'Ring doorbell privacy violations and FTC settlement', 'high', 5800000),
    (v_amazon, 'Data Privacy', 'legal_filing', 'FTC', 'Alexa children''s privacy violations and COPPA settlement', 'high', 25000000),
    (v_amazon, 'Climate', 'public_statement', 'Corporate Reports', 'Climate Pledge co-founder targeting net-zero carbon by 2040', 'high', NULL),
    (v_amazon, 'Climate', 'public_report', 'Public Reports', 'Carbon footprint continues to grow with expanding operations', 'medium', NULL),
    (v_amazon, 'Facial Recognition', 'public_statement', 'Public Records', 'Rekognition technology sold to law enforcement agencies', 'high', NULL),
    (v_amazon, 'Subsidies', 'state_incentive', 'Good Jobs First', 'HQ2 received billions in state and local incentives', 'high', 3000000000),
    (v_amazon, 'Executive Giving', 'fec_individual', 'FEC', 'Jeff Bezos personal political and media investments', 'high', NULL),
    (v_amazon, 'Workplace Safety', 'osha_filing', 'OSHA', 'OSHA citations for unsafe working conditions in warehouses', 'high', NULL),
    (v_amazon, 'Supply Chain', 'public_report', 'Public Reports', 'Third-party seller and delivery partner labor concerns', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── META (Facebook) ──────────────────────────────────────────
  IF v_meta IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_meta, 'PAC Spending', 'fec_disbursement', 'FEC', 'Meta PAC contributions to both parties', 'high', 2800000),
    (v_meta, 'Lobbying', 'lda_filing', 'Senate LDA', 'Heavy lobbying on content moderation, privacy, and antitrust', 'high', 19000000),
    (v_meta, 'Data Privacy', 'legal_filing', 'FTC', 'FTC record $5B fine for Cambridge Analytica privacy violations', 'high', 5000000000),
    (v_meta, 'Data Privacy', 'legal_filing', 'EU', 'EU GDPR fines totaling over $1B', 'high', 1300000000),
    (v_meta, 'Antitrust', 'legal_filing', 'FTC', 'FTC antitrust lawsuit alleging monopoly in social media', 'high', NULL),
    (v_meta, 'Mental Health', 'public_report', 'Internal Docs', 'Internal research showed Instagram harmful to teen mental health', 'high', NULL),
    (v_meta, 'Content Moderation', 'keyword_match', 'Public Reports', 'Ongoing challenges with misinformation, hate speech, and election interference', 'high', NULL),
    (v_meta, 'Content Moderation', 'public_statement', 'Public Records', 'Shift away from third-party fact-checking to community notes model', 'high', NULL),
    (v_meta, 'DEI', 'public_statement', 'Corporate Reports', 'Rolled back DEI programs and diversity targets in 2025', 'high', NULL),
    (v_meta, 'Executive Giving', 'fec_individual', 'FEC', 'Mark Zuckerberg donated $400M to election administration (2020)', 'high', 400000000),
    (v_meta, 'Labor Practices', 'keyword_match', 'Public Reports', 'Major layoffs affecting 20,000+ employees in 2022-2023', 'high', NULL),
    (v_meta, 'Content Moderator Welfare', 'legal_filing', 'Court Records', 'Lawsuits over PTSD and working conditions for content moderators', 'high', NULL),
    (v_meta, 'Surveillance', 'keyword_match', 'Public Reports', 'Platform used for government surveillance in authoritarian countries', 'medium', NULL),
    (v_meta, 'Tax Policy', 'public_report', 'ITEP', 'International tax structure funneling profits through Ireland', 'medium', NULL),
    (v_meta, 'AI Ethics', 'public_statement', 'Corporate Reports', 'Open-source AI model releases (LLaMA) with safety debates', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── APPLE ────────────────────────────────────────────────────
  IF v_apple IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_apple, 'PAC Spending', 'fec_disbursement', 'FEC', 'Apple does not operate a corporate PAC — rare among Big Tech', 'high', 0),
    (v_apple, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on tech regulation, privacy, and trade policy', 'high', 9800000),
    (v_apple, 'Tax Policy', 'legal_filing', 'EU', 'EU ordered $15.8B in back taxes from Ireland (overturned and re-appealed)', 'high', 15800000000),
    (v_apple, 'Tax Policy', 'public_report', 'Senate Report', 'Senate investigation found Apple used offshore entities to avoid US taxes', 'high', NULL),
    (v_apple, 'Supply Chain', 'public_report', 'Public Reports', 'Labor conditions at Foxconn and other suppliers in China', 'high', NULL),
    (v_apple, 'Supply Chain', 'public_report', 'Corporate Reports', 'Published annual supplier responsibility reports', 'high', NULL),
    (v_apple, 'Data Privacy', 'public_statement', 'Corporate Reports', 'Privacy positioned as core product differentiator', 'high', NULL),
    (v_apple, 'Data Privacy', 'public_statement', 'Public Records', 'Resisted FBI request to unlock San Bernardino shooter''s iPhone', 'high', NULL),
    (v_apple, 'China Relations', 'keyword_match', 'Public Reports', 'Removed VPN apps and encrypted messaging from China App Store', 'high', NULL),
    (v_apple, 'China Relations', 'keyword_match', 'Public Reports', 'Manufacturing dependency on China for majority of products', 'high', NULL),
    (v_apple, 'Antitrust', 'legal_filing', 'DOJ', 'DOJ antitrust lawsuit over App Store monopoly practices', 'high', NULL),
    (v_apple, 'Antitrust', 'legal_filing', 'EU', 'EU Digital Markets Act compliance requirements', 'high', NULL),
    (v_apple, 'Right to Repair', 'public_statement', 'Public Records', 'Historically opposed right-to-repair legislation before partially reversing', 'high', NULL),
    (v_apple, 'Climate', 'public_statement', 'Corporate Reports', 'Carbon neutral for corporate operations; targeting full supply chain by 2030', 'high', NULL),
    (v_apple, 'Labor Practices', 'nlrb_filing', 'NLRB', 'Retail store unionization efforts and company responses', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── JPMORGAN CHASE ───────────────────────────────────────────
  IF v_jpmorgan IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_jpmorgan, 'PAC Spending', 'fec_disbursement', 'FEC', 'Among the largest bank PACs in the US, bipartisan giving', 'high', 5200000),
    (v_jpmorgan, 'Lobbying', 'lda_filing', 'Senate LDA', 'Extensive lobbying on financial regulation and banking policy', 'high', 11000000),
    (v_jpmorgan, 'Executive Giving', 'fec_individual', 'FEC', 'CEO Jamie Dimon personal political contributions', 'high', 150000),
    (v_jpmorgan, 'Government Contracts', 'usaspending', 'USAspending', 'Federal financial services and banking contracts', 'high', 500000000),
    (v_jpmorgan, 'Financial Misconduct', 'legal_filing', 'DOJ', 'Billions in fines for mortgage fraud related to 2008 financial crisis', 'high', 13000000000),
    (v_jpmorgan, 'Financial Misconduct', 'legal_filing', 'CFTC', 'Precious metals and treasury market spoofing fines', 'high', 920000000),
    (v_jpmorgan, 'Jeffrey Epstein', 'legal_filing', 'Court Records', 'Settlement over ties to Jeffrey Epstein banking relationship', 'high', 365000000),
    (v_jpmorgan, 'Fossil Fuels', 'public_report', 'Rainforest Action', 'Largest global financier of fossil fuel projects', 'high', NULL),
    (v_jpmorgan, 'Fossil Fuels', 'public_statement', 'Corporate Reports', 'Net-zero by 2050 commitment while continuing fossil fuel financing', 'high', NULL),
    (v_jpmorgan, 'DEI', 'public_statement', 'Corporate Reports', 'Major DEI and racial equity commitments post-2020', 'high', NULL),
    (v_jpmorgan, 'Revolving Door', 'public_record', 'OpenSecrets', 'Multiple former government regulators on advisory teams', 'high', NULL),
    (v_jpmorgan, 'Anti-ESG', 'keyword_match', 'Public Records', 'Navigating political tensions around ESG investing standards', 'medium', NULL),
    (v_jpmorgan, 'Deregulation', 'keyword_match', 'Public Records', 'Lobbied for rollback of Dodd-Frank financial regulations', 'high', NULL),
    (v_jpmorgan, 'Money Laundering', 'legal_filing', 'OCC', 'Compliance failures related to anti-money laundering controls', 'medium', NULL),
    (v_jpmorgan, 'Executive Compensation', 'sec_filing', 'SEC', 'CEO Jamie Dimon among highest-paid bank executives', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── BOEING ───────────────────────────────────────────────────
  IF v_boeing IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_boeing, 'PAC Spending', 'fec_disbursement', 'FEC', 'Boeing PAC among largest defense sector PACs', 'high', 3800000),
    (v_boeing, 'Lobbying', 'lda_filing', 'Senate LDA', 'Heavy lobbying on defense spending, FAA regulation, and trade', 'high', 14000000),
    (v_boeing, 'Government Contracts', 'usaspending', 'USAspending', 'Among the largest federal defense and NASA contractors', 'high', 25000000000),
    (v_boeing, 'Safety', 'legal_filing', 'DOJ', '737 MAX crashes killing 346 people led to DOJ investigation', 'high', NULL),
    (v_boeing, 'Safety', 'legal_filing', 'DOJ', 'Deferred prosecution agreement and $2.5B settlement for 737 MAX fraud', 'high', 2500000000),
    (v_boeing, 'Safety', 'faa_filing', 'FAA', 'Door plug blowout on 737-9 MAX led to renewed FAA scrutiny (2024)', 'high', NULL),
    (v_boeing, 'Whistleblower Retaliation', 'keyword_match', 'Public Reports', 'Multiple whistleblowers raised safety concerns; some died under suspicious circumstances', 'high', NULL),
    (v_boeing, 'Quality Control', 'faa_filing', 'FAA', 'FAA production limits imposed due to quality control failures', 'high', NULL),
    (v_boeing, 'Revolving Door', 'public_record', 'OpenSecrets', 'Extensive revolving door with DoD and FAA officials', 'high', NULL),
    (v_boeing, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Billions in state tax breaks for manufacturing facilities', 'high', 8700000000),
    (v_boeing, 'Labor Practices', 'keyword_match', 'Public Reports', 'Machinists union strike over wages and pension issues', 'high', NULL),
    (v_boeing, 'Executive Compensation', 'sec_filing', 'SEC', 'Executive bonuses despite safety failures drew shareholder criticism', 'high', NULL),
    (v_boeing, 'Defense Spending', 'usaspending', 'USAspending', 'Major weapons systems including fighter jets and satellites', 'high', 15000000000),
    (v_boeing, 'Trade Association', 'membership', 'Public Records', 'Leading member of Aerospace Industries Association', 'high', NULL),
    (v_boeing, 'Corporate Governance', 'sec_filing', 'SEC', 'Board oversight failures in safety governance', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── EXXON MOBIL ──────────────────────────────────────────────
  IF v_exxon IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_exxon, 'PAC Spending', 'fec_disbursement', 'FEC', 'ExxonMobil PAC contributions heavily favor Republican candidates', 'high', 2900000),
    (v_exxon, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on energy policy, climate regulation, and taxation', 'high', 12000000),
    (v_exxon, 'Climate', 'public_report', 'Academic Research', 'Internal scientists accurately predicted climate change in the 1970s while publicly denying it', 'high', NULL),
    (v_exxon, 'Climate', 'legal_filing', 'State AGs', 'Multiple state attorney general investigations for climate fraud', 'high', NULL),
    (v_exxon, 'Climate', 'public_report', 'Public Reports', 'Funded climate denial organizations for decades', 'high', NULL),
    (v_exxon, 'Climate', 'keyword_match', 'Public Records', 'Now acknowledges climate change but opposes aggressive regulation', 'high', NULL),
    (v_exxon, 'Lobbying', 'keyword_match', 'Public Records', 'Lobbyist caught on camera describing influence tactics (2021)', 'high', NULL),
    (v_exxon, 'Dark Money', 'irs_990', 'IRS 990', 'Funded American Petroleum Institute and other industry groups opposing climate policy', 'high', NULL),
    (v_exxon, 'Environmental Violations', 'legal_filing', 'EPA', 'Exxon Valdez oil spill — one of the worst environmental disasters in US history', 'high', NULL),
    (v_exxon, 'Government Contracts', 'usaspending', 'USAspending', 'Federal fuel and energy supply contracts', 'high', 1200000000),
    (v_exxon, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Receives significant fossil fuel subsidies and tax breaks', 'high', 5000000000),
    (v_exxon, 'Anti-ESG', 'keyword_match', 'Public Records', 'Sued activist investors trying to force climate action on board', 'high', NULL),
    (v_exxon, 'Trade Association', 'membership', 'Public Records', 'American Petroleum Institute leading member', 'high', NULL),
    (v_exxon, 'Revolving Door', 'public_record', 'OpenSecrets', 'Former Secretary of State Rex Tillerson was ExxonMobil CEO', 'high', NULL),
    (v_exxon, 'Executive Compensation', 'sec_filing', 'SEC', 'Executive compensation among highest in energy sector', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── DISNEY ───────────────────────────────────────────────────
  IF v_disney IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_disney, 'PAC Spending', 'fec_disbursement', 'FEC', 'Disney PAC contributions to both parties', 'high', 2100000),
    (v_disney, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on copyright extension, media regulation, and tax policy', 'high', 6500000),
    (v_disney, 'LGBTQ+ Rights', 'public_statement', 'Public Records', 'Opposed Florida "Don''t Say Gay" bill after initial silence', 'high', NULL),
    (v_disney, 'LGBTQ+ Rights', 'legal_filing', 'Florida', 'Lost special tax district in battle with Florida Gov. DeSantis', 'high', NULL),
    (v_disney, 'DEI', 'public_statement', 'Corporate Reports', 'Diversity and inclusion commitments in content and hiring', 'high', NULL),
    (v_disney, 'DEI', 'keyword_match', 'Public Reports', 'Conservative backlash over inclusion efforts in entertainment content', 'medium', NULL),
    (v_disney, 'Labor Practices', 'keyword_match', 'Public Reports', 'Theme park workers report low wages relative to cost of living', 'high', NULL),
    (v_disney, 'Copyright', 'keyword_match', 'Public Records', 'Decades of lobbying to extend copyright protections (Mickey Mouse Act)', 'high', NULL),
    (v_disney, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Reedy Creek special tax district and Florida tax benefits', 'high', 580000000),
    (v_disney, 'China Relations', 'keyword_match', 'Public Reports', 'Filmed near Uyghur detention camps for Mulan (thanked Xinjiang authorities)', 'high', NULL),
    (v_disney, 'Executive Compensation', 'sec_filing', 'SEC', 'CEO compensation packages criticized by shareholders and unions', 'high', NULL),
    (v_disney, 'Trade Association', 'membership', 'Public Records', 'Member of Motion Picture Association of America', 'high', NULL),
    (v_disney, 'Revolving Door', 'public_record', 'OpenSecrets', 'Former government officials in government affairs roles', 'medium', NULL),
    (v_disney, 'Content Moderation', 'keyword_match', 'Public Reports', 'Navigating political pressure on content from both left and right', 'medium', NULL),
    (v_disney, 'Tax Policy', 'public_report', 'ITEP', 'International tax structure to minimize global tax burden', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── NIKE ─────────────────────────────────────────────────────
  IF v_nike IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_nike, 'PAC Spending', 'fec_disbursement', 'FEC', 'Nike PAC contributions split between both parties', 'high', 680000),
    (v_nike, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on trade policy, tariffs, and labor standards', 'high', 2200000),
    (v_nike, 'Supply Chain', 'public_report', 'Public Reports', 'Historical sweatshop labor concerns in Asian manufacturing', 'high', NULL),
    (v_nike, 'Supply Chain', 'public_report', 'Corporate Reports', 'Published supplier factory list and audit reports', 'high', NULL),
    (v_nike, 'Supply Chain', 'keyword_match', 'Public Reports', 'Ongoing forced labor concerns in Chinese supply chain', 'medium', NULL),
    (v_nike, 'Political Activism', 'public_statement', 'Public Records', 'Colin Kaepernick campaign supporting racial justice', 'high', NULL),
    (v_nike, 'Gender Discrimination', 'legal_filing', 'Court Records', 'Workplace gender discrimination lawsuits and settlements', 'high', NULL),
    (v_nike, 'Tax Policy', 'public_report', 'ITEP', 'Bermuda subsidiary tax structure scrutinized', 'medium', NULL),
    (v_nike, 'Climate', 'public_statement', 'Corporate Reports', 'Move to Zero campaign targeting zero carbon and zero waste', 'high', NULL),
    (v_nike, 'DEI', 'public_statement', 'Corporate Reports', 'Racial equity commitments including $140M fund', 'high', 140000000),
    (v_nike, 'Labor Practices', 'keyword_match', 'Public Reports', 'Oregon HQ workplace culture concerns raised by employees', 'medium', NULL),
    (v_nike, 'Executive Compensation', 'sec_filing', 'SEC', 'Significant executive pay packages relative to factory worker wages', 'high', NULL),
    (v_nike, 'China Relations', 'keyword_match', 'Public Reports', 'Navigating tensions between human rights stance and China market dependence', 'medium', NULL),
    (v_nike, 'Uyghur Labor', 'public_report', 'ASPI', 'Listed in reports about potential forced Uyghur labor in supply chain', 'medium', NULL),
    (v_nike, 'Greenwashing', 'keyword_match', 'Public Reports', 'Sustainability marketing scrutinized against actual environmental impact', 'low', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── UBER ─────────────────────────────────────────────────────
  IF v_uber IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_uber, 'PAC Spending', 'fec_disbursement', 'FEC', 'Uber PAC contributions to both parties', 'high', 1500000),
    (v_uber, 'Lobbying', 'lda_filing', 'Senate LDA', 'Lobbying on gig worker classification, ride-sharing regulation', 'high', 8500000),
    (v_uber, 'Labor Practices', 'legal_filing', 'Court Records', 'Extensive litigation over driver classification as contractors vs employees', 'high', NULL),
    (v_uber, 'Labor Practices', 'public_report', 'Public Reports', 'Proposition 22 campaign spent $200M+ to keep drivers as contractors', 'high', 200000000),
    (v_uber, 'Labor Practices', 'keyword_match', 'Public Reports', 'Drivers report declining pay and increasing costs', 'high', NULL),
    (v_uber, 'Safety', 'public_report', 'Corporate Reports', 'Thousands of reported sexual assault incidents involving riders', 'high', NULL),
    (v_uber, 'Corporate Culture', 'keyword_match', 'Public Reports', 'History of toxic workplace culture under former CEO Kalanick', 'high', NULL),
    (v_uber, 'Data Privacy', 'legal_filing', 'FTC', 'Covered up 2016 data breach affecting 57M users', 'high', NULL),
    (v_uber, 'Data Privacy', 'legal_filing', 'Court Records', 'Former security chief convicted for covering up data breach', 'high', NULL),
    (v_uber, 'Tax Policy', 'public_report', 'Public Reports', 'Complex corporate structure to minimize tax burden', 'medium', NULL),
    (v_uber, 'Regulatory Evasion', 'keyword_match', 'Uber Files', 'Uber Files leak revealed aggressive lobbying and regulatory circumvention', 'high', NULL),
    (v_uber, 'Climate', 'public_statement', 'Corporate Reports', 'Zero-emissions platform target by 2040', 'medium', NULL),
    (v_uber, 'Executive Compensation', 'sec_filing', 'SEC', 'Significant stock-based executive compensation packages', 'high', NULL),
    (v_uber, 'Surge Pricing', 'keyword_match', 'Public Reports', 'Surge pricing during emergencies and disasters draws criticism', 'medium', NULL),
    (v_uber, 'Anti-Competition', 'keyword_match', 'Public Reports', 'Predatory pricing strategies to eliminate taxi competition', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── TESLA ────────────────────────────────────────────────────
  IF v_tesla IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_tesla, 'Executive Giving', 'fec_individual', 'FEC', 'CEO Elon Musk donated $277M to pro-Trump America PAC', 'high', 277000000),
    (v_tesla, 'Executive Giving', 'fec_individual', 'FEC', 'Musk became a major political figure aligned with Republican causes', 'high', NULL),
    (v_tesla, 'DOGE', 'keyword_match', 'Public Records', 'Musk leads Department of Government Efficiency (DOGE) under Trump administration', 'high', NULL),
    (v_tesla, 'Labor Practices', 'nlrb_filing', 'NLRB', 'NLRB found Tesla violated labor law by prohibiting union organizing', 'high', NULL),
    (v_tesla, 'Labor Practices', 'osha_filing', 'OSHA', 'Above-average workplace injury rates at Fremont factory', 'high', NULL),
    (v_tesla, 'Racial Discrimination', 'legal_filing', 'EEOC', 'EEOC lawsuit alleging widespread racial harassment at Fremont plant', 'high', NULL),
    (v_tesla, 'Racial Discrimination', 'legal_filing', 'Court Records', 'Jury awarded $3.2M to Black employee in discrimination case', 'high', 3200000),
    (v_tesla, 'Autopilot Safety', 'legal_filing', 'NHTSA', 'Multiple NHTSA investigations into Autopilot-related crashes and deaths', 'high', NULL),
    (v_tesla, 'Autopilot Safety', 'keyword_match', 'Public Reports', 'Allegations of misleading marketing of Full Self-Driving capabilities', 'high', NULL),
    (v_tesla, 'Subsidies', 'state_incentive', 'Good Jobs First', 'Billions in government EV subsidies, tax credits, and state incentives', 'high', 5000000000),
    (v_tesla, 'Climate', 'public_statement', 'Corporate Reports', 'Core mission to accelerate transition to sustainable energy', 'high', NULL),
    (v_tesla, 'China Relations', 'keyword_match', 'Public Reports', 'Major manufacturing presence and market dependence in China', 'high', NULL),
    (v_tesla, 'Corporate Governance', 'sec_filing', 'SEC', 'SEC sued Musk over misleading tweets about taking Tesla private', 'high', 40000000),
    (v_tesla, 'DEI', 'keyword_match', 'Public Reports', 'Dissolved DEI team and removed diversity language from reports', 'high', NULL),
    (v_tesla, 'Anti-Union', 'nlrb_filing', 'NLRB', 'Musk personally threatened workers would lose stock options if they unionized', 'high', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── PFIZER ───────────────────────────────────────────────────
  IF v_pfizer IS NOT NULL THEN
    INSERT INTO issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount) VALUES
    (v_pfizer, 'PAC Spending', 'fec_disbursement', 'FEC', 'Pfizer PAC among the largest pharmaceutical company PACs', 'high', 4200000),
    (v_pfizer, 'Lobbying', 'lda_filing', 'Senate LDA', 'Extensive lobbying on drug pricing, FDA regulation, and patent policy', 'high', 11000000),
    (v_pfizer, 'Drug Pricing', 'keyword_match', 'Public Reports', 'Regular above-inflation price increases on popular drugs', 'high', NULL),
    (v_pfizer, 'Drug Pricing', 'keyword_match', 'Public Records', 'Lobbied against Medicare drug price negotiation provisions', 'high', NULL),
    (v_pfizer, 'Legal Settlements', 'legal_filing', 'DOJ', 'Largest healthcare fraud settlement in history ($2.3B) for off-label promotion', 'high', 2300000000),
    (v_pfizer, 'COVID-19', 'public_statement', 'Corporate Reports', 'Developed one of the first authorized COVID-19 vaccines with BioNTech', 'high', NULL),
    (v_pfizer, 'COVID-19', 'keyword_match', 'Public Reports', 'Charged premium pricing for COVID vaccine to governments worldwide', 'medium', NULL),
    (v_pfizer, 'Patent Policy', 'keyword_match', 'Public Records', 'Opposed TRIPS waiver for COVID vaccine patents in developing countries', 'high', NULL),
    (v_pfizer, 'Government Contracts', 'usaspending', 'USAspending', 'Federal vaccine and pharmaceutical supply contracts', 'high', 7500000000),
    (v_pfizer, 'Revolving Door', 'public_record', 'OpenSecrets', 'Former FDA officials in advisory and lobbying roles', 'high', NULL),
    (v_pfizer, 'Trade Association', 'membership', 'Public Records', 'Leading member of PhRMA industry lobbying group', 'high', NULL),
    (v_pfizer, 'Executive Compensation', 'sec_filing', 'SEC', 'CEO compensation increased significantly during pandemic', 'high', NULL),
    (v_pfizer, 'Opioid Crisis', 'keyword_match', 'Public Reports', 'Pharmaceutical industry role in opioid crisis under scrutiny', 'low', NULL),
    (v_pfizer, 'Clinical Trials', 'keyword_match', 'Public Reports', 'Ethics concerns about clinical trials in developing nations', 'medium', NULL),
    (v_pfizer, 'Tax Policy', 'public_report', 'ITEP', 'International corporate structure to reduce effective tax rate', 'medium', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;


-- ═══════════════════════════════════════════════════════════════════
-- PUBLIC STANCES
-- Schema: company_id (FK→companies.id), topic, public_position,
--         spending_reality, gap (CHECK: 'aligned'/'mixed'/'contradictory', DEFAULT 'mixed')
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_home_depot UUID;
  v_chick_fil_a UUID;
  v_hobby_lobby UUID;
  v_google UUID;
  v_walmart UUID;
  v_patagonia UUID;
  v_koch UUID;
  v_costco UUID;
  v_starbucks UUID;
  v_amazon UUID;
  v_meta UUID;
  v_apple UUID;
  v_jpmorgan UUID;
  v_boeing UUID;
  v_exxon UUID;
  v_disney UUID;
  v_nike UUID;
  v_uber UUID;
  v_tesla UUID;
  v_pfizer UUID;
BEGIN
  SELECT id INTO v_home_depot FROM companies WHERE slug = 'home-depot';
  SELECT id INTO v_chick_fil_a FROM companies WHERE slug = 'chick-fil-a';
  SELECT id INTO v_hobby_lobby FROM companies WHERE slug = 'hobby-lobby';
  SELECT id INTO v_google FROM companies WHERE slug = 'google';
  SELECT id INTO v_walmart FROM companies WHERE slug = 'walmart';
  SELECT id INTO v_patagonia FROM companies WHERE slug = 'patagonia';
  SELECT id INTO v_koch FROM companies WHERE slug = 'koch-industries';
  SELECT id INTO v_costco FROM companies WHERE slug = 'costco';
  SELECT id INTO v_starbucks FROM companies WHERE slug = 'starbucks';
  SELECT id INTO v_amazon FROM companies WHERE slug = 'amazon';
  SELECT id INTO v_meta FROM companies WHERE slug = 'meta';
  SELECT id INTO v_apple FROM companies WHERE slug = 'apple';
  SELECT id INTO v_jpmorgan FROM companies WHERE slug = 'jpmorgan-chase';
  SELECT id INTO v_boeing FROM companies WHERE slug = 'boeing';
  SELECT id INTO v_exxon FROM companies WHERE slug = 'exxon-mobil';
  SELECT id INTO v_disney FROM companies WHERE slug = 'disney';
  SELECT id INTO v_nike FROM companies WHERE slug = 'nike';
  SELECT id INTO v_uber FROM companies WHERE slug = 'uber';
  SELECT id INTO v_tesla FROM companies WHERE slug = 'tesla';
  SELECT id INTO v_pfizer FROM companies WHERE slug = 'pfizer';

  -- ─── HOME DEPOT ───
  IF v_home_depot IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_home_depot, 'Diversity & Inclusion', 'Publicly committed to DEI initiatives and diverse hiring', 'Co-founder actively funds organizations opposing DEI policies', 'contradictory'),
    (v_home_depot, 'Labor Rights', 'States commitment to employee development and fair treatment', 'Lobbies against minimum wage increases; opposes unionization', 'contradictory'),
    (v_home_depot, 'Climate & Environment', 'Promotes sustainability initiatives and energy-efficient products', 'Member of U.S. Chamber of Commerce which has opposed climate legislation', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── CHICK-FIL-A ───
  IF v_chick_fil_a IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_chick_fil_a, 'LGBTQ+ Rights', 'Stated in 2019 it would stop donating to anti-LGBTQ+ organizations', 'Chairman personal and family foundation giving continues to fund organizations opposing LGBTQ+ rights', 'contradictory'),
    (v_chick_fil_a, 'Community Engagement', 'Promotes community involvement and charitable giving', 'Charitable giving historically directed to organizations with exclusionary policies', 'mixed'),
    (v_chick_fil_a, 'Employee Treatment', 'Known for employee training and development programs', 'Franchise model limits corporate control over individual store labor practices', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── HOBBY LOBBY ───
  IF v_hobby_lobby IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_hobby_lobby, 'Reproductive Rights', 'Sued government to avoid covering contraceptives (Burwell v. Hobby Lobby, 2014)', 'Funds organizations that advocate for further restrictions on reproductive rights', 'aligned'),
    (v_hobby_lobby, 'Religious Liberty', 'Publicly frames business around Christian values', 'CEO donations go to organizations classified as anti-LGBTQ+ by civil rights watchdogs', 'aligned'),
    (v_hobby_lobby, 'Cultural Preservation', 'Founded Museum of the Bible to celebrate religious heritage', 'Fined $3M for smuggling Iraqi cultural artifacts illegally', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── GOOGLE ───
  IF v_google IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_google, 'Climate', 'Committed to carbon-free energy by 2030', 'Member of Chamber of Commerce which has opposed climate legislation', 'mixed'),
    (v_google, 'Data Privacy', 'Supports responsible privacy frameworks', 'Lobbies heavily against strict privacy regulations', 'contradictory'),
    (v_google, 'AI Ethics', 'Published AI Principles committing to responsible development', 'Faced employee protests over military AI contracts; fired AI ethics researchers', 'contradictory'),
    (v_google, 'Antitrust', 'Claims to compete fairly in open markets', 'Found guilty of illegal monopoly maintenance in search', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── WALMART ───
  IF v_walmart IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_walmart, 'Wages & Labor', 'Raised minimum wage to $14/hr, promotes advancement opportunities', 'Lobbies against federal minimum wage increases and has opposed unionization efforts', 'contradictory'),
    (v_walmart, 'Sustainability', 'Project Gigaton emissions reduction commitment', 'Member of trade associations that have opposed climate legislation', 'mixed'),
    (v_walmart, 'Gun Safety', 'Removed certain firearms and ammunition after mass shootings', 'PAC continues to donate to candidates opposing gun control', 'mixed'),
    (v_walmart, 'Community Investment', 'Promotes local community investment and charitable giving', 'Many employees rely on public assistance due to low wages', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── PATAGONIA ───
  IF v_patagonia IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_patagonia, 'Climate & Environment', 'Company exists to "save our home planet"', 'Transferred ownership to environmental nonprofit; profits fund conservation', 'aligned'),
    (v_patagonia, 'Labor Standards', 'Committed to fair labor practices in supply chain', 'Published supply chain audits; Fair Trade Certified products', 'aligned'),
    (v_patagonia, 'Political Activism', 'Openly advocates for environmental policy and public lands', 'Sued government over Bears Ears; donated tax cut savings to environmental groups', 'aligned')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── KOCH INDUSTRIES ───
  IF v_koch IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_koch, 'Climate Change', 'Has acknowledged need for energy innovation', 'Spent billions opposing climate legislation and funding climate skepticism', 'contradictory'),
    (v_koch, 'Criminal Justice Reform', 'Publicly supported bipartisan criminal justice reform', 'Funded reform efforts through Stand Together — a rare bipartisan stance', 'aligned'),
    (v_koch, 'Free Markets', 'Promotes free-market principles and limited government', 'Subsidiaries accept billions in government subsidies and contracts', 'contradictory'),
    (v_koch, 'Education', 'Supports educational innovation and school choice', 'Funds university programs that promote specific free-market ideology', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── COSTCO ───
  IF v_costco IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_costco, 'Wages & Labor', 'Known for above-average wages and benefits', 'PAC spending is modest and leans Democrat; no significant anti-labor lobbying', 'aligned'),
    (v_costco, 'DEI', 'Board affirmed commitment to diversity and inclusion programs', 'Shareholders voted 98% to maintain DEI initiatives despite activist pressure', 'aligned'),
    (v_costco, 'Employee Benefits', 'Comprehensive healthcare including part-time workers', 'Employee turnover significantly below retail industry average', 'aligned')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── STARBUCKS ───
  IF v_starbucks IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_starbucks, 'Worker Empowerment', 'Claims to value partners (employees) as company foundation', 'Over 100 NLRB complaints for union-busting activities', 'contradictory'),
    (v_starbucks, 'Racial Equity', 'Closed stores for racial bias training; committed to racial equity', 'Actions limited to symbolic gestures; diversity hiring targets partially met', 'mixed'),
    (v_starbucks, 'Climate', 'Committed to 50% reduction in carbon emissions by 2030', 'Supply chain sustainability through C.A.F.E. Practices program', 'aligned'),
    (v_starbucks, 'Employee Benefits', 'Offers healthcare, tuition coverage, and stock options to part-time workers', 'New CEO compensation exceeds $100M while baristas earn near minimum wage', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── AMAZON ───
  IF v_amazon IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_amazon, 'Worker Safety', 'States commitment to employee safety and wellbeing', 'Warehouse injury rates significantly above industry average; OSHA citations', 'contradictory'),
    (v_amazon, 'Climate', 'Co-founded Climate Pledge targeting net-zero by 2040', 'Carbon footprint continues to grow with expanding operations', 'mixed'),
    (v_amazon, 'Worker Rights', 'Claims to respect employee choice on unionization', 'Aggressive anti-union campaigns; NLRB found labor law violations', 'contradictory'),
    (v_amazon, 'Data Privacy', 'States commitment to customer data protection', 'FTC settlements for Ring and Alexa privacy violations totaling $30M+', 'contradictory'),
    (v_amazon, 'Small Business', 'Claims to empower small businesses through marketplace', 'FTC alleges anti-competitive practices harming marketplace sellers', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── META ───
  IF v_meta IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_meta, 'Data Privacy', 'Promotes user control over personal data', '$5B FTC fine for privacy violations; ongoing EU GDPR fines', 'contradictory'),
    (v_meta, 'Mental Health', 'Claims to prioritize user wellbeing and safety', 'Internal research showed Instagram harmful to teens; delayed action', 'contradictory'),
    (v_meta, 'Content Integrity', 'Committed to fighting misinformation and harmful content', 'Shifted away from fact-checking; ongoing challenges with hate speech', 'mixed'),
    (v_meta, 'DEI', 'Previously committed to diversity and inclusion goals', 'Rolled back DEI programs and diversity targets in 2025', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── APPLE ───
  IF v_apple IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_apple, 'Privacy', 'Markets privacy as a fundamental human right', 'Complies with Chinese government content and data demands', 'mixed'),
    (v_apple, 'Climate', 'Carbon neutral for operations; targeting full supply chain by 2030', 'Manufacturing heavily dependent on China with coal-powered grid', 'mixed'),
    (v_apple, 'Right to Repair', 'Introduced self-service repair program', 'Historically opposed right-to-repair legislation; parts-pairing restrictions', 'mixed'),
    (v_apple, 'Tax Responsibility', 'Compliant with all tax laws globally', 'EU found $15.8B in unpaid back taxes from Ireland arrangement', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── JPMORGAN CHASE ───
  IF v_jpmorgan IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_jpmorgan, 'Racial Equity', 'Committed $30B to advance racial equity', 'Settlement over Epstein ties; history of discriminatory lending practices', 'mixed'),
    (v_jpmorgan, 'Climate', 'Net-zero by 2050 commitment', 'Largest global financier of fossil fuel projects', 'contradictory'),
    (v_jpmorgan, 'Financial Stability', 'Promotes responsible banking and financial inclusion', 'Billions in fines for mortgage fraud, market manipulation, and compliance failures', 'contradictory'),
    (v_jpmorgan, 'Regulation', 'Supports sensible financial regulation', 'Lobbied extensively for rollback of Dodd-Frank protections', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── BOEING ───
  IF v_boeing IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_boeing, 'Safety', 'Publicly committed to highest safety standards', '737 MAX crashes killed 346 people; ongoing quality control failures', 'contradictory'),
    (v_boeing, 'Innovation', 'Promotes engineering excellence and innovation', 'Whistleblowers report corner-cutting and safety shortcuts', 'contradictory'),
    (v_boeing, 'National Security', 'Positions as critical national defense partner', 'Receives billions in no-bid contracts with extensive cost overruns', 'mixed'),
    (v_boeing, 'Worker Relations', 'Values workforce expertise and development', 'Machinist strikes over wages; outsourced engineering to cut costs', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── EXXON MOBIL ───
  IF v_exxon IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_exxon, 'Climate', 'Now acknowledges climate change and supports carbon tax concept', 'Spent decades funding climate denial; continues opposing aggressive regulation', 'contradictory'),
    (v_exxon, 'Energy Transition', 'Investing in carbon capture and low-carbon solutions', 'Core business remains fossil fuels; sued activist investors pushing for change', 'contradictory'),
    (v_exxon, 'Environmental Stewardship', 'Committed to minimizing environmental impact', 'History of major spills and environmental violations; EPA fines', 'contradictory'),
    (v_exxon, 'Shareholder Rights', 'Respects shareholder voice in governance', 'Sued activist shareholders to block climate proposals', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── DISNEY ───
  IF v_disney IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_disney, 'LGBTQ+ Rights', 'Opposed Florida Don''t Say Gay bill after initial silence', 'Previously donated to bill sponsors; walked back under employee pressure', 'mixed'),
    (v_disney, 'DEI', 'Committed to diverse and inclusive content and hiring', 'Faces political backlash over inclusion; navigating partisan pressure', 'mixed'),
    (v_disney, 'Worker Welfare', 'Promotes magical employee experience', 'Theme park workers report wages insufficient for local cost of living', 'contradictory'),
    (v_disney, 'Copyright', 'Defends intellectual property to protect creative works', 'Decades of lobbying extended copyright far beyond original intent', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── NIKE ───
  IF v_nike IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_nike, 'Social Justice', 'Bold stance on racial justice through Kaepernick campaign', 'Limited follow-through on internal workplace equity issues', 'mixed'),
    (v_nike, 'Supply Chain Ethics', 'Committed to fair labor in global supply chain', 'Ongoing concerns about forced labor in Chinese manufacturing', 'mixed'),
    (v_nike, 'Sustainability', 'Move to Zero campaign targeting zero carbon and waste', 'Environmental impact of fast fashion model and global shipping', 'mixed'),
    (v_nike, 'Gender Equity', 'Promotes women''s empowerment in marketing', 'Workplace gender discrimination lawsuits and settlements', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── UBER ───
  IF v_uber IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_uber, 'Worker Flexibility', 'Promotes flexible work as driver benefit', 'Spent $200M+ on Prop 22 to avoid classifying drivers as employees', 'contradictory'),
    (v_uber, 'Safety', 'Claims rider and driver safety is top priority', 'Thousands of reported sexual assault incidents; delayed transparency', 'contradictory'),
    (v_uber, 'Climate', 'Zero-emissions platform target by 2040', 'Primary business model increases car usage in cities', 'mixed'),
    (v_uber, 'Innovation', 'Promotes itself as technology-driven mobility solution', 'Uber Files revealed aggressive regulatory circumvention tactics', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── TESLA ───
  IF v_tesla IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_tesla, 'Climate', 'Core mission to accelerate transition to sustainable energy', 'CEO spends political capital supporting anti-climate-regulation politicians', 'mixed'),
    (v_tesla, 'Worker Rights', 'Claims to value diverse and talented workforce', 'NLRB violations; EEOC racial discrimination lawsuit; anti-union actions', 'contradictory'),
    (v_tesla, 'Safety Innovation', 'Markets Autopilot as advancing vehicle safety', 'Multiple crashes and deaths under investigation; misleading marketing claims', 'contradictory'),
    (v_tesla, 'DEI', 'Previously stated commitment to diversity', 'Dissolved DEI team; removed diversity language from corporate reports', 'contradictory')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── PFIZER ───
  IF v_pfizer IS NOT NULL THEN
    INSERT INTO company_public_stances (company_id, topic, public_position, spending_reality, gap) VALUES
    (v_pfizer, 'Drug Affordability', 'Claims commitment to patient access and affordability', 'Regular above-inflation price increases; lobbied against Medicare negotiation', 'contradictory'),
    (v_pfizer, 'Public Health', 'Developed life-saving COVID-19 vaccine rapidly', 'Opposed TRIPS waiver for vaccine patents in developing countries', 'mixed'),
    (v_pfizer, 'Transparency', 'Promotes transparency in clinical research', 'Largest healthcare fraud settlement in history for off-label promotion', 'contradictory'),
    (v_pfizer, 'Innovation', 'Invests heavily in R&D for new treatments', 'Lobbies extensively to extend patent protections and block generics', 'mixed')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
