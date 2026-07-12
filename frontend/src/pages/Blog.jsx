import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client'; // 🌐 Importation du client socket
import tradPattern from '../assets/traditional.jpg';
import {
  Paperclip,
  Search,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Plus,
  FileText,
  X,
  Send,
  Megaphone,
  Briefcase
} from "lucide-react";

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

  // ÉTATS POUR LA MODIFICATION
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [editMediaPreview, setEditMediaPreview] = useState(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState('');

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  // 🟢 NOUVEAU : On stocke le socket dans une référence pour y accéder partout
  const socketRef = useRef(null); 

  const BACKEND_URL = 'https://hitas.onrender.com';
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

  const clearEditMedia = () => {
    if (editMediaPreview) URL.revokeObjectURL(editMediaPreview);
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setExistingMediaUrl('');
    if (editFileInputRef.current) editFileInputRef.current.value = '';
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

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (editMediaPreview) URL.revokeObjectURL(editMediaPreview);
    const objectUrl = URL.createObjectURL(file);

    setExistingMediaUrl('');
    setEditMediaFile(file);
    setEditMediaPreview(objectUrl);
  };

  const startEditing = (post) => {
    setEditingId(post._id);
    setEditText(post.text || '');
    setExistingMediaUrl(post.mediaUrl || '');
    setEditMediaFile(null);
    if (editMediaPreview) URL.revokeObjectURL(editMediaPreview);
    setEditMediaPreview(null);
  };

  // 1. Charger tous les posts au démarrage
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/posts`);
      setPosts(res.data);
      loading && setLoading(false);
    } catch (err) {
      setError('Impossible de charger les publications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    return () => { 
      if (mediaPreview) URL.revokeObjectURL(mediaPreview); 
      if (editMediaPreview) URL.revokeObjectURL(editMediaPreview); 
    };
  }, []);

  // 🌐 INTERCEPTION TEMPS RÉEL STABILISÉE (PC & MOBILE)
  useEffect(() => {
    // 🟢 ASSIGNATION DU SOCKET À LA RÉFÉRENCE
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'], // Assure une meilleure compatibilité mobile
      closeOnBeforeunload: true
    });

    const socket = socketRef.current;

    const handleCreated = (newPost) => {
      setPosts((prevPosts) => {
        if (prevPosts.some(post => post._id === newPost._id)) return prevPosts;
        return [newPost, ...prevPosts];
      });
    };

    const handleDeleted = (deletedPostId) => {
      setPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPostId));
    };

    const handleUpdated = (updatedPost) => {
      setPosts((prevPosts) => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    const handleInteractions = (updatedPost) => {
      setPosts((prevPosts) => prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    // 1. On attache les écouteurs
    socket.on('posts_created', handleCreated);
    socket.on('posts_deleted', handleDeleted);
    socket.on('posts_updated', handleUpdated);
    socket.on('posts_updated_interactions', handleInteractions);

    // 2. Nettoyage STRICT quand on quitte la page / le composant démonte
    return () => {
      socket.off('posts_created', handleCreated);
      socket.off('posts_deleted', handleDeleted);
      socket.off('posts_updated', handleUpdated);
      socket.off('posts_updated_interactions', handleInteractions);
      socket.disconnect();
    };
  }, [BACKEND_URL]);

  // 2. Aimer / Liker une publication
  const handleLike = async (postId) => {
    try {
      // 🟢 AJOUT DU SOCKET ID
      const response = await axios.put(`${BACKEND_URL}/api/posts/like/${postId}`, {
        socketId: socketRef.current?.id
      }, getAuthHeader());
      setPosts(posts.map(post => post._id === postId ? { ...post, likes: response.data?.likes || response.data } : post));
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Ajouter un commentaire
  const handleAddComment = async (postId) => {
    const textComment = commentTexts[postId];
    if (!textComment || !textComment.trim()) return;
    try {
      // 🟢 AJOUT DU SOCKET ID
      const response = await axios.post(`${BACKEND_URL}/api/posts/comment/${postId}`, { 
        text: textComment,
        socketId: socketRef.current?.id
      }, getAuthHeader());
      
      setPosts(posts.map(post => post._id === postId ? { ...post, comments: response.data?.comments || response.data } : post));
      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Soumission d'une nouvelle publication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!text.trim() && !mediaFile) return setError('Le corps du message ne peut pas être vide ou doit contenir un média.');
    try {
      const formData = new FormData();
      
      // 🟢 AJOUT DU SOCKET ID EN PREMIER DANS LE FORMDATA (Très important pour Multer)
      if (socketRef.current?.id) {
        formData.append('socketId', socketRef.current.id);
      }
      
      formData.append('text', text);
      formData.append('category', category);
      if (mediaFile) formData.append('media', mediaFile);
      const token = localStorage.getItem('token');
      
      await axios.post(`${BACKEND_URL}/api/posts`, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      
      setText(''); clearMedia();
      setSuccess('Publication partagée avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  // 5. Enregistrer les modifications d'un post
  const handleEditSubmit = async (postId) => {
    if (!editText.trim() && !editMediaFile && !existingMediaUrl) {
      return alert('La publication ne peut pas être complètement vide.');
    }

    try {
      const formData = new FormData();
      
      // 🟢 AJOUT DU SOCKET ID EN PREMIER DANS LE FORMDATA
      if (socketRef.current?.id) {
        formData.append('socketId', socketRef.current.id);
      }

      formData.append('text', editText);
      formData.append('existingMediaUrl', existingMediaUrl);
      if (editMediaFile) formData.append('media', editMediaFile);

      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/posts/${postId}`, formData, {
        headers: { 
          'x-auth-token': token, 
          'Content-Type': 'multipart/form-data' 
        }
      });

      setEditingId(null);
      clearEditMedia();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification de la publication.');
    }
  };

  // 6. Supprimer un post
  const handleDelete = async (postId) => {
    if (window.confirm('Es-tu sûr de vouloir supprimer cette publication ?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, getAuthHeader());
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

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-zinc-800 selection:bg-indigo-500 selection:text-white antialiased py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
            Espace Entraide & Blog
          </h1>
          <p className="text-zinc-600 text-sm max-w-xl">Partages d'expériences, guides et aperçus de vos stages au quotidien.</p>
        </div>

        {/* Formulaire de création */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 transition-all duration-300 hover:border-slate-300">
          <h2 className="text-xs font-bold mb-4 text-indigo-600 uppercase tracking-widest">Créer une nouvelle publication</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-xs font-medium">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-xl mb-4 text-xs font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows="3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-sm leading-relaxed"
              placeholder="Un truc cool à l'école ou en stage ? Raconte ou ajoute un média..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>

            {mediaPreview && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[380px] w-full flex items-center justify-center p-2 relative group shadow-inner">
                <button 
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-3 right-3 bg-white hover:bg-slate-100 text-zinc-700 rounded-full w-7 h-7 flex items-center justify-center text-xs transition-all border border-slate-200 z-10 shadow-md backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
                {mediaFile?.type.startsWith('image/') && <img src={mediaPreview} alt="Aperçu" className="w-full h-auto max-h-[360px] object-contain rounded-lg" />}
                {mediaFile?.type.startsWith('video/') && <video src={mediaPreview} controls className="w-full h-auto max-h-[360px] object-contain rounded-lg" />}
                {mediaFile?.type.startsWith('audio/') && <audio src={mediaPreview} controls className="w-full max-w-md my-4 accent-indigo-500" />}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <label htmlFor="category-select" className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Catégorie :</label>
                  <select
                    id="category-select"
                    className="bg-transparent text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="General" className="bg-white text-zinc-800">Général</option>
                    <option value="Entraide" className="bg-white text-zinc-800">Entraide</option>
                    <option value="Stage/Emploi" className="bg-white text-zinc-800">Stage / Emploi</option>
                    <option value="Logement" className="bg-white text-zinc-800">Logement</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-medium transition-all duration-200 ${mediaFile ? 'border-indigo-500/30 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50 text-zinc-600 hover:text-zinc-800 hover:border-slate-300'}`}
                >
                  <Paperclip size={16} className="text-indigo-600" />
                  {mediaFile ? 'Média prêt' : 'Ajouter un média'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*,video/*,audio/*,application/pdf,.doc,.docx" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </div>

              <button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm hover:shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Publier</span>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </form>
        </div>

        {/* RECHERCHE */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center justify-center">
              <Search size={16} className="text-indigo-500" />
            </span>
            <input
              type="text"
              placeholder="Rechercher un mot-clé, un sujet, un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* FILTRES CATÉGORIES */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-5">
          {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${selectedFilter === cat ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-sm' : 'bg-white text-zinc-600 border-slate-200 hover:border-slate-300 hover:text-zinc-800'}`}
            >
              {cat === 'Tous' && <Megaphone size={14} />}
              {cat === 'Stage/Emploi' && <Briefcase size={14} />}
              <span>{cat === 'General' ? 'Général' : cat === 'Stage/Emploi' ? 'Stage / Emploi' : cat}</span>
            </button>
          ))}
        </div>

        {/* LISTE DES POSTS */}
        {loading ? (
          <div className="text-center text-zinc-400 py-16 text-xs font-bold tracking-widest animate-pulse">CHARGEMENT EN COURS...</div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="text-center text-zinc-500 py-16 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm">
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
                    className="bg-white p-5 rounded-2xl border border-slate-200 transition-all duration-300 hover:border-slate-300 shadow-sm"
                  >
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-4">
                      <Link 
                        to={`/profile/${getUserId(post.user)}`} 
                        className="flex items-center gap-3 group/author cursor-pointer"
                      >
                        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-sm">
                          {avatarPath ? (
                            <img 
                              src={formatMediaUrl(avatarPath)} 
                              alt={`${post.firstName}`} 
                              className="absolute inset-0 w-full h-full rounded-full object-cover border border-slate-200 z-10 group-hover/author:border-slate-400 transition-all" 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 text-zinc-700 rounded-full flex items-center justify-center font-bold text-xs select-none border border-slate-300 group-hover/author:border-slate-400 transition-all">
                            {post.firstName?.[0] || 'U'}{post.lastName?.[0] || ''}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-zinc-800 tracking-wide group-hover/author:text-zinc-950 group-hover/author:underline transition-all">
                            {post.firstName} {post.lastName}
                          </h3>
                          <p className="text-[11px] text-zinc-400 font-medium">{new Date(post.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeColor(post.category)}`}>
                          {post.category}
                        </span>
                        
                        {getUserId(post.user) === loggedInUserId && (
                          <div className="flex gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-inner items-center">
                            <button onClick={() => startEditing(post)} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md text-xs transition-all">
                              <Pencil size={15} className="text-amber-500" />
                            </button>
                            <button onClick={() => handleDelete(post._id)} className="text-zinc-400 hover:text-red-500 p-1 rounded-md text-xs transition-all">
                              <Trash2 size={15} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CORPS DU POST EN MODE ÉDITION */}
                    {editingId === post._id ? (
                      <div className="mt-2 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Modifier la publication</h4>
                        
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-zinc-800 focus:outline-none focus:border-slate-300 resize-none leading-relaxed"
                          rows="3"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        
                        <div className="space-y-2">
                          <label className="text-[11px] font-medium text-zinc-600 block">Gestion du média :</label>
                          
                          {existingMediaUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-2 max-h-[180px] flex items-center justify-between">
                              <span className="text-xs text-zinc-500 truncate max-w-[80%]">📁 Média actuellement sauvegardé</span>
                              <button 
                                type="button" 
                                onClick={() => setExistingMediaUrl('')} 
                                className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md text-[11px] font-medium hover:bg-red-100 transition-all"
                              >
                                Retirer
                              </button>
                            </div>
                          )}

                          {editMediaPreview && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white p-2 max-h-[180px] flex items-center justify-between">
                              <span className="text-xs text-indigo-600 truncate max-w-[80%]">📎 Nouveau média prêt à être injecté</span>
                              <button 
                                type="button" 
                                onClick={clearEditMedia} 
                                className="bg-slate-200 text-zinc-700 px-2 py-1 rounded-md text-[11px] font-medium hover:bg-slate-300 transition-all"
                              >
                                Annuler
                              </button>
                            </div>
                          )}

                          {!existingMediaUrl && !editMediaPreview && (
                            <div>
                              <button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                className="text-xs border border-slate-200 bg-white text-zinc-600 px-3 py-1.5 rounded-lg hover:text-zinc-800 hover:border-slate-300 transition-all flex items-center gap-1.5"
                              >
                                <Plus size={16} /> Insérer un fichier ou une vidéo
                              </button>
                              <input 
                                type="file" 
                                ref={editFileInputRef}
                                accept="image/*,video/*,audio/*" 
                                onChange={handleEditFileChange} 
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                          <button onClick={() => { setEditingId(null); clearEditMedia(); }} className="px-3 py-1.5 bg-transparent border border-slate-200 text-xs font-semibold rounded-lg text-zinc-500 hover:text-zinc-700 transition-all">Annuler</button>
                          <button onClick={() => handleEditSubmit(post._id)} className="px-3 py-1.5 bg-zinc-800 text-white text-xs font-bold rounded-lg hover:bg-zinc-900 transition-all">Sauvegarder</button>
                        </div>
                      </div>
                    ) : (
                      <> 
                        {post.text?.trim() && (
                          <p className="text-zinc-700 text-sm whitespace-pre-wrap pl-0.5 leading-relaxed font-normal mb-3">
                            {post.text}
                          </p>
                        )}
                        
                        {post.mediaUrl && (
                          <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[440px] w-full flex items-center justify-center p-1 shadow-inner">
                            {post.mediaUrl.match(/\.(mp4|webm|mov|m4v)$/i) ? (
                              <video src={formatMediaUrl(post.mediaUrl)} controls className="w-full h-auto max-h-[420px] object-contain rounded-lg" />
                            ) : post.mediaUrl.match(/\.(mp3|wav|m4a|ogg)$/i) ? (
                              <audio src={formatMediaUrl(post.mediaUrl)} controls className="w-full max-w-md my-3 accent-indigo-500" />
                            ) : post.mediaUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                              <div className="flex items-center gap-3 p-4 w-full bg-indigo-555/5 rounded-lg border border-slate-200 m-2">
                                <span className="text-2xl text-indigo-600"><FileText size={28} className="text-indigo-600" /></span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-zinc-800 truncate">
                                    {post.mediaUrl.split('/').pop()}
                                  </p>
                                  <a 
                                    href={formatMediaUrl(post.mediaUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline inline-flex items-center gap-1 mt-0.5"
                                  >
                                    Ouvrir le document dans un nouvel onglet ↗
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <img 
                                src={formatMediaUrl(post.mediaUrl)} 
                                alt="Média" 
                                className="w-full h-auto max-h-[420px] object-contain rounded-lg shadow-sm"
                                onError={(e) => { e.target.parentNode.style.display = 'none'; }}
                              />
                            )}
                          </div>
                        )}

                        {/* Actions / Boutons */}
                        <div className="flex gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
                          <button 
                            onClick={() => handleLike(post._id)} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-zinc-500 hover:text-zinc-800 transition-all ${hasLiked ? 'border-indigo-200 bg-indigo-50 text-indigo-600 font-bold hover:text-indigo-700 hover:border-indigo-300' : ''}`}
                          >
                            <Heart
                              size={15}
                              className={`${hasLiked ? "fill-current" : ""} text-pink-500`}
                            />
                            <span className="text-[11px]">{post.likes?.length || 0}</span>
                          </button>
                          <button 
                            onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })} 
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-zinc-500 hover:text-zinc-800 transition-all ${showComments[post._id] ? 'bg-slate-50 text-zinc-800 border-slate-300' : ''}`}
                          >
                            <MessageCircle size={15} className="text-purple-500" />
                            <span className="text-[11px]">{post.comments?.length || 0}</span>
                          </button>
                        </div>

                        {/* Zone Commentaires */}
                        {showComments[post._id] && (
                          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Écrire un commentaire..."
                                value={commentTexts[post._id] || ''}
                                onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500/50"
                              />
                              <button 
                                onClick={() => handleAddComment(post._id)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 rounded-xl text-xs font-bold hover:from-indigo-500 hover:to-purple-500 active:scale-[0.97] transition-all"
                              >
                                Envoyer
                              </button>
                            </div>

                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                              {post.comments?.map((comment, i) => {
                                const commentAvatarPath = comment.avatar || (comment.user && typeof comment.user === 'object' ? comment.user.avatar : null);
                                return (
                                  <Link 
                                    key={i} 
                                    to={`/profile/${getUserId(comment.user)}`} 
                                    className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex gap-3 items-start transition-all hover:bg-slate-50 hover:border-slate-200 group/comment-author w-full text-left cursor-pointer block shadow-sm"
                                  >
                                    <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center shadow-sm">
                                      {commentAvatarPath ? (
                                        <img 
                                          src={formatMediaUrl(commentAvatarPath)} 
                                          alt="Author" 
                                          className="absolute inset-0 w-full h-full rounded-full object-cover border border-slate-200 z-10 group-hover/comment-author:border-slate-400 transition-all" 
                                          onError={(e) => { e.target.style.display = 'none'; }} 
                                        />
                                      ) : null}
                                      <div className="w-full h-full bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-[9px] select-none uppercase border border-slate-200 group-hover/comment-author:border-slate-400 transition-all">
                                        {comment.firstName?.[0] || 'U'}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-zinc-600 mb-0.5 group-hover/comment-author:text-zinc-900 group-hover/comment-author:underline transition-all">
                                        {comment.firstName} {comment.lastName}
                                      </p>
                                      <p className="text-zinc-700 leading-relaxed">{comment.text}</p>
                                    </div>
                                  </Link>
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