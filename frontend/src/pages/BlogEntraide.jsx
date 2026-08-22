import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import {
  Trash2,
  Send,
  Layers,
  MessageCircle,
  Heart,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Music,
  Paperclip,
  Download,
  ExternalLink
} from 'lucide-react';

import Navbar from '../components/Navbar';
import tradPattern from '../assets/traditional.jpg';

const BlogEntraide = ({
  hasNewNotification,
  clearNotifications
}) => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [activeMediaIndexes, setActiveMediaIndexes] = useState({});

  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  const BACKEND_URL = 'https://hitas.onrender.com';
  const loggedInUserId = localStorage.getItem('userId') || '';
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'x-auth-token': token } };
  };

  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  const getPostMedia = (post) => {
    if (post.mediaFiles && Array.isArray(post.mediaFiles) && post.mediaFiles.length > 0) {
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BACKEND_URL}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les publications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (clearNotifications) clearNotifications();
  }, [clearNotifications]);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    const socket = socketRef.current;

    const handleCreated = (newPost) => {
      setPosts((prevPosts) => {
        if (prevPosts.some((post) => post._id === newPost._id)) return prevPosts;
        return [newPost, ...prevPosts];
      });
    };

    const handleDeleted = (deletedPostId) => {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
    };

    const handleUpdated = (updatedPost) => {
      setPosts((prevPosts) => prevPosts.map((post) => post._id === updatedPost._id ? updatedPost : post));
    };

    socket.on('posts_created', handleCreated);
    socket.on('posts_deleted', handleDeleted);
    socket.on('posts_updated', handleUpdated);

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError('');

    if (selectedFiles.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} fichiers autorisés.`);
      e.target.value = '';
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => {
      if (file.type?.startsWith('image/')) {
        return { url: URL.createObjectURL(file), name: file.name, type: 'image' };
      }
      return { url: null, name: file.name, type: 'file' };
    });

    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    if (previewUrls[index]?.url) URL.revokeObjectURL(previewUrls[index].url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelectedFiles = () => {
    previewUrls.forEach((p) => { if (p.url) URL.revokeObjectURL(p.url); });
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!text.trim() && selectedFiles.length === 0) {
      setError('La publication doit contenir du texte ou un fichier.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      if (socketRef.current?.id) {
        formData.append('socketId', socketRef.current.id);
      }

      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      await axios.post(`${BACKEND_URL}/api/posts`, formData, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });

      setText('');
      clearSelectedFiles();
      setSuccess('Publication partagée !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/posts/${postId}`, getAuthHeader());
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const setSelectedMediaIndex = (updater) => {
    setActiveMediaIndexes(updater);
  };

  const filteredPosts = selectedFilter === 'Tous' ? posts : posts.filter((p) => p.category === selectedFilter);

  const getBadgeColor = (cat) => {
    switch (cat) {
      case 'Entraide': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Stage/Emploi': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Logement': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    }
  };

  /* =========================================================
     RENDER MEDIA (AVEC APERÇU PDF MODERNE ET DESIGN GLASSMORPHISM)
  ========================================================= */

  const renderMedia = (post) => {
    const media = getPostMedia(post);
    if (!media.length) return null;

    const activeIndex = activeMediaIndexes[post._id] || 0;
    const currentMedia = media[activeIndex] || media[0];
    const currentFileName = currentMedia.originalName || currentMedia.name || 'Fichier joint';
    const hasMultipleMedia = media.length > 1;
    const mediaType = currentMedia.type || 'image';
    const mediaUrl = formatMediaUrl(currentMedia.url);

    return (
      <div className="mb-6 overflow-hidden px-4">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-100/80 dark:bg-[#030014] px-4 py-3 rounded-t-2xl border-x border-t border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
              <FileText size={13} />
            </div>
            <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              {currentFileName}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-zinc-600 shrink-0">
            {activeIndex + 1} / {media.length}
          </span>
        </div>

        {/* Main Media Viewport Box */}
        <div className="rounded-b-2xl overflow-hidden border border-slate-200 dark:border-indigo-900/40 bg-slate-100 dark:bg-[#030014]/80 min-h-[260px] sm:min-h-[350px] w-full flex items-center justify-center relative shadow-inner p-4">
          {mediaType === 'pdf' || mediaType === 'document' ? (
            <div className="w-full max-w-md bg-gradient-to-br from-[#0b081e] via-[#120e2e] to-[#030014] border border-indigo-500/30 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mx-auto mb-4 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <FileText size={32} />
              </div>
              
              <span className="inline-block bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest mb-2">
                Document PDF
              </span>
              
              <p className="text-xs font-bold text-white mb-6 truncate px-2">
                {currentFileName}
              </p>

              <div className="flex gap-2">
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink size={14} /> Ouvrir
                </a>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-[#030014] hover:bg-indigo-950/60 border border-indigo-500/30 text-zinc-300 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-inner"
                >
                  <Download size={14} /> Télécharger
                </a>
              </div>
            </div>
          ) : mediaType === 'audio' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Music size={24} />
              </div>
              <audio controls src={mediaUrl} className="w-full max-w-sm" />
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt=""
              className="max-h-[380px] w-full object-contain select-none rounded-xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}

          {/* Left / Right Carousel Navigation Buttons */}
          {hasMultipleMedia && activeIndex > 0 && (
            <button
              type="button"
              onClick={() => setSelectedMediaIndex((prev) => ({ ...prev, [post._id]: activeIndex - 1 }))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {hasMultipleMedia && activeIndex < media.length - 1 && (
            <button
              type="button"
              onClick={() => setSelectedMediaIndex((prev) => ({ ...prev, [post._id]: activeIndex + 1 }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Thumbnails Bar */}
        {hasMultipleMedia && media.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-2 mt-3 scrollbar-none">
            {media.map((mediaItem, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setSelectedMediaIndex((prev) => ({
                    ...prev,
                    [post._id]: index
                  }))
                }
                className={`w-16 h-11 rounded-lg border overflow-hidden bg-white dark:bg-[#030014] shrink-0 flex items-center justify-center transition-all ${
                  activeIndex === index
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 opacity-100 shadow-md'
                    : 'border-slate-300 dark:border-indigo-950 opacity-40 hover:opacity-70'
                }`}
              >
                {mediaItem.type === 'image' || !mediaItem.type ? (
                  <img
                    src={formatMediaUrl(mediaItem.url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs">📄</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar hasNewNotification={hasNewNotification} clearNotifications={clearNotifications} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Blog & Entraide</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">Partage tes actualités avec la communauté.</p>
        </div>

        <div className="bg-white/90 dark:bg-[#161618]/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg mb-6 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            <textarea
              rows="3"
              className="w-full bg-transparent border-0 outline-none resize-none text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600"
              placeholder="Que veux-tu partager aujourd'hui ?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {selectedFiles.length > 0 && (
              <div className="mt-3 rounded-xl border border-zinc-800 overflow-hidden bg-[#0d0d0e] p-2 grid grid-cols-3 gap-1">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900">
                    {preview.type === 'image' && preview.url ? (
                      <img src={preview.url} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-[9px] truncate">{preview.name}</div>
                    )}
                    <button type="button" onClick={() => removeSelectedFile(index)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <div className="mt-3 bg-red-500/10 text-red-500 p-2.5 rounded-lg text-xs">{error}</div>}
            {success && <div className="mt-3 bg-emerald-500/10 text-emerald-500 p-2.5 rounded-lg text-xs">{success}</div>}

            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" multiple onChange={handleFileSelection} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#0d0d0e] text-zinc-400 text-[10px] font-semibold">
                  <Paperclip size={14} /> {selectedFiles.length > 0 ? `${selectedFiles.length} fichier(s)` : 'Ajouter des fichiers'}
                </button>
              </div>
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-md flex items-center gap-2">
                Publier <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article key={post._id} className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {post.firstName?.[0] || 'U'}{post.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{post.firstName} {post.lastName}</h3>
                    <p className="text-[10px] text-zinc-500">{new Date(post.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {getUserId(post.user) === loggedInUserId && (
                  <button onClick={() => handleDelete(post._id)} className="p-2 text-zinc-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {post.text?.trim() && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-wrap">{post.text}</p>
                </div>
              )}

              {renderMedia(post)}

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Heart size={16} /> {post.likes?.length || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={16} /> {post.comments?.length || 0}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BlogEntraide;