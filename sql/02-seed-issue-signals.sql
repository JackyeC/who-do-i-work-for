-- ============================================================================
-- 02-seed-issue-signals.sql
-- Seed data for issue_signals table
-- ~310 INSERT statements covering well-known companies across diverse issue categories
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- AMAZON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Case Files', 'NLRB complaints regarding anti-union activities at multiple warehouse facilities including Bessemer, AL and Staten Island, NY', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'OSHA Inspection Database', 'OSHA citations for unsafe working conditions in fulfillment centers including excessive injury rates double the industry average', 'high', 60000
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'surveillance', 'investigative_report', 'The Verge / Vice News', 'Worker surveillance programs including AI-driven productivity tracking and automated termination systems in warehouses', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'sec_filing', 'FTC Enforcement Actions', 'FTC settlement over Ring doorbell privacy violations and Alexa childrens privacy breaches totaling $30.8M', 'high', 30800000
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Annual federal lobbying expenditures covering antitrust, labor, cloud computing, and trade policy', 'high', 21400000
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ITEP / ProPublica', 'Paid zero federal income tax in 2017 and 2018 despite billions in profits through tax incentive strategies', 'high', 0
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'FTC v. Amazon', 'FTC antitrust lawsuit alleging monopolistic practices in online marketplace including anti-discounting policies and seller penalties', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- APPLE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'The Guardian / NYT', 'Reports of poor labor conditions at Foxconn and other supplier factories in China manufacturing Apple products', 'high', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'union_relations', 'nlrb_filing', 'NLRB Case Files', 'NLRB complaints filed by Apple retail store workers in multiple locations alleging anti-union intimidation tactics', 'high', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'Apple Privacy Reports', 'Public commitment to user privacy including App Tracking Transparency framework and on-device processing', 'high', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'government_report', 'EU Commission Rulings', 'EU ordered Apple to pay 13 billion euros in back taxes to Ireland for illegal tax benefits via favorable transfer pricing', 'high', 14500000000
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Federal lobbying spending on encryption policy, antitrust, trade, and tax legislation', 'high', 9800000
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'DOJ v. Apple', 'DOJ antitrust lawsuit alleging Apple maintains illegal monopoly over smartphone market through App Store restrictions', 'high', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Apple Environmental Reports', 'Commitment to carbon neutrality across entire supply chain by 2030 with substantial renewable energy investments', 'medium', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- META
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'FTC Enforcement', 'FTC $5 billion settlement over Cambridge Analytica privacy violations and deceptive data practices', 'high', 5000000000
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'ai_ethics', 'investigative_report', 'Wall Street Journal / Frances Haugen', 'Internal research showed Instagram harms teen mental health; company suppressed findings per whistleblower documents', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Meta PAC contributions to members of Congress on both sides of the aisle focusing on tech-friendly legislators', 'high', 1500000
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Federal lobbying on content moderation policy, Section 230, data privacy, and antitrust legislation', 'high', 19700000
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'Reuters / Bloomberg', 'Rolled back DEI programs in 2025 including ending diversity hiring goals and disbanding DEI team', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'surveillance', 'investigative_report', 'The Intercept', 'Extensive cross-platform user tracking and shadow profiles built from non-users contact information and browsing data', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'government_report', 'DOJ Civil Rights Division', 'DOJ investigation into discriminatory ad targeting allowing housing and employment advertisers to exclude by race', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MICROSOFT
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'USASpending.gov', 'Major defense and intelligence contracts including JEDI/JWCC cloud computing contract worth up to $9 billion', 'high', 9000000000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'ai_ethics', 'news_report', 'NYT / Wired', 'AI ethics concerns around partnership with OpenAI and deployment of AI in military and law enforcement applications', 'medium', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Federal lobbying on cloud computing policy, AI regulation, cybersecurity, and antitrust matters', 'high', 13100000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Microsoft Sustainability Reports', 'Carbon negative pledge by 2030 with $1 billion climate innovation fund; water positive and zero waste goals', 'high', 1000000000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'FTC / EU Regulatory Actions', 'FTC and EU scrutiny over Activision Blizzard acquisition and bundling practices in productivity software', 'high', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Microsoft PAC bipartisan contributions to federal candidates with emphasis on tech and defense committees', 'high', 2300000
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Bloomberg', 'Voluntarily recognized unions at Activision Blizzard studios post-acquisition; relatively labor-neutral stance', 'medium', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOOGLE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'DOJ v. Google', 'DOJ found Google maintained illegal monopoly in search and search advertising through exclusive distribution deals', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'State AG Settlements', 'Settlement with 40 state attorneys general over deceptive location tracking practices totaling $391.5 million', 'high', 391500000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Among top corporate lobbying spenders on antitrust, AI, content moderation, and data privacy regulation', 'high', 13400000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Case Files', 'NLRB ruled Google illegally fired workers involved in organizing protests over Project Dragonfly and military contracts', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'ai_ethics', 'news_report', 'NYT / The Verge', 'Fired AI ethics researchers Timnit Gebru and Margaret Mitchell after research critical of large language models', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'military_defense', 'news_report', 'The Intercept', 'Project Nimbus $1.2B cloud contract with Israeli military and government drew employee protests', 'high', 1200000000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'CNBC / Reuters', 'Scaled back diversity programs and targets in 2025 following broader industry retreat from DEI commitments', 'high', NULL
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TESLA
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'DFEH / EEOC Filings', 'California DFEH lawsuit over widespread racial discrimination and harassment at Fremont factory; jury awarded $3.2M', 'high', 3200000
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'OSHA Records', 'Elevated workplace injury rates at Fremont factory above industry average with allegations of underreporting', 'high', NULL
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'union_relations', 'nlrb_filing', 'NLRB Case Files', 'NLRB found Tesla unlawfully threatened employees over union activity; Musk tweet ordering to give up stock options ruled illegal', 'high', NULL
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'EPA / Tesla Impact Report', 'Leading EV manufacturer accelerating transition to sustainable energy; significant positive climate impact', 'high', NULL
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'news_report', 'OpenSecrets / Bloomberg', 'CEO Elon Musk major political donor; contributed significantly to political candidates and PACs', 'high', 250000000
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'eeoc_filing', 'EEOC / Court Records', 'Multiple lawsuits alleging sexual harassment and gender discrimination at Tesla factories', 'high', NULL
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WALMART
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'investigative_report', 'Economic Policy Institute', 'Despite raising minimum wage to $14/hr, many workers still rely on public assistance programs costing taxpayers billions', 'high', NULL
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'union_relations', 'nlrb_filing', 'NLRB Case Files', 'Long history of anti-union practices including closing stores where workers organized and mandatory anti-union meetings', 'high', NULL
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'eeoc_filing', 'Dukes v. Walmart', 'Largest class-action employment discrimination lawsuit in US history alleging systematic gender discrimination in pay and promotion', 'high', NULL
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gun_policy', 'news_report', 'Reuters / AP', 'Removed certain ammunition and firearms from stores after mass shootings; raised minimum age for gun purchases to 21', 'high', NULL
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Federal lobbying on trade policy, labor regulations, healthcare, and supply chain issues', 'high', 7400000
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Walmart PAC contributes heavily to both parties with emphasis on commerce and agriculture committee members', 'high', 1800000
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Walmart ESG Reports', 'Project Gigaton initiative aiming to reduce supply chain emissions by 1 billion metric tons by 2030', 'medium', NULL
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HOME DEPOT
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings / OpenSecrets', 'Co-founder Bernie Marcus major Republican donor; company PAC contributes to conservative candidates', 'high', 7000000
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Case Files', 'Anti-union stance with history of discouraging organizing efforts among retail workers', 'medium', NULL
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'Court Records', '2014 data breach exposed 56 million customer credit card numbers; $17.5M multistate settlement', 'high', 17500000
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Home Depot ESG Reports', 'Sustainability commitments including eco-friendly product lines and energy efficiency in stores', 'medium', NULL
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on housing policy, trade tariffs, immigration, and environmental regulations', 'high', 3200000
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'HRC / News Reports', 'Co-founder Bernie Marcus donated to organizations opposing LGBTQ rights; sparked boycott calls', 'high', NULL
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TARGET
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'Reuters / AP', 'Removed Pride merchandise in 2023 after threats to employees; faced criticism from LGBTQ advocacy groups', 'high', NULL
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'Bloomberg / NYT', 'Ended DEI goals and programs in January 2025 following broader corporate retreat from diversity initiatives', 'high', NULL
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'Court Records', '2013 data breach affecting 41 million customer payment cards; $18.5 million multistate settlement', 'high', 18500000
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'news_report', 'Target Press Releases', 'Raised minimum wage to $15/hr in 2020 and subsequently to $24/hr for some positions', 'high', NULL
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Target PAC contributions to candidates on both sides with focus on retail and commerce policy', 'medium', 900000
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Target ESG Reports', 'Target Forward sustainability strategy targeting net zero emissions by 2040', 'medium', NULL
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STARBUCKS
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'union_relations', 'nlrb_filing', 'NLRB Case Files', 'Over 100 NLRB complaints for illegal anti-union activities including firing organizers and closing unionized stores', 'high', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Rulings', 'NLRB ruled Starbucks committed hundreds of unfair labor practices during union campaign at 400+ stores', 'high', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'HRC / News Reports', 'Workers alleged company restricted Pride decorations in stores; historically had strong LGBTQ-friendly policies', 'medium', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'news_report', 'AP / NYT', 'Closed 8000 stores for racial bias training after arrest of two Black men in Philadelphia store in 2018', 'high', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'public_record', 'Starbucks Benefits Reports', 'Provides health insurance to part-time workers working 20+ hours/week; one of few retail companies to do so', 'high', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Starbucks ESG Reports', 'Committed to 50% reduction in carbon emissions, water withdrawal, and waste by 2030', 'medium', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NIKE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'investigative_report', 'Worker Rights Consortium', 'Continued reports of sweatshop conditions at overseas supplier factories including excessive hours and low wages', 'high', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'news_report', 'NYT / WSJ', 'Internal gender discrimination complaints led to departure of multiple senior executives in 2018 culture reckoning', 'high', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'news_report', 'AP / Reuters', 'Colin Kaepernick ad campaign took strong stance on racial justice despite boycott threats', 'high', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'sec_filing', 'Nike Annual Reports', 'Set representation targets for women and racial minorities in leadership positions', 'medium', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ICIJ / Tax Justice Network', 'Uses Dutch subsidiary structure to minimize European tax obligations through transfer pricing', 'high', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Nike Impact Reports', 'Move to Zero campaign targeting zero carbon and zero waste with recycled materials in products', 'medium', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DISNEY
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'NYT / CNN', 'Initially failed to oppose Floridas Dont Say Gay bill; employee walkout forced reversal of company position', 'high', NULL
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Disney PAC donated to sponsors of Dont Say Gay bill while publicly opposing it; paused political donations', 'high', 2400000
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'news_report', 'LA Times / Orlando Sentinel', 'Theme park workers reported struggling with poverty wages while company paid executives hundreds of millions', 'high', NULL
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on copyright extension, content regulation, streaming policy, and theme park development', 'high', 5100000
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'WSJ / Bloomberg', 'Scaled back public DEI messaging after political backlash while maintaining some internal programs', 'medium', NULL
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Variety / THR', 'Writers and actors strikes in 2023 highlighted disputes over AI use, streaming residuals, and fair compensation', 'high', NULL
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JPMORGAN CHASE
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Rainforest Action Network', 'Worlds largest funder of fossil fuel projects; over $430 billion in fossil fuel financing since Paris Agreement', 'high', 430000000000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'CFPB Enforcement', 'CFPB fines for illegal credit card practices and overcharging customers on mortgage fees', 'high', 136000000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'JPMorgan PAC among largest corporate political donors with bipartisan contributions focused on financial services committees', 'high', 3200000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Heavy lobbying against banking regulations including Dodd-Frank provisions and capital requirements', 'high', 11200000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'JPM Press Releases', 'Committed $30 billion to advance racial equity including lending, philanthropy, and business investment', 'high', 30000000000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'Documented / OpenSecrets', 'Connections to dark money groups through trade associations that lobby against financial regulation', 'medium', NULL
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOLDMAN SACHS
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'public_record', 'Court Records', 'Class action settlement of $215M over gender discrimination in pay and promotion for female employees', 'high', 215000000
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on financial regulation, tax policy, cryptocurrency regulation, and derivatives rules', 'high', 5600000
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'sec_filing', 'DOJ', 'DOJ settlement over 1MDB Malaysian sovereign wealth fund scandal involving billions in misappropriated funds', 'high', 2900000000
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'ProPublica / Documented', 'Numerous former executives moved into senior government positions including Treasury Secretary and Fed roles', 'high', NULL
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Goldman Sachs PAC and employee contributions heavily favor financial services committee members', 'high', 4100000
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'Bloomberg', 'Rolled back requirement for IPO clients to have diverse board members after initial diversity push', 'high', NULL
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BANK OF AMERICA
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'CFPB Enforcement', 'CFPB fined for double-charging junk fees and withholding credit card rewards from customers', 'high', 100000000
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Banking on Climate Chaos', 'Major funder of fossil fuel projects while pledging net-zero emissions by 2050', 'high', NULL
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on banking regulation, consumer protection rules, and fintech policy', 'high', 5400000
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'news_report', 'Reuters', 'Raised minimum wage to $23/hr in 2023 with commitment to reach $25/hr by 2025', 'high', NULL
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'BofA PAC bipartisan contributions with focus on banking and financial services committee members', 'high', 2800000
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'housing', 'public_record', 'DOJ Settlement Records', 'Historic Countrywide mortgage discrimination settlement for discriminatory lending to Black and Hispanic borrowers', 'high', 335000000
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WELLS FARGO
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'CFPB / OCC Enforcement', 'Fake accounts scandal created millions of unauthorized accounts; $3.7 billion total penalties', 'high', 3700000000
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'DOJ Settlement', 'DOJ settlement over discriminatory mortgage lending practices that charged higher rates to Black and Hispanic borrowers', 'high', 175000000
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'NYT / Bloomberg', 'Conducted fake job interviews with minority candidates for positions already filled to satisfy diversity requirements', 'high', NULL
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Heavy lobbying to ease regulatory restrictions and asset cap imposed after fake accounts scandal', 'high', 4800000
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Wells Fargo PAC contributions focused on banking committee members and financial deregulation supporters', 'high', 2600000
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'housing', 'government_report', 'HUD / CFPB Reports', 'Repeated violations in mortgage servicing including improper foreclosures on active-duty military members', 'high', NULL
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXXONMOBIL
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'InsideClimate News / Harvard Study', 'Internal research confirmed climate change from fossil fuels as early as 1977; publicly funded climate denial for decades', 'high', NULL
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'Union of Concerned Scientists', 'Funded network of climate denial organizations and think tanks to cast doubt on climate science', 'high', 39000000
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Among top oil industry lobbyists fighting carbon tax, methane regulations, and clean energy subsidies', 'high', 12900000
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'government_report', 'EPA Enforcement', 'Repeated EPA violations for air and water pollution at refineries and chemical plants', 'high', NULL
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'ExxonMobil PAC contributions predominantly to Republican candidates opposing climate legislation', 'high', 1300000
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ProPublica', 'Paid zero federal income tax in 2018 while earning $20 billion in profit through tax avoidance strategies', 'high', 0
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHEVRON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'public_record', 'Lago Agrio Case Records', 'Decades-long legal battle over massive oil contamination in Ecuadorian Amazon affecting indigenous communities', 'high', NULL
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Carbon Majors Database', 'Among top 20 companies responsible for one-third of all global carbon emissions since 1965', 'high', NULL
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against climate regulation, clean energy mandates, and methane emission rules', 'high', 11300000
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Chevron PAC heavily supports candidates opposing climate legislation and supporting fossil fuel development', 'high', 1600000
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'Documented / Drilled Podcast', 'Funding climate denial groups and trade associations that fight emission regulations', 'high', NULL
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'OSHA / CSB Reports', 'Richmond refinery fire in 2012 sent 15000 residents to hospitals; fined $963K by Cal/OSHA', 'high', 963000
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SHELL
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Dutch Court Ruling', 'Dutch court ordered Shell to cut CO2 emissions 45% by 2030; company appealed the ruling', 'high', NULL
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'investigative_report', 'Amnesty International', 'Decades of oil spills in Niger Delta causing severe environmental damage to local communities', 'high', NULL
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against methane regulations and clean energy transition mandates', 'high', 8700000
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'InfluenceMap', 'Spent millions on PR campaigns promoting natural gas while lobbying against renewable energy mandates', 'high', NULL
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'news_report', 'Reuters / FT', 'Scaled back renewable energy targets and investments in 2023-2024 to focus on profitable oil and gas', 'high', NULL
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BP
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'public_record', 'DOJ / EPA', 'Deepwater Horizon oil spill in 2010 was largest marine oil spill in history; $20.8 billion settlement', 'high', 20800000000
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'news_report', 'The Guardian / BBC', 'Retreated from climate commitments in 2023; slowed renewable energy investments to boost oil and gas production', 'high', NULL
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on energy policy, carbon pricing, and pipeline regulations', 'high', 7200000
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'CSB Investigation', 'Texas City refinery explosion killed 15 workers in 2005; systemic safety failures documented', 'high', NULL
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'InfluenceMap', 'Coined the personal carbon footprint concept to shift climate responsibility from corporations to individuals', 'high', NULL
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PFIZER
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'public_record', 'DOJ Settlement', 'Paid $2.3 billion in largest healthcare fraud settlement for illegal promotion of off-label drug use', 'high', 2300000000
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on drug pricing legislation, patent law, and FDA regulation', 'high', 13500000
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Pfizer PAC contributes to both parties with focus on health, energy, and commerce committee members', 'high', 1900000
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'investigative_report', 'Senate Finance Committee', 'Drug pricing practices criticized for dramatic price increases on essential medications', 'high', NULL
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ITEP / Bloomberg', 'Tax inversion attempt to redomicile in Ireland blocked by Treasury rules; extensive use of tax havens', 'high', NULL
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JOHNSON & JOHNSON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'Court Records / Reuters', 'Talcum powder litigation over cancer-causing asbestos contamination; proposed $8.9 billion settlement', 'high', 8900000000
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'public_record', 'DOJ / State AG Settlements', 'Role in opioid crisis through promotion of opioid painkillers; $5 billion settlement with states', 'high', 5000000000
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on tort reform, drug pricing, and medical device regulation', 'high', 8200000
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'government_report', 'EPA / State Environmental Agencies', 'Contamination of water supplies near manufacturing facilities with PFAS and other industrial chemicals', 'medium', NULL
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'Court Records', 'Lawsuits alleging company targeted talcum powder marketing toward Black women despite known cancer risks', 'high', NULL
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UNITEDHEALTH GROUP
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'investigative_report', 'ProPublica / STAT News', 'AI-driven claim denials overturned at high rates on appeal; automated system rejected legitimate medical claims', 'high', NULL
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Among largest healthcare industry lobbyists fighting single-payer and public option proposals', 'high', 8400000
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'UHG PAC contributions to both parties focused on health committee members and ACA policy', 'high', 2800000
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'DOJ / FTC', 'DOJ antitrust concerns over acquisition of Change Healthcare creating monopoly in claims processing', 'high', NULL
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'news_report', 'NYT / WSJ', 'Pattern of prior authorization denials and delays criticized by patients and medical providers', 'high', NULL
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'news_report', 'Reuters / Bloomberg', 'Change Healthcare data breach in 2024 exposed sensitive health data of approximately 100 million Americans', 'high', NULL
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BOEING
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'FAA / NTSB Reports', 'Two 737 MAX crashes killed 346 people due to flawed MCAS system and inadequate safety review processes', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'DOJ Deferred Prosecution', 'DOJ deferred prosecution agreement for conspiracy to defraud FAA regarding 737 MAX certification; $2.5B settlement', 'high', 2500000000
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'USASpending.gov', 'Major defense contractor for military aircraft, satellites, and weapons systems', 'high', 25000000000
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on defense spending, FAA regulation, trade policy, and commercial aviation safety rules', 'high', 12400000
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Seattle Times / Reuters', 'Threatened to move production away from unionized facilities; machinist strikes over pay and pension disputes', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'POGO / ProPublica', 'Extensive revolving door between Boeing executives and Pentagon officials including defense secretaries', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LOCKHEED MARTIN
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'military_defense', 'public_record', 'USASpending.gov', 'Largest US defense contractor; F-35 program alone worth over $400 billion in lifetime costs', 'high', 400000000000
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Major defense lobbying on military spending, weapons systems, and foreign military sales', 'high', 12800000
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Lockheed PAC among top defense industry donors focused on armed services and defense appropriations committees', 'high', 3800000
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'POGO', 'Frequent hiring of former Pentagon officials and military officers into senior corporate positions', 'high', NULL
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'sec_filing', 'Lockheed Martin 10-K', 'Over 70% of revenue comes from US government contracts making it heavily dependent on defense spending', 'high', 50000000000
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Lockheed ESG Reports', 'Sustainability commitments alongside manufacture of weapons systems used in conflict zones worldwide', 'low', NULL
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RAYTHEON (RTX)
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'military_defense', 'public_record', 'USASpending.gov', 'Major defense contractor producing missile systems, radars, and cybersecurity systems for US military', 'high', 27000000000
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on defense budgets, arms sales, and military technology development', 'high', 9200000
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'RTX PAC contributions focused on defense and foreign affairs committee members', 'high', 2900000
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'POGO', 'Former Secretary of Defense Lloyd Austin sat on Raytheon board before appointment; extensive revolving door', 'high', NULL
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'DOJ Settlement', 'DOJ settlement for overcharging US government on defense contracts through fraudulent pricing', 'high', 27000000
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NORTHROP GRUMMAN
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'military_defense', 'public_record', 'USASpending.gov', 'Manufacturer of B-21 stealth bomber, nuclear weapons systems, and military satellites', 'high', 36000000000
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on nuclear modernization, space force funding, and defense appropriations', 'high', 13200000
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Northrop PAC among top defense contractor donors to congressional campaigns', 'high', 3100000
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'POGO', 'Regularly hires former Pentagon and intelligence community officials into leadership roles', 'high', NULL
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'sec_filing', 'Northrop Grumman 10-K', 'Over 80% of revenue from US government contracts; critical to nuclear weapons infrastructure', 'high', NULL
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GENERAL DYNAMICS
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'military_defense', 'public_record', 'USASpending.gov', 'Major defense contractor producing submarines, tanks, and IT systems for military and intelligence', 'high', 31000000000
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on shipbuilding, combat vehicle modernization, and defense IT contracts', 'high', 11000000
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'General Dynamics PAC contributions focused on defense appropriations committee members', 'high', 2400000
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'POGO', 'Pattern of hiring former military and intelligence officials; strong Pentagon revolving door', 'high', NULL
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'immigration', 'investigative_report', 'The Intercept', 'Provides IT infrastructure for ICE detention and border enforcement operations', 'high', NULL
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMCAST
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Among top corporate lobbyists fighting net neutrality and promoting media consolidation', 'high', 14200000
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'FCC / State AG Enforcement', 'Repeated fines for deceptive billing practices and unauthorized charges on customer accounts', 'high', 2300000
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'FCC / DOJ', 'Scrutiny over media consolidation through ownership of NBC Universal, Sky, and dominant broadband positions', 'high', NULL
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Comcast PAC bipartisan donor with focus on communications and tech committee members', 'high', 3600000
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'news_report', 'EFF / Ars Technica', 'Criticized for deep packet inspection and selling customer browsing data to advertisers', 'medium', NULL
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AT&T
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'surveillance', 'investigative_report', 'The Intercept / Snowden Docs', 'NSA Fairview program provided bulk surveillance access to international communications through AT&T infrastructure', 'high', NULL
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Major telecom lobbyist on broadband regulation, spectrum policy, and Section 230', 'high', 12600000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'AT&T PAC among top corporate political donors with bipartisan contributions', 'high', 3200000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'Reuters / Daily Beast', 'Funded One America News Network (OAN) which spread election disinformation', 'high', NULL
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'news_report', 'TechCrunch / BleepingComputer', 'Massive data breach in 2024 exposing call and text records of nearly all AT&T cellular customers', 'high', NULL
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'FTC Enforcement', 'FTC $60 million settlement for throttling unlimited data plans while charging full price', 'high', 60000000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIZON
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'surveillance', 'public_record', 'FISA Court Orders', 'Provided bulk phone metadata to NSA under FISA court orders revealed by Snowden leaks', 'high', NULL
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against net neutrality, municipal broadband, and broadband subsidy oversight', 'high', 11800000
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Verizon PAC major donor to both parties focused on telecom and tech committee members', 'high', 2700000
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ITEP', 'Paid effective federal tax rate well below statutory rate through aggressive tax planning', 'high', NULL
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'FCC Enforcement', 'Fined by FCC for using supercookies to track customers without consent', 'high', 1350000
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FOX CORPORATION
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'public_record', 'Dominion v. Fox News', 'Settled Dominion Voting Systems defamation lawsuit for $787.5 million over false election fraud claims', 'high', 787500000
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on media regulation, content moderation policy, and broadcasting rules', 'high', 5400000
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Public Citizen', 'Fox News hosts consistently downplayed climate science and opposed climate legislation per content analysis', 'high', NULL
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'public_record', 'Court Records', 'Multiple sexual harassment lawsuits and settlements including Roger Ailes and Bill OReilly cases', 'high', 50000000
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'immigration', 'investigative_report', 'Media Matters', 'Fox News programming consistently amplified anti-immigration rhetoric and replacement theory narratives', 'high', NULL
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NEWS CORP
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'UK Parliamentary Inquiry', 'Phone hacking scandal at News of the World resulted in closure of newspaper and criminal convictions', 'high', NULL
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'Columbia Journalism Review', 'Murdoch media properties use editorial influence to support preferred political candidates globally', 'high', NULL
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on media ownership rules, copyright, and content regulation', 'high', 4300000
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Greenpeace / Media Matters', 'Australian newspapers under News Corp promoted climate skepticism and opposed emissions reduction policies', 'high', NULL
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'FCC / ACMA', 'Concentration of media ownership raising concerns about media diversity and democratic discourse', 'medium', NULL
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- KOCH INDUSTRIES
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'Jane Mayer / New Yorker', 'Built extensive dark money network of political organizations spending hundreds of millions on elections', 'high', 400000000
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'Greenpeace / Union of Concerned Scientists', 'Major funder of climate denial organizations and opposition to clean energy legislation', 'high', 145000000
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'government_report', 'EPA Enforcement', 'One of top 10 air polluters in the US; multiple EPA violations and settlements for environmental contamination', 'high', NULL
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Massive lobbying apparatus fighting environmental regulation, labor protections, and campaign finance reform', 'high', 16000000
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'union_relations', 'investigative_report', 'The Guardian', 'Funded organizations opposing union rights and labor protections through ALEC and other groups', 'high', NULL
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'education', 'investigative_report', 'UnKoch My Campus', 'Donated hundreds of millions to universities with conditions influencing academic appointments and curricula', 'high', 200000000
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HOBBY LOBBY
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'reproductive_rights', 'public_record', 'Burwell v. Hobby Lobby', 'Supreme Court case won exemption from ACA contraceptive mandate based on religious beliefs', 'high', NULL
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'ProPublica / OpenSecrets', 'Green family major donors to conservative Christian political causes and candidates', 'high', NULL
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'HRC / GLAAD', 'Owners fund organizations opposing same-sex marriage and LGBTQ rights legislation', 'high', NULL
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'DOJ / CBP Records', 'Paid $3 million fine for smuggling thousands of Iraqi antiquities through fraudulent customs declarations', 'high', 3000000
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'education', 'news_report', 'Washington Post / AP', 'Funded Museum of the Bible and efforts to introduce Bible curriculum in public schools', 'high', NULL
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHICK-FIL-A
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'public_record', 'Tax Filings / IRS 990s', 'WinShape Foundation funded organizations opposing same-sex marriage including Fellowship of Christian Athletes', 'high', 8000000
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'ThinkProgress / GLAAD', 'CEO public opposition to same-sex marriage generated boycotts and counter-protests', 'high', NULL
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'news_report', 'Forbes / Reuters', 'Among highest-rated fast food employers for workplace satisfaction; relatively higher pay for industry', 'medium', NULL
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'AP / NYT', 'Announced in 2019 would stop donating to anti-LGBTQ organizations; shifted charitable focus', 'medium', NULL
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'education', 'public_record', 'Chick-fil-A Foundation Reports', 'Scholarship programs and youth education investments through corporate foundation', 'medium', 32000000
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PATAGONIA
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Patagonia Press Releases', 'Transferred company ownership to climate trust; all profits go to fighting climate change', 'high', 3000000000
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Patagonia Environmental Reports', 'Pioneer of sustainable business practices including Fair Trade Certified manufacturing and recycled materials', 'high', NULL
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'news_report', 'NYT / Bloomberg', 'Donated $10 million Trump tax cut savings to environmental organizations', 'high', 10000000
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'public_record', 'Fair Trade USA', 'Fair Trade Certified supply chain with living wage initiatives for factory workers', 'high', NULL
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'news_report', 'Patagonia Action Works', 'Lobbies for public lands protection, environmental regulation, and climate policy', 'high', NULL
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COSTCO
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'public_record', 'Costco Proxy Statements', 'Industry-leading wages and benefits for retail workers; starting pay significantly above minimum wage', 'high', NULL
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'news_report', 'Bloomberg / Forbes', 'Provides comprehensive health insurance to part-time workers; among best benefits in retail sector', 'high', NULL
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'sec_filing', 'Costco Proxy Statements', 'Board rejected shareholder proposal to eliminate DEI programs; maintained commitment to diversity initiatives', 'high', NULL
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Costco ESG Reports', 'Sustainability initiatives in supply chain including sustainable seafood sourcing and packaging reduction', 'medium', NULL
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on trade policy, food safety, and retail industry regulations', 'high', 1200000
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BEN & JERRY'S
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'Ben and Jerrys Website', 'Publicly called to defund the police and dismantle white supremacy; among most politically active brands', 'high', NULL
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Ben and Jerrys Social Mission Reports', 'Strong climate advocacy with commitment to reduce emissions and transition to sustainable dairy sourcing', 'high', NULL
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'HRC / Ben and Jerrys', 'Long-standing advocacy for marriage equality and LGBTQ rights through products and campaigns', 'high', NULL
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'immigration', 'public_record', 'Ben and Jerrys Website', 'Advocated for refugee and immigrant rights; opposed family separation policies', 'high', NULL
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'public_record', 'Milk with Dignity Program', 'Partnered with Migrant Justice for Milk with Dignity program ensuring fair conditions for dairy farmworkers', 'high', NULL
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COCA-COLA
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'investigative_report', 'Break Free From Plastic', 'Named worlds top plastic polluter for multiple consecutive years producing millions of tons of plastic waste', 'high', NULL
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against sugar taxes, bottle deposit laws, and plastic container regulations', 'high', 7600000
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'investigative_report', 'NYT / BMJ', 'Funded research to downplay link between sugary beverages and obesity; payments to health organizations', 'high', NULL
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'investigative_report', 'SINALTRAINAL / Killer Coke Campaign', 'Allegations of anti-union violence at bottling plants in Colombia and Guatemala', 'high', NULL
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Coca-Cola PAC bipartisan contributions focused on agriculture and health committee members', 'high', 1400000
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'Coca-Cola ESG Reports', 'World Without Waste initiative to collect and recycle equivalent of every bottle sold by 2030', 'medium', NULL
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PEPSICO
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'investigative_report', 'Break Free From Plastic', 'Among top global plastic polluters; producing billions of single-use plastic containers annually', 'high', NULL
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against soda taxes, nutritional labeling requirements, and packaging regulations', 'high', 4200000
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'investigative_report', 'CSPI / BMJ', 'Funded health research and organizations to downplay negative health effects of sugary beverages', 'high', NULL
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'PepsiCo ESG Reports', 'pep+ sustainability transformation targeting net-zero emissions by 2040 and net water positive by 2030', 'medium', NULL
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'PepsiCo PAC bipartisan contributions to agriculture, health, and commerce committee members', 'high', 1100000
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MCDONALDS
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'news_report', 'Fight for $15 / Reuters', 'Target of Fight for $15 movement; franchise model used to avoid responsibility for worker wages', 'high', NULL
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'eeoc_filing', 'EEOC / Court Records', 'Multiple lawsuits over systemic sexual harassment at franchise locations; $26M harassment settlement', 'high', 26000000
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against minimum wage increases, joint employer rules, and franchise labor regulations', 'high', 3500000
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'investigative_report', 'CSPI / Public Health Advocates', 'Marketing unhealthy food to children through Happy Meals, toys, and targeted advertising', 'high', NULL
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'public_record', 'McDonalds ESG Reports', 'Pledged to source all packaging from renewable or recycled sources and reduce greenhouse gas emissions', 'medium', NULL
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'public_record', 'Court Records', 'Black franchise owners filed discrimination lawsuit alleging company steered them to lower-revenue locations', 'high', NULL
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TYSON FOODS
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'OSHA / GAO Reports', 'Meatpacking workers face injury rates far above national average; COVID-19 outbreaks killed multiple workers', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'investigative_report', 'Human Rights Watch', 'Exploitative working conditions in meatpacking plants often staffed by vulnerable immigrant workers', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'pollution', 'government_report', 'EPA / Environmental Integrity Project', 'Among largest water polluters in the US; runoff from operations contaminates waterways', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'public_record', 'DOJ / Court Records', 'Price-fixing lawsuits alleging collusion with other poultry producers to inflate chicken prices', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'immigration', 'public_record', 'DOJ / ICE Records', 'Hired undocumented workers at multiple facilities; ICE raids at plants affected hundreds of workers', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'investigative_report', 'IATP / Guardian', 'Greenhouse gas emissions rivaling entire countries; one of largest contributors to agricultural emissions', 'high', NULL
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UBER
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'public_record', 'CA AB5 / Court Records', 'Spent $200M on Prop 22 to classify drivers as independent contractors avoiding employee benefits', 'high', 200000000
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'public_record', 'Uber Safety Reports', 'Reported thousands of sexual assault incidents during rides in US Safety Report', 'high', NULL
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets / Uber Files', 'Uber Files leak revealed massive global lobbying operation including direct outreach to world leaders', 'high', 6800000
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'public_record', 'FTC / DOJ', 'Covered up data breach affecting 57 million users; paid hackers $100K to delete data and stay quiet', 'high', 148000000
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'news_report', 'Susan Fowler / NYT', 'Systemic sexual harassment culture exposed by engineer Susan Fowler leading to CEO resignation', 'high', NULL
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ICIJ / Bloomberg', 'Used Dutch subsidiary structure to minimize global tax obligations through aggressive transfer pricing', 'high', NULL
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LYFT
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'public_record', 'CA Prop 22 Campaign', 'Joined Uber in spending over $200M on Prop 22 to keep drivers as independent contractors', 'high', NULL
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'public_record', 'Court Records', 'Faced lawsuits over sexual assault incidents during rides and inadequate driver background checks', 'high', NULL
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Lyft Press Releases', 'Committed to 100% electric vehicles on platform by 2030; carbon-neutral rides since 2019 through offsets', 'medium', NULL
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'reproductive_rights', 'news_report', 'Reuters / CNBC', 'Pledged to cover legal fees for drivers sued under Texas abortion ban transportation provisions', 'high', NULL
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'investigative_report', 'Economic Policy Institute', 'Driver earnings after expenses often fall below minimum wage despite company claims', 'high', NULL
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AIRBNB
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'housing', 'investigative_report', 'Harvard Housing Studies / Inside Airbnb', 'Contributes to housing affordability crisis by converting long-term rentals to short-term vacation rentals', 'high', NULL
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'racial_justice', 'investigative_report', 'Harvard Business School Study', 'Research documented systematic discrimination against Black guests by hosts on the platform', 'high', NULL
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against short-term rental regulations and hotel industry tax requirements', 'high', 4100000
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'Bloomberg / Reuters', 'Disputes with cities over tourist tax collection and obligations for platform listings', 'medium', NULL
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'immigration', 'public_record', 'Airbnb Press Releases', 'Provided free temporary housing for 100,000 refugees from Afghanistan, Ukraine, and other countries', 'high', NULL
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DOORDASH
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'public_record', 'CA Prop 22 / Court Records', 'Contributed to Prop 22 campaign to maintain drivers as independent contractors without full benefits', 'high', NULL
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'investigative_report', 'NYT / Economic Policy Institute', 'Tip-skimming controversy where company used customer tips to subsidize base pay for drivers', 'high', NULL
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'DC AG / State Enforcement', 'DC Attorney General sued for deceptive practices around driver tips and hidden fees', 'high', NULL
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on gig worker classification, food delivery regulations, and labor policy', 'high', 2300000
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'news_report', 'TechCrunch', 'Data breach exposed personal information of approximately 4.9 million customers, workers, and merchants', 'high', NULL
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BLACKROCK
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'news_report', 'Bloomberg / FT', 'Retreated from climate activism commitments; left Net Zero Asset Managers initiative in 2025', 'high', NULL
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'OpenSecrets / Documented', 'Subject of both progressive and conservative political pressure over ESG investing approach', 'high', NULL
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying on financial regulation, ESG disclosure rules, and investment management policy', 'high', 4800000
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'housing', 'investigative_report', 'The Atlantic / ProPublica', 'Institutional investment in single-family homes criticized for driving up housing prices', 'high', NULL
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'antitrust', 'investigative_report', 'Academic Research / Senate Inquiry', 'Common ownership of competing companies through index funds raises antitrust concerns', 'medium', NULL
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gun_policy', 'news_report', 'Reuters / Bloomberg', 'Offered gun-free investment funds but continued to hold significant positions in firearms manufacturers through index funds', 'medium', NULL
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BERKSHIRE HATHAWAY
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'sec_filing', 'SEC Proxy Records', 'Repeatedly defeated shareholder proposals for climate risk disclosure and emissions reporting', 'high', NULL
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'OpenSecrets', 'Subsidiary companies active in political spending while holding company maintains low profile', 'medium', NULL
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'sustainability', 'news_report', 'As You Sow / Reuters', 'Among last major corporations to resist ESG reporting and climate risk disclosure requirements', 'high', NULL
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Subsidiaries lobby on insurance regulation, energy policy, and railroad safety', 'high', 8500000
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'ProPublica Tax Records', 'Effective tax rates lower than statutory rates through insurance float and investment strategies', 'medium', NULL
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITADEL
-- ============================================================================
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings / OpenSecrets', 'CEO Ken Griffin among largest individual political donors in US; donated over $100M to Republican causes', 'high', 100000000
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'SEC / GameStop Congressional Hearing', 'Payment for order flow practices scrutinized during GameStop trading controversy', 'high', NULL
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbying against financial transaction taxes and tighter regulation of market-making activities', 'high', 3200000
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dark_money', 'investigative_report', 'ProPublica / Documented', 'Griffin funds conservative think tanks and dark money organizations influencing policy', 'high', NULL
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'education', 'news_report', 'Chicago Tribune / Sun-Times', 'Griffin donated $300M to Harvard and hundreds of millions to other educational institutions', 'high', 300000000
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ADDITIONAL SIGNALS - EXPANDING COVERAGE
-- ============================================================================

