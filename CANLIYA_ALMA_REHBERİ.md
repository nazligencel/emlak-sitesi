# Hostinger ile Canlıya Alma Rehberi

Emlak sitenizi Hostinger üzerinde yayına almak için aşağıdaki adımları takip edin. Projeniz modern bir React uygulamasıdır ve "Statik Site" olarak sunulacaktır.

## 1. Hazırlık: Dosyaların Oluşturulması
Biz bu adımı sizin için yaptık ama tekrar etmek isterseniz:
1. Terminalde şu komutu çalıştırarak üretim (production) dosyalarını oluşturun:
   ```bash
   npm run build
   ```
2. Bu işlem projenizin ana dizininde `dist` adında yeni bir klasör oluşturur.
   - Bu klasörün içinde `index.html`, `assets` klasörü ve diğer dosyalar bulunur.
   - **Canlıya yükleyeceğiniz dosyalar SADECE bu `dist` klasörünün içindekilerdir.**

> **Önemli Not:** Sizin için `.htaccess` dosyasını da hazırladık ve build içine dahil ettik. Bu dosya, sayfa yenilendiğinde "404 Sayfa Bulunamadı" hatası almanızı engeller.

## 2. Hostinger Paneline Giriş ve Dosya Yükleme

1. **Hostinger Paneline Giriş Yapın:**
   - Hostinger hesabınıza girin ve "Web Siteleri" bölümünden sitenizin yanındaki **"Yönet"** butonuna tıklayın.

2. **Dosya Yöneticisini Açın:**
   - Sol menüden veya Dashboard üzerinden **"Dosya Yöneticisi" (File Manager)** seçeneğini bulun ve tıklayın (`public_html` klasörüne erişim sağlar).

3. **`public_html` Klasörünü Temizleyin:**
   - Dosya yöneticisinde `public_html` klasörüne çift tıklayın.
   - İçinde varsayılan olarak gelen `default.php` veya başka dosyalar varsa hepsini seçip **SİLİN**. Klasör tamamen boş olmalıdır.

4. **Dosyaları Yükleyin:**
   - Bilgisayarınızdaki proje klasörüne gidin: `d:\Java\workspace\emlak-sitesi\dist`
   - `dist` klasörünün **İÇİNDEKİ** (klasörün kendisi değil, içindekiler) tüm dosyaları seçin (`index.html`, `.htaccess`, `assets`, `logo.png` vb.).
   - Bu dosyaları sürükleyip Hostinger Dosya Yöneticisi penceresine (public_html içine) bırakın.
   - Yükleme tamamlandığında `index.html` dosyası direkt olarak `public_html` klasörünün içinde görünmelidir. (Örn: `public_html/index.html`).

## 3. Yayını Kontrol Etme

1. Tarayıcınızdan domain adresinize gidin (örn: `www.siteniz.com`).
2. Sitenizin açıldığını görmelisiniz.
3. **Test Edin:** Menülerde gezinin, bir ilanın detayına gidin ve sayfayı yenileyin (F5). Eğer sayfa yenilendiğinde hata almıyorsanız `.htaccess` dosyası doğru çalışıyor demektir.

## Sık Karşılaşılan Sorunlar

- **Sayfalar arası geçişte hata yok ama yenileyince 404 hatası alıyorum:**
  - `.htaccess` dosyası yüklenmemiş olabilir. Bilgisayarınızdaki `dist` klasöründe `.htaccess` dosyasını (bazen gizli olabilir) Hostinger'a yüklediğinizden emin olun.

- **Site "Index of /" sayfası gösteriyor:**
  - `index.html` dosyasını doğrudan `public_html` içine değil, yanlışlıkla bir alt klasöre (örneğin `public_html/dist/`) atmış olabilirsiniz. Dosyaları bir üst dizine taşıyın.

Tebrikler! Siteniz artık yayında. 🚀
