-- Add missing columns for Land (Arsa) features if they do not exist
-- You can run this in Supabase SQL Editor

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS ada_no text,
ADD COLUMN IF NOT EXISTS parsel_no text,
ADD COLUMN IF NOT EXISTS kaks text, -- For Emsal (Kaks)
ADD COLUMN IF NOT EXISTS zoning_status text, -- İmar Durumu
ADD COLUMN IF NOT EXISTS price_per_sqm numeric, -- m2 Fiyatı
ADD COLUMN IF NOT EXISTS infrastructure text, -- Altyapı
ADD COLUMN IF NOT EXISTS location_features text, -- Konum Özellikleri
ADD COLUMN IF NOT EXISTS general_features text, -- Genel Özellikler
ADD COLUMN IF NOT EXISTS view text, -- Manzara
ADD COLUMN IF NOT EXISTS tapu_status text; -- Tapu Durumu

-- Refresh the schema cache (Supabase specific, normally happens automatically but good to know)
NOTIFY pgrst, 'reload config';
