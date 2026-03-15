UPDATE companies SET 
  consumer_relevance = 'Fast food restaurants serving burgers, chicken, fries, and breakfast items. Over 13,000 U.S. locations. One of the most recognized consumer brands globally.',
  worker_relevance = 'One of the largest private employers in the U.S. (~200,000 corporate + franchise workers). Entry-level and management roles across restaurants, corporate offices, and supply chain.'
WHERE slug = 'mcdonalds';

UPDATE companies SET 
  consumer_relevance = 'Retail chain operating supercenters, grocery stores, and Sam''s Club warehouses. Largest retailer in the world by revenue.',
  worker_relevance = 'Largest private employer in the U.S. (~1.6M associates). Roles span retail, logistics, e-commerce, and corporate operations.'
WHERE slug = 'walmart';