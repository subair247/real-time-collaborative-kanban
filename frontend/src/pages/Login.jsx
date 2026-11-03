import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate('/board');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoAccount = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('password123');
        setError(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full p-8 relative overflow-hidden">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md shadow-indigo-200">
                    <Shield className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {isRegister ? 'Create an Account' : 'Welcome Back!'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                    {isRegister
                        ? 'Register to access your organization and branch boards'
                        : 'Enter your credentials to continue to your collaborative Kanban board'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Work Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. rahul@abc.com"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 transition-colors mt-2"
                    >
                        {loading ? 'Authenticating...' : isRegister ? 'Register & Continue' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>One-Click Test Accounts</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('rahul@abc.com')}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-left text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                            👑 Rahul (Org Admin)
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('priya@abc.com')}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-left text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                            🛡️ Priya (Tenant Admin)
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('arjun@abc.com')}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-left text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                            👤 Arjun (Member - Hyd)
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('sneha@abc.com')}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-left text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                            📍 Sneha (Bangalore)
                        </button>
                    </div>
                </div>

                <div className="mt-5 text-center">
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError(null);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;