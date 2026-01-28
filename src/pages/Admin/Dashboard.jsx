import { useState, useEffect, useRef } from 'react';
import { useListings } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, X, Search, Move } from 'lucide-react';
import { CONSULTANTS } from '../../constants/consultants';
import { LOCATIONS } from '../../constants/locations';
import { supabase } from '../../supabase';

const ZONING_OPTIONS = ['Bağ & Bahçe', 'Depo & Antrepo', 'Konut', 'Muhtelif', 'Sanayi', 'Sera', 'Sit Alanı', 'Tarla', 'Tarla + Bağ', 'Ticari', 'Ticari + Konut', 'Villa', 'Zeytinlik'];
const TAPU_OPTIONS = ['Hisseli Tapu', 'Müstakil Tapulu', 'Tapu Kaydı Yok'];
const INFRASTRUCTURE_OPTIONS = ['Elektrik', 'Sanayi Elektriği', 'Su', 'Telefon', 'Doğalgaz', 'Kanalizasyon', 'Arıtma', 'Sondaj & Kuyu', 'Zemin Etüdü', 'Yolu Açılmış', 'Yolu Açılmamış', 'Yolu Yok'];
const LOCATION_FEATURES_OPTIONS = ['Anayola Yakın', 'Denize Sıfır', 'Denize Yakın', 'Havaalanına Yakın', 'Toplu Taşımaya Yakın'];
const GENERAL_FEATURES_OPTIONS = ['İfrazlı', 'Parselli', 'Projeli', 'Köşe Parsel'];
const VIEW_OPTIONS = ['Şehir', 'Deniz', 'Doğa', 'Boğaz', 'Göl'];

