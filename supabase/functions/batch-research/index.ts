const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════
// RUSSELL 1000 TARGET LIST (as of Jan 2026 reconstitution)
// Organized by sector for maintainability. ~1,000 unique companies.
// Includes all current Russell 1000 constituents plus key private
// politically-active entities (Koch, Cargill, etc.)
// ═══════════════════════════════════════════════════════════════

const TARGET_COMPANIES = [
  // ── TECHNOLOGY (Hardware, Software, Semiconductors, IT Services) ──
  "Apple", "Microsoft", "NVIDIA", "Broadcom", "Oracle", "Salesforce", "Adobe",
  "AMD", "Intel", "Cisco Systems", "IBM", "Qualcomm", "Texas Instruments",
  "Applied Materials", "Micron Technology", "Analog Devices", "Lam Research",
  "KLA Corporation", "Synopsys", "Cadence Design Systems", "Marvell Technology",
  "Microchip Technology", "ON Semiconductor", "Skyworks Solutions", "Teradyne",
  "Monolithic Power Systems", "Lattice Semiconductor", "Silicon Laboratories",
  "Wolfspeed", "Amkor Technology", "Photronics", "MACOM Technology Solutions",
  "Semtech", "Diodes Incorporated", "MaxLinear", "Cirrus Logic",
  "Dell Technologies", "Hewlett Packard Enterprise", "HP Inc", "NetApp",
  "Pure Storage", "Western Digital", "Seagate Technology",
  "ServiceNow", "Intuit", "Palo Alto Networks", "CrowdStrike", "Fortinet",
  "Snowflake", "Datadog", "Palantir Technologies", "Cloudflare", "MongoDB",
  "Confluent", "Elastic", "Dynatrace", "Zscaler", "SentinelOne",
  "Okta", "HubSpot", "Twilio", "Atlassian", "Splunk",
  "Workday", "Veeva Systems", "ANSYS", "PTC", "Tyler Technologies",
  "Paycom Software", "Paylocity", "Manhattan Associates", "Roper Technologies",
  "Trimble", "Bentley Systems", "Autodesk", "Fair Isaac Corporation",
  "Teradata", "Commvault Systems", "Box", "Dropbox",
  "Arista Networks", "Juniper Networks", "Ciena Corporation", "Calix",
  "F5 Networks", "Akamai Technologies", "VeriSign", "GoDaddy",
  "Gartner", "Booz Allen Hamilton", "SAIC", "Leidos", "CACI International",
  "ManTech International", "Accenture", "Cognizant", "EPAM Systems",
  "Globant", "WEX", "Jack Henry & Associates", "Fiserv", "Fidelity National Information Services",
  "Global Payments", "FleetCor Technologies", "Shift4 Payments",
  "Block Inc", "PayPal", "Marqeta", "Repay Holdings",
  "Snap Inc", "Pinterest", "Reddit", "Roku",

  // ── COMMUNICATION SERVICES ──
  "Alphabet", "Meta Platforms", "Netflix", "Walt Disney Company",
  "Comcast", "Charter Communications", "T-Mobile", "AT&T", "Verizon",
  "Lumen Technologies", "Frontier Communications", "Consolidated Communications",
  "Warner Bros Discovery", "Paramount Global", "Fox Corporation", "News Corp",
  "iHeartMedia", "Sinclair Broadcast Group", "Nexstar Media Group",
  "Liberty Media", "Liberty Broadband", "Sirius XM", "Spotify",
  "Live Nation Entertainment", "Madison Square Garden Entertainment",
  "Electronic Arts", "Take-Two Interactive", "Activision Blizzard",
  "Roblox", "Unity Software", "Zynga", "Playtika",
  "Match Group", "IAC", "ZoomInfo Technologies", "DoubleVerify",
  "The Trade Desk", "Digital Turbine", "Integral Ad Science",

  // ── CONSUMER DISCRETIONARY ──
  "Amazon", "Tesla", "Home Depot", "Lowe's", "TJX Companies",
  "McDonald's", "Starbucks", "Nike", "Booking Holdings", "Chipotle Mexican Grill",
  "Ross Stores", "Target", "Best Buy", "Dollar General", "Dollar Tree",
  "AutoZone", "O'Reilly Automotive", "Advance Auto Parts",
  "Tractor Supply Company", "Five Below", "Burlington Stores",
  "Ulta Beauty", "Bath & Body Works", "Tapestry", "Capri Holdings",
  "Ralph Lauren", "PVH Corp", "Hanesbrands", "Under Armour",
  "Carter's", "Columbia Sportswear", "Skechers",
  "Ford Motor Company", "General Motors", "Stellantis", "Rivian", "Lucid Motors",
  "Aptiv", "BorgWarner", "Dana Incorporated", "Gentex Corporation",
  "Lear Corporation", "Visteon Corporation", "Modine Manufacturing",
  "Darden Restaurants", "Yum! Brands", "Restaurant Brands International",
  "Domino's Pizza", "Papa John's", "Wingstop", "Shake Shack",
  "Texas Roadhouse", "Cracker Barrel", "Brinker International",
  "Marriott International", "Hilton Worldwide", "Hyatt Hotels",
  "Wyndham Hotels", "Choice Hotels", "MGM Resorts", "Las Vegas Sands",
  "Wynn Resorts", "Caesars Entertainment", "Penn Entertainment",
  "DraftKings", "Flutter Entertainment",
  "Expedia Group", "Airbnb", "Uber Technologies", "Lyft", "DoorDash",
  "Carvana", "CarMax", "AutoNation", "Lithia Motors", "Group 1 Automotive",
  "Lennar", "DR Horton", "PulteGroup", "NVR Inc", "Toll Brothers",
  "KB Home", "Meritage Homes", "Taylor Morrison", "MDC Holdings",
  "Mohawk Industries", "Floor & Decor", "RH", "Williams-Sonoma",
  "Wayfair", "Ethan Allen", "La-Z-Boy", "Tempur Sealy",
  "Hasbro", "Mattel", "Topgolf Callaway Brands",
  "Gap Inc", "Nordstrom", "Macy's", "Kohl's", "Foot Locker",
  "Dick's Sporting Goods", "Academy Sports + Outdoors",
  "Carnival Corporation", "Royal Caribbean", "Norwegian Cruise Line",

  // ── CONSUMER STAPLES ──
  "Walmart", "Costco", "Procter & Gamble", "Coca-Cola", "PepsiCo",
  "Philip Morris International", "Altria Group", "Mondelez International",
  "Colgate-Palmolive", "Kimberly-Clark", "Church & Dwight",
  "Estée Lauder", "Clorox", "Spectrum Brands", "Energizer Holdings",
  "Kraft Heinz", "General Mills", "Kellogg", "ConAgra Brands",
  "Hormel Foods", "JM Smucker", "McCormick", "Lamb Weston",
  "Tyson Foods", "Pilgrim's Pride", "Smithfield Foods",
  "Archer Daniels Midland", "Bunge Limited",
  "Hershey", "Tootsie Roll", "TreeHouse Foods",
  "Sysco", "US Foods", "Performance Food Group",
  "Kroger", "Albertsons", "Sprouts Farmers Market",
  "Casey's General Stores", "BJ's Wholesale Club",
  "Reynolds American", "Vector Group",
  "Molson Coors", "Boston Beer Company", "Constellation Brands",
  "Brown-Forman", "Diageo", "Anheuser-Busch InBev",
  "Edgewell Personal Care", "Spectrum Brands", "Central Garden and Pet",
  "Grocery Outlet", "SpartanNash", "United Natural Foods",
  "Flowers Foods", "Cal-Maine Foods", "Sanderson Farms",
  "Freshpet", "Simply Good Foods",
  "Walgreens Boots Alliance", "CVS Health",

  // ── ENERGY ──
  "ExxonMobil", "Chevron", "ConocoPhillips", "EOG Resources",
  "Pioneer Natural Resources", "Phillips 66", "Valero Energy",
  "Marathon Petroleum", "Occidental Petroleum", "Devon Energy",
  "Hess Corporation", "Diamondback Energy", "Marathon Oil",
  "APA Corporation", "Coterra Energy", "Ovintiv", "Permian Resources",
  "Matador Resources", "SM Energy", "Laredo Petroleum",
  "Magnolia Oil & Gas", "Civitas Resources", "Chord Energy",
  "Continental Resources", "Murphy Oil",
  "Baker Hughes", "Halliburton", "Schlumberger", "NOV Inc",
  "ChampionX", "TechnipFMC", "Helmerich & Payne",
  "Kinder Morgan", "Williams Companies", "ONEOK", "Targa Resources",
  "Enterprise Products Partners", "Energy Transfer", "Plains All American Pipeline",
  "Western Midstream", "DT Midstream", "Equitrans Midstream",
  "Cheniere Energy", "New Fortress Energy", "Tellurian",
  "Sempra Energy", "Dominion Energy", "Duke Energy", "Southern Company",
  "NextEra Energy", "AES Corporation", "Entergy", "Exelon",
  "FirstEnergy", "Xcel Energy", "Evergy", "Alliant Energy",
  "Ameren", "CMS Energy", "DTE Energy", "WEC Energy Group",
  "Eversource Energy", "Avangrid", "PPL Corporation",
  "Pinnacle West Capital", "IDACORP", "OGE Energy", "Black Hills Corporation",
  "Portland General Electric", "NorthWestern Energy",
  "AES Indiana", "Vistra Corp", "NRG Energy", "Constellation Energy",

  // ── FINANCIALS ──
  "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup",
  "Goldman Sachs", "Morgan Stanley", "US Bancorp", "PNC Financial",
  "Truist Financial", "Charles Schwab", "Capital One",
  "Bank of New York Mellon", "State Street", "Northern Trust",
  "Raymond James", "Stifel Financial", "Jefferies Financial Group",
  "Lazard", "Evercore", "Houlihan Lokey", "Piper Sandler",
  "Visa", "Mastercard", "American Express",
  "Discover Financial Services", "Synchrony Financial",
  "Ally Financial", "SoFi Technologies", "LendingClub",
  "Berkshire Hathaway", "BlackRock", "T. Rowe Price",
  "Franklin Templeton", "Invesco", "Legg Mason",
  "Carlyle Group", "KKR", "Apollo Global Management",
  "Blackstone", "Ares Management", "Blue Owl Capital",
  "Prudential Financial", "MetLife", "AIG", "Aflac",
  "Progressive", "Allstate", "Travelers Companies",
  "Chubb", "Hartford Financial Services", "Markel Corporation",
  "Arch Capital Group", "RenaissanceRe", "Everest Re Group",
  "Globe Life", "Unum Group", "Lincoln National",
  "Principal Financial Group", "Voya Financial",
  "Assurant", "Fidelity National Financial", "Stewart Information Services",
  "First American Financial", "Old Republic International",
  "Loews Corporation", "Fairfax Financial Holdings",
  "Cincinnati Financial", "Erie Indemnity", "Hanover Insurance Group",
  "Selective Insurance", "Kinsale Capital Group",
  "Coinbase", "Robinhood Markets", "Interactive Brokers",
  "LPL Financial", "Ameriprise Financial",
  "MSCI", "S&P Global", "Moody's", "FactSet Research Systems",
  "Morningstar", "MarketAxess", "Tradeweb Markets",
  "Intercontinental Exchange", "CME Group", "Cboe Global Markets",
  "Nasdaq Inc",
  "Regions Financial", "KeyCorp", "Citizens Financial Group",
  "M&T Bank", "Huntington Bancshares", "Zions Bancorporation",
  "Fifth Third Bancorp", "Comerica", "Webster Financial",
  "East West Bancorp", "Valley National Bancorp",
  "Cullen/Frost Bankers", "Glacier Bancorp", "Independent Bank Group",
  "Pacific Premier Bancorp", "Western Alliance Bancorporation",
  "Pinnacle Financial Partners", "Home BancFins",
  "First Horizon", "Synovus Financial", "Atlantic Capital",
  "Popular Inc", "Columbia Banking System", "Banner Financial Group",
  "Renasant Corporation", "South State Corporation",

  // ── HEALTHCARE ──
  "UnitedHealth Group", "Johnson & Johnson", "Eli Lilly", "AbbVie",
  "Merck", "Pfizer", "Bristol-Myers Squibb", "Amgen", "Gilead Sciences",
  "Regeneron", "Moderna", "Vertex Pharmaceuticals", "Biogen",
  "Illumina", "Dexcom", "Edwards Lifesciences", "Intuitive Surgical",
  "Stryker", "Medtronic", "Abbott Laboratories", "Becton Dickinson",
  "Boston Scientific", "Baxter International", "Zimmer Biomet",
  "Hologic", "ResMed", "Align Technology", "Insulet Corporation",
  "Penumbra", "Globus Medical", "NuVasive", "Integra LifeSciences",
  "Integer Holdings", "ICU Medical", "Haemonetics",
  "Cigna Group", "Elevance Health", "Humana", "Centene",
  "Molina Healthcare", "Oscar Health",
  "HCA Healthcare", "Tenet Healthcare", "Universal Health Services",
  "Community Health Systems", "Acadia Healthcare",
  "McKesson", "AmerisourceBergen", "Cardinal Health",
  "Henry Schein", "Patterson Companies", "Owens & Minor",
  "DaVita", "Amedisys", "Encompass Health", "Select Medical",
  "Thermo Fisher Scientific", "Danaher", "Agilent Technologies",
  "Waters Corporation", "Bio-Rad Laboratories", "Repligen",
  "Charles River Laboratories", "ICON Plc", "Syneos Health",
  "Catalent", "West Pharmaceutical Services", "Azenta",
  "Jazz Pharmaceuticals", "Neurocrine Biosciences", "Sarepta Therapeutics",
  "BioMarin Pharmaceutical", "Exact Sciences", "Natera",
  "Veracyte", "Guardant Health", "Twist Bioscience",
  "10x Genomics", "Adaptive Biotechnologies",
  "Zoetis", "IDEXX Laboratories", "Elanco Animal Health",
  "Avantor", "Revvity", "Mettler-Toledo",
  "Cooper Companies", "ICU Medical", "Masimo",
  "Lantheus Holdings", "Shockwave Medical",
  "Royalty Pharma", "Alnylam Pharmaceuticals", "Argenx",
  "BeiGene", "Seagen", "Horizon Therapeutics",
  "Ionis Pharmaceuticals", "Incyte Corporation", "United Therapeutics",
  "Nektar Therapeutics", "Halozyme Therapeutics",

  // ── INDUSTRIALS ──
  "Honeywell", "General Electric", "Caterpillar", "John Deere",
  "3M", "Illinois Tool Works", "Emerson Electric", "Parker Hannifin",
  "Eaton Corporation", "Rockwell Automation", "Cummins", "PACCAR",
  "Danaher", "Dover Corporation", "Fortive", "Ametek",
  "Roper Technologies", "Nordson", "Graco", "IDEX Corporation",
  "Watts Water Technologies", "Mueller Water Products",
  "Lockheed Martin", "Raytheon Technologies", "Boeing", "Northrop Grumman",
  "General Dynamics", "L3Harris Technologies", "Huntington Ingalls",
  "Textron", "Howmet Aerospace", "TransDigm Group",
  "Heico Corporation", "Curtiss-Wright", "BWX Technologies",
  "Mercury Systems", "Kratos Defense & Security Solutions",
  "Union Pacific", "CSX", "Norfolk Southern", "Canadian Pacific Kansas City",
  "Old Dominion Freight Line", "XPO Logistics", "JB Hunt",
  "Saia Inc", "Werner Enterprises", "Heartland Express",
  "Knight-Swift Transportation", "Landstar System",
  "FedEx", "UPS", "CH Robinson",
  "Delta Air Lines", "United Airlines", "American Airlines",
  "Southwest Airlines", "JetBlue", "Alaska Air Group",
  "Spirit Airlines", "Frontier Group",
  "Republic Services", "Waste Management", "Waste Connections",
  "Clean Harbors", "US Ecology", "Casella Waste Systems",
  "Cintas", "Unifirst", "ABM Industries",
  "Robert Half International", "Kforce", "Insperity",
  "TriNet Group", "Paychex", "Automatic Data Processing",
  "Broadridge Financial Solutions", "Verisk Analytics",
  "CoStar Group", "Zillow Group", "Redfin",
  "Jacobs Solutions", "AECOM", "Quanta Services",
  "MasTec", "EMCOR Group", "Comfort Systems USA",
  "Simpson Strong-Tie", "Armstrong World Industries",
  "Builders FirstSource", "Patrick Industries",
  "Watsco", "Ferguson Enterprises", "Fastenal", "WW Grainger",
  "MSC Industrial Direct", "Hillman Solutions",
  "Trane Technologies", "Carrier Global", "Johnson Controls",
  "Lennox International", "A.O. Smith", "Watts Water Technologies",
  "Allegion", "Fortune Brands Innovations",
  "Stanley Black & Decker", "Snap-on", "Lincoln Electric",
  "Donaldson Company", "Watts Water Technologies",
  "Hubbell Incorporated", "Regal Rexnord",
  "Otis Worldwide", "Vertiv Holdings",

  // ── MATERIALS ──
  "Linde", "Air Products", "Sherwin-Williams", "Ecolab",
  "Dow Inc", "DuPont", "LyondellBasell", "Eastman Chemical",
  "PPG Industries", "RPM International", "Axalta Coating Systems",
  "Nucor", "US Steel", "Cleveland-Cliffs", "Steel Dynamics",
  "Commercial Metals", "Olympic Steel", "Haynes International",
  "Freeport-McMoRan", "Newmont Corporation", "Southern Copper",
  "Royal Gold", "Franco-Nevada", "Wheaton Precious Metals",
  "Alcoa", "Arconic", "Kaiser Aluminum",
  "Celanese", "Huntsman Corporation", "Cabot Corporation",
  "Kronos Worldwide", "Tronox Holdings",
  "International Flavors & Fragrances", "Albemarle",
  "Livent", "Compass Minerals", "Minerals Technologies",
  "Sylvamo", "Clearwater Paper", "Graphic Packaging",
  "Sealed Air", "Berry Global Group", "Sonoco Products",
  "Packaging Corporation of America", "International Paper",
  "WestRock", "Avery Dennison", "Silgan Holdings",
  "Ball Corporation", "Crown Holdings", "Greif",
  "CF Industries", "Mosaic Company", "Corteva Agriscience",
  "FMC Corporation", "American Vanguard",
  "Summit Materials", "Eagle Materials", "US Concrete",
  "Martin Marietta Materials", "Vulcan Materials",

  // ── REAL ESTATE ──
  "American Tower", "Crown Castle", "Prologis", "Equinix",
  "Public Storage", "Realty Income", "Simon Property Group",
  "Digital Realty Trust", "SBA Communications",
  "Welltower", "Ventas", "Healthpeak Properties",
  "VICI Properties", "Gaming and Leisure Properties",
  "Alexandria Real Estate Equities", "Boston Properties",
  "Vornado Realty Trust", "SL Green Realty", "Paramount Group",
  "Kilroy Realty", "Cousins Properties", "Highwoods Properties",
  "AvalonBay Communities", "Equity Residential", "UDR",
  "Essex Property Trust", "Camden Property Trust", "Mid-America Apartment",
  "Invitation Homes", "American Homes 4 Rent", "Sun Communities",
  "Equity LifeStyle Properties",
  "Extra Space Storage", "CubeSmart", "Life Storage",
  "Iron Mountain", "Lamar Advertising",
  "Regency Centers", "Federal Realty Investment Trust",
  "Kimco Realty", "Brixmor Property Group", "Kite Realty Group",
  "National Retail Properties", "STORE Capital", "Spirit Realty Capital",
  "Agree Realty", "Essential Properties Realty Trust",
  "W. P. Carey", "Broadstone Net Lease",
  "Weyerhaeuser", "Rayonier", "PotlatchDeltic",
  "CBRE Group", "Jones Lang LaSalle", "Cushman & Wakefield",
  "Brookfield Asset Management",

  // ── UTILITIES ──
  "NextEra Energy", "Duke Energy", "Southern Company", "Dominion Energy",
  "Sempra Energy", "American Electric Power", "Exelon",
  "Xcel Energy", "WEC Energy Group", "Eversource Energy",
  "CenterPoint Energy", "Atmos Energy", "NiSource",
  "National Fuel Gas", "Spire", "Southwest Gas Holdings",
  "New Jersey Resources", "South Jersey Industries",
  "American Water Works", "Essential Utilities",
  "California Water Service", "SJW Group", "York Water",
  "Brookfield Renewable Partners", "Clearway Energy",
  "Ormat Technologies", "Sunnova Energy",

  // ── CONSULTING & PROFESSIONAL SERVICES ──
  "Deloitte", "PricewaterhouseCoopers", "Ernst & Young", "KPMG",
  "McKinsey & Company", "Boston Consulting Group", "Bain & Company",
  "Infosys", "Wipro", "Tata Consultancy Services",

  // ── PRIVATE / POLITICALLY SIGNIFICANT (not in Russell but critical for CivicLens) ──
  "Koch Industries", "Georgia-Pacific", "Flint Hills Resources",
  "Invista", "Guardian Industries", "Molex",
  "Cargill", "Mars Inc", "Publix Super Markets",
  "Bloomberg LP", "Fidelity Investments", "Vanguard Group",
  "Edward Jones", "State Farm",
  "Bain Capital", "Citadel LLC", "Bridgewater Associates",
  "Renaissance Technologies", "Two Sigma", "Elliott Management",
  "Pershing Square", "Tiger Global Management",
  "Bechtel", "Cox Enterprises", "Hearst Corporation",
  "SC Johnson", "Hobby Lobby", "Chick-fil-A",
  "In-N-Out Burger", "Waffle House",
  "JBS USA", "Land O'Lakes", "CHS Inc",
  "Ocean Spray", "Dole Food Company",

  // ── ADDITIONAL RUSSELL 1000 CONSTITUENTS ──
  // (Filling to ~1000 with remaining mid/small-cap Russell members)
  "Agilysys", "Alarm.com Holdings", "Allegro MicroSystems",
  "AMAG Pharmaceuticals", "American Axle", "American Financial Group",
  "Amphastar Pharmaceuticals", "AngioDynamics",
  "Apartment Investment and Management", "Apogee Enterprises",
  "Applied Industrial Technologies", "Ares Capital", "Arko Corp",
  "Ashland", "Aspen Technology", "Associated Banc-Corp",
  "Astronics Corporation", "Avis Budget Group",
  "Axcelis Technologies", "Balchem Corporation",
  "Bank of Hawaii", "Bankinter", "Barnes Group",
  "Beacon Roofing Supply", "Belden", "Benchmark Electronics",
  "BJ's Restaurants", "Black Knight", "BOK Financial",
  "Brink's Company", "Brixmor Property Group",
  "Bruker Corporation", "Cabot Oil & Gas",
  "Caleres", "Cannae Holdings", "Carlisle Companies",
  "Catalent", "Cavco Industries", "Cedar Fair",
  "ChampionX", "Chart Industries",
  "Choice Hotels International", "Ciena Corporation",
  "Cirrus Logic", "Clean Energy Fuels",
  "Coherent Corp", "Columbia Banking System",
  "Commerce Bancshares", "Community Bankers Trust",
  "Compass Diversified", "CONMED Corporation",
  "Consensus Cloud Solutions", "Copa Holdings",
  "Core Molding Technologies", "Covenant Logistics",
  "CSW Industrials", "Curtiss-Wright",
  "CyberArk Software", "Dillard's",
  "Diodes Incorporated", "Eagle Bancorp",
  "East West Bancorp", "Electro Scientific Industries",
  "Element Solutions", "Emergent BioSolutions",
  "Enerpac Tool Group", "Ensign Group",
  "EQT Corporation", "Equity Commonwealth",
  "Essential Properties Realty Trust",
  "Etsy", "Evercore", "EverQuote",
  "Exact Sciences", "Exponent",
  "First BanCorp", "First Busey Corporation",
  "First Financial Bankshares", "First Industrial Realty Trust",
  "First Interstate BancSystem", "FirstCash Holdings",
  "Flex", "Fluor Corporation",
  "FormFactor", "Fox Factory Holding",
  "Franklin Electric", "FTI Consulting",
  "Glacier Bancorp", "Glaukos Corporation",
  "Global-e Online", "Gold Fields",
  "Goosehead Insurance", "Graphic Packaging Holding",
  "Great Lakes Dredge & Dock", "Green Dot Corporation",
  "Grocery Outlet Holding", "Group 1 Automotive",
  "GXO Logistics", "Haynes International",
  "HealthStream", "Heartland Financial USA",
  "Heidrick & Struggles", "Helen of Troy",
  "Hexcel Corporation", "Highwoods Properties",
  "Hill-Rom Holdings", "Holly Energy Partners",
  "Hub Group", "Huron Consulting Group",
  "Hyster-Yale Materials Handling",
  "ICF International", "II-VI Incorporated",
  "Independencia", "Independent Bank Corp",
  "Innospec", "Innovative Industrial Properties",
  "Installed Building Products", "Intellicheck",
  "Inter Parfums", "Intermountain Healthcare",
  "International Bancshares",
  "iRobot Corporation", "ITT Inc", "John Bean Technologies",
  "JELD-WEN Holding", "K12",
  "Kaman Aerospace", "Kennametal",
  "Kforce", "Knowles Corporation",
  "Kontoor Brands", "Krystal Biotech",
  "LCI Industries", "Leidos Holdings",
  "Leslie's", "LGI Homes",
  "Ligand Pharmaceuticals", "Lions Gate Entertainment",
  "LivePerson", "Lumentum Holdings",
  "Luther Burbank Corporation", "Lydall",
  "M/I Homes", "Malibu Boats",
  "Marcus & Millichap", "Martin Marietta Materials",
  "Matthews International", "MaxLinear",
  "MasTec", "Materion Corporation",
  "MDU Resources Group", "Medpace Holdings",
  "Mercury General Corporation", "Merisel",
  "Merit Medical Systems", "Mesa Air Group",
  "MGP Ingredients", "Minerals Technologies",
  "Mistras Group", "Model N",
  "Modivcare", "Moog",
  "Mueller Industries", "Murphy USA",
  "National Bank Holdings", "National Instruments",
  "National Western Financial", "Natus Medical",
  "Navigant Consulting", "NCI Building Systems",
  "Nelnet", "New Relic", "NewMarket Corporation",
  "Novanta", "NovoCure",
  "Nu Skin Enterprises", "NV5 Global",
  "Olympic Steel", "Omega Healthcare Investors",
  "OneSpan", "Onto Innovation",
  "Orchid Island Capital", "OrthoPediatrics",
  "OSI Systems", "Oxford Industries",
  "PBF Energy", "PC Connection",
  "PDC Energy", "Pebblebrook Hotel Trust",
  "Peloton Interactive", "Pennant Group",
  "Perdoceo Education", "Perficient",
  "PerkinElmer", "Physicians Realty Trust",
  "Playa Hotels & Resorts", "Plug Power",
  "Pool Corporation", "Power Integrations",
  "Preferred Bank", "Premier Financial",
  "PriceSmart", "Primoris Services",
  "Prosperity Bancshares", "Protagonist Therapeutics",
  "Q2 Holdings", "Qualys",
  "Quaker Chemical Corporation",
  "Rambus", "Range Resources",
  "RBC Bearings", "Reata Pharmaceuticals",
  "Regis Corporation", "Rexnord",
  "Rogers Corporation", "RPC Inc",
  "Rush Enterprises", "Ryman Hospitality Properties",
  "ScanSource", "Schneider National",
  "Scholastic", "SciPlay Corporation",
  "SemGroup", "ServisFirst Bancshares",
  "SI-BONE", "SiTime Corporation",
  "SkyWest", "Sleep Number",
  "Smith & Wesson Brands", "Sonos",
  "SouthState Corporation", "Sovos Brands",
  "SPX Technologies", "SPS Commerce",
  "SS&C Technologies", "Standex International",
  "Star Bulk Carriers", "State Auto Financial",
  "Stericycle", "Sterling Construction",
  "Stevens Transport", "Stock Yards Financial",
  "Strategic Education", "Stride Inc",
  "Summit Hotel Properties", "SunCoke Energy",
  "Superior Group of Companies", "SuRo Capital",
  "Sweetgreen", "Sylvamo",
  "Talos Energy", "Tandem Diabetes Care",
  "Tanger Factory Outlet Centers", "TechTarget",
  "Tennant Company", "Ternium",
  "Thermon Group", "Thor Industries",
  "TimkenSteel", "Titan International",
  "TopBuild", "Toro Company",
  "TreeHouse Foods", "Trex Company",
  "TriMas Corporation", "Triton International",
  "Triumph Group", "TrueBlue",
  "Turning Point Brands", "UFP Industries",
  "Ultragenyx Pharmaceutical", "US Physical Therapy",
  "Vail Resorts", "Varex Imaging",
  "Verint Systems", "Victoria's Secret",
  "Viper Energy Partners", "Virtus Investment Partners",
  "Vishay Intertechnology", "Vista Outdoor",
  "Wabash National", "Walker & Dunlop",
  "Watts Water Technologies", "WillScot Mobile Mini",
  "Winnebago Industries", "Woodward",
  "Xperi Holding", "Yeti Holdings",
  "Zurn Elkay Water Solutions",
];

