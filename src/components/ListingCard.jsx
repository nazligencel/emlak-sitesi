import { MapPin, Bed, Square, Home, Compass, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing, index }) => {
    // Determine main image
    const displayImage = listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : 'https://via.placeholder.com/400x300?text=Görsel+Yok');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
        >
            <Link to={`/ilan/${listing.id}`} className="block h-full">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={displayImage}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {listing.type}
                    </div>
                    {listing.is_opportunity && (
                        <div className="absolute top-14 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse z-10">
                            FIRSAT
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {listing.status}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-20 opacity-60" />
                </div>
                {/* ... rest of logic unchanged ... */}

                {/* Content */}
                <div className="p-5">
                    <div className="text-secondary font-bold text-xl mb-1">
                        {listing.price ? Number(listing.price).toLocaleString('tr-TR') : 0} ₺
                    </div>
                    <h3 className="text-slate-800 font-bold text-lg mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                        {listing.title}
                    </h3>

                    <div className="flex items-center text-slate-500 mb-4 text-sm">
                        <MapPin size={16} className="mr-1 text-secondary" />
                        <span className="line-clamp-1">{listing.location}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-slate-600 text-sm gap-2">
                        <div className="flex items-center gap-1">
                            <Bed size={16} className="text-slate-400" />
                            <span>{listing.beds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Utensils size={16} className="text-slate-400" />
                            <span>{listing.kitchen}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Square size={16} className="text-slate-400" />
                            <span>{listing.sqm || listing.gross_sqm || '-'} m²</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Compass size={16} className="text-slate-400" />
                            <span>{listing.facade}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ListingCard;
