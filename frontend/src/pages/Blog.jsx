import React, { useState, useEffect, useRef } from 'react';
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

  const fileInputRef = useRef(null);
  const BACKEND_URL = 'http://localhost:5000';
  const loggedInUserId = localStorage.getItem('userId') || ''; 
  const location = useLocation();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'x-auth-token': token } };
  };

  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  const normalizeStr = (str) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    const objectUrl = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 180) { 
          setError('Désolé, les vidéos sont limitées à 3 minutes maximum !');
          clearMedia();
        } else {
          setMediaFile(file);
          setMediaPreview(objectUrl);
        }
      };
      video.src = objectUrl;
    } else {
      setMediaFile(file);
      setMediaPreview(objectUrl);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/posts/like/${postId}`, {}, getAuthHeader());
      setPosts(posts.map(post => post._id === postId ? { ...post, likes: response.data } : post));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/api/posts/comment/${postId}`, { text }, getAuthHeader());
      setPosts(posts.map(post => post._id === postId ? { ...post, comments: response.data } : post));
      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/posts`);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      setError('Impossible de charger les publications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    return () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview); };
  }, []);

  useEffect(() => {
    if (posts.length > 0 && location.state?.scrollToId) {
      setTimeout(() => {
        const element = document.getElementById(`post-${location.state.scrollToId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-950/20');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-950/20');
          }, 3000);
        }
      }, 200);
    }
  }, [posts, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!text.trim() && !mediaFile) return setError('Le corps du message ne peut pas être vide ou doit contenir un média.');
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      if (mediaFile) formData.append('media', mediaFile);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BACKEND_URL}/api/posts`, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      setPosts([res.data, ...posts]);
      setText(''); clearMedia();
      setSuccess('Publication partagée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
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
      alert('Erreur lors de la modification.');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Es-tu sûr de vouloir supprimer cette publication ?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, getAuthHeader());
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const filteredPosts = posts
    .filter(post => selectedFilter === 'Tous' ? true : normalizeStr(post.category) === normalizeStr(selectedFilter))
    .filter(post => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return post.text?.toLowerCase().includes(query) || `${post.firstName} ${post.lastName}`.toLowerCase().includes(query);
    });

  const getBadgeColor = (cat) => {
    switch(normalizeStr(cat)) {
      case 'entraide': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'stageemploi': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'logement': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    /* AJOUT ICI : Un conteneur plein écran avec fond sombre forcé pour bloquer le blanc du navigateur */
    <div className="w-full min-h-screen bg-[#0d0d0e] text-zinc-100 selection:bg-indigo-500 selection:text-white antialiased py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Espace Entraide & Blog
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">Partages d'expériences, guides et aperçus de vos stages au quotidien.</p>
        </div>

        {/* Formulaire de création */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-2xl mb-8 transition-all duration-300 hover:border-zinc-800">
          <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Créer une nouvelle publication</h2>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs font-medium">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-4 text-xs font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows="3"
              className="w-full bg-[#0d0d0e] border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-4 focus:ring-zinc-800/40 transition-all resize-none text-sm leading-relaxed"
              placeholder="Un truc cool à l'école ou en stage ? Raconte ou ajoute un média..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            {mediaPreview && (
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0e] max-h-[380px] w-full flex items-center justify-center p-2 relative group shadow-inner">
                <button 
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-3 right-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 rounded-full w-7 h-7 flex items-center justify-center text-xs transition-all border border-zinc-700/50 z-10 shadow-lg backdrop-blur-sm"
                >
                  ✕
                </button>
                {mediaFile?.type.startsWith('image/') && <img src={mediaPreview} alt="Aperçu" className="w-full h-auto max-h-[360px] object-contain rounded-lg" />}
                {mediaFile?.type.startsWith('video/') && <video src={mediaPreview} controls className="w-full h-auto max-h-[360px] object-contain rounded-lg" />}
                {mediaFile?.type.startsWith('audio/') && <audio src={mediaPreview} controls className="w-full max-w-md my-4 accent-indigo-500" />}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-[#0d0d0e] border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <label htmlFor="category-select" className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Catégorie :</label>
                  <select
                    id="category-select"
                    className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
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
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-medium transition-all duration-200 ${mediaFile ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-zinc-800 bg-[#0d0d0e] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'}`}
                >
                  📎 {mediaFile ? 'Média prêt' : 'Ajouter un média'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*,video/*,audio/*" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </div>

              <button type="submit" className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md hover:shadow-xl active:scale-[0.98]">
                Publier
              </button>
            </div>
          </form>
        </div>

        {/* RECHERCHE */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un mot-clé, un sujet, un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161618] border border-zinc-800/60 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-4 focus:ring-zinc-800/30 transition-all"
            />
          </div>
        </div>

        {/* FILTRES CATÉGORIES */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800/40 pb-5">
          {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${selectedFilter === cat ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-md' : 'bg-[#161618] text-zinc-400 border-zinc-800/60 hover:border-zinc-700 hover:text-zinc-200'}`}
            >
              {cat === 'Tous' ? '📢 Tous' : cat === 'Stage/Emploi' ? '💼 Stage / Emploi' : cat}
            </button>
          ))}
        </div>

        {/* LISTE DES POSTS */}
        {loading ? (
          <div className="text-center text-zinc-500 py-16 text-xs font-bold tracking-widest animate-pulse">CHARGEMENT EN COURS...</div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="text-center text-zinc-500 py-16 bg-[#161618] border border-zinc-800/40 rounded-2xl text-sm">
                Aucune publication ne correspond à ta recherche.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const hasLiked = post.likes?.some(like => getUserId(like.user) === loggedInUserId);
                const avatarPath = post.avatar || (post.user && typeof post.user === 'object' ? post.user.avatar : null);

                return (
                  <div 
                    key={post._id} 
                    id={`post-${post._id}`}
                    className="bg-[#161618] p-5 rounded-2xl border border-zinc-800/50 transition-all duration-300 hover:border-zinc-800 shadow-lg"
                  >
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md">
                          {avatarPath && (
                            <img 
                              src={`${BACKEND_URL}${avatarPath}`} 
                              alt={`${post.firstName}`} 
                              className="absolute inset-0 w-full h-full rounded-full object-cover border border-zinc-800 z-10"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200 rounded-full flex items-center justify-center font-bold text-xs select-none border border-zinc-700">
                            {post.firstName?.[0]}{post.lastName?.[0]}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-zinc-200 tracking-wide">{post.firstName} {post.lastName}</h3>
                          <p className="text-[11px] text-zinc-500 font-medium">{new Date(post.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeColor(post.category)}`}>
                          {post.category}
                        </span>
                        
                        {getUserId(post.user) === loggedInUserId && (
                          <div className="flex gap-0.5 bg-[#0d0d0e] border border-zinc-800 rounded-lg p-0.5 shadow-inner">
                            <button onClick={() => { setEditingId(post._id); setEditText(post.text); }} className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 p-1.5 rounded-md text-xs transition-all">✏️</button>
                            <button onClick={() => handleDelete(post._id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md text-xs transition-all">🗑️</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Corps du Post */}
                    {editingId === post._id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="w-full bg-[#0d0d0e] border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-transparent border border-zinc-800 text-xs font-semibold rounded-lg text-zinc-400 hover:text-zinc-200 transition-all">Annuler</button>
                          <button onClick={() => handleEditSubmit(post._id)} className="px-3 py-1.5 bg-zinc-100 text-zinc-950 text-xs font-bold rounded-lg hover:bg-white transition-all">Sauvegarder</button>
                        </div>
                      </div>
                    ) : (
                      <> 
                        {post.text?.trim() && (
                          <p className="text-zinc-300 text-sm whitespace-pre-wrap pl-0.5 leading-relaxed font-normal mb-3">
                            {post.text}
                          </p>
                        )}
                        
                        {post.mediaUrl && (
                          <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-zinc-800/60 bg-[#0d0d0e] max-h-[440px] w-full flex items-center justify-center p-1 shadow-inner">
                            {post.mediaUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                              <video src={`${BACKEND_URL}${post.mediaUrl}`} controls className="w-full h-auto max-h-[420px] object-contain rounded-lg" />
                            ) : post.mediaUrl.match(/\.(mp3|wav|m4a|ogg)$/i) ? (
                              <audio src={`${BACKEND_URL}${post.mediaUrl}`} controls className="w-full max-w-md my-3 accent-indigo-500" />
                            ) : (
                              <img src={`${BACKEND_URL}${post.mediaUrl}`} alt="Média" className="w-full h-auto max-h-[420px] object-contain rounded-lg shadow-md" />
                            )}
                          </div>
                        )}

                        {/* Actions / Boutons */}
                        <div className="flex gap-3 mt-4 pt-3 border-t border-zinc-800/40 text-xs">
                          <button 
                            onClick={() => handleLike(post._id)} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 transition-all ${hasLiked ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-bold hover:text-indigo-300 hover:border-indigo-500/40' : ''}`}
                          >
                            💙 <span className="text-[11px]">{post.likes?.length || 0}</span>
                          </button>
                          <button 
                            onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 transition-all ${showComments[post._id] ? 'bg-zinc-800/50 text-zinc-200 border-zinc-700' : ''}`}
                          >
                            💬 <span className="text-[11px]">{post.comments?.length || 0}</span>
                          </button>
                        </div>

                        {/* Zone Commentaires */}
                        {showComments[post._id] && (
                          <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3 bg-[#111112]/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Écrire un commentaire..."
                                value={commentTexts[post._id] || ''}
                                onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                className="w-full bg-[#0d0d0e] border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                              />
                              <button 
                                onClick={() => handleAddComment(post._id)}
                                className="bg-zinc-200 text-zinc-950 px-4 rounded-xl text-xs font-bold hover:bg-white active:scale-[0.97] transition-all"
                              >
                                Envoyer
                              </button>
                            </div>

                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                              {post.comments?.map((comment, i) => {
                                const commentAvatarPath = comment.avatar || (comment.user && typeof comment.user === 'object' ? comment.user.avatar : null);
                                return (
                                  <div key={i} className="bg-[#18181b]/40 p-3 rounded-xl border border-zinc-800/30 text-xs flex gap-3 items-start transition-all hover:bg-[#18181b]/60">
                                    <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center shadow">
                                      {commentAvatarPath && (
                                        <img src={`${BACKEND_URL}${commentAvatarPath}`} alt="Author" className="absolute inset-0 w-full h-full rounded-full object-cover border border-zinc-800 z-10" onError={(e) => e.target.style.display = 'none'} />
                                      )}
                                      <div className="w-full h-full bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center font-bold text-[9px] select-none uppercase border border-zinc-700">
                                        {comment.firstName?.[0]}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-zinc-400 mb-0.5">{comment.firstName} {comment.lastName}</p>
                                      <p className="text-zinc-200 leading-relaxed font-light">{comment.text}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
    </div>
  );
};

export default Blog;