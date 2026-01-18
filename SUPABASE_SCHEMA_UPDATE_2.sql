
-- Add new columns for Net/Gross SQM and Title Deed Status
ALTER TABLE listings ADD COLUMN IF NOT EXISTS net_sqm numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS gross_sqm numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS tapu_status text;

-- Change parking column type from boolean to text to support specific types
-- First, cast existing boolean to text text mapping, then apply constraints if needed
ALTER TABLE listings ALTER COLUMN parking TYPE text USING CASE WHEN parking = true THEN 'Mevcut' ELSE 'Yok' END;

-- Add kitchen column if it doesn't exist (it seemed missing in the form but might be in DB)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS kitchen text;
