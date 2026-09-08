import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import API from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation de correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // Exclure confirmPassword lors de l'envoi au backend
      const { email, password } = formData;
      const response = await API.post('/auth/register', { email, password });

      // Enregistrement du token
      localStorage.setItem('token', response.data.token);

      // Récupération et stockage optionnel du userId s'il est renvoyé par l'API
      const userId = response.data.userId || response.data.user?.id || response.data.user?._id;
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      setSuccess('Compte créé avec succès ! Préparation de votre espace...');
      setTimeout(() => {
        // Redirige directement vers l'intérieur de l'application (/home)
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-900 dark:text-zinc-100 antialiased relative flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white/80 dark:bg-[#0b081e]/85 backdrop-blur-xl border border-gray-200 dark:border-indigo-500/30 rounded-[2.5rem] shadow-xl relative z-10">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Inscription
          </h2>
          <p className="text-gray-600 dark:text-zinc-300 text-xs sm:text-sm mt-2 font-medium">Rejoins la communauté HITAS Connect</p>
        </div>

        {/* Message d'erreur flash */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-300 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
            ⚠️ {error}
          </div>
        )}

        {/* Message de succès flash */}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium rounded-xl leading-relaxed backdrop-blur-md">
            🎉 {success}
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
              className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-[#030014]/80 border border-gray-300 dark:border-indigo-500/30 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all text-sm shadow-inner"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 pointer-events-none">
              <User size={18} />
            </span>
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-[#030014]/80 border border-gray-300 dark:border-indigo-500/30 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirmation Mot de passe */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmer le mot de passe"
              className="w-full px-6 py-3.5 pr-12 bg-gray-50 dark:bg-[#030014]/80 border border-gray-300 dark:border-indigo-500/30 rounded-full text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-full transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien vers connexion */}
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-zinc-400 text-xs font-medium">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-white font-semibold hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;