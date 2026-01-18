import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="min-h-screen bg-primary text-slate-300">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2600&auto=format&fit=crop"
                        alt="Modern Architecture"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80 mix-blend-multiply" />
                </div>
                <div className="relative z-10 text-center px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6"
                    >
                        Hakkımızda
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-secondary max-w-2xl mx-auto font-light"
                    >
                        Güvenle Geleceği İnşa Ediyoruz
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-24">
                <div className="grid md:grid-cols-2 gap-20 items-start">
                    <div>
                        <h2 className="text-4xl font-bold mb-8 text-white">Hakkımızda & Vizyonumuz</h2>
                        <div className="space-y-6 text-lg text-slate-300 font-light leading-relaxed text-justify">
                            <p>
                                İnşaat sektöründeki köklü geçmişimizi, gayrimenkul dünyasının dinamikleriyle birleştirerek sınırları aşan bir vizyon sunuyoruz.
                                Hedefimiz yalnızca bina inşa etmek değil; doğru yatırım ve kusursuz yaşam alanları kurgulamaktır.
                            </p>
                            <p>
                                Modern mimarinin zarafetini, karlı gayrimenkul fırsatlarıyla harmanlayarak, hem ev sahibi olmak isteyenlere
                                hem de yatırımcılara dünya standartlarında çözümler üretiyoruz. Yerel tecrübemizi küresel tasarım trendleriyle
                                birleştirerek, estetiğin ve konforun uluslararası dilini projelerimize yansıtıyoruz.
                            </p>
                            <p>
                                <strong className="text-white">Topcu İnşaat & Gayrimenkul</strong> olarak, estetik ve konforu, güvenilir emlak danışmanlığı ile buluşturuyor;
                                sadece bir konut değil, prestijli bir yaşam kültürü ve değer kazanan bir gelecek vaat ediyoruz.
                            </p>
                        </div>

                        <div className="mt-12 space-y-8">
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border-l-4 border-secondary">
                                <h3 className="text-xl font-bold text-white mb-2">Misyonumuz</h3>
                                <p className="text-slate-400">
                                    Müşterilerimize en doğru gayrimenkul yatırımlarını sunarken, güven, şeffaflık ve kalite prensiplerinden ödün vermeden,
                                    hayallerindeki yaşam alanlarına kavuşmalarını sağlamak.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border-l-4 border-white/50">
                                <h3 className="text-xl font-bold text-white mb-2">Vizyonumuz</h3>
                                <p className="text-slate-400">
                                    Yenilikçi projelerimiz ve profesyonel danışmanlık hizmetimizle, sektörde standartları belirleyen,
                                    global ölçekte tanınan ve tercih edilen lider bir marka olmak.
                                </p>
                            </div>
                        </div>


                    </div>

                    <div className="relative sticky top-32">
                        <div className="absolute -inset-4 border-2 border-secondary/30 rounded-2xl md:rotate-6 -z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                            alt="Office Interior"
                            className="rounded-xl shadow-2xl w-full"
                        />
                        <div className="mt-8">
                            <img
                                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop"
                                alt="Modern House"
                                className="rounded-xl shadow-lg w-full h-64 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
