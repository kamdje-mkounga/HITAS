import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';

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
    <div
      className="w-full min-h-screen text-zinc-100 antialiased relative flex items-center justify-center px-4 font-sans selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundColor: '#030014',
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/10 dark:bg-[#0b081e]/30 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative z-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
            Connexion
          </h2>
          <p className="text-zinc-300 text-xs sm:text-sm mt-2 font-medium">Heureux de te revoir sur HITAS Connect</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
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
              className="w-full px-6 py-3.5 pr-12 bg-black/30 border border-white/15 rounded-full text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
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
              className="w-full px-6 py-3.5 pr-12 bg-black/30 border border-white/15 rounded-full text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-zinc-100 text-slate-900 font-bold rounded-full transition-all shadow-xl hover:shadow-white/10 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers inscription */}
        <div className="text-center mt-6">
          <p className="text-zinc-400 text-xs font-medium">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-300 hover:text-white font-semibold hover:underline transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;