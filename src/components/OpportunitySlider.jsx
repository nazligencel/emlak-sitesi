import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ListingCard from './ListingCard';

const OpportunitySlider = ({ listings }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds

        return () => clearInterval(timer);
    }, [currentIndex, listings.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % listings.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + listings.length) % listings.length);
    };

    if (!listings || listings.length === 0) return null;

    // We want to show 'itemsPerPage' items starting from 'currentIndex'
    // To make it infinite/circular, we might need to wrap around the array indices
    const visibleListings = [];
    for (let i = 0; i < itemsPerPage; i++) {
        const index = (currentIndex + i) % listings.length;
        visibleListings.push(listings[index]);
    }

    return (
        <div className="relative group">
            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 p-3 rounded-full shadow-lg text-primary hover:bg-secondary hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 p-3 rounded-full shadow-lg text-primary hover:bg-secondary hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronRight size={24} />
            </button>

            {/* Slider Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {visibleListings.map((listing, idx) => {
                        // We need a stable key for animation, but avoiding duplicates if listings are few is tricky
                        // If listings < itemsPerPage, we have duplicates in visibleListings.
                        // We'll trust the user has enough listings or just use index as part of key
                        // Actually, for a simple implementation, standard grid update without complex AnimatePresence might be safer to avoid key collisions
                        // But the user likes animations (Premium, "wow").
                        // Let's rely on listing.id. If we show the same listing twice (looping), we need unique keys.

                        const uniqueKey = `${listing.id}-${currentIndex}-${idx}`;

                        return (
                            <motion.div
                                key={uniqueKey}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                layout
                            >
                                <ListingCard listing={listing} index={idx} />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center mt-8 gap-2">
                {listings.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-secondary w-6' : 'bg-slate-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default OpportunitySlider;
