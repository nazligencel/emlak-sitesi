import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        let timeout;

        const resetTimer = () => {
            if (user) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    logout();
                    alert('Oturumunuz uzun süre işlem yapmadığınız için kapatıldı.');
                }, 2 * 60 * 60 * 1000); // 2 hours
            }
        };

        // Events to listen for activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        if (user) {
            events.forEach(event => document.addEventListener(event, resetTimer));
            resetTimer(); // Start timer immediately
        }

        return () => {
            clearTimeout(timeout);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [user]);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error.message);
            return { success: false, error: 'Hatalı e-posta veya şifre.' };
        }
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
