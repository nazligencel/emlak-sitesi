import { useState, useEffect } from 'react';
import { Menu, X, Home, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled || !isHome
                    ? 'bg-primary/95 backdrop-blur-md shadow-lg py-2' // Dark Navy background
                    : 'bg-transparent py-4'
            )}
        >
            <div className="w-full px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.png" alt="Topcu Logo" className="h-14 w-auto object-contain transition-transform group-hover:scale-105" />
                    <span className="text-base md:text-lg font-bold text-white tracking-tight leading-none translate-y-2">
                        Topcu İnşaat & Gayrimenkul
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { name: 'Anasayfa', path: '/' },
                        { name: 'İlanlar', path: '/ilanlar' },
                        { name: 'Ekibimiz', path: '/danismanlar' },
                        { name: 'Hakkımızda', path: '/hakkimizda' },
                        { name: 'İletişim', path: '/iletisim' }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="text-slate-200 hover:text-secondary font-medium transition-colors relative group"
                        >
                            {item.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black border-t border-slate-800"
                    >
                        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                            {[
                                { name: 'Anasayfa', path: '/' },
                                { name: 'İlanlar', path: '/ilanlar' },
                                { name: 'Ekibimiz', path: '/danismanlar' },
                                { name: 'Hakkımızda', path: '/hakkimizda' },
                                { name: 'İletişim', path: '/iletisim' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="text-slate-300 hover:text-white text-lg font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
