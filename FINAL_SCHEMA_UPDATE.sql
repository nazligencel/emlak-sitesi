
-- Consolidated Schema Update
-- Run this entire script in your Supabase SQL Editor to ensure all columns exist.

-- 1. Net and Gross SQM
ALTER TABLE listings ADD COLUMN IF NOT EXISTS net_sqm numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS gross_sqm numeric;

-- 2. Title Deed Status (Tapu Durumu)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tapu_status text;

-- 3. Kitchen (Mutfak)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS kitchen text;

-- 4. Facade (Cephe)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS facade text;

-- 5. Deposit (Depozito)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deposit numeric;

-- 6. Currency (Para Birimi) - Default to TL
ALTER TABLE listings ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TL';

-- 7. Update Parking column to text if it is boolean
-- This handles the conversion safely.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'listings'
        AND column_name = 'parking'
        AND data_type = 'boolean'
    ) THEN
        ALTER TABLE listings ALTER COLUMN parking TYPE text USING CASE WHEN parking = true THEN 'Mevcut' ELSE 'Yok' END;
    END IF;
END $$;
