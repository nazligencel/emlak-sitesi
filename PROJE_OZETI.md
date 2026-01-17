# Topcu İnşaat & Gayrimenkul - Web Sitesi Proje Dokümantasyonu

Bu belge, **Topcu İnşaat & Gayrimenkul** için geliştirilen web sitesinin teknik özelliklerini, kullanıcı arayüzü detaylarını, yönetim paneli fonksiyonlarını ve yapılan geliştirmeleri kapsamaktadır.

---

## 🏗️ 1. Proje Özeti ve Teknolojiler

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş, **tamamen mobil uyumlu (responsive)**, hızlı ve dinamik bir emlak portföy yönetim sistemidir.

*   **Frontend (Önyüz):** React.js (Vite altyapısı ile)
*   **Stil & Tasarım:** Tailwind CSS (Özel konfigürasyonlu)
*   **Animasyonlar:** Framer Motion
*   **İkon Seti:** Lucide React
*   **Veritabanı & Backend:** Supabase (PostgreSQL tabanlı)
*   **Harita Entegrasyonu:** Google Maps Embed API
*   **Yayınlama (Deployment):** Hostinger uyumlu (SPA yapısı için .htaccess dahil)

---

## 🎨 2. Tasarım ve Arayüz Özellikleri

Site, **"Premium & Güven"** algısını pekiştirmek amacıyla özel bir renk paleti ve tasarım diliyle oluşturulmuştur.

*   **Renk Paleti:**
    *   **Ana Renk:** Koyu Lacivert (Navy Blue - Güven ve Kurumsallık)
    *   **Vurgu Rengi:** Altın Sarısı (Gold - Lüks ve Kalite)
    *   **Arka Planlar:** Temiz Beyaz ve Hafif Gri (Modernlik)
*   **Görsel Efektler:**
    *   **Glassmorphism:** Yarı saydam, buzlu cam efektleri (Navbar ve kartlarda).
    *   **Hero Bölümü:** Tam ekran, yüksek kaliteli arka plan görseli ve animasyonlu karşılama metni.
    *   **Mikro-Animasyonlar:** Butonlara gelindiğinde (hover) renk değişimleri, sayfa geçişlerinde yumuşak efektler.
*   **Mobil Uyumluluk:**
    *   Telefon, tablet ve bilgisayar ekranlarında otomatik şekil alan ızgara (grid) yapısı.
    *   Mobilde otomatik devreye giren "Hamburger Menü".

---

## 🏠 3. Sayfa ve Modül Detayları

### A. Anasayfa (Home)
*   **Hero Alanı:** Etkileyici arka plan, markanın sloganı ve hızlı arama çubuğu (İlçe seçimi).
*   **Öne Çıkan İlanlar:** En son eklenen 3 ilan otomatik olarak burada listelenir.
*   **WhatsApp Butonu:** Ekranın sağ alt köşesinde sabit, direkt WhatsApp hattına bağlayan buton.

### B. İlanlar Sayfası (Listings)
*   **Filtreleme:** Konum veya ilan başlığına göre anlık arama yapabilme.
*   **Kart Tasarımı:** İlanın resmi, fiyatı, konumu, oda/banyo sayısı ve metrekare bilgisini içeren şık kartlar.
*   **Otomatik Düzen:** İlan bulunamazsa kullanıcıya özel uyarı ekranı.

### C. İlan Detay Sayfası
*   **Galeri:** İlan resimleri arasında geçiş yapılabilen, dokunmatik uyumlu (swipe) ve hızlı slider yapısı.
*   **Sekmeli Yapı:**
    *   **Detaylar:** Özellikler (Balkon, Asansör vb.), Aidat, Kat bilgisi vb.
    *   **Açıklama:** İlanın uzun metin açıklaması.
    *   **Konum:** İlanın konumunu harita üzerinde gösteren Google Maps entegrasyonu.
*   **Danışman Kartı:** İlanla ilgilenen danışmanın fotoğrafı, adı ve **"Tıkla Ara"** özellikli telefon butonu.
*   **Paylaş Butonu:** Mobilde direkt uygulamalarla paylaşma, masaüstünde link kopyalama özelliği.

---

## 🛠️ 4. Yönetim Paneli (Admin Dashboard)

Site sahiplerinin ilanları kolayca yönetebilmesi için şifreli ve güvenli bir panel geliştirilmiştir.

### Özellikler:
1.  **Güvenli Giriş:** E-posta ve şifre ile korunan, şık (Dark Mode & Blur efektli) giriş ekranı.
2.  **İlan Ekleme/Düzenleme:**
    *   **Çoklu Fotoğraf Yükleme:** Sürükle-bırak veya dosya seçme yöntemiyle sınırsız fotoğraf yükleme.
    *   **Dinamik İlan No:** İlan numaraları 500'den başlayarak otomatik ve sıralı artar (500, 501, 502...).
    *   **Esnek Oda Sayısı:** "4+1", "3.5+1", "Stüdyo" gibi metin girişi yapılabilir.
    *   **Danışman Seçimi:** İlanın hangi danışmana ait olduğu listeden seçilebilir.
    *   Supabase veritabanı ile anlık senkronizasyon.
3.  **İlan Silme:** İlanları kalıcı olarak listeden kaldırma.

---

## ⚙️ 5. Yapılan Son Teknik Geliştirmeler

Kullanıcı talepleri doğrultusunda yapılan ince ayarlar:
*   **Logo Hizalaması:** Logo ve "Topcu İnşaat & Gayrimenkul" yazısı milimetrik olarak hizalandı.
*   **Admin Giriş Ekranı:** Arka plana sistemle bütünlük sağlayan flu (blur) bir görsel eklendi.
*   **Veritabanı Güncellemesi:** Oda sayısı alanı "Sayı" yerine "Metin" formatına dönüştürüldü.
*   **Performans:** Slider geçiş hızları optimize edildi (0.2sn).
*   **Hostinger Uyumu:** `.htaccess` dosyası ile sunucu ayarları yapıldı.

---

## 🚀 6. Kurulum ve Yayınlama

Proje, `dist` klasörü içerisindeki dosyaların sunucuya (Hostinger public_html) yüklenmesiyle çalışır duruma gelir. Ekstra bir sunucu kurulumu gerektirmez (Serverless mimari).

**Hazırlayan:** Antigravity AI Asistanı
**Tarih:** 16 Ocak 2026
