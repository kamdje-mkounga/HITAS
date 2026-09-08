import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import API from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await API.post('/auth/login', formData);

      localStorage.setItem('token', response.data.token);

      const userId = response.data.userId || response.data.user?.id || response.data.user?._id;
      const userRole = response.data.user?.role;

      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn("L'ID utilisateur n'a pas pu être extrait.");
      }

      if (userRole) {
        localStorage.setItem('userRole', userRole);
      }

      navigate('/Home');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-900 dark:text-zinc-100 antialiased relative flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/80 dark:bg-sky-950/85 backdrop-blur-xl border border-gray-200 dark:border-sky-800/40 rounded-[2.5rem] shadow-xl relative z-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Connexion
          </h2>
          <p className="text-gray-600 dark:text-sky-100 text-xs sm:text-sm mt-2 font-medium">Heureux de te revoir sur HITAS Connect</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Adresse Email"
              className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-sky-300/60 focus:outline-none focus:border-sky-500 transition-all text-sm shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-sky-300/70 pointer-events-none">
              <User size={18} />
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-sky-300/60 focus:outline-none focus:border-sky-500 transition-all text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-sky-300/70 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-sky-500/20 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers inscription */}
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-sky-100 text-xs font-medium">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-white font-semibold hover:underline transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;