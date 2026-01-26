import { MapPin, Bed, Square, Home, Compass, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { slugify } from '../lib/utils';

const ListingCard = ({ listing, index }) => {
    // Determine main image
    const displayImage = listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : 'https://via.placeholder.com/400x300?text=Görsel+Yok');

    // Check if Land
    const isLand = ['Satılık Arsa', 'Satılık Tarla'].includes(listing.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100"
        >
            <Link to={`/ilan/${slugify(listing.title)}-${listing.id}`} className="block h-full flex flex-col">
                {/* Image Container - Compact Aspect Ratio */}
                <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
                    <img
                        src={displayImage}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Top Left: Type & Opportunity */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                        <span className="bg-secondary text-black px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {listing.type}
                        </span>
                        {listing.is_opportunity && (
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
                                Fırsat
                            </span>
                        )}
                    </div>

                    {/* Top Right: Status (Satılık/Kiralık) - Match Detail Style */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="bg-black/60 backdrop-blur-md text-white border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {listing.status}
                        </span>
                    </div>

                    {/* Gradient Overlay for Text Visibility */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Price & Location */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="text-secondary font-bold text-lg leading-tight">
                            {listing.price ? Number(listing.price).toLocaleString('tr-TR') : 0} {{
                                'USD': '$',
                                'EUR': '€',
                                'GBP': '£',
                                'TL': '₺'
                            }[listing.currency] || '₺'}
                        </div>
                    </div>

                    <h3 className="text-slate-800 font-bold text-sm mb-1 leading-snug line-clamp-2 group-hover:text-secondary transition-colors min-h-[2.5em]">
                        {listing.title}
                    </h3>

                    <div className="flex items-center text-slate-400 text-xs mb-4 font-medium">
                        <MapPin size={12} className="mr-1 shrink-0 text-secondary" />
                        <span className="truncate">{listing.location}</span>
                    </div>

                    {/* Stats Grid - Dynamic based on Type */}
                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                        {isLand ? (
                            <>
                                <div className="flex items-center gap-1.5" title="İmar Durumu">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    <span className="truncate max-w-[80px]">{listing.zoning_status || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Ada/Parsel">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    <span className="truncate">{listing.ada_no ? `Ada: ${listing.ada_no}` : '-'}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Alan">
                                    <Square size={13} className="text-slate-400" />
                                    <span>{listing.gross_sqm || '-'} m²</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5" title="Oda Sayısı">
                                    <Bed size={13} className="text-slate-400" />
                                    <span>{listing.beds || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Bina Yaşı">
                                    <Home size={13} className="text-slate-400" />
                                    <span>{listing.building_age ? `${listing.building_age} Yıl` : '0'}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Alan">
                                    <Square size={13} className="text-slate-400" />
                                    <span>{listing.gross_sqm || '-'} m²</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ListingCard;
