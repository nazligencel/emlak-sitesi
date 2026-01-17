-- BU KODLARI SUPABASE SQL EDITÖRÜNDE ÇALIŞTIRIN --

-- 1. İlanlar tablosuna 'description' (açıklama) sütunu ekle (Eğer yoksa)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS description text;

-- 2. Oda sayısı (beds) sütununu metin (text) tipine çevir 
-- (Böylece "4+1", "3+1" gibi değerler girilebilir)
ALTER TABLE listings 
ALTER COLUMN beds TYPE text;

-- 3. Değişikliklerin geçerli olması için önbelleği yenileme (bazen gereklidir)
NOTIFY pgrst, 'reload schema';