-- Additional Amazon signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'climate_environment', 'public_record', 'Amazon Sustainability Reports', 'Climate Pledge co-founder committing to net-zero carbon by 2040; largest corporate buyer of renewable energy', 'high', NULL
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

-- Additional Meta signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lgbtq_rights', 'news_report', 'GLAAD / Washington Post', 'Removed gender identity from hate speech protections on Facebook and Instagram platforms in 2025', 'high', NULL
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

-- Additional Tesla signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'ai_ethics', 'news_report', 'Reuters / NHTSA', 'Autopilot and Full Self-Driving system involved in hundreds of crashes and multiple fatalities; NHTSA investigations', 'high', NULL
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

-- Additional Walmart signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'public_record', 'DOJ / State AG Settlements', 'Settled opioid distribution lawsuits for $3.1 billion over role in fueling the opioid crisis through pharmacy operations', 'high', 3100000000
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

-- Additional Nike signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'investigative_report', 'Washington Post / Worker Rights Consortium', 'Supplier factory wages in Southeast Asia insufficient for living wage despite company code of conduct', 'high', NULL
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

-- Additional Disney signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'tax_policy', 'investigative_report', 'Orlando Sentinel / ProPublica', 'Special Reedy Creek tax district provided decades of favorable tax treatment until dissolved in political dispute', 'high', NULL
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

