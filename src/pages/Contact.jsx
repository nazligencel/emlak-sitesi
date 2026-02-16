import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPANY } from '../constants/config';

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
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">İletişim</h1>
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
                                            href={`https://www.google.com/maps/search/?api=1&query=${COMPANY.mapsQuery}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-600 hover:text-secondary transition-colors"
                                        >
                                            {COMPANY.address}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Telefon</h3>
                                        {COMPANY.phones.map((phone, i) => (
                                            <p key={i} className="text-slate-600">{phone}</p>
                                        ))}
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
                                        <p className="text-slate-600">{COMPANY.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Çalışma Saatleri</h3>
                                        <p className="text-slate-600">Pazartesi - Cumartesi: {COMPANY.hours.weekday}</p>
                                        <p className="text-slate-600">Pazar: {COMPANY.hours.sunday}</p>
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
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        className="w-full grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                    >
                    </iframe>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
