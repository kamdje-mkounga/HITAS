import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogEntraide = () => {
  // États pour les posts et le formulaire
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  // Configuration du header avec le token d'authentification
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // Ajuste si tu stockes le token ailleurs
    return { headers: { 'x-auth-token': token } }; // Ajuste 'x-auth-token' selon ton middleware backend
  };

  // 1. Charger tous les posts au démarrage
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/posts`);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les publications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Soumission d'un nouveau post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!text.trim()) {
      return setError('Le corps du message ne peut pas être vide.');
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/posts`,
        { text, category },
        getAuthHeader()
      );

      // Ajouter le nouveau post en haut de la liste sans recharger la page
      setPosts([res.data, ...posts]);
      setText(''); // Réinitialiser le champ texte
      setSuccess('Publication partagée avec succès !');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la publication. As-tu bien créé ton profil ?');
    }
  };

  // 3. Suppression d'un post
  const handleDelete = async (postId) => {
    if (window.confirm('Es-tu sûr de vouloir supprimer cette publication ?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, getAuthHeader());
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression ou non autorisé.');
      }
    }
  };

  // Filtrer les posts localement selon la catégorie sélectionnée
  const filteredPosts = selectedFilter === 'Tous' 
    ? posts 
    : posts.filter(post => post.category === selectedFilter);

  // Fonction utilitaire pour la couleur des badges de catégorie
  const getBadgeColor = (cat) => {
    switch(cat) {
      case 'Entraide': return 'bg-blue-900/50 text-blue-300 border-blue-800';
      case 'Stage/Emploi': return 'bg-green-900/50 text-green-300 border-green-800';
      case 'Logement': return 'bg-amber-900/50 text-amber-300 border-amber-800';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Blog & Entraide</h1>
      <p className="text-gray-400 mb-8">Pose tes questions, partage des opportunités ou échange avec la communauté.</p>

      {/* Formulaire de création de Post */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-indigo-400">Créer une nouvelle publication</h2>
        
        {error && <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows="3"
            className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Que veux-tu partager aujourd'hui ?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Catégorie :</label>
              <select
                className="bg-[#111] border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">Général</option>
                <option value="Entraide">Entraide</option>
                <option value="Stage/Emploi">Stage / Emploi</option>
                <option value="Logement">Logement</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Publier
            </button>
          </div>
        </form>
      </div>

      {/* Barre de Filtres */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
        {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedFilter === cat
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                : 'bg-[#111] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            {cat === 'General' ? 'Général' : cat === 'Tous' ? '📢 Tous' : cat}
          </button>
        ))}
      </div>

      {/* Liste des Posts */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Chargement du fil d'actualité...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-[#141414] rounded-xl border border-gray-900">
          Aucune publication trouvée dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post._id} className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
              
              {/* En-tête du post : Auteur + Date + Catégorie */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar temporaire ou dynamique */}
                  <div className="w-10 h-10 bg-indigo-900/40 border border-indigo-700 rounded-full flex items-center justify-center text-indigo-300 font-bold uppercase text-sm">
                    {post.firstName[0]}{post.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm tracking-wide">{post.firstName} {post.lastName}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeColor(post.category)}`}>
                    {post.category === 'General' ? 'Général' : post.category}
                  </span>
                  
                  {/* Bouton supprimer (Backend gère la sécurité, mais on peut cliquer) */}
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="text-gray-600 hover:text-red-400 p-1 rounded transition-colors"
                    title="Supprimer la publication"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Corps du texte */}
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pl-1">
                {post.text}
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogEntraide;