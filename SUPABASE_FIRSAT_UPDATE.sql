-- Add is_opportunity column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_opportunity boolean DEFAULT false;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
