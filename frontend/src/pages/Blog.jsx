import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client'; // 🌐 Importation du client socket
import { Search, Paperclip, Send, Layers, Heart, MessageSquare, Pencil, Trash2, X } from 'lucide-react';

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
      setLoading(false);
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
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'], 
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

    socket.on('posts_created', handleCreated);
    socket.on('posts_deleted', handleDeleted);
    socket.on('posts_updated', handleUpdated);
    socket.on('posts_updated_interactions', handleInteractions);

    return () => {
      socket.off('posts_created', handleCreated);
      socket.off('posts_deleted', handleDeleted);
      socket.off('posts_updated', handleUpdated);
      socket.off('posts_updated_interactions', handleInteractions);
      socket.disconnect();
    };
  }, [BACKEND_URL]);

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/posts/like/${postId}`, {
        socketId: socketRef.current?.id
      }, getAuthHeader());
      setPosts(posts.map(post => post._id === postId ? { ...post, likes: response.data?.likes || response.data } : post));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const textComment = commentTexts[postId];
    if (!textComment || !textComment.trim()) return;
    try {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!text.trim() && !mediaFile) return setError('Le corps du message ne peut pas être vide ou doit contenir un média.');
    try {
      const formData = new FormData();
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

  const handleEditSubmit = async (postId) => {
    if (!editText.trim() && !editMediaFile && !existingMediaUrl) {
      return alert('La publication ne peut pas être complètement vide.');
    }

    try {
      const formData = new FormData();
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Rendu de la liste des posts filtrés */}
      {loading ? (
        <div className="text-center text-zinc-400 py-10">Chargement des publications...</div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            // Définition dynamique de l'avatar du post
            const avatarPath = post.avatar || (post.user && typeof post.user === 'object' ? post.user.avatar : null);
            const hasLiked = post.likes?.includes(loggedInUserId);

            return (
              <div 
                key={post._id} 
                id={`post-${post._id}`}
                className="bg-[#161618] p-5 rounded-2xl border border-zinc-800/50 transition-all duration-300 hover:border-zinc-800 shadow-lg"
              >
                {/* Post Header */}
                <div className="flex justify-between items-start mb-4">
                  <Link 
                    to={`/profile/${getUserId(post.user)}`} 
                    className="flex items-center gap-3 group/author cursor-pointer"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md">
                      {avatarPath ? (
                        <img 
                          src={formatMediaUrl(avatarPath)} 
                          alt={`${post.firstName}`} 
                          className="absolute inset-0 w-full h-full rounded-full object-cover border border-zinc-800 z-10 group-hover/author:border-zinc-600 transition-all" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200 rounded-full flex items-center justify-center font-bold text-xs select-none border border-zinc-700 group-hover/author:border-zinc-600 transition-all">
                        {post.firstName?.[0] || 'U'}{post.lastName?.[0] || ''}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-zinc-200 tracking-wide group-hover/author:text-white group-hover/author:underline transition-all">
                        {post.firstName} {post.lastName}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-medium">{new Date(post.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeColor(post.category)}`}>
                      {post.category}
                    </span>
                    
                    {getUserId(post.user) === loggedInUserId && (
                      <div className="flex gap-0.5 bg-[#0d0d0e] border border-zinc-800 rounded-lg p-0.5 shadow-inner">
                        <button onClick={() => startEditing(post)} className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 p-1.5 rounded-md text-xs transition-all">✏️</button>
                        <button onClick={() => handleDelete(post._id)} className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md text-xs transition-all">🗑️</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* CORPS DU POST */}
                {editingId === post._id ? (
                  <div className="mt-2 space-y-4 bg-[#0d0d0e] p-4 rounded-xl border border-zinc-800">
                    <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Modifier la publication</h4>
                    
                    <textarea
                      className="w-full bg-[#161618] border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                      rows="3"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 block">Gestion du média :</label>
                      
                      {existingMediaUrl && (
                        <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#161618] p-2 max-h-[180px] flex items-center justify-between">
                          <span className="text-xs text-zinc-400 truncate max-w-[80%]">📁 Média actuellement sauvegardé</span>
                          <button 
                            type="button" 
                            onClick={() => setExistingMediaUrl('')} 
                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-[11px] font-medium hover:bg-red-500/20 transition-all"
                          >
                            Retirer
                          </button>
                        </div>
                      )}

                      {editMediaPreview && (
                        <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#161618] p-2 max-h-[180px] flex items-center justify-between">
                          <span className="text-xs text-indigo-400 truncate max-w-[80%]">📎 Nouveau média prêt à être injecté</span>
                          <button 
                            type="button" 
                            onClick={clearEditMedia} 
                            className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md text-[11px] font-medium hover:bg-zinc-700 transition-all"
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
                            className="text-xs border border-zinc-800 bg-[#161618] text-zinc-400 px-3 py-1.5 rounded-lg hover:text-zinc-200 hover:border-zinc-700 transition-all"
                          >
                            ➕ Insérer un fichier ou une vidéo
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

                    <div className="flex gap-2 justify-end pt-2 border-t border-zinc-800/60">
                      <button onClick={() => { setEditingId(null); clearEditMedia(); }} className="px-3 py-1.5 bg-transparent border border-zinc-800 text-xs font-semibold rounded-lg text-zinc-400 hover:text-zinc-200 transition-all">Annuler</button>
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
                          <video src={formatMediaUrl(post.mediaUrl)} controls className="w-full h-auto max-h-[420px] object-contain rounded-lg" />
                        ) : post.mediaUrl.match(/\.(mp3|wav|m4a|ogg)$/i) ? (
                          <audio src={formatMediaUrl(post.mediaUrl)} controls className="w-full max-w-md my-3 accent-indigo-500" />
                        ) : post.mediaUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                          <div className="flex items-center gap-3 p-4 w-full bg-zinc-900/50 rounded-lg border border-zinc-800 m-2">
                            <span className="text-2xl text-indigo-400">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-200 truncate">
                                {post.mediaUrl.split('/').pop()}
                              </p>
                              <a 
                                href={formatMediaUrl(post.mediaUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                Ouvrir le document dans un nouvel onglet ↗
                              </a>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={formatMediaUrl(post.mediaUrl)} 
                            alt="Média" 
                            className="w-full h-auto max-h-[420px] object-contain rounded-lg shadow-md"
                            onError={(e) => { e.target.parentNode.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    )}

                    {/* Actions */}
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

                    {/* Commentaires */}
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
                              <Link 
                                key={i} 
                                to={`/profile/${getUserId(comment.user)}`} 
                                className="bg-[#18181b]/40 p-3 rounded-xl border border-zinc-800/30 text-xs flex gap-3 items-start transition-all hover:bg-[#18181b]/60 group/comment-author w-full text-left cursor-pointer block"
                              >
                                <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center shadow">
                                  {commentAvatarPath ? (
                                    <img 
                                      src={formatMediaUrl(commentAvatarPath)} 
                                      alt="Author" 
                                      className="absolute inset-0 w-full h-full rounded-full object-cover border border-zinc-800 z-10 group-hover/comment-author:border-zinc-600 transition-all" 
                                      onError={(e) => { e.target.style.display = 'none'; }} 
                                    />
                                  ) : null}
                                  <div className="w-full h-full bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center font-bold text-[9px] select-none uppercase border border-zinc-700 group-hover/comment-author:border-zinc-600 transition-all">
                                    {comment.firstName?.[0] || 'U'}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-zinc-400 mb-0.5 group-hover/comment-author:text-white group-hover/comment-author:underline transition-all">
                                    {comment.firstName} {comment.lastName}
                                  </p>
                                  <p className="text-zinc-300 leading-relaxed">{comment.text}</p>
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
          })}
        </div>
      )}
    </div>
  );
};

export default Blog;