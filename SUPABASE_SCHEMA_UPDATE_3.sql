
-- Add new columns for Facade, Deposit, and Currency
ALTER TABLE listings ADD COLUMN IF NOT EXISTS facade text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TL';
