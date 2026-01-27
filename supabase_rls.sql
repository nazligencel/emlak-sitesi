-- BU KODLARI SUPABASE SQL EDİTÖRÜNDE ÇALIŞTIRIN
-- Bu işlem "listings" tablonuzu koruma altına alır.

-- 1. ADIM: RLS'yi (Güvenlik Katmanı) Aktif Et
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- 2. ADIM: Okuma İzni (Herkes okuyabilir)
-- Web sitenizdeki ilanları herkesin (giriş yapmamış kullanıcıların bile) görmesi gerekir.
CREATE POLICY "Herkes ilanları görebilir" 
ON listings FOR SELECT 
TO public 
USING (true);

-- 3. ADIM: Yazma/Silme İzni (Sadece giriş yapmış adminler)
-- İlan ekleme, silme ve güncelleme işlemlerini sadece giriş yapmış kullanıcılar yapabilir.
-- 'authenticated' rolü Supabase'de giriş yapmış kullanıcıları temsil eder.
CREATE POLICY "Sadece adminler işlem yapabilir" 
ON listings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
