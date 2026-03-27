

## Fix: Consolidate duplicate industries in Browse dropdown

### Problem
The database has ~120 distinct industry values with massive fragmentation. Examples:
- **Retail variants**: "Retail", "Apparel Retail", "Department Store Retail", "Grocery Retail", "Retail & Apparel", "Retail Apparel and Fashion", "Specialty Retail", "Jewelry Retail", "Retail - Convenience Stores", "Retail - Sporting Goods", "Retail (Arts & Crafts)", "Non-profit / Retail", etc.
- **Food variants**: "Food & Beverage", "Beverage", "Beverages", "Beverage Manufacturing", "Fast Food Restaurant", "Fast Food Restaurants", "Fast-Casual Restaurant", "Fast Casual Restaurant", "Organic Food and Beverage", "Ice Cream / Food and Beverage", "Restaurant & Dairy"
- **Tech variants**: "Technology", "Information Technology", "Software", "Software Development", "AI / Technology", "Artificial Intelligence", "Cybersecurity", "Cloud Computing...", "Internet Software and Services", etc.
- **HR variants**: "HR Tech / Fintech", "HR Technology", "Human Resources Consulting", "Human Resources Software", "Human Resources Technology (HR Tech)"

### Solution
Create an industry normalization utility that maps all granular values to ~15-20 broad categories for the dropdown filter, while preserving the original value for display on individual company cards.

### Changes

**1. New file: `src/utils/industryNormalization.ts`**
- A mapping from keyword patterns to canonical industry names
- Categories: Technology, Healthcare, Finance, Energy, Retail, Manufacturing, Food & Beverage, Media & Entertainment, Telecommunications, Defense, Education, Automotive, Pharmaceuticals, Real Estate, Transportation, Insurance, Consulting, Agriculture, Non-profit, Government, Other
- Function `normalizeIndustry(raw: string): string` that matches against the map

**2. Update `src/pages/Browse.tsx`**
- Import `normalizeIndustry`
- Build `allIndustries` from normalized values (deduped)
- Filter by normalized industry instead of raw value
- Company cards still show the original granular industry text

### Industry mapping (key patterns → canonical name)

| Canonical | Matches (substring/keyword) |
|---|---|
| Technology | technology, software, AI, cybersecurity, cloud, IoT, internet, semiconductor, information technology |
| Healthcare | healthcare, veterinary, senior living, animal health |
| Finance | finance, financial, banking, fintech, cryptocurrency |
| Retail | retail, apparel, footwear, grocery, department store, sporting goods, jewelry, convenience store, home goods |
| Food & Beverage | food, beverage, restaurant, coffee, ice cream, dairy |
| Energy | energy, oil, gas, renewable, utilities, green tech |
| Manufacturing | manufacturing, electronics manufacturing |
| Media & Entertainment | media, entertainment, streaming, broadcasting, animation, publishing, live entertainment |
| Telecommunications | telecom, telecommunications |
| Defense | defense, private prison, detention |
| Education | education, higher education, K-12 |
| HR & Consulting | HR, human resources, consulting |
| Pharmaceuticals | pharma |
| Insurance | insurance |
| Real Estate | real estate |
| Automotive | automotive |
| Transportation | transportation |
| Agriculture | agriculture |
| Non-profit | non-profit, philanthropy |
| Government | government |
| Other | unknown, pending, everything else |

### What the user sees
- Dropdown goes from ~120 entries to ~20 clean categories
- Selecting "Retail" filters to all retail-adjacent companies
- Individual company cards still show their specific industry label

