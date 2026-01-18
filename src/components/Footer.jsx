import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-slate-300 border-t border-slate-800">
            {/* Main Footer Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Topcu Logo" className="h-12 w-auto object-contain brightness-0 invert" />
                            <span className="text-xl font-bold text-white tracking-tight">
                                Topcu İnşaat
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Antalya'nın en prestijli projelerinde güven, kalite ve estetiği bir araya getiriyoruz. Hayalinizdeki yaşam alanına bizimle adım atın.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/topcuinsaattgayrimenkul/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-secondary hover:text-black transition-colors">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Hızlı Menü</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/" className="hover:text-secondary transition-colors inline-block">Anasayfa</Link>
                            </li>
                            <li>
                                <Link to="/ilanlar" className="hover:text-secondary transition-colors inline-block">İlanlar</Link>
                            </li>
                            <li>
                                <Link to="/danismanlar" className="hover:text-secondary transition-colors inline-block">Uzman Ekibimiz</Link>
                            </li>
                            <li>
                                <Link to="/hakkimizda" className="hover:text-secondary transition-colors inline-block">Hakkımızda</Link>
                            </li>
                            <li>
                                <Link to="/iletisim" className="hover:text-secondary transition-colors inline-block">İletişim</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services / Categories (Optional - or just placeholders) */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Portföy</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/ilanlar" className="hover:text-secondary transition-colors inline-block">Satılık Daireler</Link>
                            </li>
                            <li>
                                <Link to="/ilanlar" className="hover:text-secondary transition-colors inline-block">Kiralık Konutlar</Link>
                            </li>
                            <li>
                                <Link to="/ilanlar" className="hover:text-secondary transition-colors inline-block">Lüks Villalar</Link>
                            </li>
                            <li>
                                <Link to="/ilanlar" className="hover:text-secondary transition-colors inline-block">Ticari Gayrimenkul</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">İletişim</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-secondary shrink-0 mt-1" size={20} />
                                <span className="text-sm">Çamlıbel Mahallesi Ahmet Vefik Paşa Caddesi No:29 Kepez/Antalya</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-secondary shrink-0" size={20} />
                                <span className="text-sm">+90 540 360 07 34</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-secondary shrink-0" size={20} />
                                <span className="text-sm">info@topcuinsaat.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 bg-black/20">
                <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 Topcu İnşaat Gayrimenkul. Tüm hakları saklıdır.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-secondary transition-colors">Gizlilik Politikası</a>
                        <a href="#" className="hover:text-secondary transition-colors">Kullanım Şartları</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
