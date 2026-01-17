import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useListings } from '../context/ListingContext';
import { Search } from 'lucide-react';

const Listings = () => {
    const { listings } = useListings();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (location.state?.location) {
            setSearchTerm(location.state.location);
        }
    }, [location.state]);

    const filteredListings = listings.filter(listing =>
        listing.title.toLocaleLowerCase('tr').includes(searchTerm.toLocaleLowerCase('tr')) ||
        listing.location.toLocaleLowerCase('tr').includes(searchTerm.toLocaleLowerCase('tr')) ||
        (listing.listing_no && listing.listing_no.toString().includes(searchTerm))
    );

    return (
        <div className="pt-32 pb-20 bg-primary min-h-screen">
            <div className="container mx-auto px-6">
                <div className="flex flex-col gap-6 mb-12">
                    <h1 className="text-4xl font-bold text-white border-l-8 border-secondary pl-4">Tüm İlanlar</h1>

                    {/* Filter/Search - Aligned Left */}
                    <div className="w-full max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="İlan No, Konum veya Başlık ile arama yapın..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>
                </div>

                {filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredListings.map((listing, index) => (
                            <ListingCard key={listing.id} listing={listing} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700">
                        <div className="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">İlan Bulunamadı</h3>
                        <p className="text-slate-400">
                            "{searchTerm}" aramasına uygun ilan bulamadık. Lütfen farklı bir arama yapmayı deneyin.
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-secondary hover:text-white font-medium hover:underline transition-colors"
                        >
                            Aramayı Temizle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Listings;
