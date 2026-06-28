import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Blog = () => {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null); 
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const BACKEND_URL = 'http://localhost:5000';
  const loggedInUserId = localStorage.getItem('userId') || ''; 
  const location = useLocation();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'x-auth-token': token } };
  };

  // Sécurisation de l'extraction de l'ID utilisateur (gère le format String et Objet/Populate)
  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  // Normalise les chaînes de caractères (supprime les accents et majuscules pour les filtres)
  const normalizeStr = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 180) { 
          setError('Désolé, les vidéos sont limitées à 3 minutes maximum !');
          setMediaFile(null);
          setMediaPreview(null);
        } else {
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/posts/like/${postId}`, 
        {}, 
        getAuthHeader()
      );
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, likes: response.data } : post
      ));
    } catch (err) {
      console.error("Erreur lors du traitement du like :", err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
  
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/posts/comment/${postId}`, 
        { text }, 
        getAuthHeader()
      );
      setPosts(posts.map(post => 
        post._id === postId ? { ...post, comments: response.data } : post
      ));
      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
    }
  };

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

  // Détection du scroll automatique et surbrillance depuis l'espace Profil
  useEffect(() => {
    if (posts.length > 0 && location.state?.scrollToId) {
      setTimeout(() => {
        const element = document.getElementById(`post-${location.state.scrollToId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('border-indigo-500', 'bg-indigo-950/10');
          setTimeout(() => {
            element.classList.remove('border-indigo-500', 'bg-indigo-950/10');
          }, 3000);
        }
      }, 200);
    }
  }, [posts, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (!text.trim() && !mediaFile) {
      return setError('Le corps du message ne peut pas être vide ou doit contenir un média.');
    }
  
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
  
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BACKEND_URL}/api/posts`, formData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setPosts([res.data, ...posts]);
      setText('');
      setMediaFile(null); 
      setMediaPreview(null); 
      setSuccess('Publication partagée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  const handleEditSubmit = async (postId) => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(`${BACKEND_URL}/api/posts/${postId}`, { text: editText }, getAuthHeader());
      setPosts(posts.map(post => post._id === postId ? res.data : post));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification.');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Es-tu sûr de vouloir supprimer cette publication ?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, getAuthHeader());
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  // Filtrage robuste insensible aux accents et casses
  const filteredPosts = posts
    .filter(post => selectedFilter === 'Tous' ? true : normalizeStr(post.category) === normalizeStr(selectedFilter))
    .filter(post => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const textMatch = post.text?.toLowerCase().includes(query);
      const authorMatch = `${post.firstName} ${post.lastName}`.toLowerCase().includes(query);
      return textMatch || authorMatch;
    });

  const getBadgeColor = (cat) => {
    switch(normalizeStr(cat)) {
      case 'entraide': return 'bg-blue-950/40 text-blue-300 border-blue-900/60';
      case 'stageemploi': return 'bg-green-950/40 text-green-300 border-green-900/60';
      case 'logement': return 'bg-amber-950/40 text-amber-300 border-amber-900/60';
      default: return 'bg-gray-900 text-gray-300 border-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white selection:bg-white selection:text-black">
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Espace Entraide & Blog</h1>
      <p className="text-gray-400 mb-8 text-sm">Partages d'expériences, guides et aperçus de vos stages au quotidien.</p>

      {/* Formulaire de création */}
      <div className="bg-[#141414] p-6 rounded-xl border border-white/5 shadow-xl mb-8">
        <h2 className="text-sm font-semibold mb-4 text-gray-300 uppercase tracking-wider">Créer une nouvelle publication</h2>
        {error && <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-950/30 border border-green-900/50 text-green-400 p-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows="3"
            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors resize-none text-sm"
            placeholder="Un truc cool à l'école ou en stage ? Raconte ou glisse une courte vidéo, photo ou un fichier audio !"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          {mediaPreview && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black max-h-[380px] w-full flex items-center justify-center p-2 relative group">
              <button 
                type="button"
                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors z-10"
              >
                ✕
              </button>
              {mediaFile && mediaFile.type.startsWith('image/') && (
                <img src={mediaPreview} alt="Aperçu" className="w-full h-auto max-h-[360px] object-contain" />
              )}
              {mediaFile && mediaFile.type.startsWith('video/') && (
                <video src={mediaPreview} controls className="w-full h-auto max-h-[360px] object-contain" />
              )}
              {mediaFile && mediaFile.type.startsWith('audio/') && (
                <audio src={mediaPreview} controls className="w-full max-w-md my-4 accent-white" />
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label htmlFor="category-select" className="text-xs text-gray-400">Catégorie :</label>
                <select
                  id="category-select"
                  className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">Général</option>
                  <option value="Entraide">Entraide</option>
                  <option value="Stage/Emploi">Stage / Emploi</option>
                  <option value="Logement">Logement</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <input 
                  type="file" 
                  key={mediaFile ? mediaFile.name : 'empty'} 
                  accept="image/*,video/*,audio/*" 
                  onChange={handleFileChange} 
                  className="text-xs text-gray-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:border-white/10 file:text-xs file:font-medium file:bg-black file:text-white hover:file:bg-white hover:file:text-black cursor-pointer"
                />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-white hover:bg-gray-200 text-black font-semibold px-6 py-2 rounded-lg text-xs transition-colors shadow-md">
              Publier
            </button>
          </div>
        </form>
      </div>

      {/* RECHERCHE */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Rechercher un mot-clé, un sujet, un étudiant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#141414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
        />
      </div>

      {/* FILTRES CATÉGORIES */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
        {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${selectedFilter === cat ? 'bg-white text-black border-white scale-105' : 'bg-black text-gray-400 border-white/10 hover:border-white/30'}`}
          >
            {cat === 'Tous' ? '📢 Tous' : cat}
          </button>
        ))}
      </div>

      {/* LISTE DES POSTS */}
      {loading ? (
        <div className="text-center text-gray-500 py-10 text-sm tracking-widest animate-pulse">CHARGEMENT EN COURS...</div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-[#141414] border border-white/5 rounded-xl text-sm">
              Aucune publication ne correspond à ta recherche.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.likes?.some(like => getUserId(like.user) === loggedInUserId);

              return (
                <div 
                  key={post._id} 
                  id={`post-${post._id}`}
                  className="bg-[#141414] p-5 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs select-none">
                        {post.firstName ? post.firstName[0] : 'U'}{post.lastName ? post.lastName[0] : 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm tracking-wide">{post.firstName} {post.lastName}</h3>
                        <p className="text-[10px] text-gray-500">{new Date(post.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(post.category)}`}>
                        {post.category}
                      </span>
                      
                      {getUserId(post.user) === loggedInUserId && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { setEditingId(post._id); setEditText(post.text); }}
                            className="text-gray-500 hover:text-white p-1 text-xs transition-colors"
                          >
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(post._id)} className="text-gray-500 hover:text-rose-400 p-1 text-xs transition-colors">
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingId === post._id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-white"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-black border border-white/10 text-xs rounded-md text-gray-400 hover:text-white">
                          Annuler
                        </button>
                        <button onClick={() => handleEditSubmit(post._id)} className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-md hover:bg-gray-200">
                          Sauvegarder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <> 
                      {post.text && post.text.trim() && (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap pl-0.5 leading-relaxed">
                          {post.text}
                        </p>
                      )}
                      
                      {post.mediaUrl && (
                        <div className="mt-3.5 rounded-lg overflow-hidden border border-white/5 bg-black/40 max-h-[480px] w-full flex items-center justify-center p-1">
                          {post.mediaUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                            <video src={`${BACKEND_URL}${post.mediaUrl}`} controls className="w-full h-auto max-h-[460px] object-contain" />
                          ) : post.mediaUrl.match(/\.(mp3|wav|m4a|ogg)$/i) ? (
                            <audio src={`${BACKEND_URL}${post.mediaUrl}`} controls className="w-full max-w-md my-2 accent-white" />
                          ) : (
                            <img src={`${BACKEND_URL}${post.mediaUrl}`} alt="Média partagé" className="w-full h-auto max-h-[460px] object-contain" />
                          )}
                        </div>
                      )}

                      <div className="flex gap-4 mt-4 pt-2 border-t border-white/[0.02] text-xs text-gray-500">
                        <button 
                          onClick={() => handleLike(post._id)} 
                          className={`hover:text-white transition-colors ${hasLiked ? 'text-indigo-400 font-semibold' : ''}`}
                        >
                          💙 {post.likes?.length || 0} Like{post.likes?.length > 1 ? 's' : ''}
                        </button>
                        <button 
                          onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })} 
                          className="hover:text-white transition-colors"
                        >
                          💬 Commentaires ({post.comments?.length || 0})
                        </button>
                      </div>

                      {showComments[post._id] && (
                        <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Écrire un commentaire..."
                              value={commentTexts[post._id] || ''}
                              onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-white"
                            />
                            <button 
                              onClick={() => handleAddComment(post._id)}
                              className="bg-white text-black px-3 rounded-lg text-xs font-semibold hover:bg-gray-200"
                            >
                              Envoyer
                            </button>
                          </div>
                          {post.comments && post.comments.map((comment, i) => (
                            <div key={i} className="bg-black/30 p-2.5 rounded-lg border border-white/[0.02] text-xs">
                              <p className="font-semibold text-gray-400 mb-0.5">{comment.firstName} {comment.lastName}</p>
                              <p className="text-gray-200">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Blog;