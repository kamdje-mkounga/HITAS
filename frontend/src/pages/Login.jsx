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
    setLoading(false);

    try {
      setLoading(true);
      // Appel à notre route de Login du backend
      const response = await API.post('/auth/login', formData);
      
      // 1. Stockage du token JWT
      localStorage.setItem('token', response.data.token);
      
      // 2. Extraction et stockage sécurisé de l'ID utilisateur
      const userId = response.data.userId || response.data.user?.id || response.data.user?._id;
      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn("L'ID utilisateur n'a pas pu être extrait de la réponse du serveur. Vérifie la structure de res.json() dans auth.js");
      }
      
      // Redirection vers l'accueil / tableau de bord
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Connexion</h2>
          <p className="text-zinc-400 text-sm mt-2">Heureux de te revoir sur HITAS Connect</p>
        </div>

        {/* Message d'erreur flash */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="etudiant@itas.edu"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien de bascule */}
        <div className="text-center mt-6">
          <p className="text-zinc-500 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-zinc-300 hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;