-- Correction 1: Update Meta employee count from ~86,000 to ~78,865 (StockAnalysis.com, Dec 2025)
UPDATE companies SET employee_count = '~78,865' WHERE slug = 'meta';

-- Correction 2: Update Amazon PAC total from $612,400 to $1,583,307 (OpenSecrets/FEC, 2023-2024 cycle)
UPDATE companies SET total_pac_spending = 1583307 WHERE slug = 'amazon';

-- Correction 2 (cont): Update Amazon party breakdown to 50.56% D / 49.44% R per OpenSecrets
DELETE FROM company_party_breakdown WHERE company_id = (SELECT id FROM companies WHERE slug = 'amazon');
INSERT INTO company_party_breakdown (company_id, party, amount, color)
SELECT id, 'Democrat', 800517, 'hsl(211, 69%, 50%)' FROM companies WHERE slug = 'amazon'
UNION ALL
SELECT id, 'Republican', 782790, 'hsl(0, 72%, 51%)' FROM companies WHERE slug = 'amazon';

-- Correction 3: Update Amazon employee count from ~1,550,000 to ~1,576,000 (StockAnalysis.com, Dec 2025)
UPDATE companies SET employee_count = '~1,576,000' WHERE slug = 'amazon';

-- Correction 7 (partial): Fix Goldman Sachs 1MDB source from SEC to DOJ in issue_signals
UPDATE issue_signals SET source_dataset = 'DOJ', description = 'DOJ settlement over 1MDB Malaysian sovereign wealth fund scandal involving billions in misappropriated funds'
WHERE entity_id IN (SELECT id FROM companies WHERE slug = 'goldman-sachs')
  AND description LIKE '%1MDB%'
  AND source_dataset = 'SEC Enforcement';

-- Correction 7 (partial): Fix Goldman Sachs 1MDB source in public_stances
UPDATE company_public_stances SET spending_reality = 'DOJ settlement over 1MDB scandal involving billions in misappropriated funds; extensive revolving door with government'
WHERE company_id IN (SELECT id FROM companies WHERE slug = 'goldman-sachs')
  AND topic = 'Ethics and Compliance'
  AND spending_reality LIKE '%SEC settlement over 1MDB%';
