
# CivicLens — Corporate Political Transparency Tool

## What We're Building
A clean, professional web app where anyone can search a company and instantly see its political donations, PAC spending, and connections to specific political movements — helping people make informed decisions about where they work and shop.

## Pages & Features

### 1. Landing Page
- Bold headline explaining the tool's mission
- Prominent search bar ("Search any company...")
- Featured/trending companies section
- Brief "How it works" explainer

### 2. Company Profile Page
- **Overview card**: Company name, industry, revenue range, logo
- **Political Spending Summary**: Total PAC contributions, top recipients, party breakdown (pie chart)
- **Candidates Supported**: List of politicians funded, with party, district, and donation amounts
- **Alignment Score**: A simple visual score (e.g., red/yellow/green) based on flagged affiliations
- **Executive Donors**: Key executives and their personal political contributions
- **Sources & Disclaimers**: Links to FEC data, date of last update

### 3. Search Results Page
- List of matching companies with mini-summary cards
- Filters: industry, state, alignment score

### 4. Browse/Directory Page
- Pre-curated list of major companies with their scores
- Category filters (retail, tech, food, etc.)

### 5. Auth & User Features (Phase 2 extras)
- Sign up / login (email-based)
- Save/bookmark companies to a watchlist
- Get alerts when new donation data is added

## Data Strategy
- **Phase 1 (Launch)**: Curated database of top 50-100 companies with manually researched political spending data, stored in Supabase
- **Phase 2**: Integrate OpenFEC API via edge functions to pull live campaign finance data for any company searched
- Admin interface for adding/editing company data

## Design
- Clean, neutral color palette (think ProPublica/OpenSecrets)
- Data visualizations using Recharts (pie charts for party split, bar charts for spending)
- Mobile-responsive
- Trust signals: source citations, last-updated dates

## Tech Approach
- **Frontend**: React + Tailwind + shadcn/ui components
- **Backend**: Supabase (Lovable Cloud) for database, auth, and edge functions
- **Database tables**: companies, candidates, donations, executives, flagged_organizations, user_watchlists
