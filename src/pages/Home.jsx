import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { useListings } from '../context/ListingContext';
import OpportunitySlider from '../components/OpportunitySlider';

import WhatsAppButton from '../components/WhatsAppButton';

const Home = () => {
    const { listings } = useListings();

    // Filter Opportunity Listings
    const opportunityListings = listings.filter(listing => listing.is_opportunity);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Hero />

            {/* Main Content */}
            <main className="container mx-auto px-6 relative z-20 mt-12 md:-mt-24 pb-16">
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 gap-6 md:gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary md:text-white mb-3 md:drop-shadow-lg">Fırsat İlanlar</h2>
                        <p className="text-slate-600 md:text-slate-100 text-lg md:drop-shadow-md">Sizin için seçtiğimiz en özel fırsatlar</p>
                    </div>
                    <Link to="/ilanlar" className="bg-secondary text-black px-6 py-2 rounded-full font-bold hover:bg-secondary/90 transition-all shadow-[0_0_15px_rgba(229,192,94,0.4)] flex items-center gap-2">
                        Tüm İlanları Gör →
                    </Link>
                </div>

                <div className="pt-4">
                    {opportunityListings.length > 0 ? (
                        <OpportunitySlider listings={opportunityListings} />
                    ) : (
                        <p className="text-center text-slate-600 bg-white/50 p-8 rounded-xl">Henüz fırsat ilanı bulunmuyor.</p>
                    )}
                </div>
            </main>

            <WhatsAppButton />
        </div>
    );
};

export default Home;
