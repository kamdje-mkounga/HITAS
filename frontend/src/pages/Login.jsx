import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // Appel à notre route de Login du backend
      const response = await API.post('/auth/login', formData);
      
      // 1. Stockage du token JWT
      localStorage.setItem('token', response.data.token);
      
      // 2. Extraction et stockage sécurisé de l'ID utilisateur et de son rôle
      const userId = response.data.userId || response.data.user?.id || response.data.user?._id;
      const userRole = response.data.user?.role;

      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn("L'ID utilisateur n'a pas pu être extrait.");
      }

      if (userRole) {
        localStorage.setItem('userRole', userRole); // Permettra d'afficher le bouton Admin plus tard !
      }
      
      // Redirection vers l'accueil / tableau de bord
      navigate('/');
    } catch (err) {
      // Récupère précisément le message du backend (ex: "Compte en attente de validation")
      setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#030014] text-zinc-50 flex items-center justify-center px-4 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md p-8 bg-[#0b081e]/40 backdrop-blur-md border border-indigo-950/60 rounded-2xl shadow-2xl shadow-black/50">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-300 bg-clip-text text-transparent">
            Connexion
          </h2>
          <p className="text-zinc-400 text-sm mt-2">Heureux de te revoir sur HITAS Connect</p>
        </div>

        {/* Message d'erreur flash (Gère le cas de compte bloqué ou non validé) */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-xl leading-relaxed">
            ⚠️ {error}
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

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/80 rounded-xl text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] disabled:opacity-50 text-sm"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers inscription */}
        <div className="text-center mt-6">
          <p className="text-zinc-500 text-xs font-medium">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;