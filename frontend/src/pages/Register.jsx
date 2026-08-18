import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';

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

      localStorage.setItem('token', response.data.token);

      setSuccess('Compte créé avec succès ! Préparation de votre espace...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-[#030014] text-zinc-100 antialiased py-12 relative flex items-center justify-center px-4 font-sans selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="w-full max-w-md p-8 bg-[#0b081e]/40 backdrop-blur-md border border-indigo-950/60 rounded-2xl shadow-2xl shadow-black/50 relative z-10">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-300 bg-clip-text text-transparent">
            Inscription
          </h2>
          <p className="text-zinc-400 text-sm mt-2">Rejoins la communauté HITAS Connect</p>
        </div>

        {/* Message d'erreur flash */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-xl leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Message de succès flash */}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl leading-relaxed">
            🎉 {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="etudiant@hitas.com"
              className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/80 rounded-xl text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3 bg-[#030014]/60 border border-indigo-950/80 rounded-xl text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-300 text-xs font-semibold px-1 py-0.5 rounded transition-colors"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {/* Confirmation Mot de passe */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3 bg-[#030014]/60 border border-indigo-950/80 rounded-xl text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-300 text-xs font-semibold px-1 py-0.5 rounded transition-colors"
              >
                {showConfirmPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 text-sm"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien vers connexion */}
        <div className="text-center mt-6">
          <p className="text-zinc-500 text-xs font-medium">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;