const Dashboard = () => {
    const { listings, addListing, updateListing, deleteListing, uploadImages } = useListings(); // Use uploadImages
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    // const [newImages, setNewImages] = useState([]); // Removed in favor of displayImages
    const [displayImages, setDisplayImages] = useState([]); // { id, url, file, type: 'existing'|'new' }
    const [uploading, setUploading] = useState(false);

    // Drag & Drop refs
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterConsultant, setFilterConsultant] = useState('');
    const [locCity, setLocCity] = useState('');
    const [locDistrict, setLocDistrict] = useState('');
    const [locNeighborhood, setLocNeighborhood] = useState('');

    useEffect(() => {
        if (locCity && locDistrict) {
            // Construct location string: "Neighborhood, District, City" or "District, City"
            const parts = [locNeighborhood, locDistrict, locCity].filter(Boolean);
            setForm(prev => ({ ...prev, location: parts.join(', ') }));
        }
    }, [locCity, locDistrict, locNeighborhood]);

    // ... (rest of state)

    // Filter Logic
    const filteredListings = listings.filter(listing => {
        const term = searchTerm.toLowerCase();

        // Find consultant for name search
        const consultant = CONSULTANTS.find(c => c.id === listing.consultant_id);
        const consultantName = consultant ? consultant.name.toLowerCase() : '';

        const matchesSearch = (
            (listing.listing_no?.toString() || '').includes(term) ||
            listing.title?.toLowerCase().includes(term) ||
            listing.location?.toLowerCase().includes(term) ||
            consultantName.includes(term)
        );
        const matchesConsultant = filterConsultant ? listing.consultant_id === parseInt(filterConsultant) : true;

        return matchesSearch && matchesConsultant;
    });

    // ... (rest of search/filter code)

    const handleFacadeChange = (e) => {
        const { value, checked } = e.target;
        let currentFacades = form.facade ? form.facade.split(' - ') : [];

        if (checked) {
            currentFacades.push(value);
        } else {
            currentFacades = currentFacades.filter(f => f !== value);
        }

        // Sort to keep order consistent, or just join
        // Order: Kuzey, Güney, Doğu, Batı
        const order = ['Kuzey', 'Güney', 'Doğu', 'Batı'];
        currentFacades.sort((a, b) => order.indexOf(a) - order.indexOf(b));

        setForm(prev => ({
            ...prev,
            facade: currentFacades.join(' - ')
        }));
    };

    const handleMultiSelectCheck = (e, field) => {
        const { value, checked } = e.target;
        let currentItems = form[field] ? form[field].split(' - ') : [];
        if (checked) {
            currentItems.push(value);
        } else {
            currentItems = currentItems.filter(item => item !== value);
        }
        setForm(prev => ({
            ...prev,
            [field]: currentItems.join(' - ')
        }));
    };

    // Form state...
    const initialFormState = {
        title: '',
        location: '',
        price: '',
        currency: 'TL',
        type: 'Daire',
        status: 'Satılık',
        beds: '',
        baths: '',
        net_sqm: '',
        gross_sqm: '',
        building_age: '',
        floor_location: '',
        total_floors: '',
        heating: 'Doğalgaz',
        kitchen: 'Kapalı',
        facade: '',
        balcony: false,
        elevator: false,
        parking: 'Yok',
        furnished: false,
        usage_status: 'Boş',
        in_complex: false,
        dues: '',
        deposit: '',
        complex_name: '',
        loan_eligible: true,
        tapu_status: '',
        title_deed_status: 'Kat Mülkiyeti',
        from_who: 'Sahibinden',
        swap: false,
        listing_no: '',
        image: '',
        images: [],
        consultant_id: 2,
        is_opportunity: false,
        // Land specific fields
        zoning_status: '',
        ada_no: '',
        parsel_no: '',
        kaks: '',
        infrastructure: '',
        location_features: '',
        general_features: '',
        view: '',
        price_per_sqm: '' // Manuel m2 fiyatı
    };

    const [form, setForm] = useState(initialFormState);

    // Cleanup previews
    useEffect(() => {
        return () => {
            displayImages.forEach(img => {
                if (img.type === 'new') {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, [displayImages]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleEdit = (listing) => {
        setEditingId(listing.id);
        const listingImages = listing.images || (listing.image ? [listing.image] : []);
        setForm({
            ...initialFormState,
            ...listing,
            price: listing.price ? Number(listing.price).toLocaleString('tr-TR') : '',
            images: listingImages,
        });

        // Initialize existing images for display/reorder
        const initialDisplayImages = listingImages.map((url, idx) => ({
            id: `existing-${idx}-${Date.now()}`,
            url: url,
            type: 'existing'
        }));
        setDisplayImages(initialDisplayImages);

        // Parse Location: "Mahalle, İlçe, İl" or "İlçe, İl"
        const loc = listing.location || '';
        const parts = loc.split(',').map(s => s.trim());

        let foundCity = '';
        let foundDistrict = '';
        let foundNeighborhood = '';

        // Try to find City from known locations (usually last part)
        const possibleCity = parts[parts.length - 1];
        if (LOCATIONS[possibleCity]) {
            foundCity = possibleCity;

            // Check district (second to last)
            if (parts.length > 1) {
                const possibleDistrict = parts[parts.length - 2];
                // Check if district exists in city (keys of object)
                if (LOCATIONS[foundCity][possibleDistrict] || (Array.isArray(LOCATIONS[foundCity]) && LOCATIONS[foundCity].includes(possibleDistrict))) {
                    foundDistrict = possibleDistrict;

                    // Remainder is neighborhood
                    if (parts.length > 2) {
                        foundNeighborhood = parts.slice(0, parts.length - 2).join(', ');
                    }
                }
            }
        }
        // Fallback search
        if (!foundCity) {
            for (const part of parts) {
                if (LOCATIONS[part]) {
                    foundCity = part;
                    break;
                }
            }
        }

        setLocCity(foundCity);
        setLocDistrict(foundDistrict);
        setLocNeighborhood(foundNeighborhood);
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
            await deleteListing(id);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newItems = files.map(file => ({
                id: `new-${Math.random().toString(36).substr(2, 9)}`,
                url: URL.createObjectURL(file), // Use this for preview
                file: file,
                type: 'new'
            }));

            setDisplayImages(prev => [...prev, ...newItems]);
        }
        e.target.value = '';
    };

    const handleRemoveImage = (id) => {
        setDisplayImages(prev => prev.filter(img => img.id !== id));
    };

    // Drag and Drop Handlers
    const handleSort = () => {
        let _displayImages = [...displayImages];
        const draggedItemContent = _displayImages.splice(dragItem.current, 1)[0];
        _displayImages.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setDisplayImages(_displayImages);
    };

    const generateListingNo = () => {
        const sequentialNumbers = listings
            .map(l => parseInt(l.listing_no))
            .filter(n => !isNaN(n) && n < 1000000);

        if (sequentialNumbers.length === 0) {
            return "500";
        }

        const maxNum = Math.max(...sequentialNumbers);
        return (maxNum + 1).toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // 1. Separate items
            const existingItems = displayImages.filter(i => i.type === 'existing');
            const newItems = displayImages.filter(i => i.type === 'new');

            // 2. Upload new files
            let uploadedUrls = [];
            if (newItems.length > 0) {
                const filesToUpload = newItems.map(img => img.file);
                uploadedUrls = await uploadImages(filesToUpload);
            }

            // 3. Reconstruct the ordered list of URLs
            // We need to map the original 'displayImages' order to the final URLs
            // We use a pointer for the uploadedUrls array
            let uploadPtr = 0;
            const finalImages = displayImages.map(item => {
                if (item.type === 'existing') {
                    return item.url;
                } else {
                    return uploadedUrls[uploadPtr++];
                }
            });

            const mainImage = finalImages.length > 0 ? finalImages[0] : '';

            let finalListingNo = form.listing_no;
            if (!editingId && !finalListingNo) {
                finalListingNo = generateListingNo();
            }

            const sanitizeNumeric = (val) => (val === '' ? null : val);

            const formData = {
                ...form,
                listing_no: finalListingNo,
                images: finalImages,
                image: mainImage,
            };

            let result;

            // Validate required fields based on Type
            const isLand = ['Satılık Arsa', 'Satılık Tarla'].includes(form.type);
            // Example validation override if needed, but HTML required attribute helps.

            if (editingId) {
                result = await updateListing(editingId, formData);
            } else {
                result = await addListing(formData);
            }

            if (result.success) {
                alert(editingId ? 'İlan güncellendi!' : `İlan eklendi! İlan No: ${finalListingNo}`);
                setView('list');
                setForm(initialFormState);
                setEditingId(null);
                setDisplayImages([]);
            } else {
                alert('Hata: ' + result.error);
            }
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setUploading(false);
        }
    };



    const handlePriceChange = (e) => {
        // Allow digits only
        let raw = e.target.value.replace(/\D/g, '');
        if (raw) {
            // Format with dots
            const formatted = Number(raw).toLocaleString('tr-TR');
            setForm(prev => ({ ...prev, price: formatted }));
        } else {
            setForm(prev => ({ ...prev, price: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (view === 'list') {
        return (
            <div className="min-h-screen bg-slate-100 pt-24 pb-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-primary whitespace-nowrap w-full md:w-auto text-center md:text-left">İlan Yönetimi</h1>

                        <div className="flex flex-col md:flex-row gap-2 flex-1 max-w-3xl w-full mx-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="İlan No, Başlık veya Konum ile ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                                />
                            </div>
                            <select
                                value={filterConsultant}
                                onChange={(e) => setFilterConsultant(e.target.value)}
                                className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white"
                            >
                                <option value="">Tüm Danışmanlar</option>
                                {CONSULTANTS.filter(c => c.name !== "Mesut TOPCU").map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end">
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setForm(initialFormState);
                                    setDisplayImages([]);
                                    setLocCity('');
                                    setLocDistrict('');
                                    setView('form');
                                }}
                                className="bg-secondary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-secondary/90 transition-colors whitespace-nowrap"
                            >
                                <Plus size={20} /> Yeni İlan
                            </button>

                            <button onClick={handleLogout} className="text-red-600 font-medium hover:text-red-700 whitespace-nowrap">
                                Çıkış Yap
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#fafafa] rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-200 text-slate-700 font-semibold border-b border-slate-300">
                                        <th className="p-4 whitespace-nowrap">Resim</th>
                                        <th className="p-4 whitespace-nowrap">İlan No</th>
                                        <th className="p-4 whitespace-nowrap">Başlık</th>
                                        <th className="p-4 whitespace-nowrap">Konum</th>
                                        <th className="p-4 whitespace-nowrap">Fiyat</th>
                                        <th className="p-4 whitespace-nowrap text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredListings.map(listing => (
                                        <tr key={listing.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-4 whitespace-nowrap">
                                                <img src={listing.image} alt="" className="w-16 h-12 object-cover rounded" />
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-500 whitespace-nowrap">#{listing.listing_no || listing.id}</td>
                                            <td className="p-4 font-medium text-primary whitespace-nowrap">{listing.title}</td>
                                            <td className="p-4 text-slate-500 whitespace-nowrap">{listing.location}</td>
                                            <td className="p-4 font-bold text-secondary whitespace-nowrap">
                                                {Number(listing.price).toLocaleString('tr-TR')} {listing.currency || 'TL'}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(listing)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 mr-2"
                                                    title="Düzenle"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredListings.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-slate-500">
                                                Henüz ilan bulunmuyor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    } // End of List View

    return (
        <div className="min-h-screen bg-slate-100 pt-24 pb-20">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">
                        {editingId ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
                    </h1>
                    <button
                        onClick={() => setView('list')}
                        className="text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                    >
                        <X size={20} /> İptal
                    </button>
                </div>

                <div className="bg-[#fafafa] p-8 rounded-xl shadow-lg border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Temel Bilgiler */}
                        {/* Temel Bilgiler - Compact Design */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                <h3 className="text-lg font-bold text-slate-800">Temel Bilgiler</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                {/* İlan Başlığı */}
                                <div className="md:col-span-6 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İlan Başlığı</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 h-[46px] rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium text-slate-600 placeholder:text-slate-300"
                                        placeholder="Örn: Deniz Manzaralı Lüks Villa"
                                    />
                                </div>

                                {/* Fiyat Grubu */}
                                <div className="md:col-span-4 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fiyat & Para Birimi</label>
                                    <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/10 transition-all bg-white h-[46px] items-center">
                                        <input
                                            type="text"
                                            name="price"
                                            value={form.price}
                                            onChange={handlePriceChange}
                                            required
                                            className="w-full px-4 h-full outline-none text-sm font-medium text-slate-900 placeholder:text-slate-200 bg-transparent"
                                            placeholder="0"
                                        />
                                        <div className="bg-slate-50 border-l border-slate-100 flex items-center px-1 h-full">
                                            <select
                                                name="currency"
                                                value={form.currency}
                                                onChange={handleChange}
                                                className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer h-full px-2 hover:text-secondary transition-colors"
                                            >
                                                <option value="TL">TL</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* İlan No */}
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İlan No</label>
                                    <input
                                        type="text"
                                        name="listing_no"
                                        value={form.listing_no || (editingId ? '' : 'Otomatik Atanacak')}
                                        readOnly
                                        disabled
                                        className="w-full px-4 h-[46px] rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-center text-sm font-medium outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lokasyon ve Gayrimenkul Tipi - Compact Design */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                <h3 className="text-lg font-bold text-slate-800">Lokasyon ve Detaylar</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Location Group */}
                                <div className="md:col-span-4 space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İl</label>
                                        <select
                                            value={locCity}
                                            onChange={(e) => {
                                                setLocCity(e.target.value);
                                                setLocDistrict('');
                                                setLocNeighborhood('');
                                            }}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium"
                                        >
                                            <option value="">İl Seçiniz</option>
                                            {Object.keys(LOCATIONS).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İlçe</label>
                                        <select
                                            value={locDistrict}
                                            onChange={(e) => {
                                                setLocDistrict(e.target.value);
                                                setLocNeighborhood('');
                                            }}
                                            disabled={!locCity}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium"
                                        >
                                            <option value="">İlçe Seçiniz</option>
                                            {locCity && LOCATIONS[locCity] && Object.keys(LOCATIONS[locCity]).map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mahalle</label>
                                        <input
                                            type="text"
                                            value={locNeighborhood}
                                            onChange={(e) => setLocNeighborhood(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium placeholder:text-slate-300"
                                            placeholder="Mahalle giriniz"
                                        />
                                    </div>
                                </div>

                                {/* Property Details Group */}
                                <div className="md:col-span-8 grid grid-cols-2 gap-4 h-fit">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İlan Sorumlusu</label>
                                        <select
                                            name="consultant_id"
                                            value={form.consultant_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium"
                                        >
                                            {CONSULTANTS.filter(c => c.name !== "Mesut TOPCU").map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Emlak Tipi</label>
                                        <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                            <option value="Daire">Daire</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Rezidans">Rezidans</option>
                                            <option value="Dükkan">Dükkan</option>
                                            <option value="Satılık Arsa">Satılık Arsa</option>
                                            <option value="Satılık Tarla">Satılık Tarla</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Durum</label>
                                        <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                            <option value="Satılık">Satılık</option>
                                            <option value="Kiralık">Kiralık</option>
                                            <option value="Devren Satılık">Devren Satılık</option>
                                            <option value="Devren Kiralık">Devren Kiralık</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kullanım Durumu</label>
                                        <select name="usage_status" value={form.usage_status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                            <option value="Boş">Boş</option>
                                            <option value="Kiracılı">Kiracılı</option>
                                            <option value="Mülk Sahibi">Mülk Sahibi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Açıklama - Compact Design */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                <h3 className="text-lg font-bold text-slate-800">İlan Açıklaması</h3>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Açıklama</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-medium text-slate-600 placeholder:text-slate-300 resize-y min-h-[100px]"
                                    placeholder="İlan hakkında dikkat çekici detayları buraya yazınız..."
                                ></textarea>
                            </div>
                        </div>


                        {['Satılık Arsa', 'Satılık Tarla'].includes(form.type) ? (
                            // -------------------------
                            // LAND / FIELD FORM FIELDS
                            // -------------------------
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                    <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                    <h3 className="text-lg font-bold text-slate-800">Arsa/Tarla Detayları & Özellikler</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">İmar Durumu</label>
                                        <input type="text" name="zoning_status" value={form.zoning_status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tapu Durumu</label>
                                        <input type="text" name="tapu_status" value={form.tapu_status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Takas</label>
                                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all h-[42px]">
                                            <input type="checkbox" name="swap" checked={form.swap} onChange={handleChange} className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300" />
                                            <span className="text-sm font-medium text-slate-600">Takas Yapılabilir</span>
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fırsat İlanı</label>
                                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-all h-[42px]">
                                            <input type="checkbox" name="is_opportunity" checked={form.is_opportunity} onChange={handleChange} className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500 border-yellow-400" />
                                            <span className="text-sm font-bold text-yellow-700">Fırsat İlanı</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">m² (Alanı)</label>
                                        <input type="number" name="gross_sqm" value={form.gross_sqm} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" placeholder="0" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">m² Fiyatı</label>
                                        <input type="text" name="price_per_sqm" value={form.price_per_sqm} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" placeholder="Manuel" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Ada No</label>
                                        <input type="text" name="ada_no" value={form.ada_no} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Parsel No</label>
                                        <input type="text" name="parsel_no" value={form.parsel_no} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kaks (Emsal)</label>
                                        <input type="text" name="kaks" value={form.kaks} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-slate-50">
                                    {/* Altyapı */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Altyapı</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {INFRASTRUCTURE_OPTIONS.map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={form.infrastructure?.split(' - ').includes(opt)}
                                                        onChange={(e) => handleMultiSelectCheck(e, 'infrastructure')}
                                                        className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Konum */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Konum</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {LOCATION_FEATURES_OPTIONS.map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={form.location_features?.split(' - ').includes(opt)}
                                                        onChange={(e) => handleMultiSelectCheck(e, 'location_features')}
                                                        className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Genel Özellikler */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Genel Özellikler</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {GENERAL_FEATURES_OPTIONS.map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={form.general_features?.split(' - ').includes(opt)}
                                                        onChange={(e) => handleMultiSelectCheck(e, 'general_features')}
                                                        className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Manzara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Manzara</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {VIEW_OPTIONS.map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        value={opt}
                                                        checked={form.view?.split(' - ').includes(opt)}
                                                        onChange={(e) => handleMultiSelectCheck(e, 'view')}
                                                        className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // -------------------------
                            // STANDARD BUILDING FORM
                            // -------------------------
                            <>
                                {/* Gayrimenkul Detayları - Compact Design */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                        <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                        <h3 className="text-lg font-bold text-slate-800">Bina/Daire Detayları</h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Net m²</label>
                                            <input type="number" name="net_sqm" value={form.net_sqm} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Brüt m²</label>
                                            <input type="number" name="gross_sqm" value={form.gross_sqm} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Oda</label>
                                            <input type="text" name="beds" value={form.beds} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Banyo</label>
                                            <input type="number" name="baths" value={form.baths} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Isıtma</label>
                                            <select name="heating" value={form.heating} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                                <option value="Doğalgaz">Doğalgaz</option>
                                                <option value="Kombi">Kombi</option>
                                                <option value="Merkezi">Merkezi</option>
                                                <option value="Yerden Isıtma">Yerden Isıtma</option>
                                                <option value="Klima">Klima</option>
                                                <option value="Yok">Yok</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bina Yaşı</label>
                                            <input type="text" name="building_age" value={form.building_age} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" placeholder="0 (Yeni)" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bulunduğu Kat</label>
                                            <input type="text" name="floor_location" value={form.floor_location} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kat Sayısı</label>
                                            <input type="number" name="total_floors" value={form.total_floors} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Aidat (TL)</label>
                                            <input type="number" name="dues" value={form.dues} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mutfak</label>
                                            <select name="kitchen" value={form.kitchen} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                                <option value="Kapalı">Kapalı</option>
                                                <option value="Açık">Açık</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tapu (Örn: Hisseli)</label>
                                            <input type="text" name="tapu_status" value={form.tapu_status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Otopark</label>
                                            <select name="parking" value={form.parking} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium">
                                                <option value="Yok">Yok</option>
                                                <option value="Açık">Açık</option>
                                                <option value="Kapalı">Kapalı</option>
                                                <option value="Açık & Kapalı">Açık & Kapalı</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Depozito</label>
                                            <input type="number" name="deposit" value={form.deposit} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm font-medium" />
                                        </div>

                                        {/* Cephe */}
                                        <div className="col-span-2 md:col-span-4 lg:col-span-6 space-y-1">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cephe</label>
                                            <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border border-slate-200">
                                                {['Kuzey', 'Güney', 'Doğu', 'Batı'].map(facadeOption => (
                                                    <label key={facadeOption} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            value={facadeOption}
                                                            checked={form.facade?.split(' - ').includes(facadeOption)}
                                                            onChange={handleFacadeChange}
                                                            className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">{facadeOption}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ek Özellikler (Checkbox) - Compact Design */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                        <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                        <h3 className="text-lg font-bold text-slate-800">Ek Özellikler</h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                                        {[
                                            { key: 'balcony', label: 'Balkon' },
                                            { key: 'elevator', label: 'Asansör' },
                                            { key: 'furnished', label: 'Eşyalı' },
                                            { key: 'in_complex', label: 'Site İçerisinde' },
                                            { key: 'loan_eligible', label: 'Krediye Uygun' },
                                            { key: 'swap', label: 'Takas' },
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all">
                                                <input type="checkbox" name={item.key} checked={form[item.key]} onChange={handleChange} className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300" />
                                                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                            </label>
                                        ))}

                                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-all">
                                            <input type="checkbox" name="is_opportunity" checked={form.is_opportunity} onChange={handleChange} className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500 border-yellow-400" />
                                            <span className="text-sm font-bold text-yellow-700">Fırsat İlanı</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Görsel - Compact Design */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                                <h3 className="text-lg font-bold text-slate-800">İlan Görselleri</h3>
                            </div>

                            <div className="col-span-full">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors border-2 border-dashed border-slate-200 w-full md:w-auto hover:border-secondary hover:text-secondary group"
                                    >
                                        <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                            <Plus size={20} className="text-slate-400 group-hover:text-secondary" />
                                        </div>
                                        <span>Yeni Fotoğraf Ekle</span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="font-bold text-slate-600 block mb-0.5">{displayImages.length} Resim Seçildi</span>
                                        Sıralamak için sürükleyip bırakabilirsiniz.
                                    </div>
                                </div>

                                {uploading && <p className="text-sm text-yellow-600 mb-2 font-bold animate-pulse">Resimler yükleniyor ve ilan oluşturuluyor...</p>}

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {displayImages.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className="relative group aspect-[4/3] cursor-grab active:cursor-grabbing"
                                            draggable
                                            onDragStart={(e) => {
                                                dragItem.current = index;
                                                e.dataTransfer.effectAllowed = "move";
                                            }}
                                            onDragEnter={(e) => {
                                                dragOverItem.current = index;
                                            }}
                                            onDragEnd={handleSort}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Görsel ${index}`}
                                                className={`w-full h-full object-cover rounded-xl shadow-sm border-2 transition-all ${img.type === 'new' ? 'border-secondary' : 'border-slate-100 group-hover:border-slate-300'}`}
                                            />

                                            {/* Order Badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none border border-white/20">
                                                {index + 1}
                                            </div>

                                            {/* Drag Handle Icon (Visual Cue) */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 pointer-events-none drop-shadow-lg transition-opacity">
                                                <Move size={32} />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(img.id)}
                                                className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-red-700 p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-sm hover:scale-110 transition-all z-10"
                                                title="Resmi Kaldır"
                                            >
                                                <X size={16} />
                                            </button>

                                            <span className={`absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm shadow-sm ${img.type === 'new' ? 'bg-secondary text-black' : 'bg-black/60 text-white border border-white/20'}`}>
                                                {img.type === 'new' ? 'YENİ' : 'MEVCUT'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`flex-1 text-black font-bold py-4 rounded-lg transition-all shadow-lg text-lg ${uploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-secondary hover:bg-secondary/90'}`}
                            >
                                {uploading ? 'İşleniyor...' : (editingId ? 'İlanı Güncelle' : 'İlanı Yayınla')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
                .input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; outline: none; transition: all; }
                .input:focus { border-color: #CCAC2C; ring: 1px solid #CCAC2C; }
            `}</style>
        </div>
    );
};

export default Dashboard;
