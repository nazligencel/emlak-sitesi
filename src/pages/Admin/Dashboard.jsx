import { useState, useEffect, useRef } from 'react';
import { useListings } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, X, Search, Move } from 'lucide-react';
import { CONSULTANTS } from '../../constants/consultants';
import { LOCATIONS } from '../../constants/locations';

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
        consultant_id: 1,
        is_opportunity: false
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
                price: form.price ? form.price.toString().replace(/\./g, '') : null,
                net_sqm: sanitizeNumeric(form.net_sqm),
                gross_sqm: sanitizeNumeric(form.gross_sqm),
                baths: sanitizeNumeric(form.baths),
                building_age: sanitizeNumeric(form.building_age),
                total_floors: sanitizeNumeric(form.total_floors),
                dues: sanitizeNumeric(form.dues),
                deposit: sanitizeNumeric(form.deposit),
                consultant_id: parseInt(form.consultant_id)
            };

            let result;
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
            <div className="min-h-screen bg-slate-50 pt-24 pb-20">
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

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
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
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
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

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Temel Bilgiler */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Temel Bilgiler</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="col-span-full">
                                    <label className="label">İlan Başlığı</label>
                                    <input type="text" name="title" value={form.title} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Fiyat (TL)</label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={form.price}
                                        onChange={handlePriceChange}
                                        required
                                        className="input"
                                        placeholder="0.000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Para Birimi</label>
                                    <select name="currency" value={form.currency} onChange={handleChange} className="input">
                                        <option value="TL">TL</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">İlan No (Otomatik Atanır)</label>
                                    <input
                                        type="text"
                                        name="listing_no"
                                        value={form.listing_no || (editingId ? '' : 'Otomatik Oluşturulacak')}
                                        onChange={handleChange}
                                        className="input bg-slate-100 text-slate-500"
                                        disabled // Disable manual entry since we auto-gen
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lokasyon & Özellikler */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Lokasyon ve Gayrimenkul Tipi</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="label">İl</label>
                                    <select
                                        value={locCity}
                                        onChange={(e) => {
                                            setLocCity(e.target.value);
                                            setLocDistrict('');
                                            setLocNeighborhood('');
                                        }}
                                        className="input mb-4"
                                    >
                                        <option value="">İl Seçiniz</option>
                                        {Object.keys(LOCATIONS).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>

                                    <label className="label">İlçe</label>
                                    <select
                                        value={locDistrict}
                                        onChange={(e) => {
                                            setLocDistrict(e.target.value);
                                            setLocNeighborhood('');
                                        }}
                                        disabled={!locCity}
                                        className="input mb-4"
                                    >
                                        <option value="">İlçe Seçiniz</option>
                                        {locCity && LOCATIONS[locCity] && Object.keys(LOCATIONS[locCity]).map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>

                                    <label className="label">Mahalle</label>
                                    <select
                                        value={locNeighborhood}
                                        onChange={(e) => setLocNeighborhood(e.target.value)}
                                        disabled={!locDistrict}
                                        className="input"
                                    >
                                        <option value="">Mahalle Seçiniz</option>
                                        {locCity && locDistrict && LOCATIONS[locCity]?.[locDistrict]?.map(neighborhood => (
                                            <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">İlan Sorumlusu (Danışman)</label>
                                    <select
                                        name="consultant_id"
                                        value={form.consultant_id}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        {CONSULTANTS.filter(c => c.name !== "Mesut TOPCU").map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Emlak Tipi</label>
                                    <select name="type" value={form.type} onChange={handleChange} className="input">
                                        <option value="Daire">Daire</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Rezidans">Rezidans</option>
                                        <option value="Dükkan">Dükkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Durum</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="input">
                                        <option value="Satılık">Satılık</option>
                                        <option value="Kiralık">Kiralık</option>
                                        <option value="Devren Satılık">Devren Satılık</option>
                                        <option value="Devren Kiralık">Devren Kiralık</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Kullanım Durumu</label>
                                    <select name="usage_status" value={form.usage_status} onChange={handleChange} className="input">
                                        <option value="Boş">Boş</option>
                                        <option value="Kiracılı">Kiracılı</option>
                                        <option value="Mülk Sahibi">Mülk Sahibi</option>
                                    </select>
                                </div>
                            </div>
                        </div>


                        {/* Açıklama */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">İlan Açıklaması</h3>
                            <div className="grid md:grid-cols-1 gap-6">
                                <div>
                                    <label className="label">Açıklama (Detaylı Bilgi)</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="5"
                                        className="input resize-y"
                                        placeholder="İlan hakkında detaylı bilgi giriniz..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Detaylar */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Gayrimenkul Detayları</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="label">Net Metrekare (m²)</label>
                                    <input type="number" name="net_sqm" value={form.net_sqm} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Brüt Metrekare (m²)</label>
                                    <input type="number" name="gross_sqm" value={form.gross_sqm} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Oda Sayısı</label>
                                    <input type="text" name="beds" value={form.beds} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Banyo Sayısı</label>
                                    <input type="number" name="baths" value={form.baths} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Bina Yaşı</label>
                                    <input type="number" name="building_age" value={form.building_age} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Bulunduğu Kat</label>
                                    <input type="text" name="floor_location" value={form.floor_location} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Kat Sayısı</label>
                                    <input type="number" name="total_floors" value={form.total_floors} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Isıtma</label>
                                    <select name="heating" value={form.heating} onChange={handleChange} className="input">
                                        <option value="Doğalgaz">Doğalgaz</option>
                                        <option value="Kombi">Kombi</option>
                                        <option value="Merkezi">Merkezi</option>
                                        <option value="Yerden Isıtma">Yerden Isıtma</option>
                                        <option value="Klima">Klima</option>
                                        <option value="Yok">Yok</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Aidat (TL)</label>
                                    <input type="number" name="dues" value={form.dues} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">Mutfak Tipi</label>
                                    <select name="kitchen" value={form.kitchen} onChange={handleChange} className="input">
                                        <option value="Kapalı">Kapalı</option>
                                        <option value="Açık">Açık</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Tapu Durumu</label>
                                    <input type="text" name="tapu_status" value={form.tapu_status} onChange={handleChange} className="input" placeholder="Örn: Hisseli, Müstakil" />
                                </div>
                                <div>
                                    <label className="label">Otopark Durumu</label>
                                    <select name="parking" value={form.parking} onChange={handleChange} className="input">
                                        <option value="Yok">Yok</option>
                                        <option value="Açık">Açık</option>
                                        <option value="Kapalı">Kapalı</option>
                                        <option value="Açık & Kapalı">Açık & Kapalı</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Cephe</label>
                                    <div className="grid grid-cols-2 gap-2 bg-white p-3 border border-slate-200 rounded-lg">
                                        {['Kuzey', 'Güney', 'Doğu', 'Batı'].map(facadeOption => (
                                            <label key={facadeOption} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-primary">
                                                <input
                                                    type="checkbox"
                                                    value={facadeOption}
                                                    checked={form.facade?.split(' - ').includes(facadeOption)}
                                                    onChange={handleFacadeChange}
                                                    className="w-4 h-4 text-secondary rounded focus:ring-secondary border-slate-300"
                                                />
                                                <span>{facadeOption}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Depozito</label>
                                    <input type="number" name="deposit" value={form.deposit} onChange={handleChange} className="input" />
                                </div>
                            </div>
                        </div>

                        {/* Ek Özellikler (Checkbox) */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Özellikler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="balcony" checked={form.balcony} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Balkon</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="elevator" checked={form.elevator} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Asansör</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Eşyalı</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="in_complex" checked={form.in_complex} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Site İçerisinde</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="loan_eligible" checked={form.loan_eligible} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Krediye Uygun</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="swap" checked={form.swap} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Takas</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                    <input type="checkbox" name="is_opportunity" checked={form.is_opportunity} onChange={handleChange} className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500" />
                                    <span className="font-bold text-yellow-700">Fırsat İlanı</span>
                                </label>
                            </div>
                        </div>

                        {/* Görsel */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Görseller</h3>
                            <div className="col-span-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors border border-dashed border-slate-300"
                                    >
                                        <Plus size={20} />
                                        <span>Fotoğraf Ekle</span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-slate-500">
                                        {displayImages.length} Resim Seçili (Sürükle bırak ile sıralayabilirsiniz)
                                    </span>
                                </div>

                                {uploading && <p className="text-sm text-yellow-600 mb-2 font-bold animate-pulse">Resimler yükleniyor ve ilan oluşturuluyor...</p>}

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {displayImages.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className="relative group aspect-square cursor-grab active:cursor-grabbing"
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
                                                className={`w-full h-full object-cover rounded-lg shadow-sm border-2 ${img.type === 'new' ? 'border-secondary' : 'border-slate-200'}`}
                                            />

                                            {/* Order Badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none">
                                                {index + 1}
                                            </div>

                                            {/* Drag Handle Icon (Visual Cue) */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-70 pointer-events-none drop-shadow-lg">
                                                <Move size={32} />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(img.id)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-100 shadow-md hover:bg-red-700 z-10"
                                                title="Resmi Kaldır"
                                            >
                                                <X size={14} />
                                            </button>

                                            <span className={`absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm ${img.type === 'new' ? 'bg-secondary text-black' : 'bg-black/60 text-white'}`}>
                                                {img.type === 'new' ? 'Yeni' : 'Mevcut'}
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
