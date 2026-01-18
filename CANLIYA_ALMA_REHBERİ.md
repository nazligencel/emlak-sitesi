# 🚀 Emlak Sitesi - Canlıya Alma (Yayınlama) Rehberi

Bu rehber, **Topcu İnşaat & Gayrimenkul** web sitesini Hostinger veya benzeri bir hosting sağlayıcısında yayına almak için hazırlanmıştır. Projeniz **statik** bir web sitesi olarak hazırdır ve ek bir sunucu kurulumu gerektirmez.

---

## 📂 1. Hazır Dosyalar (dist Klasörü)

Biz sizin için tüm kodları derledik ve yayına hazır hale getirdik.
Projenizin ana dizinindeki **`dist`** klasörü, canlı sitenizin ta kendisidir.

**`dist` Klasörünün İçeriği Şunları Kapsar:**
*   **`index.html`**: Sitenin giriş kapısı (SEO ve Sosyal Medya etiketleri ile güncellendi).
*   **`assets/`**: Sitenin stil (CSS) ve kod (JS) dosyaları.
*   **`.htaccess`**: Sayfa yenilemelerinde hata almamak için gerekli sunucu ayar dosyası.
*   **`logo.png`, `logo.jpg`**: Favicon ve sosyal medya paylaşım görselleri.
*   **`consultants/`**: Danışman resimleri.

---

## 🌍 2. Hostinger'a Yükleme Adımları

Sitenizi yayına almak için şu adımları izleyin:

1.  **Hostinger Paneline Girin:**
    *   Hesabınıza giriş yapın ve sitenizin yönetim panelinden **"Dosya Yöneticisi" (File Manager)** bölümünü açın.

2.  **`public_html` Klasörünü Açın:**
    *   Dosya yöneticisinde **`public_html`** klasörüne çift tıklayın.
    *   İçerisinde `default.php` veya başka dosyalar varsa hepsini **silin**. Klasör tamamen boş olsun.

3.  **Dosyaları Yükleyin:**
    *   Bilgisayarınızdaki proje klasöründe **`dist`** klasörünün **İÇİNE** girin.
    *   Buradaki **TÜM dosyaları ve klasörleri** seçin (`assets`, `index.html`, `.htaccess`, resimler vb.).
    *   Bu dosyaları sürükleyip Hostinger tarayıcı penceresindeki boş `public_html` alanına bırakın.

⚠️ **DİKKAT:** `dist` klasörünün kendisini değil, **içindeki dosyaları** yüklemelisiniz. Yükleme bittiğinde `public_html/index.html` şeklinde görünmelidir.

---

## ✅ 3. Kontrol Listesi (Checklist)

Yayına aldıktan sonra şunları kontrol edin:

*   [ ] **Site Açılıyor mu?**: `www.siteniz.com` adresine girdiğinizde site yükleniyor mu?
*   [ ] **Sekme Başlığı ve İkon**: Tarayıcı sekmesinde "Topcu İnşaat & Gayrimenkul" yazıyor ve logonuz görünüyor mu?
*   [ ] **Sayfa Yenileme**: Herhangi bir ilanın detayına girin (örn: `/ilan/500`) ve sayfayı yenileyin (F5). Hata almadan sayfa tekrar açılıyor mu? (Eğer 404 hatası alırsanız `.htaccess` dosyası yüklenmemiş demektir, tekrar yükleyin).
*   [ ] **WhatsApp Paylaşımı**: Sitenin linkini WhatsApp'tan birine gönderin. Resimli ve açıklamaklı önizleme kartı çıkıyor mu? (Bazen ilk seferde çıkmazsa linkin sonuna `/?1` ekleyip deneyin).

---

## 🆘 Sık Sorulan Sorular

**Soru: Sitede değişiklik yaptım, nasıl güncellerim?**
Cevap: Her değişiklikten sonra terminalde `npm run build` komutunu çalıştırın. Oluşan yeni `dist` klasöründeki dosyaları sunucuya tekrar yükleyin (eski dosyaların üzerine yazın).

**Soru: Resimler görünmüyor?**
Cevap: Dosya isimlerinin büyük/küçük harf duyarlı olduğunu unutmayın. Bilgisayarda `Logo.png` ve `logo.png` aynı olabilir ama sunucuda farklıdır. Kodlarımızda tümü küçük harf uyumludur.

Tebrikler, siteniz yayında! 🧿
