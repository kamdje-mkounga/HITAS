import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    setLoading(true);

    try {
      // Appel à notre route d'inscription backend
      const response = await API.post('/auth/register', formData);
      
      // Stockage du token automatique après inscription
      localStorage.setItem('token', response.data.token);
      
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 font-sans antialiased">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Créer un compte</h2>
          <p className="text-zinc-400 text-sm mt-2">Rejoins la communauté ITAS Connect</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-sm rounded-lg">
            🎉 {success}
          </div>
        )}

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
              placeholder="ton.nom@gmail.com"
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
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-zinc-500 text-sm">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-zinc-300 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;