-- Additional ExxonMobil signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'government_report', 'CSB / OSHA', 'Chemical plant explosion in Baytown TX and other refinery incidents causing worker injuries and community evacuations', 'high', NULL
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

-- Additional Boeing signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'workplace_safety', 'news_report', 'Seattle Times / NYT', 'Door plug blowout on 737 MAX 9 in January 2024 renewed concerns about quality control and safety culture', 'high', NULL
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

-- Additional Google signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gender_equity', 'public_record', 'Court Records / EEOC', 'Settled gender pay discrimination claims for $118 million affecting over 15,000 female employees', 'high', 118000000
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

-- Additional JPMorgan signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'consumer_protection', 'public_record', 'USVI AG / Court Records', 'Ties to Jeffrey Epstein scrutinized in lawsuits; $290M settlement with US Virgin Islands', 'high', 290000000
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

-- Additional Wells Fargo signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'eeoc_filing', 'EEOC / Court Records', 'EEOC settlement for discriminatory hiring practices in home mortgage lending division', 'high', 7800000
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

-- Additional Comcast signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings', 'Among top corporate political donors; employees and PAC contributed to candidates across both parties', 'high', 5600000
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

-- Additional UnitedHealth signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'revolving_door', 'investigative_report', 'ProPublica / Documented', 'Extensive hiring of former CMS and HHS officials influencing Medicare Advantage and Medicaid policy', 'high', NULL
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