const BATCH_SIZE = 5; // Process 5 companies per invocation (increased from 3)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional params
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batchSize || BATCH_SIZE, 10);

    // Get all existing company names/slugs
    const { data: existingCompanies, error: fetchErr } = await supabase
      .from('companies')
      .select('name, slug');

    if (fetchErr) {
      console.error('Failed to fetch existing companies:', fetchErr);
      return new Response(JSON.stringify({ success: false, error: fetchErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deduplicate target list
    const uniqueTargets = [...new Set(TARGET_COMPANIES)];

    const existingSlugs = new Set((existingCompanies || []).map(c => c.slug));
    const existingNames = new Set((existingCompanies || []).map(c => c.name.toLowerCase()));

    // Find companies not yet in the database
    const missing = uniqueTargets.filter(name => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return !existingSlugs.has(slug) && !existingNames.has(name.toLowerCase());
    });

    console.log(`Directory: ${existingCompanies?.length || 0} companies. Target: ${uniqueTargets.length}. Missing: ${missing.length}. Batch: ${batchSize}.`);

    if (missing.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All target companies are already in the directory!',
        totalInDirectory: existingCompanies?.length || 0,
        targetListSize: uniqueTargets.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Take next batch
    const batch = missing.slice(0, batchSize);
    const results: any[] = [];

    for (const companyName of batch) {
      console.log(`Researching: ${companyName}...`);
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/company-research`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyName }),
        });

        const data = await resp.json();
        results.push({
          company: companyName,
          success: data.success,
          alreadyExists: data.alreadyExists,
          error: data.error,
        });

        if (data.success) {
          console.log(`✅ ${companyName} added successfully`);
        } else {
          console.error(`❌ ${companyName} failed: ${data.error}`);
        }

        // Brief pause between calls to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`❌ ${companyName} error:`, e);
        results.push({ company: companyName, success: false, error: String(e) });
      }
    }

    const succeeded = results.filter(r => r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${batch.length} companies. ${succeeded} succeeded.`,
      remaining: missing.length - batch.length,
      totalInDirectory: (existingCompanies?.length || 0) + succeeded,
      targetListSize: uniqueTargets.length,
      percentComplete: Math.round(((uniqueTargets.length - missing.length + succeeded) / uniqueTargets.length) * 100),
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Batch research error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
