import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            setLoading(true);
            const data = await forgotPassword(email);
            setMessage(
                data?.message ||
                "Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Erreur lors de l'envoi de la demande. Veuillez réessayer."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen text-gray-900 dark:text-zinc-100 antialiased relative flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md p-8 sm:p-10 bg-white/80 dark:bg-sky-950/85 backdrop-blur-xl border border-gray-200 dark:border-sky-800/40 rounded-[2.5rem] shadow-xl relative z-10">

                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Mot de passe oublié
                    </h2>
                    <p className="text-gray-600 dark:text-sky-100 text-xs sm:text-sm mt-2 font-medium">
                        Entre ton adresse email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
                        ⚠️ {error}
                    </div>
                )}

                {message && (
                    <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
                        ✅ {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Adresse Email"
                            className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-sky-300/60 focus:outline-none focus:border-sky-500 transition-all text-sm shadow-inner"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-sky-300/70 pointer-events-none">
                            <Mail size={18} />
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-sky-500/20 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-white text-xs font-semibold hover:underline transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Retour à la connexion
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default ForgotPassword;