-- Additional Koch Industries signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'fec_filing', 'FEC Filings / OpenSecrets', 'Koch network spent nearly $400M in 2018 election cycle through various political organizations', 'high', 400000000
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

-- Additional Starbucks signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'wage_equity', 'news_report', 'Reuters / Bloomberg', 'Promised pay increases for non-union stores while withholding them from unionized locations; NLRB cited this as retaliatory', 'high', NULL
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

-- Additional Apple signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'surveillance', 'news_report', 'EFF / The Guardian', 'CSAM scanning proposal raised surveillance concerns from privacy advocates before being shelved', 'medium', NULL
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

-- Additional Chevron signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'political_spending', 'investigative_report', 'OpenSecrets / Climate Investigations', 'Among top oil industry donors to political campaigns opposing climate legislation', 'high', 5000000
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

-- Additional Microsoft signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'data_privacy', 'government_report', 'EU DPA / FTC', 'GDPR and privacy concerns over data collection in Windows, LinkedIn, and Office 365 services', 'medium', NULL
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

-- Additional Target signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Case Files', 'NLRB complaints from workers at distribution centers over working conditions and scheduling practices', 'medium', NULL
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

-- Additional Johnson & Johnson signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbied against drug pricing reforms including Medicare negotiation provisions in Inflation Reduction Act', 'high', 8200000
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

