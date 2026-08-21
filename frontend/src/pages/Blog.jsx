import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import tradPattern from '../assets/traditional.jpg';
import Navbar from '../components/Navbar';

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
  Briefcase,
  Music,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const Blog = ({ hasNewNotification, clearNotifications }) => {

  /* =========================================================
     STATES
  ========================================================= */

  // Création
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Commentaires
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [replyingTo, setReplyingTo] = useState({}); // Pour gérer l'ouverture du champ de réponse par commentaire
  const [replyTexts, setReplyTexts] = useState({}); // Textes des réponses

  // Modification
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState([]);

  const [existingMediaUrls, setExistingMediaUrls] = useState([]);

  // Carousel Active Index tracking per post
  const [activeMediaIndexes, setActiveMediaIndexes] = useState({});

  // Refs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const socketRef = useRef(null);

  const BACKEND_URL = 'https://hitas.onrender.com';

  const loggedInUserId =
    localStorage.getItem('userId') || '';

  /* =========================================================
     AUTH
  ========================================================= */

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        'x-auth-token': token
      }
    };
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getUserId = (userField) => {
    if (!userField) return '';

    return typeof userField === 'object'
      ? userField._id
      : userField;
  };

  const normalizeStr = (str) => {
    if (!str) return '';

    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const formatMediaUrl = (url) => {
    if (!url) return '';

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getPostMedia = (post) => {
    if (!post) return [];

    if (
      Array.isArray(post.mediaFiles) &&
      post.mediaFiles.length > 0
    ) {
      return post.mediaFiles;
    }

    if (post.mediaUrl) {
      return [{
        url: post.mediaUrl,
        path: post.mediaPath || '',
        type: post.mediaType || 'image',
        originalName: post.mediaOriginalName || ''
      }];
    }

    return [];
  };

  const isImage = (item) => {
    const type = item?.type || '';
    const url = typeof item === 'string' ? item : (item?.url || '');
    return type === 'image' || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  };

  const isAudio = (item) => {
    const type = item?.type || '';
    const url = typeof item === 'string' ? item : (item?.url || '');
    return type === 'audio' || /\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(url);
  };

  const getFileName = (url) => {
    try {
      return decodeURIComponent(
        url
          .split('/')
          .pop()
          .split('?')[0]
      );
    } catch {
      return 'Fichier';
    }
  };

  /* =========================================================
     CAROUSEL HANDLERS
  ========================================================= */

  const setMediaIndex = (postId, index) => {
    setActiveMediaIndexes((prev) => ({
      ...prev,
      [postId]: index
    }));
  };

  const nextMedia = (postId, mediaCount) => {
    setActiveMediaIndexes((prev) => {
      const current = prev[postId] || 0;
      return {
        ...prev,
        [postId]: (current + 1) % mediaCount
      };
    });
  };

  const previousMedia = (postId, mediaCount) => {
    setActiveMediaIndexes((prev) => {
      const current = prev[postId] || 0;
      return {
        ...prev,
        [postId]: (current - 1 + mediaCount) % mediaCount
      };
    });
  };

  /* =========================================================
     CREATE MEDIA
  ========================================================= */

  const clearMedia = () => {
    mediaPreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setMediaFiles([]);
    setMediaPreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMediaFile = (index) => {
    const preview = mediaPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setMediaFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setMediaPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleFileChange = (e) => {
    setError('');

    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const hasVideo = files.some((file) =>
      file.type.startsWith('video/')
    );

    if (hasVideo) {
      setError(
        'Les vidéos ne sont pas autorisées dans les publications.'
      );

      e.target.value = '';
      return;
    }

    const allowedFiles = files.filter((file) => {
      return (
        file.type.startsWith('image/') ||
        file.type.startsWith('audio/') ||
        file.type === 'application/pdf' ||
        /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(
          file.name
        )
      );
    });

    const newPreviews = allowedFiles.map(
      (file) => URL.createObjectURL(file)
    );

    setMediaFiles((prev) => [
      ...prev,
      ...allowedFiles
    ]);

    setMediaPreviews((prev) => [
      ...prev,
      ...newPreviews
    ]);

    e.target.value = '';
  };

  /* =========================================================
     EDIT MEDIA
  ========================================================= */

  const clearEditMedia = () => {
    editMediaPreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setEditMediaFiles([]);
    setEditMediaPreviews([]);
    setExistingMediaUrls([]);

    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const removeEditMediaFile = (index) => {
    const preview = editMediaPreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setEditMediaFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setEditMediaPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const removeExistingMedia = (index) => {
    setExistingMediaUrls((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const hasVideo = files.some((file) =>
      file.type.startsWith('video/')
    );

    if (hasVideo) {
      alert('Les vidéos ne sont pas autorisées.');
      e.target.value = '';
      return;
    }

    const allowedFiles = files.filter((file) => {
      return (
        file.type.startsWith('image/') ||
        file.type.startsWith('audio/') ||
        file.type === 'application/pdf' ||
        /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(
          file.name
        )
      );
    });

    const newPreviews = allowedFiles.map(
      (file) => URL.createObjectURL(file)
    );

    setEditMediaFiles((prev) => [
      ...prev,
      ...allowedFiles
    ]);

    setEditMediaPreviews((prev) => [
      ...prev,
      ...newPreviews
    ]);

    e.target.value = '';
  };

  const startEditing = (post) => {
    setEditingId(post._id);
    setEditText(post.text || '');

    const existing = getPostMedia(post);
    setExistingMediaUrls(existing);
    setEditMediaFiles([]);

    editMediaPreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setEditMediaPreviews([]);
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/posts`
      );

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

    if (clearNotifications) {
      clearNotifications();
    }

    return () => {
      mediaPreviews.forEach((url) =>
        URL.revokeObjectURL(url)
      );

      editMediaPreviews.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearNotifications]);

  /* =========================================================
     SOCKET.IO
  ========================================================= */

  useEffect(() => {
    socketRef.current = io(
      BACKEND_URL,
      {
        transports: [
          'websocket',
          'polling'
        ],
        closeOnBeforeunload: true
      }
    );

    const socket = socketRef.current;

    const handleCreated = (newPost) => {
      setPosts((prevPosts) => {
        if (
          prevPosts.some(
            (post) =>
              post._id === newPost._id
          )
        ) {
          return prevPosts;
        }

        return [
          newPost,
          ...prevPosts
        ];
      });
    };

    const handleDeleted = (deletedPostId) => {
      setPosts((prevPosts) =>
        prevPosts.filter(
          (post) =>
            post._id !== deletedPostId
        )
      );
    };

    const handleUpdated = (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    };

    const handleInteractions = (
      updatedPost
    ) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
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
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/posts/like/${postId}`,
        {
          socketId: socketRef.current?.id
        },
        getAuthHeader()
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes:
                  response.data?.likes ||
                  response.data
              }
            : post
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    const textComment = parentCommentId ? replyTexts[parentCommentId] : commentTexts[postId];

    if (!textComment || !textComment.trim()) {
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/posts/comment/${postId}`,
        {
          text: textComment,
          parentCommentId,
          socketId: socketRef.current?.id
        },
        getAuthHeader()
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments:
                  response.data?.comments ||
                  response.data
              }
            : post
        )
      );

      if (parentCommentId) {
        setReplyTexts((prev) => ({ ...prev, [parentCommentId]: '' }));
        setReplyingTo((prev) => ({ ...prev, [parentCommentId]: false }));
      } else {
        setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!text.trim() && mediaFiles.length === 0) {
      setError('Le corps du message ne peut pas être vide ou doit contenir un média.');
      return;
    }

    try {
      const formData = new FormData();

      if (socketRef.current?.id) {
        formData.append('socketId', socketRef.current.id);
      }

      formData.append('text', text);
      formData.append('category', category);

      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const token = localStorage.getItem('token');

      await axios.post(
        `${BACKEND_URL}/api/posts`,
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setText('');
      clearMedia();
      setSuccess('Publication partagée avec succès !');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Erreur lors de la publication.'
      );
    }
  };

  const handleEditSubmit = async (postId) => {
    if (
      !editText.trim() &&
      editMediaFiles.length === 0 &&
      existingMediaUrls.length === 0
    ) {
      alert('La publication ne peut pas être complètement vide.');
      return;
    }

    try {
      const formData = new FormData();

      if (socketRef.current?.id) {
        formData.append('socketId', socketRef.current.id);
      }

      formData.append('text', editText);

      existingMediaUrls.forEach((url) => {
        formData.append(
          'existingMediaUrls',
          typeof url === 'string' ? url : url.url
        );
      });

      editMediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const token = localStorage.getItem('token');

      await axios.put(
        `${BACKEND_URL}/api/posts/${postId}`,
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setEditingId(null);
      clearEditMedia();

    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification de la publication.');
    }
  };

  const handleDelete = async (postId) => {
    if (
      window.confirm(
        'Es-tu sûr de vouloir supprimer cette publication ?'
      )
    ) {
      try {
        await axios.delete(
          `${BACKEND_URL}/api/posts/${postId}`,
          getAuthHeader()
        );
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const filteredPosts = posts
    .filter((post) =>
      selectedFilter === 'Tous'
        ? true
        : normalizeStr(post.category) === normalizeStr(selectedFilter)
    )
    .filter((post) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        post.text?.toLowerCase().includes(query) ||
        `${post.firstName} ${post.lastName}`.toLowerCase().includes(query)
      );
    });

  const getBadgeColor = (cat) => {
    switch (normalizeStr(cat)) {
      case 'entraide':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
      case 'stageemploi':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'logement':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700';
    }
  };

  const renderMediaGrid = (post) => {
    const mediaItems = getPostMedia(post);
    if (!mediaItems || mediaItems.length === 0) return null;

    const activeIndex = activeMediaIndexes[post._id] || 0;

    return (
      <div className="w-full bg-black">
        <div className="relative w-full overflow-hidden bg-black flex items-center justify-center">
          <div 
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {mediaItems.map((item, index) => {
              const url = typeof item === 'string' ? item : item.url;
              const fullUrl = formatMediaUrl(url);
              const mediaType = typeof item === 'string' ? (isImage(item) ? 'image' : 'file') : (item.type || 'image');

              return (
                <div
                  key={`${url}-${index}`}
                  className="min-w-full w-full flex-shrink-0 flex items-center justify-center bg-black"
                >
                  {mediaType === 'image' || isImage(url) ? (
                    <img
                      src={fullUrl}
                      alt={`Publication ${index + 1}`}
                      className="w-full max-h-[720px] object-contain bg-black select-none"
                      loading="lazy"
                    />
                  ) : mediaType === 'audio' || isAudio(url) ? (
                    <div className="w-full p-6 bg-slate-50 dark:bg-[#030014]">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                          <Music size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate mb-1">
                            {item.originalName || getFileName(url)}
                          </p>
                          <audio src={fullUrl} controls className="w-full h-9" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-full flex items-center gap-3 p-4 bg-white dark:bg-[#030014] hover:bg-slate-50 dark:hover:bg-[#0b081e] transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <FileText size={23} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {item.originalName || getFileName(url)}
                        </p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                          Ouvrir le document →
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {mediaItems.length > 1 && activeIndex > 0 && (
            <button
              type="button"
              onClick={() => previousMedia(post._id, mediaItems.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {mediaItems.length > 1 && activeIndex < mediaItems.length - 1 && (
            <button
              type="button"
              onClick={() => nextMedia(post._id, mediaItems.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Composant récursif pour afficher les commentaires et leurs réponses imbriquées (style YouTube)
  const renderCommentThread = (comment, postId) => {
    const commentAvatarPath =
      comment.avatar ||
      (comment.user && typeof comment.user === 'object' ? comment.user.avatar : null);
    
    const commentId = comment._id || comment.id;
    const isReplying = replyingTo[commentId];

    return (
      <div key={commentId} className="relative text-xs text-zinc-100 mt-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link to={`/profile/${getUserId(comment.user)}`} className="w-8 h-8 rounded-full overflow-hidden bg-indigo-950 border border-indigo-500/30 flex-shrink-0 flex items-center justify-center font-bold text-indigo-300">
            {commentAvatarPath ? (
              <img src={formatMediaUrl(commentAvatarPath)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{comment.firstName?.[0] || 'U'}</span>
            )}
          </Link>

          {/* Corps du commentaire */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${getUserId(comment.user)}`} className="font-bold text-white uppercase text-[11px] tracking-wide hover:underline">
                @{comment.firstName} {comment.lastName}
              </Link>
              <span className="text-zinc-500 text-[10px]">
                {comment.date ? new Date(comment.date).toLocaleDateString('fr-FR') : 'Récemment'}
              </span>
            </div>

            <p className="text-zinc-200 text-xs leading-relaxed break-words mb-2">
              {comment.text}
            </p>

            {/* Boutons d'action (Likes & Répondre) */}
            <div className="flex items-center gap-4 text-zinc-400 text-xs">
              <button className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{comment.likes?.length || 0}</span>
              </button>
              <button className="hover:text-indigo-400 transition-colors">
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setReplyingTo(prev => ({ ...prev, [commentId]: !isReplying }))}
                className="font-bold text-zinc-300 hover:text-white transition-colors"
              >
                Répondre
              </button>
            </div>

            {/* Formulaire de réponse rapide imbriqué */}
            {isReplying && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyTexts[commentId] || ''}
                  onChange={(e) => setReplyTexts(prev => ({ ...prev, [commentId]: e.target.value }))}
                  placeholder="Ajouter une réponse..."
                  className="flex-1 bg-[#030014] border border-indigo-900/60 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => handleAddComment(postId, commentId)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl font-bold transition-all"
                >
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sous-commentaires / Réponses avec la ligne verticale caractéristique */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative pl-6 sm:pl-8 mt-3 ml-4 border-l border-indigo-900/60 space-y-3">
            {comment.replies.map((reply) => renderCommentThread(reply, postId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-screen text-slate-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white antialiased flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat'
      }}
    >
      <Navbar hasNewNotification={hasNewNotification} clearNotifications={clearNotifications} />

      <div className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-indigo-200 dark:to-purple-400 dark:bg-clip-text">
            Espace Entraide & Blog
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-xl">
            Partages d'expériences, guides et aperçus de vos stages au quotidien.
          </p>
        </div>

        {/* Create Post Card */}
        <div className="bg-white/80 dark:bg-[#0b081e]/85 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-indigo-900/60 shadow-2xl mb-7">
          <h2 className="text-xs font-bold mb-4 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Créer une nouvelle publication
          </h2>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 text-xs font-medium">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl mb-4 text-xs font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows="3"
              className="w-full bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl p-4 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all resize-none text-sm leading-relaxed"
              placeholder="Un truc cool à l'école ou en stage ? Raconte ou ajoute des fichiers..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#030014] border border-slate-200 dark:border-indigo-950 px-3 py-1.5 rounded-xl">
                  <label htmlFor="category-select" className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Catégorie :
                  </label>
                  <select
                    id="category-select"
                    className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
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
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-medium border-slate-200 dark:border-indigo-950 bg-slate-100 dark:bg-[#030014] text-slate-600 dark:text-zinc-400"
                >
                  <Paperclip size={16} className="text-indigo-600 dark:text-indigo-400" />
                  {mediaFiles.length > 0 ? `${mediaFiles.length} fichier(s)` : 'Ajouter des fichiers'}
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Publier</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="mb-5 relative">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Search size={16} className="text-indigo-600 dark:text-indigo-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher un mot-clé, un sujet, un étudiant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 dark:bg-[#0b081e]/80 backdrop-blur-md border border-slate-200 dark:border-indigo-900/60 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-7 border-b border-slate-200 dark:border-indigo-950/40 pb-5">
          {['Tous', 'General', 'Entraide', 'Stage/Emploi', 'Logement'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                selectedFilter === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md'
                  : 'bg-white/80 dark:bg-[#0b081e]/80 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-indigo-900/60'
              }`}
            >
              {cat === 'Tous' && <Megaphone size={14} />}
              {cat === 'Stage/Emploi' && <Briefcase size={14} />}
              <span>{cat === 'General' ? 'Général' : cat === 'Stage/Emploi' ? 'Stage / Emploi' : cat}</span>
            </button>
          ))}
        </div>

        {/* Posts Stream */}
        {loading ? (
          <div className="text-center text-slate-500 dark:text-zinc-500 py-16 text-xs font-bold tracking-widest animate-pulse">
            CHARGEMENT EN COURS...
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="text-center text-slate-600 dark:text-zinc-400 py-16 bg-white/80 dark:bg-[#0b081e]/80 rounded-2xl text-sm border border-slate-200 dark:border-indigo-900/60">
                Aucune publication ne correspond à ta recherche.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const hasLiked = post.likes?.some(
                  (like) => getUserId(like.user) === loggedInUserId
                );
                const avatarPath = post.avatar || (post.user && typeof post.user === 'object' ? post.user.avatar : null);

                return (
                  <div key={post._id} className="bg-white/90 dark:bg-[#0b081e]/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-indigo-900/60 overflow-hidden shadow-xl">
                    
                    {/* Post Header */}
                    <div className="flex justify-between items-start px-4 sm:px-5 pt-4 pb-2">
                      <Link to={`/profile/${getUserId(post.user)}`} className="flex items-center gap-3 group/author">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          {avatarPath ? (
                            <img src={formatMediaUrl(avatarPath)} alt={post.firstName} className="absolute inset-0 w-full h-full rounded-full object-cover border border-slate-300 dark:border-indigo-950 z-10" />
                          ) : null}
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 dark:from-indigo-950 to-slate-200 dark:to-slate-900 rounded-full flex items-center justify-center font-bold text-xs">
                            {post.firstName?.[0] || 'U'}{post.lastName?.[0] || ''}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-200 group-hover/author:text-indigo-600 transition-all">
                            {post.firstName} {post.lastName}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                            {new Date(post.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeColor(post.category)}`}>
                          {post.category}
                        </span>

                        {getUserId(post.user) === loggedInUserId && (
                          <div className="flex gap-1 bg-slate-100 dark:bg-[#030014] border border-slate-200 dark:border-indigo-950 rounded-lg p-1">
                            <button onClick={() => startEditing(post)} className="p-1"><Pencil size={15} className="text-amber-500" /></button>
                            <button onClick={() => handleDelete(post._id)} className="p-1"><Trash2 size={15} className="text-red-500" /></button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit or Display Post */}
                    {editingId === post._id ? (
                      <div className="m-4 space-y-4 bg-slate-50 dark:bg-[#030014]/60 p-4 rounded-xl border border-slate-200 dark:border-indigo-950">
                        <h4 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Modifier la publication</h4>
                        <textarea
                          className="w-full bg-white dark:bg-[#0b081e] border border-slate-200 dark:border-indigo-900 rounded-xl p-3 text-sm resize-none"
                          rows="3"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 pt-3">
                          <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded-lg text-xs">Annuler</button>
                          <button type="button" onClick={() => handleEditSubmit(post._id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Sauvegarder</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.text?.trim() && (
                          <p className="px-4 sm:px-5 pb-2 text-slate-800 dark:text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
                            {post.text}
                          </p>
                        )}

                        {renderMediaGrid(post)}

                        {/* Actions Bar */}
                        <div className="flex gap-2 px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-indigo-900/40">
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                              hasLiked ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            <Heart size={15} className={hasLiked ? 'fill-current text-pink-500' : 'text-slate-400'} />
                            <span className="text-[11px]">{post.likes?.length || 0}</span>
                          </button>

                          <button
                            onClick={() => setShowComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-zinc-300"
                          >
                            <MessageCircle size={15} />
                            <span className="text-[11px]">{post.comments?.length || 0}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {showComments[post._id] && (
                          <div className="border-t border-slate-200 dark:border-indigo-900/40 p-4 bg-slate-50 dark:bg-[#0b081e]/80">
                            
                            {/* Main Comment Input */}
                            <div className="flex gap-2 mb-4">
                              <input
                                type="text"
                                placeholder="Écrire un commentaire..."
                                value={commentTexts[post._id] || ''}
                                onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                className="w-full bg-white dark:bg-[#030014] border border-slate-200 dark:border-indigo-900 rounded-xl p-2.5 text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 rounded-xl text-xs font-bold"
                              >
                                Envoyer
                              </button>
                            </div>

                            {/* Threaded Comments List */}
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                              {post.comments && post.comments.length > 0 ? (
                                post.comments.map((comment) => renderCommentThread(comment, post._id))
                              ) : (
                                <p className="text-zinc-500 text-xs italic text-center py-2">Aucun commentaire pour le moment.</p>
                              )}
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