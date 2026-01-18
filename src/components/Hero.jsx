import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOCATIONS } from '../constants/locations';

const Hero = () => {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState('Antalya');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const handleSearch = () => {
        const searchTerm = selectedDistrict
            ? `${selectedDistrict}, ${selectedCity}`
            : selectedCity;
        navigate('/ilanlar', { state: { location: searchTerm } });
    };

    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2600&auto=format&fit=crop" /* Ultra Modern White Villa */
                    alt="Modern Luxury Architecture"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/30" /> {/* Lighter, cleaner tint */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" /> {/* Side gradient for text readability */}
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center text-white">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight drop-shadow-lg"
                >

                    Hayalinizdeki Evi <br />
                    <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent font-extrabold drop-shadow-sm">Keşfedin</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-100 mb-10 max-w-2xl mx-auto font-light drop-shadow-md"
                >
                    Topcu İnşaat Gayrimenkul güvencesiyle, lüks ve konforun buluştuğu en özel portföyler.
                </motion.p>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-2xl md:rounded-full border border-white/20 shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 relative z-30"
                >
                    {/* City Selector */}
                    <div className="relative min-w-[160px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                            <MapPin size={20} />
                        </div>
                        <select
                            className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-8 py-3.5 rounded-full outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer font-medium hover:bg-white/10 transition-colors [&>option]:text-slate-900"
                            value={selectedCity}
                            onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setSelectedDistrict('');
                            }}
                        >
                            {Object.keys(LOCATIONS).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>

                    {/* District/Neighborhood Selector */}
                    <div className="flex-1 relative">
                        <select
                            className="w-full bg-white/90 text-slate-800 px-6 py-3.5 rounded-full outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                        >
                            <option value="">{selectedCity ? `${selectedCity} - Tüm Bölgeler` : 'Önce Şehir Seçiniz'}</option>
                            {selectedCity && LOCATIONS[selectedCity]?.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        {/* Custom Arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="bg-secondary hover:bg-secondary/90 text-black px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(229,192,94,0.3)] hover:shadow-[0_0_30px_rgba(229,192,94,0.5)] active:scale-95 whitespace-nowrap"
                    >
                        İlanları Gör
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
