import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useListings } from '../context/ListingContext';
import { MapPin, Ruler, Bed, Square, Home, Utensils, ArrowLeft, Phone, CheckCircle2, ChevronLeft, ChevronRight, Share2, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONSULTANTS } from '../constants/consultants';

const ListingDetail = () => {
    const { slug } = useParams();
    const { listings, loading } = useListings();
    const [activeTab, setActiveTab] = useState('details');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Refs
    const scrollContainerRef = useRef(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Parse ID from slug (e.g., "satilik-daire-123" -> 123)
    // If slug is just "123", parsedId will be 123
    const id = slug ? slug.split('-').pop() : null;

    // Find listing
    const listing = listings.find(l => l.id.toString() === id);
    const assignedConsultant = CONSULTANTS.find(c => c.id === listing?.consultant_id) || CONSULTANTS[0];

    const currencySymbol = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'TL': '₺'
    }[listing?.currency] || '₺';

    // Image Logic
    const allImages = listing?.images && listing.images.length > 0
        ? listing.images
        : (listing?.image ? [listing.image] : []);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // Scroll Handler for Lightbox
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const index = Math.round(scrollContainerRef.current.scrollLeft / scrollContainerRef.current.clientWidth);
            if (index !== currentImageIndex) {
                setCurrentImageIndex(index);
            }
        }
    };

    // Sync scroll position when opening lightbox
    useEffect(() => {
        if (isLightboxOpen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: currentImageIndex * scrollContainerRef.current.clientWidth,
                behavior: 'instant'
            });
        }
    }, [isLightboxOpen]);

    const scrollToImage = (index) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: index * scrollContainerRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        if (isLightboxOpen) {
            const nextIndex = (currentImageIndex + 1) % allImages.length;
            scrollToImage(nextIndex);
        } else {
            nextImage();
        }
    };

    const handlePrev = () => {
        if (isLightboxOpen) {
            const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            scrollToImage(prevIndex);
        } else {
            prevImage();
        }
    };

    // ... (rest of component render)



    if (loading) return <div className="pt-32 text-center text-white">Yükleniyor...</div>;

    if (!listing) return (
        <div className="pt-32 text-center text-white mb-20">
            <h2 className="text-2xl font-bold mb-4">İlan Bulunamadı</h2>
            <Link to="/ilanlar" className="text-secondary hover:underline">İlanlara Dön</Link>
        </div>
    );

    return (
        <div className="pt-24 pb-20 bg-primary min-h-screen font-sans">
            <div className="container mx-auto px-4 md:px-6">
                {/* Build Navigation & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/ilanlar" className="inline-flex items-center gap-2 text-slate-300 hover:text-secondary transition-colors font-medium">
                        <ArrowLeft size={20} /> İlanlara Dön
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={async () => {
                                const shareData = {
                                    title: listing.title,
                                    text: `${listing.title} - ${listing.price} TL #TopcuInsaat`,
                                    url: window.location.href,
                                };
                                try {
                                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                        await navigator.share(shareData);
                                    } else {
                                        throw new Error('Web Share API not supported');
                                    }
                                } catch (err) {
                                    console.log('Share failed, falling back to clipboard', err);
                                    try {
                                        await navigator.clipboard.writeText(window.location.href);
                                        alert('İlan bağlantısı kopyalandı!');
                                    } catch (clipboardErr) {
                                        console.error('Clipboard failed', clipboardErr);
                                        // Legacy Fallback
                                        const textArea = document.createElement("textarea");
                                        textArea.value = window.location.href;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        try {
                                            document.execCommand('copy');
                                            alert(' Bağlantı kopyalandı! (Manual)');
                                        } catch (e) {
                                            alert('Bağlantı kopyalanamadı. Lütfen adresi manuel olarak alın.');
                                        }
                                        document.body.removeChild(textArea);
                                    }
                                }
                            }}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                            title="Paylaş"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
                    {/* Header Image Gallery - Full Width Slider Style */}
                    <div className="relative group h-[500px] md:h-[700px] bg-slate-900 overflow-hidden">
                        <AnimatePresence mode='wait'>
                            <motion.img
                                key={currentImageIndex}
                                src={allImages[currentImageIndex] || 'https://via.placeholder.com/800x600?text=Görsel+Yok'}
                                alt={listing.title}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => setIsLightboxOpen(true)}
                            />
                        </AnimatePresence>

                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 md:opacity-40 select-none overflow-hidden">
                            <div className="text-white text-4xl md:text-8xl font-bold -rotate-12 whitespace-nowrap drop-shadow-lg opacity-50">
                                TOPCU
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none" />

                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {/* Title & Price Overlay */}
                        {/* Title & Price Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 text-white z-10 pointer-events-none">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-6">
                                <div>
                                    <div className="flex gap-2, mb-2 md:mb-3">
                                        <span className="bg-secondary text-black text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider">
                                            {listing.type}
                                        </span>
                                        <span className="bg-primary/90 text-white border border-white/20 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider">
                                            {listing.status}
                                        </span>
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 leading-tight shadow-md line-clamp-2 md:line-clamp-none">{listing.title}</h1>
                                    <div className="flex items-center gap-1 md:gap-2 text-slate-200 text-sm md:text-lg">
                                        <MapPin size={16} className="text-secondary md:w-5 md:h-5" />
                                        {listing.location}
                                    </div>
                                </div>
                                <div className="text-left md:text-right shrink-0">
                                    <div className="text-2xl md:text-5xl font-bold text-secondary drop-shadow-lg whitespace-nowrap">
                                        {Number(listing.price || 0).toLocaleString('tr-TR')} {currencySymbol}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
                        {/* Main Details & Tabs */}
                        <div className="lg:col-span-2 p-8 md:p-12">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-slate-200 mb-8">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'details' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                >
                                    İlan Detayları
                                </button>
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'description' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                >
                                    Açıklama
                                </button>
                                <button
                                    onClick={() => setActiveTab('location')}
                                    className={`pb-4 px-4 font-bold text-lg transition-colors border-b-2 ${activeTab === 'location' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                >
                                    Konum
                                </button>
                            </div>

                            {/* Tab Content: Details */}
                            {activeTab === 'details' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-12"
                                >
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <StatBox icon={Ruler} label="Brüt" value={`${listing.sqm || listing.gross_sqm || '-'} m²`} />
                                        <StatBox icon={Bed} label="Oda" value={listing.beds} />
                                        <StatBox icon={Utensils} label="Mutfak" value={listing.kitchen || '-'} />
                                        <StatBox icon={Compass} label="Cephe" value={listing.facade || '-'} />
                                    </div>

                                    {/* Details List */}
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-secondary rounded-full block"></span>
                                            Genel Bilgiler
                                        </h3>
                                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                            <div className="flex flex-col gap-4">
                                                <DetailRow label="İlan No" value={listing.listing_no || `#${listing.id}`} />
                                                <DetailRow label="Emlak Tipi" value={listing.type} />
                                                <DetailRow label="Bina Yaşı" value={listing.building_age || 'Sıfır'} />
                                                <DetailRow label="Kat Sayısı" value={listing.total_floors || '-'} />
                                                <DetailRow label="Isıtma" value={listing.heating || '-'} />
                                                <DetailRow label="Kullanım" value={listing.usage_status || 'Boş'} />
                                                <DetailRow label="Aidat" value={listing.dues ? `${listing.dues} TL` : '-'} />
                                                <DetailRow label="Depozito" value={listing.deposit ? `${Number(listing.deposit).toLocaleString('tr-TR')} ${currencySymbol}` : '-'} />
                                                <DetailRow label="Kredi" value={listing.loan_eligible ? 'Uygun' : 'Uygun Değil'} />
                                                <DetailRow label="Tapu Durumu" value={listing.tapu_status || '-'} />
                                                <DetailRow label="Cephe" value={listing.facade || '-'} />
                                                <DetailRow label="Otopark" value={listing.parking && listing.parking !== 'true' && listing.parking !== true ? listing.parking : 'Yok'} />
                                                <DetailRow label="Mutfak" value={`${listing.kitchen || 'Kapalı'} Mutfak`} />
                                                <DetailRow label="Takas" value={listing.swap ? 'Olabilir' : 'Yok'} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-secondary rounded-full block"></span>
                                            Özellikler
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <FeatureItem label="Balkon" active={listing.balcony} />
                                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${listing.parking && listing.parking !== 'Yok' && listing.parking !== 'true' && listing.parking !== true ? 'bg-secondary/5 border-secondary/20 text-primary' : 'bg-transparent border-transparent text-slate-400 grayscale opacity-60'}`}>
                                                <CheckCircle2 size={18} className={listing.parking && listing.parking !== 'Yok' && listing.parking !== 'true' && listing.parking !== true ? 'text-secondary' : 'text-slate-300'} />
                                                <span className="font-semibold text-sm">Otopark: {listing.parking && listing.parking !== 'true' && listing.parking !== true ? listing.parking : 'Yok'}</span>
                                            </div>
                                            <FeatureItem label="Asansör" active={listing.elevator} />
                                            <FeatureItem label="Eşyalı" active={listing.furnished} />
                                            <FeatureItem label="Site İçinde" active={listing.in_complex} />
                                            <FeatureItem label="Kombi" active={listing.heating === 'Kombi'} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab Content: Description */}
                            {activeTab === 'description' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line"
                                >
                                    <h3 className="text-xl font-bold text-primary mb-4">İlan Açıklaması</h3>
                                    {listing.description ? (
                                        <p>{listing.description}</p>
                                    ) : (
                                        <p className="italic text-slate-400">Bu ilan için açıklama girilmemiştir.</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab Content: Location */}
                            {activeTab === 'location' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                                        <MapPin className="text-secondary" />
                                        {listing.location}
                                    </h3>
                                    <div className="w-full h-[400px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                            className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                                        ></iframe>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar Consultant - Clean & Professional */}
                        <div className="p-8 md:p-12 bg-slate-50">
                            <div className="sticky top-28 space-y-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <img
                                            src={assignedConsultant.image}
                                            alt={assignedConsultant.name}
                                            className="w-full h-full rounded-full object-cover border-4 border-slate-50"
                                        />
                                        <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Online"></div>
                                    </div>
                                    <h3 className="font-bold text-xl text-primary">{assignedConsultant.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6">{assignedConsultant.role}</p>

                                    <a
                                        href={`tel:${assignedConsultant.phone}`}
                                        className="w-full bg-secondary hover:bg-secondary/90 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-secondary/30 active:scale-95 group"
                                    >
                                        <div className="bg-black/10 p-2 rounded-full group-hover:bg-black/20 transition-colors">
                                            <Phone size={20} />
                                        </div>
                                        <span>{assignedConsultant.phone}</span>
                                    </a>

                                    <p className="text-xs text-slate-400 mt-4">
                                        İlan ile ilgili detaylı bilgi almak için dilediğiniz zaman arayabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white z-[70] p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
                        >
                            <X size={32} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-[70] p-4 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronLeft size={48} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-[70] p-4 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronRight size={48} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-6 left-6 z-[70] text-white/90 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            {currentImageIndex + 1} / {allImages.length}
                        </div>

                        {/* Native Scroll Gallery */}
                        <div
                            ref={scrollContainerRef}
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                            onScroll={handleScroll}
                        >
                            {allImages.map((src, idx) => (
                                <div key={idx} className="min-w-full w-full h-full flex items-center justify-center snap-center relative p-2 md:p-12">
                                    <img
                                        src={src}
                                        alt={`${listing.title} - ${idx + 1}`}
                                        className="max-h-full max-w-full object-contain pointer-events-none select-none"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Watermark in Lightbox (Fixed Overlay) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[65] opacity-[0.15] select-none overflow-hidden">
                            <div className="text-white text-5xl md:text-9xl font-bold -rotate-12 whitespace-nowrap drop-shadow-2xl">
                                TOPCU
                            </div>
                        </div>

                        <style>{`
                            .no-scrollbar::-webkit-scrollbar { display: none; }
                            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                        `}</style>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

const StatBox = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-secondary/50 transition-colors group">
        <Icon size={28} className="text-slate-400 mb-2 group-hover:text-secondary transition-colors" />
        <span className="font-bold text-primary text-sm md:text-base text-center leading-tight">{value}</span>
        <span className="font-bold text-slate-500 text-sm md:text-base text-center mt-1">{label}</span>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-primary font-semibold">{value}</span>
    </div>
);

const FeatureItem = ({ label, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${active ? 'bg-secondary/5 border-secondary/20 text-primary' : 'bg-transparent border-transparent text-slate-400 grayscale opacity-60'}`}>
        <CheckCircle2 size={18} className={active ? 'text-secondary' : 'text-slate-300'} />
        <span className="font-semibold text-sm">{label}</span>
    </div>
);

export default ListingDetail;
