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
            // Helper for safe number conversion
            const safeNumber = (val) => (val === '' || val === null || val === undefined) ? null : Number(val);

            const processedListing = {
                ...newListing,
                price: safeNumber(newListing.price),
                beds: newListing.beds,
                baths: safeNumber(newListing.baths),
                sqm: safeNumber(newListing.sqm),
                building_age: safeNumber(newListing.building_age),
                total_floors: safeNumber(newListing.total_floors),
                dues: safeNumber(newListing.dues),
                balcony: Boolean(newListing.balcony),
                elevator: Boolean(newListing.elevator),
                parking: Boolean(newListing.parking),
                furnished: Boolean(newListing.furnished),
                in_complex: Boolean(newListing.in_complex),
                loan_eligible: Boolean(newListing.loan_eligible),

                swap: Boolean(newListing.swap),
                is_opportunity: Boolean(newListing.is_opportunity),
                consultant_id: safeNumber(newListing.consultant_id),
            };

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
            // Fix: Exclude 'id' and 'created_at' from parsing to avoid "id can only be updated to DEFAULT" error
            const { id: _, created_at: __, ...fieldsToUpdate } = updatedFields;

            const { data, error } = await supabase
                .from('listings')
                .update(fieldsToUpdate)
                .eq('id', id)
                .select();

            if (error) throw error;

            setListings(prev => prev.map(item => item.id === id ? data[0] : item));
            return { success: true };
        } catch (error) {
            console.error('Error updating listing:', error.message);
            return { success: false, error: error.message };
        }
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
