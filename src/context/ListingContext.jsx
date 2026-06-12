import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ListingContext = createContext();

export const useListings = () => {
    return useContext(ListingContext);
};

export const ListingProvider = ({ children }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const addListing = async (newListing) => {
        try {
            const processedListing = processListingData(newListing);

            const { data, error } = await supabase
                .from('listings')
                .insert([processedListing])
                .select();

            if (error) throw error;

            if (data) {
                setListings(prev => [data[0], ...prev]);
            }
            return { success: true };
        } catch (error) {
            console.error('Error adding listing:', error.message);
            return { success: false, error: error.message };
        }
    };

    const updateListing = async (id, updatedFields) => {
        try {
            // Fix: Exclude internal fields
            const { id: _, created_at: __, ...fields } = updatedFields;
            const processedFields = processListingData(fields);
            const previous = listings.find(item => item.id === id);

            const { data, error } = await supabase
                .from('listings')
                .update(processedFields)
                .eq('id', id)
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setListings(prev => prev.map(item => item.id === id ? data[0] : item));

                // Remove images that were dropped during this edit (best-effort).
                // Guard on `images` actually being part of the update so we never
                // wipe a listing's photos when images weren't touched.
                if (previous && Array.isArray(processedFields.images)) {
                    const oldUrls = previous.images || (previous.image ? [previous.image] : []);
                    const removed = oldUrls.filter(u => u && !processedFields.images.includes(u));
                    if (removed.length > 0) await removeImages(removed);
                }
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating listing:', error.message);
            return { success: false, error: error.message };
        }
    };

    // Helper for safe number conversion and data normalization
    const processListingData = (data) => {
        const safeNumber = (val) => {
            if (val === '' || val === null || val === undefined) return null;
            if (typeof val === 'number') return isNaN(val) ? null : val;

            let s = val.toString().trim();
            if (s === '') return null;

            // Normalize Turkish/European number formatting into a JS-parseable number.
            if (s.includes(',')) {
                // Comma present => comma is the decimal separator, dots are thousands
                // separators. "1.500.000,75" -> "1500000.75", "1,50" -> "1.5"
                s = s.replace(/\./g, '').replace(',', '.');
            } else {
                const dotCount = (s.match(/\./g) || []).length;
                if (dotCount > 1) {
                    // Multiple dots => all thousands separators. "1.500.000" -> "1500000"
                    s = s.replace(/\./g, '');
                } else if (dotCount === 1) {
                    // A single dot is ambiguous. Treat exactly 3 trailing digits as a
                    // thousands separator ("1.500" -> 1500); otherwise keep it as a
                    // decimal point so values like KAKS "1.50"/"2.07"/"0.30" survive
                    // instead of being multiplied by 100.
                    const frac = s.split('.')[1];
                    if (frac.length === 3) s = s.replace('.', '');
                }
            }

            const num = Number(s);
            return isNaN(num) ? null : num;
        };

        const processed = { ...data };

        // 1. Explicitly clean all strings and handle empty strings first
        Object.keys(processed).forEach(key => {
            if (processed[key] === '') {
                processed[key] = null;
            }
        });

        // 2. Apply safeNumber to ALL potential numeric fields
        // This ensures if a numeric column in DB gets a value, it's a Number or NULL, never ""
        const numericFields = [
            'price', 'baths', 'net_sqm', 'gross_sqm', 'sqm',
            'building_age', 'total_floors', 'dues', 'deposit',
            'ada_no', 'parsel_no', 'kaks', 'price_per_sqm',
            'consultant_id'
        ];

        numericFields.forEach(field => {
            if (processed[field] !== undefined) {
                processed[field] = safeNumber(processed[field]);
            }
        });

        // 3. Handle Special Cases
        // beds can be "3+1" (string) or a number. If we force it to number, we lose "3+1".
        // But if the DB is numeric, "3+1" will crash anyway. 
        // We assume if it contains '+', it's a string and we hope the DB column is text.
        if (processed.beds && !processed.beds.toString().includes('+')) {
            const bedNum = safeNumber(processed.beds);
            if (bedNum !== null) processed.beds = bedNum;
        }

        // 4. Force Boolean conversion for all Toggle fields
        const booleanFields = [
            'balcony', 'elevator', 'furnished', 'in_complex',
            'loan_eligible', 'swap', 'is_opportunity'
        ];

        booleanFields.forEach(field => {
            if (processed[field] !== undefined) {
                if (processed[field] === null || processed[field] === '') {
                    processed[field] = false; // Default for booleans if empty
                } else {
                    processed[field] = Boolean(processed[field]);
                }
            }
        });

        return processed;
    };

    // Derive the in-bucket path (file name) from a public storage URL.
    const pathFromUrl = (url) => {
        if (!url) return null;
        const marker = '/listing-images/';
        const idx = url.indexOf(marker);
        return idx === -1 ? null : url.slice(idx + marker.length);
    };

    // Best-effort removal of storage files given their public URLs. Never throws —
    // a failed cleanup should not break the surrounding operation.
    const removeImages = async (urls) => {
        const paths = (urls || []).map(pathFromUrl).filter(Boolean);
        if (paths.length === 0) return;
        try {
            await supabase.storage.from('listing-images').remove(paths);
        } catch (error) {
            console.error('Error removing images:', error.message);
        }
    };

    const uploadImages = async (files) => {
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const MIME_TO_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

        const fileArr = Array.from(files);

        // Validate everything up front so a single bad file can't leave half the
        // batch uploaded (orphaned) before we hit the failure.
        for (const file of fileArr) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`Geçersiz dosya türü: ${file.name}. Sadece JPG, PNG, WebP ve GIF yüklenebilir.`);
            }
            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`Dosya çok büyük: ${file.name}. Maksimum 5MB yüklenebilir.`);
            }
        }

        const uploadedPaths = [];
        try {
            const urls = await Promise.all(fileArr.map(async (file) => {
                const fileExt = MIME_TO_EXT[file.type] || 'jpg';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('listing-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;
                uploadedPaths.push(fileName);

                const { data } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(fileName);

                return data.publicUrl;
            }));
            return urls;
        } catch (error) {
            // Roll back any files that did upload so they don't orphan in storage.
            if (uploadedPaths.length > 0) {
                try {
                    await supabase.storage.from('listing-images').remove(uploadedPaths);
                } catch (cleanupError) {
                    console.error('Error cleaning up partial upload:', cleanupError.message);
                }
            }
            console.error('Error uploading images:', error.message);
            throw error;
        }
    };

    const deleteListing = async (id) => {
        try {
            const target = listings.find(item => item.id === id);

            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove the listing's images from storage so they don't orphan (best-effort).
            if (target) {
                const urls = (target.images && target.images.length > 0)
                    ? target.images
                    : (target.image ? [target.image] : []);
                await removeImages(urls);
            }

            setListings(prev => prev.filter(item => item.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting listing:', error.message);
            return { success: false, error: error.message };
        }
    };

    return (
        <ListingContext.Provider value={{ listings, addListing, updateListing, deleteListing, uploadImages, removeImages, loading }}>
            {children}
        </ListingContext.Provider>
    );
};
