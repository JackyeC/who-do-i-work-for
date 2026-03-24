-- ============================================================================
-- 03-seed-public-stances.sql
-- Seed data for company_public_stances table
-- ~175 INSERT statements covering well-known companies' public positions vs spending reality
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- Run in Supabase SQL Editor
-- gap values: 'aligned', 'mixed', 'contradictory'
-- ============================================================================

-- ============================================================================
-- AMAZON
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'States commitment to safe, inclusive workplace and competitive compensation for all employees', 'Spent millions fighting unionization efforts; NLRB found multiple unfair labor practices at warehouses nationwide', 'contradictory'
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Co-founded The Climate Pledge committing to net-zero carbon by 2040; largest corporate buyer of renewable energy', 'Carbon footprint continued to grow with massive logistics expansion; delivery fleet emissions increased significantly', 'mixed'
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Data Privacy', 'Claims to prioritize customer trust and data protection across all services', 'FTC fined $30.8M for Ring and Alexa privacy violations; extensive data collection across all services', 'contradictory'
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Tax Fairness', 'Publicly supports investing in communities where it operates', 'Paid zero federal income tax in 2017-2018 despite billions in profits; received billions in tax incentives for HQ2', 'contradictory'
FROM public.companies WHERE slug = 'amazon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- APPLE
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Privacy', 'Markets itself as the privacy-first tech company; What happens on your iPhone stays on your iPhone', 'Strong privacy track record with App Tracking Transparency and on-device processing; consistently resists government backdoors', 'aligned'
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Publishes supplier responsibility reports and code of conduct for manufacturers', 'Ongoing reports of poor conditions at Foxconn and other suppliers; fought retail worker unionization efforts', 'contradictory'
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Claims to be carbon neutral for corporate operations; targets full supply chain by 2030', 'Significant investment in renewable energy and recycled materials; progress toward 2030 goals is measurable', 'aligned'
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Tax Fairness', 'Publicly states it pays all taxes owed in every country where it operates', 'EU ordered repayment of 13 billion euros in back taxes; used Irish subsidiaries for aggressive tax minimization', 'contradictory'
FROM public.companies WHERE slug = 'apple'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- META
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Data Privacy', 'Claims to give users control over their data and protect user privacy', 'Paid $5 billion FTC fine for Cambridge Analytica; built business model on extensive data collection and tracking', 'contradictory'
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Previously committed to increasing diversity in workforce and leadership', 'Rolled back DEI programs in 2025; eliminated diversity hiring goals and disbanded DEI team', 'contradictory'
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Content Safety', 'Publicly commits to fighting misinformation and harmful content on platforms', 'Internal research showed Instagram harms teen mental health; whistleblower revealed company prioritized engagement over safety', 'contradictory'
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Previously promoted Pride campaigns and LGBTQ-friendly workplace policies', 'Removed gender identity from hate speech protections in 2025; scaled back LGBTQ content moderation', 'contradictory'
FROM public.companies WHERE slug = 'meta'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MICROSOFT
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Pledged to be carbon negative by 2030 and remove all historical emissions by 2050', 'Invested $1B in climate innovation fund; actual emissions increased due to AI data center expansion', 'mixed'
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'AI Ethics', 'Published responsible AI principles and created AI ethics board and oversight processes', 'Provides AI technology to military and law enforcement; fired ethics team members who raised concerns', 'mixed'
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Publicly supports workers right to organize and chose union representation', 'Voluntarily recognized unions at Activision Blizzard studios; signed labor neutrality agreement with CWA', 'aligned'
FROM public.companies WHERE slug = 'microsoft'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOOGLE
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Previously set ambitious diversity goals and published annual diversity reports', 'Scaled back diversity programs and targets in 2025; fired AI ethics researchers who highlighted bias issues', 'contradictory'
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Data Privacy', 'Provides user privacy controls and claims to protect user data', '$391.5M settlement for deceptive location tracking; business model fundamentally based on surveillance advertising', 'contradictory'
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'AI Ethics', 'Published AI Principles pledging not to develop AI for weapons or surveillance', 'Project Nimbus military contract with Israeli government; fired researchers who raised ethical concerns', 'contradictory'
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Touts inclusive workplace culture and employee empowerment', 'NLRB ruled Google illegally fired organizing workers; retaliated against employees protesting military contracts', 'contradictory'
FROM public.companies WHERE slug = 'google'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TESLA
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Mission to accelerate the worlds transition to sustainable energy through EVs and solar', 'Genuine positive climate impact through EV adoption; however CEO actively undermines climate policy discourse', 'mixed'
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'States commitment to diverse and inclusive workplace free from discrimination', 'California DFEH lawsuit over widespread racial discrimination at Fremont factory; multiple jury verdicts against company', 'contradictory'
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Claims to offer competitive compensation and best-in-class benefits', 'NLRB found illegal threats against union activity; CEO tweeted workers must give up stock options to unionize', 'contradictory'
FROM public.companies WHERE slug = 'tesla'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WALMART
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Claims to provide opportunity and upward mobility for associates', 'Decades of anti-union activity; many workers still rely on public assistance despite raising minimum wage', 'contradictory'
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gun Policy', 'Took steps to restrict firearm sales after mass shootings including raising purchase age to 21', 'Removed certain ammunition and firearms from stores; concrete action aligning with stated position', 'aligned'
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Project Gigaton aims to reduce supply chain emissions by 1 billion metric tons by 2030', 'Some progress on renewable energy but still massive carbon footprint from global logistics operations', 'mixed'
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Promotes equal opportunity and advancement for women in retail workforce', 'Largest class-action gender discrimination lawsuit in US history (Dukes v. Walmart) over pay and promotion bias', 'contradictory'
FROM public.companies WHERE slug = 'walmart'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HOME DEPOT
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Corporate policies include non-discrimination protections for LGBTQ employees', 'Co-founder Bernie Marcus donated to organizations opposing LGBTQ rights; company distanced but damage done', 'mixed'
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Committed to eco-friendly products and energy-efficient store operations', 'Invested in LED lighting and solar installations; some environmental improvements in product lines', 'mixed'
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Data Privacy', 'Pledged to protect customer data after major breach incident', 'Paid $17.5M settlement after 56 million customer credit cards exposed in 2014 breach', 'mixed'
FROM public.companies WHERE slug = 'home-depot'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TARGET
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Previously championed Pride merchandise and LGBTQ-inclusive marketing', 'Removed Pride merchandise in 2023 after threats; retreated from inclusive stance under pressure', 'contradictory'
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Previously committed to racial equity and diverse representation goals', 'Ended DEI goals and programs in January 2025; followed broader corporate retreat from diversity initiatives', 'contradictory'
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Raised minimum wage to $15/hr and subsequently higher for some positions', 'Genuine wage increases above federal minimum; one of first major retailers to commit to $15/hr', 'aligned'
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Target Forward sustainability strategy targeting net zero emissions by 2040', 'Some progress on clean energy and sustainable products but long way from net-zero goals', 'mixed'
FROM public.companies WHERE slug = 'target'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STARBUCKS
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Claims to be a partner-first company that values worker voice', 'Over 100 NLRB complaints for anti-union activity; fired organizers and closed unionized stores', 'contradictory'
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare', 'Provides health insurance to part-time workers; touted as industry-leading benefit', 'Genuinely provides health coverage to part-timers working 20+ hours; one of few retailers to do so', 'aligned'
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Closed 8000 stores for racial bias training after Philadelphia incident in 2018', 'Training initiative was a positive step but critics argued it was performative one-day event without structural change', 'mixed'
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Historically had strong LGBTQ-friendly policies and supported Pride events', 'Workers alleged company restricted Pride decorations in stores; mixed signals under different leadership', 'mixed'
FROM public.companies WHERE slug = 'starbucks'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NIKE
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Ran bold Colin Kaepernick ad campaign supporting racial justice and equality', 'Campaign aligned with brand spending and product launches; genuine financial commitment to stance', 'aligned'
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Publishes supplier code of conduct requiring fair wages and safe conditions', 'Continued reports of sweatshop conditions at overseas factories; code of conduct enforcement inconsistent', 'contradictory'
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Promotes women in sports and female empowerment in marketing', 'Internal gender discrimination led to exodus of senior executives in 2018; workplace culture contradicted marketing', 'contradictory'
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Move to Zero campaign targeting zero carbon and zero waste across operations', 'Invested in recycled materials and sustainable products; genuine progress but long way to go', 'mixed'
FROM public.companies WHERE slug = 'nike'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DISNEY
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Eventually spoke out against Floridas Dont Say Gay bill after employee pressure', 'Initially failed to oppose the bill; PAC donated to its sponsors while employees demanded action', 'contradictory'
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Promotes Disney as magical workplace with career opportunities', 'Theme park workers reported poverty wages while CEO compensation exceeded $30 million', 'contradictory'
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Committed to diverse representation in content and workforce', 'Scaled back public DEI messaging after political backlash while maintaining some internal programs', 'mixed'
FROM public.companies WHERE slug = 'disney'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JPMORGAN CHASE
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Pledged to align financing with Paris Agreement goals and achieve net-zero by 2050', 'Worlds largest funder of fossil fuel projects; over $430 billion in fossil fuel financing since Paris Agreement', 'contradictory'
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Committed $30 billion to advance racial equity in lending and business investment', 'Significant financial commitment with measurable programs; implementation progress tracked publicly', 'aligned'
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Protection', 'Claims to put customers first and act with integrity', 'Repeated CFPB fines for illegal credit card practices and mortgage overcharges', 'contradictory'
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Financial Regulation', 'Publicly acknowledges need for sound banking regulation', 'Spends over $11M annually lobbying against banking regulations and capital requirements', 'contradictory'
FROM public.companies WHERE slug = 'jpmorgan-chase'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOLDMAN SACHS
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Previously required IPO clients to have at least one diverse board member', 'Rolled back board diversity requirements after pushback; retreated from DEI commitments', 'contradictory'
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Publicly promotes women in finance and leadership programs', 'Settled $215M class action over gender pay discrimination affecting female employees', 'contradictory'
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics and Compliance', 'Promotes culture of integrity and ethical business practices', 'DOJ settlement over 1MDB scandal involving billions in misappropriated funds; extensive revolving door with government', 'contradictory'
FROM public.companies WHERE slug = 'goldman-sachs'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BANK OF AMERICA
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Committed to achieving net-zero greenhouse gas emissions by 2050', 'Continues to be major funder of fossil fuel projects while making climate pledges', 'contradictory'
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Raised minimum wage to $23/hr with commitment to $25/hr by 2025', 'Genuine industry-leading wage increases for banking sector employees', 'aligned'
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gun Policy', 'Stopped lending to military-style firearms manufacturers after Parkland', 'Followed through on commitment; concrete action aligning with public statement', 'aligned'
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Protection', 'Pledges to treat customers fairly and transparently', 'CFPB fined for double-charging junk fees and withholding credit card rewards from customers', 'contradictory'
FROM public.companies WHERE slug = 'bank-of-america'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- WELLS FARGO
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Trust', 'Claims to have reformed culture and rebuilt trust after fake accounts scandal', 'Continued regulatory penalties and new violations discovered even after cultural reform pledges', 'contradictory'
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Publicly committed to diverse hiring and inclusive workplace', 'Conducted fake job interviews with minority candidates for positions already filled to meet diversity metrics', 'contradictory'
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Housing', 'States commitment to fair and equitable lending practices', 'DOJ settlements over discriminatory mortgage lending that charged higher rates to Black and Hispanic borrowers', 'contradictory'
FROM public.companies WHERE slug = 'wells-fargo'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXXONMOBIL
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Now acknowledges climate change and promotes carbon capture technology', 'Knew about climate change since 1977 and funded denial for decades; lobbies against emissions regulations', 'contradictory'
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'Promotes Advancing Climate Solutions initiative and lower-emission technologies', 'Capital spending overwhelmingly on fossil fuel production; renewables investment negligible percentage', 'contradictory'
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Tax Fairness', 'Publicly supports fair tax system and economic growth', 'Paid zero federal income tax in 2018 on $20 billion profit through aggressive tax avoidance strategies', 'contradictory'
FROM public.companies WHERE slug = 'exxonmobil'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHEVRON
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Promotes lower carbon future and invests in carbon capture technology', 'Among top 20 companies responsible for one-third of global emissions; lobbies against climate regulation', 'contradictory'
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Environmental Responsibility', 'Claims commitment to environmental protection in operations', 'Decades-long legal battle over massive oil contamination in Ecuadorian Amazon affecting indigenous communities', 'contradictory'
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Community Engagement', 'Promotes partnerships with local communities near operations', 'Richmond refinery fire sent 15000 residents to hospitals; pattern of environmental violations near communities', 'contradictory'
FROM public.companies WHERE slug = 'chevron'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SHELL
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Promoted Powering Progress strategy with net-zero emissions target by 2050', 'Scaled back renewable energy targets to focus on profitable oil and gas; appealed Dutch court emissions order', 'contradictory'
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Environmental Responsibility', 'Claims commitment to environmental stewardship and clean operations', 'Decades of oil spills in Niger Delta causing severe environmental damage to local communities', 'contradictory'
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Clean Energy Transition', 'Publicly promotes natural gas as bridge fuel to renewable future', 'Spent millions on PR for natural gas while lobbying against renewable energy mandates', 'contradictory'
FROM public.companies WHERE slug = 'shell'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BP
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Rebranded as Beyond Petroleum promoting clean energy transition', 'Retreated from climate commitments in 2023; slowed renewable investments to boost oil and gas production', 'contradictory'
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Environmental Responsibility', 'Promotes safety culture and environmental protection in operations', 'Deepwater Horizon was largest marine oil spill in history; Texas City explosion killed 15 workers', 'contradictory'
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Individual Carbon Responsibility', 'Popularized the personal carbon footprint concept encouraging individual action', 'Promoted individual responsibility to deflect from corporate emissions; continues massive fossil fuel production', 'contradictory'
FROM public.companies WHERE slug = 'bp'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PFIZER
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare Access', 'Promotes patient access programs and commitment to affordable medicines', 'Dramatic price increases on essential medications; lobbies against drug pricing reforms and Medicare negotiation', 'contradictory'
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Global Health', 'Rapid COVID-19 vaccine development demonstrated commitment to global health', 'Genuine contribution to pandemic response; however vaccine pricing and access inequity in developing nations drew criticism', 'mixed'
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics and Compliance', 'Promotes ethical business practices and compliance programs', 'Paid $2.3 billion in largest healthcare fraud settlement for illegal off-label drug promotion', 'contradictory'
FROM public.companies WHERE slug = 'pfizer'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- JOHNSON & JOHNSON
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Safety', 'Our Credo puts patients and consumers first; commitment to product safety', 'Talcum powder cancer lawsuits and asbestos contamination; $8.9 billion proposed settlement', 'contradictory'
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare', 'Promotes commitment to improving health outcomes worldwide', 'Role in opioid crisis through promotion of opioid painkillers; $5 billion settlement with states', 'contradictory'
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Publicly committed to health equity and addressing racial health disparities', 'Lawsuits alleged company targeted talcum powder marketing toward Black women despite known cancer risks', 'contradictory'
FROM public.companies WHERE slug = 'johnson-and-johnson'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UNITEDHEALTH GROUP
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare Access', 'Mission to help people live healthier lives and improve the health system', 'AI-driven claim denials at high rates; pattern of prior authorization delays denying legitimate medical care', 'contradictory'
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare Reform', 'Publicly supports improving healthcare system efficiency and outcomes', 'Lobbies heavily against single-payer and public option proposals that would reduce private insurance role', 'contradictory'
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Data Privacy', 'Claims to protect sensitive health information and patient privacy', 'Change Healthcare data breach in 2024 exposed health data of approximately 100 million Americans', 'contradictory'
FROM public.companies WHERE slug = 'unitedhealth-group'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BOEING
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Safety', 'Claims safety is the companys top priority in aircraft manufacturing', 'Two 737 MAX crashes killed 346 people; door plug blowout in 2024; systemic quality control failures', 'contradictory'
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics and Integrity', 'Promotes culture of ethics, integrity, and transparency', 'DOJ deferred prosecution for conspiracy to defraud FAA; concealed information about MCAS system from regulators', 'contradictory'
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Relations', 'Values skilled workforce as foundation of aircraft manufacturing excellence', 'Threatened to move production from unionized facilities; machinist strikes over pay and pension cuts', 'contradictory'
FROM public.companies WHERE slug = 'boeing'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LOCKHEED MARTIN
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'National Security', 'Committed to protecting national security and supporting military readiness', 'Over 70% of revenue from government contracts; genuine alignment between stated mission and business model', 'aligned'
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'Publishes sustainability reports and commits to environmental goals', 'Manufactures weapons systems used in conflict zones; sustainability claims sit alongside core military products', 'mixed'
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics', 'Promotes ethical business practices and responsible governance', 'Extensive revolving door with Pentagon officials raises conflict-of-interest concerns; $12.8M annual lobbying', 'mixed'
FROM public.companies WHERE slug = 'lockheed-martin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RAYTHEON
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'National Security', 'Mission to make the world a safer place through advanced defense technology', 'Major weapons manufacturer; products used in conflicts worldwide including controversial arms sales', 'mixed'
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics', 'Promotes ethical business practices and transparent government relations', 'Former Secretary of Defense sat on board; DOJ settlement for fraudulent pricing on government contracts', 'contradictory'
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Commits to diverse and inclusive workforce in defense industry', 'Maintains diversity programs and veteran hiring initiatives; genuine effort in traditionally homogeneous industry', 'mixed'
FROM public.companies WHERE slug = 'raytheon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NORTHROP GRUMMAN
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'National Security', 'Defines purpose as enabling global security through advanced technology', 'Critical to nuclear weapons infrastructure; consistent alignment between stated purpose and business reality', 'aligned'
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'Published environmental sustainability goals and annual ESG reports', 'Manufacturing nuclear weapons and defense systems while promoting environmental responsibility', 'mixed'
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics and Governance', 'Promotes ethical standards and transparent government relationships', 'Extensive revolving door between company and Pentagon; $13.2M in annual lobbying spending', 'mixed'
FROM public.companies WHERE slug = 'northrop-grumman'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GENERAL DYNAMICS
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'National Security', 'Mission to support those who serve through advanced defense technologies', 'Major defense contractor with submarines, tanks, and IT systems; business aligned with stated mission', 'aligned'
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Ethics', 'Promotes strong governance and ethical business conduct', 'Extensive revolving door with Pentagon; provides IT infrastructure for ICE detention operations', 'mixed'
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Immigration', 'No public position taken on immigration policy', 'GDIT subsidiary provides IT infrastructure supporting ICE detention and border enforcement operations', 'mixed'
FROM public.companies WHERE slug = 'general-dynamics'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMCAST
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Net Neutrality', 'Previously stated support for open internet principles', 'Spent millions lobbying against net neutrality rules; among top opponents of FCC regulations', 'contradictory'
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Service', 'Promotes commitment to improving customer experience', 'Consistently rated among worst companies for customer service; fined for deceptive billing practices', 'contradictory'
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Promotes diversity in media representation through NBC Universal content', 'Some genuine progress in diverse content creation; mixed record on corporate diversity', 'mixed'
FROM public.companies WHERE slug = 'comcast'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AT&T
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Privacy', 'Claims to protect customer communications and data', 'NSA Fairview program provided bulk surveillance access; massive 2024 data breach exposed customer records', 'contradictory'
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Protection', 'Promotes transparent pricing and customer-first values', 'FTC $60 million settlement for throttling unlimited data plans while charging full price', 'contradictory'
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Media Integrity', 'Positions itself as responsible media company through WarnerMedia properties', 'Funded One America News Network which spread election disinformation per Reuters investigation', 'contradictory'
FROM public.companies WHERE slug = 'att'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIZON
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Privacy', 'Claims to protect customer privacy and security', 'Provided bulk phone metadata to NSA; fined for using supercookies to track customers without consent', 'contradictory'
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Digital Inclusion', 'Promotes digital equity and broadband access programs', 'Lobbied against municipal broadband and net neutrality which would increase internet access', 'contradictory'
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Committed to carbon neutral operations by 2035 and 50% emissions reduction by 2030', 'Significant investment in renewable energy for network operations; credible progress toward goals', 'mixed'
FROM public.companies WHERE slug = 'verizon'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FOX CORPORATION
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Journalism Integrity', 'Claims to provide fair and balanced news coverage', 'Settled Dominion defamation suit for $787.5M over knowingly broadcasting false election fraud claims', 'contradictory'
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Fox Corp pledged to reach carbon neutral operations by 2030', 'Fox News programming consistently downplayed climate science and opposed climate legislation', 'contradictory'
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Implemented workplace policies after sexual harassment scandals', 'Multiple sexual harassment lawsuits including Roger Ailes and Bill OReilly cases totaling tens of millions', 'contradictory'
FROM public.companies WHERE slug = 'fox-corporation'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NEWS CORP
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Journalism Ethics', 'Claims commitment to journalistic integrity and editorial independence', 'Phone hacking scandal at News of the World; Murdoch outlets use editorial influence for political advocacy', 'contradictory'
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Announced commitment to become carbon neutral by 2030', 'Australian newspapers promoted climate skepticism and opposed emissions reduction policies for years', 'contradictory'
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Media Diversity', 'Promotes diverse viewpoints and editorial perspectives', 'Concentration of media ownership raises concerns about media diversity and democratic discourse', 'contradictory'
FROM public.companies WHERE slug = 'news-corp'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- KOCH INDUSTRIES
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Has gradually acknowledged some climate concerns in recent years', 'Spent over $145M funding climate denial organizations and fighting clean energy legislation for decades', 'contradictory'
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Free Markets', 'Promotes free market principles and limited government intervention', 'Receives government subsidies while fighting regulations; uses dark money network to influence policy', 'contradictory'
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Education', 'Promotes educational freedom and academic excellence', 'Donated hundreds of millions to universities with conditions influencing academic appointments and curricula', 'mixed'
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Claims to value employees and create opportunity', 'Funded organizations through ALEC opposing union rights, minimum wage increases, and labor protections', 'contradictory'
FROM public.companies WHERE slug = 'koch-industries'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HOBBY LOBBY
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Religious Freedom', 'Fought for religious liberty exemption from ACA contraceptive mandate', 'Won Supreme Court case; policies consistently align with owners religious beliefs', 'aligned'
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Reproductive Rights', 'Opposes contraceptive coverage based on religious convictions', 'Successfully obtained Supreme Court exemption from providing contraceptive coverage; consistent position', 'aligned'
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Cultural Heritage', 'Promoted biblical history through Museum of the Bible investment', 'Paid $3 million fine for smuggling Iraqi antiquities through fraudulent customs declarations', 'contradictory'
FROM public.companies WHERE slug = 'hobby-lobby'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHICK-FIL-A
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Announced in 2019 would stop donating to organizations with anti-LGBTQ positions', 'Historical WinShape Foundation funding of anti-LGBTQ groups; shifted focus but reputation persists', 'mixed'
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Promotes caring workplace culture and invests in employee development', 'Among highest-rated fast food employers; relatively higher pay and better benefits for industry', 'aligned'
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Community Investment', 'Focuses on youth education and community development through foundation', 'Consistent scholarship programs and community investments through Chick-fil-A Foundation', 'aligned'
FROM public.companies WHERE slug = 'chick-fil-a'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PATAGONIA
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Earth is now our only shareholder; transferred ownership to climate trust', 'All profits directed to fighting climate change; $3 billion company transferred to environmental trust', 'aligned'
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Committed to fair labor practices throughout supply chain', 'Fair Trade Certified supply chain with living wage initiatives; Milk with Dignity partnerships', 'aligned'
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'Dont buy this jacket campaigns encouraging reduced consumption', 'Genuine investment in repair programs, recycled materials, and anti-consumerism despite being a retailer', 'aligned'
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Political Engagement', 'Uses business as force for environmental activism and policy change', 'Donated $10M tax cut savings to environmental groups; lobbies for public lands and climate policy', 'aligned'
FROM public.companies WHERE slug = 'patagonia'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COSTCO
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Promotes industry-leading wages and benefits for all employees', 'Starting pay significantly above minimum wage with comprehensive benefits; consistently follows through', 'aligned'
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Board rejected shareholder proposal to eliminate DEI programs in 2025', 'Maintained commitment to diversity initiatives when most corporations retreated; consistent stance', 'aligned'
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Healthcare', 'Provides comprehensive health insurance including to part-time workers', 'Among best benefits in retail sector; genuinely invests in employee healthcare access', 'aligned'
FROM public.companies WHERE slug = 'costco'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BEN & JERRY'S
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Publicly called to defund the police and dismantle white supremacy', 'Among most politically active brands; consistent advocacy backed by foundation spending and campaigns', 'aligned'
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Strong climate advocacy and commitment to sustainable dairy sourcing', 'Invested in reducing emissions from dairy supply chain; however ice cream production has inherent carbon footprint', 'mixed'
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'LGBTQ+ Rights', 'Long-standing advocacy for marriage equality and LGBTQ rights', 'Consistent support through product campaigns, donations, and public statements; aligned with spending', 'aligned'
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Corporate Independence', 'Independent board maintains social mission autonomy from Unilever parent', 'Tensions with Unilever parent company over political stances; sued Unilever over sale restrictions', 'mixed'
FROM public.companies WHERE slug = 'ben-and-jerrys'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COCA-COLA
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'World Without Waste initiative to collect and recycle every bottle by 2030', 'Named worlds top plastic polluter multiple years running; recycling targets far from being met', 'contradictory'
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Public Health', 'Promotes balanced lifestyles and offers low-sugar product alternatives', 'Funded research to downplay link between sugary beverages and obesity; lobbied against sugar taxes', 'contradictory'
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'DEI', 'Previously set diversity requirements for outside law firms', 'Reduced external diversity requirements after initially mandating 30% diverse attorneys', 'mixed'
FROM public.companies WHERE slug = 'coca-cola'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PEPSICO
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'pep+ sustainability transformation targeting net-zero by 2040 and net water positive', 'Among top global plastic polluters; genuine investments in sustainability mixed with continued single-use plastics', 'mixed'
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Public Health', 'Promotes healthier product options and responsible marketing', 'Lobbied against soda taxes and nutritional labeling; funded health organizations to downplay beverage risks', 'contradictory'
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Committed $400M to support Black communities and increase diverse representation', 'Made genuine investments in diversity programs and community initiatives; progress tracked publicly', 'mixed'
FROM public.companies WHERE slug = 'pepsico'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MCDONALDS
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Supports raising starting wages at company-owned restaurants', 'Franchise model used to avoid responsibility for worker wages; lobbied against minimum wage increases', 'contradictory'
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Promotes safe and respectful workplace for all employees', 'Multiple lawsuits over systemic sexual harassment at franchise locations; $26M harassment settlement', 'contradictory'
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Sustainability', 'Pledged renewable packaging and greenhouse gas emission reductions', 'Some progress on packaging sustainability but massive global footprint makes goals challenging', 'mixed'
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Publicly committed to equity and opportunity for all', 'Black franchise owners filed discrimination suit alleging steering to lower-revenue locations', 'contradictory'
FROM public.companies WHERE slug = 'mcdonalds'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TYSON FOODS
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Worker Safety', 'Claims commitment to workplace safety as top priority', 'Meatpacking workers face injury rates far above average; COVID outbreaks killed multiple workers', 'contradictory'
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Environmental Responsibility', 'Committed to environmental stewardship and sustainable food production', 'Among largest water polluters in US; greenhouse emissions rivaling entire countries', 'contradictory'
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Immigration', 'No clear public position on immigration policy', 'History of hiring undocumented workers at facilities; ICE raids affected hundreds of employees', 'mixed'
FROM public.companies WHERE slug = 'tyson-foods'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UBER
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Claims drivers are independent entrepreneurs who value flexibility', 'Spent $200M on Prop 22 to avoid classifying drivers as employees with benefits and protections', 'contradictory'
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Safety', 'Promotes commitment to rider and driver safety', 'Reported thousands of sexual assault incidents; covered up major data breach affecting 57 million users', 'contradictory'
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Gender Equity', 'Overhauled culture after Susan Fowler revelations; hired new leadership', 'Made genuine cultural changes under new CEO; however systemic issues in gig worker treatment persist', 'mixed'
FROM public.companies WHERE slug = 'uber'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LYFT
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Brands itself as the friendly alternative that values driver wellbeing', 'Joined Prop 22 campaign to keep drivers as independent contractors without employee benefits', 'contradictory'
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Reproductive Rights', 'Pledged to cover legal fees for drivers sued under Texas abortion transportation ban', 'Followed through on commitment; concrete action supporting reproductive access', 'aligned'
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Committed to 100% electric vehicles on platform by 2030', 'Carbon-neutral rides through offsets since 2019; genuine EV transition efforts underway', 'mixed'
FROM public.companies WHERE slug = 'lyft'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AIRBNB
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Housing', 'Claims to help regular people earn extra income and promote travel', 'Contributes to housing affordability crisis by converting long-term rentals to short-term vacation rentals', 'contradictory'
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Racial Justice', 'Implemented anti-discrimination policies and Project Lighthouse after bias research', 'Took concrete steps to address documented discrimination against Black guests on platform', 'mixed'
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Refugee Support', 'Committed to providing temporary housing for 100,000 refugees worldwide', 'Provided genuine housing support for Afghan, Ukrainian, and other refugees; aligned with stated commitment', 'aligned'
FROM public.companies WHERE slug = 'airbnb'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DOORDASH
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Fair Wages', 'Claims dashers earn competitive income with flexible scheduling', 'Tip-skimming controversy where company used customer tips to subsidize base pay; DC AG lawsuit', 'contradictory'
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Labor Rights', 'Promotes gig work as flexible opportunity for workers', 'Contributed to Prop 22 campaign to avoid employee classification; workers lack benefits and protections', 'contradictory'
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Consumer Transparency', 'Claims transparent pricing and fees for customers and restaurants', 'Hidden fees and complex pricing criticized by consumer advocates and state attorneys general', 'contradictory'
FROM public.companies WHERE slug = 'doordash'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BLACKROCK
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'CEO Larry Fink previously wrote annual letters urging companies to address climate risk', 'Left Net Zero Asset Managers initiative in 2025; retreated from climate activism under political pressure', 'contradictory'
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'ESG Investing', 'Promoted ESG as material to long-term financial performance', 'Retreated from ESG language and voting less often for climate resolutions at shareholder meetings', 'contradictory'
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Housing', 'No strong public position on housing affordability', 'Institutional investment in single-family homes criticized for driving up housing prices in local markets', 'mixed'
FROM public.companies WHERE slug = 'blackrock'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BERKSHIRE HATHAWAY
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Climate Action', 'Minimal public position on climate; focuses on shareholder value', 'Repeatedly defeated shareholder proposals for climate risk disclosure; owns major fossil fuel investments', 'mixed'
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'ESG Transparency', 'Maintains that each subsidiary should manage its own ESG approach', 'Among last major corporations to resist ESG reporting and climate risk disclosure requirements', 'mixed'
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Tax Fairness', 'Warren Buffett publicly advocated for higher taxes on the wealthy (Buffett Rule)', 'Uses insurance float and investment strategies for lower effective tax rates despite public advocacy', 'mixed'
FROM public.companies WHERE slug = 'berkshire-hathaway'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CITADEL
-- ============================================================================
INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Market Fairness', 'Claims to provide liquidity and price improvement for retail investors', 'Payment for order flow practices scrutinized during GameStop controversy; profits from retail order flow', 'mixed'
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Education', 'CEO Ken Griffin makes major philanthropic donations to educational institutions', '$300M to Harvard and other educational gifts; genuine large-scale philanthropy', 'aligned'
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;

INSERT INTO public.company_public_stances (company_id, topic, public_position, spending_reality, gap)
SELECT id, 'Political Influence', 'No formal corporate political position; Griffin acts individually', 'CEO among largest individual political donors in US; funds conservative campaigns and dark money organizations', 'mixed'
FROM public.companies WHERE slug = 'citadel'
ON CONFLICT DO NOTHING;