-- Additional Bank of America signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'gun_policy', 'news_report', 'Reuters / AP', 'Stopped lending to manufacturers of military-style firearms for civilian use after Parkland shooting', 'high', NULL
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

-- Additional McDonald's signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'labor_rights', 'nlrb_filing', 'NLRB Case Files', 'NLRB ruled McDonalds could be considered joint employer with franchisees for labor violations', 'high', NULL
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

-- Additional Pfizer signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'healthcare', 'public_record', 'WHO / MSF Reports', 'Criticism over COVID-19 vaccine pricing and access inequity in developing nations', 'high', NULL
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

-- Additional General Dynamics signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'government_contracts', 'public_record', 'USASpending.gov', 'Major IT contracts with intelligence agencies through GDIT subsidiary handling classified information systems', 'high', 8000000000
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

-- Additional Coca-Cola signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'dei_equity', 'news_report', 'Bloomberg / WSJ', 'Reduced external diversity requirements for law firms after initially mandating 30% diverse attorneys', 'medium', NULL
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

-- Additional AT&T signals
INSERT INTO public.issue_signals (entity_id, issue_category, signal_type, source_dataset, description, confidence_score, amount)
SELECT id, 'lobbying', 'lobbying_disclosure', 'OpenSecrets', 'Lobbied for deregulation of broadband services and against municipal broadband competition', 'high', 12600000
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;
