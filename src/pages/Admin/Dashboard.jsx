import { useState, useEffect } from 'react';
import { useListings } from '../../context/ListingContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, X, Search } from 'lucide-react';
import { CONSULTANTS } from '../../constants/consultants';
import { LOCATIONS } from '../../constants/locations';

const Dashboard = () => {
    const { listings, addListing, updateListing, deleteListing, uploadImages } = useListings(); // Use uploadImages
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [newImages, setNewImages] = useState([]); // { file, preview, id }
    const [uploading, setUploading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [locCity, setLocCity] = useState('');
    const [locDistrict, setLocDistrict] = useState('');

    useEffect(() => {
        if (locCity && locDistrict) {
            setForm(prev => ({ ...prev, location: `${locDistrict}, ${locCity}` }));
        }
    }, [locCity, locDistrict]);

    // ... (rest of state)

    // Filter Logic
    const filteredListings = listings.filter(listing => {
        const term = searchTerm.toLowerCase();
        return (
            (listing.listing_no?.toString() || '').includes(term) ||
            listing.title?.toLowerCase().includes(term) ||
            listing.location?.toLowerCase().includes(term)
        );
    });

    // Form state...
    const initialFormState = {
        title: '',
        location: '',
        price: '',
        type: 'Daire',
        status: 'Satılık',
        beds: '',
        baths: '',
        sqm: '',
        building_age: '',
        floor_location: '',
        total_floors: '',
        heating: 'Kombi',
        kitchen: 'Kapalı',
        balcony: false,
        elevator: false,
        parking: false,
        furnished: false,
        usage_status: 'Boş',
        in_complex: false,
        dues: '',
        complex_name: '',
        loan_eligible: true,
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
            newImages.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, [newImages]);

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
            images: listingImages,
        });

        // Parse Location
        let foundCity = 'Antalya';
        let foundDistrict = '';

        const loc = listing.location || '';
        const parts = loc.split(',').map(s => s.trim());

        if (parts.length > 1) {
            // Check formatted "District, City" or "City, District"
            if (Object.keys(LOCATIONS).includes(parts[1])) {
                foundCity = parts[1];
                foundDistrict = parts[0];
            } else if (Object.keys(LOCATIONS).includes(parts[0])) {
                foundCity = parts[0];
                foundDistrict = parts[1];
            }
        } else {
            // Try to find if the string matches a district or city
            if (Object.keys(LOCATIONS).includes(loc)) {
                foundCity = loc;
            } else {
                for (const [c, districts] of Object.entries(LOCATIONS)) {
                    if (districts.includes(loc)) {
                        foundCity = c;
                        foundDistrict = loc;
                        break;
                    }
                }
            }
        }

        setLocCity(foundCity);
        setLocDistrict(foundDistrict);
        setNewImages([]);
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
            const newImageObjects = files.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                id: Math.random().toString(36).substr(2, 9)
            }));

            setNewImages(prev => [...prev, ...newImageObjects]);
        }
        // Reset input value to allow selecting same files again if needed
        e.target.value = '';
    };

    const handleRemoveNewImage = (id) => {
        setNewImages(prev => prev.filter(img => img.id !== id));
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const generateListingNo = () => {
        // Parse listing numbers to find the highest existing number using the new sequence
        // Old system used random 7-digit numbers (>= 1,000,000)
        // We filter those out to start our new sequence from 500
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
            let uploadedUrls = [];

            if (newImages.length > 0) {
                const filesToUpload = newImages.map(img => img.file);
                uploadedUrls = await uploadImages(filesToUpload);
            }

            // Combine new URLs with existing ones
            const finalImages = [...(form.images || []), ...uploadedUrls];
            const mainImage = finalImages.length > 0 ? finalImages[0] : form.image;

            let finalListingNo = form.listing_no;
            // Generate listing number if creating new and empty
            if (!editingId && !finalListingNo) {
                finalListingNo = generateListingNo();
            }

            const formData = {
                ...form,
                listing_no: finalListingNo,
                images: finalImages,
                image: mainImage
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
                setNewImages([]);
            } else {
                alert('Hata: ' + result.error);
            }
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setUploading(false);
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

                        <div className="flex-1 w-full md:w-auto max-w-md relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="İlan No, Başlık veya Konum ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            />
                        </div>

                        <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end">
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setForm(initialFormState);
                                    setNewImages([]);
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
                                                {Number(listing.price).toLocaleString('tr-TR')} TL
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
                                    <input type="number" name="price" value={form.price} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Para Birimi</label>
                                    <select className="input" disabled>
                                        <option>TL</option>
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
                                        onChange={(e) => setLocDistrict(e.target.value)}
                                        disabled={!locCity}
                                        className="input"
                                    >
                                        <option value="">İlçe Seçiniz</option>
                                        {locCity && LOCATIONS[locCity]?.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
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
                                        <option value="Arsa">Arsa</option>
                                        <option value="İşyeri">İşyeri</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Durum</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="input">
                                        <option value="Satılık">Satılık</option>
                                        <option value="Kiralık">Kiralık</option>
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
                                    <label className="label">Metrekare (m²)</label>
                                    <input type="number" name="sqm" value={form.sqm} onChange={handleChange} required className="input" />
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
                                    <input type="checkbox" name="parking" checked={form.parking} onChange={handleChange} className="w-5 h-5 text-secondary rounded focus:ring-secondary" />
                                    <span>Otopark</span>
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
                                        {form.images.length + newImages.length} Resim Seçili
                                    </span>
                                </div>

                                {uploading && <p className="text-sm text-yellow-600 mb-2 font-bold animate-pulse">Resimler yükleniyor ve ilan oluşturuluyor...</p>}

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {/* Existing Images */}
                                    {form.images && form.images.map((img, idx) => (
                                        <div key={`existing-${idx}`} className="relative group aspect-square">
                                            <img src={img} alt={`Mevcut ${idx}`} className="w-full h-full object-cover rounded-lg shadow-sm border border-slate-200" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(idx)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                                                title="Resmi Kaldır"
                                            >
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">Mevcut</span>
                                        </div>
                                    ))}

                                    {/* New Images Previews */}
                                    {newImages.map((imgObj) => (
                                        <div key={imgObj.id} className="relative group aspect-square">
                                            <img src={imgObj.preview} alt="Yeni Yüklenecek" className="w-full h-full object-cover rounded-lg shadow-sm border-2 border-secondary" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(imgObj.id)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-100 shadow-md hover:bg-red-700"
                                                title="İptal Et"
                                            >
                                                <X size={14} />
                                            </button>
                                            <span className="absolute bottom-2 left-2 bg-secondary text-black text-[10px] px-2 py-0.5 rounded font-bold">Yeni</span>
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
