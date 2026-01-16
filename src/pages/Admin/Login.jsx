import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
                    filter: "blur(8px) brightness(0.6)"
                }}
            />

            <div className="bg-primary/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10 border border-white/10">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Topcu Logo" className="h-20 w-auto object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6 text-white">Yönetici Girişi</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">E-Posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-slate-500"
                            placeholder="admin@topcuinsaat.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder:text-slate-500"
                            placeholder="Şifrenizi giriniz"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-secondary text-black font-bold py-3 rounded-lg hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/20 transform hover:-translate-y-0.5"
                    >
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
