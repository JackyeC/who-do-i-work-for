
-- Add verification_status to company_executives
ALTER TABLE company_executives ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';

-- Add verification_status to board_members  
ALTER TABLE board_members ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified';

-- Add departed_at timestamps
ALTER TABLE company_executives ADD COLUMN IF NOT EXISTS departed_at timestamptz;
ALTER TABLE board_members ADD COLUMN IF NOT EXISTS departed_at timestamptz;
