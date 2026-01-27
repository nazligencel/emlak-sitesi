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

            const { data, error } = await supabase
                .from('listings')
                .update(processedFields)
                .eq('id', id)
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setListings(prev => prev.map(item => item.id === id ? data[0] : item));
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
            // Handle cases where dots are used as thousands separators (e.g., 1.500.000)
            // or where someone used a comma as a decimal point.
            const cleaned = val.toString().replace(/\./g, '').replace(/,/g, '.');
            const num = Number(cleaned);
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

    const uploadImages = async (files) => {
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('listing-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('listing-images')
                    .getPublicUrl(filePath);

                return data.publicUrl;
            });

            const urls = await Promise.all(uploadPromises);
            return urls;
        } catch (error) {
            console.error('Error uploading images:', error.message);
            throw error;
        }
    };

    const deleteListing = async (id) => {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setListings(prev => prev.filter(item => item.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting listing:', error.message);
            return { success: false, error: error.message };
        }
    };

    return (
        <ListingContext.Provider value={{ listings, addListing, updateListing, deleteListing, uploadImages, loading }}>
            {children}
        </ListingContext.Provider>
    );
};
