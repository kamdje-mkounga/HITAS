import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
// 🛠️ Importation des icônes modernes
import { Trash2, Send, Layers } from 'lucide-react';
import Navbar from '../components/Navbar'; // 👈 Importation cruciale de la Navbar

const BlogEntraide = ({ hasNewNotification, clearNotifications }) => {
  // États pour les posts et le formulaire
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Référence pour stocker le socket et l'utiliser lors du clic sur "Publier"
  const socketRef = useRef(null);

  const BACKEND_URL = 'https://hitas.onrender.com';

  // Fonction pour formater correctement l'URL des médias distants
  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Configuration du header avec le token d'authentification
  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); 
    return { headers: { 'x-auth-token': token } }; 
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
    // 🧹 Dès que l'utilisateur arrive sur la page Blog, on efface l'indicateur de notification
    if (clearNotifications) {
      clearNotifications();
    }
  }, [clearNotifications]);

  // 🌐 INTERCEPTION TEMPS RÉEL (Socket.io)
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });
    
    const socket = socketRef.current;

    socket.on('posts_created', (newPost) => {
      setPosts((prevPosts) => {
        if (prevPosts.some(post => post._id === newPost._id)) return prevPosts;
        return [newPost, ...prevPosts];
      });
    });

    socket.on('posts_deleted', (deletedPostId) => {
      setPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPostId));
    });

    socket.on('posts_updated', (updatedPost) => {
      setPosts((prevPosts) => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    });

    socket.on('posts_updated_interactions', (updatedPost) => {
      setPosts((prevPosts) => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    });

    return () => {
      socket.disconnect();
    };
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
      await axios.post(
        `${BACKEND_URL}/api/posts`,
        { 
          text, 
          category,
          socketId: socketRef.current?.id 
        },
        getAuthHeader()
      );

      setText(''); 
      setSuccess('Publication partagée avec succès !');
      
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
      case 'Entraide': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Stage/Emploi': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Logement': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* 🧭 Intégration de la Navbar avec synchronisation des notifications */}
      <Navbar hasNewNotification={hasNewNotification} clearNotifications={clearNotifications} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Blog & Entraide
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">Pose tes questions, partage des opportunités ou échange avec la communauté.</p>
        </div>

        {/* Formulaire de création de Post */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-2xl mb-8 transition-all duration-300 hover:border-zinc-800">
          <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Créer une nouvelle publication</h2>
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs font-medium">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-4 text-xs font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows="3"
              className="w-full bg-[#0d0d0e] border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-4 focus:ring-zinc-800/40 transition-all resize-none text-sm leading-relaxed"
              placeholder="Que veux-tu partager aujourd'hui ?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-[#0d0d0e] border border-zinc-800 px-3 py-1.5 rounded-xl">
                <Layers className="h-3.5 w-3.5 text-zinc-500" />
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Catégorie :</label>
                <select
                  className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer pr-1"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General" className="bg-[#0d0d0e]">Général</option>
                  <option value="Entraide" className="bg-[#0d0d0e]">Entraide</option>
                  <option value="Stage/Emploi" className="bg-[#0d0d0e]">Stage / Emploi</option>
                  <option value="Logement" className="bg-[#0d0d0e]">Logement</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Publier</span>
                <Send className="h-3 w-3" />
              </button>
            </div>
          </form>
        </div>

        {/* Barre de Filtres */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800/40 pb-5">
          {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                selectedFilter === cat
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-md'
                  : 'bg-[#161618] text-zinc-400 border-zinc-800/60 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {cat === 'General' ? 'Général' : cat === 'Tous' ? '📢 Tous' : cat === 'Stage/Emploi' ? '💼 Stage / Emploi' : cat}
            </button>
          ))}
        </div>

        {/* Liste des Posts */}
        {loading ? (
          <div className="text-center text-zinc-500 py-16 text-xs font-bold tracking-widest animate-pulse">CHARGEMENT DU FIL D'ACTUALITÉ...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-zinc-500 py-16 bg-[#161618] border border-zinc-800/40 rounded-2xl text-sm">
            Aucune publication trouvée dans cette catégorie.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.map((post) => (
              <div key={post._id} className="bg-[#161618] p-5 rounded-2xl border border-zinc-800/50 transition-all duration-300 hover:border-zinc-700/60 shadow-lg">
                
                {/* En-tête du post : Auteur + Date + Catégorie */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {post.avatar ? (
                      <img 
                        src={formatMediaUrl(post.avatar)} 
                        alt={`${post.firstName} ${post.lastName}`}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700 shadow-md"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200 rounded-full flex items-center justify-center font-bold text-xs select-none border border-zinc-700 shadow-md uppercase">
                        {post.firstName?.[0]}{post.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-zinc-200 tracking-wide">{post.firstName} {post.lastName}</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {new Date(post.date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeColor(post.category)}`}>
                      {post.category === 'General' ? 'Général' : post.category}
                    </span>
                    
                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl text-xs transition-all flex items-center justify-center border border-transparent hover:border-red-500/10"
                      title="Supprimer la publication"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Corps du texte */}
                <p className="text-zinc-300 text-sm whitespace-pre-wrap pl-0.5 leading-relaxed font-normal">
                  {post.text}
                </p>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogEntraide;