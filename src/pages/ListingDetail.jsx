import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useListings } from '../context/ListingContext';
import { MapPin, Ruler, Bed, Square, Home, Utensils, ArrowLeft, Phone, CheckCircle2, ChevronLeft, ChevronRight, Share2, X, Compass, FileText } from 'lucide-react';
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

    // Parse ID
    const id = slug ? slug.split('-').pop() : null;

    // Find listing
    const listing = listings.find(l => l.id.toString() === id);
    const assignedConsultant = CONSULTANTS.find(c => c.id === listing?.consultant_id) || CONSULTANTS[0];

    // Determine if it is a Land/Field listing
    const isLand = listing && ['Satılık Arsa', 'Satılık Tarla'].includes(listing.type);

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

    if (loading) return <div className="pt-32 text-center text-white">Yükleniyor...</div>;

    if (!listing) return (
        <div className="pt-32 text-center text-white mb-20">
            <h2 className="text-2xl font-bold mb-4">İlan Bulunamadı</h2>
            <Link to="/ilanlar" className="text-secondary hover:underline">İlanlara Dön</Link>
        </div>
    );

    return (
        <div className="pt-24 pb-20 bg-primary min-h-screen">
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
                    {/* Header Image Gallery - Compact Modern Style */}
                    <div className="relative group h-[350px] md:h-[500px] bg-slate-900 overflow-hidden">
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

                        {/* Watermark - Smaller */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20 md:opacity-30 select-none overflow-hidden">
                            <div className="text-white text-3xl md:text-6xl font-bold -rotate-12 whitespace-nowrap drop-shadow-lg opacity-50">
                                TOPCU
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 pointer-events-none" />

                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Title & Price Overlay - Compact */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-slate-100 z-10 pointer-events-none">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="bg-secondary text-black text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
                                            {listing.type}
                                        </span>
                                        <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {listing.status}
                                        </span>
                                        {listing.is_opportunity && (
                                            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                                                FIRSAT
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-bold mb-1 leading-tight text-slate-50 shadow-lg line-clamp-2 md:line-clamp-none max-w-3xl">
                                        {listing.title}
                                    </h1>
                                    <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                                        <MapPin size={14} className="text-secondary" />
                                        {listing.location}
                                    </div>
                                </div>
                                <div className="text-left md:text-right shrink-0">
                                    <div className="text-2xl md:text-4xl font-bold text-secondary drop-shadow-xl whitespace-nowrap tracking-tight">
                                        {Number(listing.price || 0).toLocaleString('tr-TR')} {currencySymbol}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
                        {/* Main Details & Tabs */}
                        <div className="lg:col-span-2 p-6 md:p-8">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar gap-6">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-3 font-bold text-base transition-colors border-b-2 whitespace-nowrap ${activeTab === 'details' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                >
                                    İlan Detayları
                                </button>
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-3 font-bold text-base transition-colors border-b-2 whitespace-nowrap ${activeTab === 'description' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
                                >
                                    Açıklama
                                </button>
                                <button
                                    onClick={() => setActiveTab('location')}
                                    className={`pb-3 font-bold text-base transition-colors border-b-2 whitespace-nowrap ${activeTab === 'location' ? 'border-secondary text-primary' : 'border-transparent text-slate-400 hover:text-primary'}`}
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
                                    className="space-y-8"
                                >
                                    {/* Quick Stats - Compact One Row */}
                                    <div className="grid grid-cols-4 gap-3">
                                        <StatBox icon={Ruler} label="Alan" value={`${listing.gross_sqm || listing.sqm || '-'} m²`} />
                                        {isLand ? (
                                            <>
                                                <StatBox icon={FileText} label="İmar" value={listing.zoning_status || '-'} />
                                                <StatBox icon={MapPin} label="Ada" value={listing.ada_no || '-'} />
                                                <StatBox icon={Compass} label="Parsel" value={listing.parsel_no || '-'} />
                                            </>
                                        ) : (
                                            <>
                                                <StatBox icon={Bed} label="Oda" value={listing.beds || '-'} />
                                                <StatBox icon={Utensils} label="Mutfak" value={listing.kitchen || '-'} />
                                                <StatBox icon={Compass} label="Cephe" value={listing.facade ? (listing.facade.includes('-') ? listing.facade.split(' - ')[0] + '..' : listing.facade) : '-'} />
                                            </>
                                        )}
                                    </div>



                                    {/* Details List - Single Column Stack */}
                                    <div>
                                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                            <span className="w-1 h-5 bg-secondary rounded-full block"></span>
                                            Genel Bilgiler
                                        </h3>
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <div className="flex flex-col px-6 md:px-10 py-4">
                                                <DetailRow label="İlan No" value={listing.listing_no || `#${listing.id}`} />
                                                <DetailRow label="Emlak Tipi" value={listing.type} />
                                                <DetailRow label="Tapu Durumu" value={listing.tapu_status || '-'} />
                                                <DetailRow label="Takas" value={listing.swap ? 'Olabilir' : 'Yok'} />
                                                {listing.swap ? <DetailRow label="Takas" value="Olabilir" /> : <DetailRow label="Takas" value="Yok" />}

                                                {isLand ? (
                                                    // Land Specific Details
                                                    <>
                                                        <DetailRow label="İmar Durumu" value={listing.zoning_status || '-'} />
                                                        <DetailRow label="m² Fiyatı" value={listing.price_per_sqm || '-'} />
                                                        <DetailRow label="Ada No" value={listing.ada_no || '-'} />
                                                        <DetailRow label="Parsel No" value={listing.parsel_no || '-'} />
                                                        <DetailRow label="Kaks (Emsal)" value={listing.kaks || '-'} />
                                                    </>
                                                ) : (
                                                    // Building Specific Details
                                                    <>
                                                        <DetailRow label="Bina Yaşı" value={listing.building_age || 'Sıfır'} />
                                                        <DetailRow label="Kat Sayısı" value={listing.total_floors || '-'} />
                                                        <DetailRow label="Bulunduğu Kat" value={listing.floor_location || '-'} />
                                                        <DetailRow label="Isıtma" value={listing.heating || '-'} />
                                                        <DetailRow label="Kullanım" value={listing.usage_status || 'Boş'} />
                                                        <DetailRow label="Aidat" value={listing.dues ? `${listing.dues} TL` : '-'} />
                                                        <DetailRow label="Depozito" value={listing.deposit ? `${Number(listing.deposit).toLocaleString('tr-TR')} ${currencySymbol}` : '-'} />
                                                        <DetailRow label="Kredi" value={listing.loan_eligible ? 'Uygun' : 'Uygun Değil'} />
                                                        <DetailRow label="Cephe" value={listing.facade || '-'} />
                                                        <DetailRow label="Otopark" value={listing.parking && listing.parking !== 'true' && listing.parking !== true ? listing.parking : 'Yok'} />
                                                        <DetailRow label="Mutfak" value={`${listing.kitchen || 'Kapalı'} Mutfak`} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                            <span className="w-1 h-5 bg-secondary rounded-full block"></span>
                                            Özellikler
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {isLand ? (
                                                // Land Features
                                                <>
                                                    {listing.infrastructure?.split(' - ').map(f => <FeatureItem key={f} label={f} active={true} />)}
                                                    {listing.location_features?.split(' - ').map(f => <FeatureItem key={f} label={f} active={true} />)}
                                                    {listing.general_features?.split(' - ').map(f => <FeatureItem key={f} label={f} active={true} />)}
                                                    {listing.view?.split(' - ').map(f => <FeatureItem key={f} label={f} active={true} />)}

                                                    {/* If empty */}
                                                    {(!listing.infrastructure && !listing.location_features && !listing.general_features) && (
                                                        <span className="text-slate-400 italic col-span-2 text-sm">Belirtilmiş özellik yok.</span>
                                                    )}
                                                </>
                                            ) : (
                                                // Building Features
                                                <>
                                                    <FeatureItem label="Balkon" active={listing.balcony} />
                                                    <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${listing.parking && listing.parking !== 'Yok' && listing.parking !== 'true' && listing.parking !== true ? 'bg-secondary/5 border-secondary/20 text-primary' : 'bg-transparent border-transparent text-slate-400 grayscale opacity-60'}`}>
                                                        <CheckCircle2 size={16} className={listing.parking && listing.parking !== 'Yok' && listing.parking !== 'true' && listing.parking !== true ? 'text-secondary' : 'text-slate-300'} />
                                                        <span className="font-semibold text-xs md:text-sm">Otopark: {listing.parking && listing.parking !== 'true' && listing.parking !== true ? listing.parking : 'Yok'}</span>
                                                    </div>
                                                    <FeatureItem label="Asansör" active={listing.elevator} />
                                                    <FeatureItem label="Eşyalı" active={listing.furnished} />
                                                    <FeatureItem label="Site İçinde" active={listing.in_complex} />
                                                    <FeatureItem label="Kombi" active={listing.heating === 'Kombi'} />
                                                </>
                                            )}
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
                                    className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base"
                                >
                                    <h3 className="text-lg font-bold text-primary mb-4">İlan Açıklaması</h3>
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
                                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                        <MapPin className="text-secondary" />
                                        {listing.location}
                                    </h3>
                                    <div className="w-full h-[350px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
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
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-secondary/50 transition-colors group h-auto min-h-[80px]">
        <Icon size={20} className="text-slate-400 mb-1.5 group-hover:text-secondary transition-colors" />
        <span className="font-bold text-primary text-sm text-center leading-tight line-clamp-1 break-all px-1">{value}</span>
        <span className="font-medium text-slate-400 text-xs text-center mt-0.5">{label}</span>
    </div>
);

const DetailRow = ({ label, value, isHighlight }) => (
    <div className={`flex justify-between items-center border-b border-slate-100/80 pb-2 last:border-0 ${isHighlight ? 'bg-yellow-50 -mx-3 px-3 py-2 border-yellow-100 rounded-md my-1' : ''}`}>
        <span className={`${isHighlight ? 'text-yellow-800 font-bold' : 'text-slate-400 font-medium text-sm'}`}>{label}</span>
        <span className={`${isHighlight ? 'text-yellow-800 font-extrabold' : 'text-primary font-semibold text-sm'}`}>{value}</span>
    </div>
);

const FeatureItem = ({ label, active }) => (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${active ? 'bg-secondary/5 border-secondary/20 text-primary' : 'bg-transparent border-transparent text-slate-400 grayscale opacity-60'}`}>
        <CheckCircle2 size={16} className={active ? 'text-secondary' : 'text-slate-300'} />
        <span className="font-semibold text-xs md:text-sm">{label}</span>
    </div>
);

export default ListingDetail;
