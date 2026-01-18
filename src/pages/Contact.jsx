import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <div className="relative min-h-screen bg-primary pt-24 pb-20 overflow-hidden">
            {/* Blurred Abstract Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2600&auto=format&fit=crop"
                    alt="Office Background"
                    className="w-full h-full object-cover blur-sm"
                />
                <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            </div>

            <div className="relative z-10 container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">İletişim</h1>
                    <p className="text-slate-300 text-xl max-w-2xl mx-auto">
                        Sorularınız için bizimle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100"
                    >
                        <h2 className="text-2xl font-bold mb-8 text-primary border-b border-slate-100 pb-4">İletişim Bilgileri</h2>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Ofis Adresimiz</h3>
                                        <a
                                            href="https://www.google.com/maps/search/?api=1&query=Çamlıbel+Mahallesi+Ahmet+Vefik+Paşa+Caddesi+No:29+Kepez/Antalya"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-600 hover:text-secondary transition-colors"
                                        >
                                            Çamlıbel Mahallesi Ahmet Vefik Paşa Caddesi<br />
                                            No:29 Kepez/Antalya
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Telefon</h3>
                                        <p className="text-slate-600">0(540) 360 07 34</p>
                                        <p className="text-slate-600">0(531) 360 07 34</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">E-Posta</h3>
                                        <p className="text-slate-600">topcuinsaatemlak@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Çalışma Saatleri</h3>
                                        <p className="text-slate-600">Pazartesi - Cumartesi: 09:00 - 19:00</p>
                                        <p className="text-slate-600">Pazar: Kapalı</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-7xl mx-auto mt-12 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50"
                >
                    <iframe
                        width="100%"
                        height="500"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src="https://maps.google.com/maps?q=%C3%87aml%C4%B1bel%20Mahallesi%20Ahmet%20Vefik%20Pa%C5%9Fa%20Caddesi%20No:29%20Kepez/Antalya&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="w-full grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                    >
                    </iframe>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
