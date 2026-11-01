import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  FileText,
  FolderOpen,
  CalendarDays,
  UserRound,
  Sparkles,
  GitBranch
} from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const formatMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = 'https://hitas.onrender.com';
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getFileName = (rawMedia) => {
  if (!rawMedia) return 'Fichier sans nom';
  if (typeof rawMedia === 'object' && rawMedia !== null) {
    if (rawMedia.originalName) return rawMedia.originalName;
    if (rawMedia.name) return rawMedia.name;
  }
  const urlStr =
    typeof rawMedia === 'string'
      ? rawMedia
      : rawMedia.url || rawMedia.path || '';

  if (!urlStr) return 'Fichier joint';
  const parts = urlStr.split('/');
  const fullName = parts[parts.length - 1];
  return decodeURIComponent(fullName.split('?')[0]) || 'Fichier joint';
};

// ==============================
// PROFESSIONAL MEDIA GALLERY COMPONENT
// ==============================
const PostMediaGallery = ({ projectMediaList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!projectMediaList || projectMediaList.length === 0) return null;

  const currentItem = projectMediaList[currentIndex];
  const mediaUrl = typeof currentItem === 'string' ? currentItem : currentItem.url;
  const mediaType = typeof currentItem === 'string' ? 'image' : (currentItem.type || 'image');

  return (
    <div className="rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-sky-950/40 my-3">
      {/* Main Active Media Preview */}
      <div className="h-[260px] w-full flex items-center justify-center relative bg-gray-100/50 dark:bg-black/30">
        {mediaType === 'pdf' ? (
          <div className="p-4 text-center">
            <span className="text-4xl mb-2 block">📄</span>
            <a
              href={formatMediaUrl(mediaUrl)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-600 dark:text-sky-400 underline font-bold"
            >
              Ouvrir le document PDF
            </a>
          </div>
        ) : mediaType === 'video' ? (
          <video
            src={formatMediaUrl(mediaUrl)}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={formatMediaUrl(mediaUrl)}
            alt="Project attachment preview"
            className="w-full h-full object-contain transition-all duration-300"
          />
        )}

        {projectMediaList.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-medium">
            {currentIndex + 1} / {projectMediaList.length}
          </span>
        )}
      </div>

      {/* Thumbnail Navigation Bar */}
      {projectMediaList.length > 1 && (
        <div className="flex gap-2 p-2 bg-gray-100/60 dark:bg-sky-950/60 overflow-x-auto">
          {projectMediaList.map((item, idx) => {
            const itemUrl = typeof item === 'string' ? item : item.url;
            const itemType = typeof item === 'string' ? 'image' : (item.type || 'image');

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 transition-all ${currentIndex === idx
                    ? 'ring-2 ring-sky-500 opacity-100 scale-105'
                    : 'opacity-40 hover:opacity-80'
                  }`}
              >
                {itemType === 'pdf' ? (
                  <div className="w-full h-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-xs">📄</div>
                ) : itemType === 'video' ? (
                  <div className="w-full h-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-xs text-sky-600 dark:text-sky-300">🎥</div>
                ) : (
                  <img src={formatMediaUrl(itemUrl)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Showcase = ({ hasNewNotification, clearNotifications }) => {
  const [projects, setProjects] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTechs, setEditTechs] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editDemo, setEditDemo] = useState('');

  const BACKEND_URL = 'https://hitas.onrender.com';
  const loggedInUserId = localStorage.getItem('userId') || '';
  const location = useLocation();

  const getAuthHeader = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'x-auth-token': token || '',
        'Content-Type': contentType
      }
    };
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/project`);
      const userProjects = res.data.filter(
        (project) => project.user === loggedInUserId
      );
      setProjects(userProjects);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des projets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects().then(() => {
      if (location.state?.scrollToId) {
        setTimeout(() => {
          const element = document.getElementById(
            `project-${location.state.scrollToId}`
          );
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            element.classList.add('bg-sky-500/[0.03]');
            setTimeout(() => {
              element.classList.remove('bg-sky-500/[0.03]');
            }, 3000);
          }
        }, 100);
      }
    });
  }, [location]);

  const processFiles = (
    files,
    currentFilesCount,
    setFilesTarget,
    setPreviewsTarget
  ) => {
    if (!files.length) return;

    if (files.length + currentFilesCount > 6) {
      setError('Vous pouvez téléverser un maximum de 6 fichiers par projet.');
      return false;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      const isImage = fileType.startsWith('image/');
      const isVideo =
        fileType.startsWith('video/') ||
        fileName.endsWith('.mov') ||
        fileName.endsWith('.mp4') ||
        fileName.endsWith('.webm');

      const isPdf =
        fileType === 'application/pdf' || fileName.endsWith('.pdf');

      if (!isImage && !isPdf && !isVideo) {
        setError('Format non supporté. Seules les images, les vidéos et les PDF sont autorisés.');
        return;
      }

      validFiles.push(file);
      newPreviews.push({
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : (isImage ? 'image' : 'pdf'),
        name: file.name
      });
    });

    if (validFiles.length > 0) {
      setFilesTarget((prev) => [...prev, ...validFiles]);
      setPreviewsTarget((prev) => [...prev, ...newPreviews]);
    }
    return true;
  };

  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files || []);
    processFiles(files, mediaFiles.length, setMediaFiles, setMediaPreviews);
    e.target.value = '';
  };

  const handleEditFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files || []);
    processFiles(
      files,
      existingMedia.length + editMediaFiles.length,
      setEditMediaFiles,
      setEditMediaPreviews
    );
    e.target.value = '';
  };

  const removeSelectedFile = (index) => {
    if (mediaPreviews[index]) {
      URL.revokeObjectURL(mediaPreviews[index].url);
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditSelectedFile = (index) => {
    if (editMediaPreviews[index]) {
      URL.revokeObjectURL(editMediaPreviews[index].url);
    }
    setEditMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setEditMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMediaLocal = (mediaItem) => {
    setExistingMedia((prev) =>
      prev.filter((item) => item.url !== mediaItem.url)
    );
    setMediaToDelete((prev) => [...prev, mediaItem.url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      return setError('Champs obligatoires.');
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('technologies', technologies);
      formData.append('githubUrl', githubUrl);
      formData.append('demoUrl', demoUrl);

      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const res = await axios.post(
        `${BACKEND_URL}/api/project`,
        formData,
        getAuthHeader('multipart/form-data')
      );

      setProjects((prev) => [res.data, ...prev]);

      setTitle('');
      setDescription('');
      setTechnologies('');
      setGithubUrl('');
      setDemoUrl('');

      mediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });

      setMediaFiles([]);
      setMediaPreviews([]);
      setSuccess('Projet partagé avec succès !');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  const handleEditSubmit = async (projectId) => {
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('technologies', editTechs);
      formData.append('githubUrl', editGithub);
      formData.append('demoUrl', editDemo);
      formData.append('mediaToDelete', JSON.stringify(mediaToDelete));

      editMediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const res = await axios.put(
        `${BACKEND_URL}/api/project/${projectId}`,
        formData,
        getAuthHeader('multipart/form-data')
      );

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? res.data : p))
      );

      editMediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });

      setEditingId(null);
      setEditMediaFiles([]);
      setEditMediaPreviews([]);
      setMediaToDelete([]);
      setExistingMedia([]);

      setSuccess('Portfolio mis à jour avec succès !');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce projet ?')) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/project/${projectId}`,
        getAuthHeader()
      );

      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setSuccess('Projet supprimé avec succès.');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression.');
    }
  };

  const startEditing = (project) => {
    setEditingId(project._id);
    setEditTitle(project.title || '');
    setEditDescription(project.description || '');

    setEditTechs(
      Array.isArray(project.technologies)
        ? project.technologies.join(', ')
        : project.technologies || ''
    );

    setEditGithub(project.githubUrl || '');
    setEditDemo(project.demoUrl || '');

    if (project.media && Array.isArray(project.media)) {
      setExistingMedia(project.media);
    } else if (project.mediaUrl) {
      setExistingMedia([
        {
          url: project.mediaUrl,
          type: project.mediaType || 'image'
        }
      ]);
    } else {
      setExistingMedia([]);
    }

    setMediaToDelete([]);
    setEditMediaFiles([]);
    setEditMediaPreviews([]);
  };

  const cancelEditing = () => {
    editMediaPreviews.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
    });

    setEditingId(null);
    setEditMediaFiles([]);
    setEditMediaPreviews([]);
    setMediaToDelete([]);
    setExistingMedia([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Navbar
        hasNewNotification={hasNewNotification}
        clearNotifications={clearNotifications}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 w-full overflow-hidden flex-1 relative">

        {/* PAGE HEADER */}
        <div className="mb-8 relative overflow-hidden z-10">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              Student Showcase
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Showcase des projets
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-sky-100 leading-relaxed">
              Découvrez, présentez et partagez vos projets et réalisations avec la communauté HITAS.
            </p>
          </div>
        </div>

        {/* CREATE PROJECT */}
        <div className="bg-white/60 dark:bg-sky-950/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-md shrink-0">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Partager un projet
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-sky-300/70">
                Ajoutez une réalisation à votre portfolio étudiant.
              </p>
            </div>
          </div>

          {error && <div className="bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-3 rounded-2xl text-xs mb-4 font-medium">{error}</div>}
          {success && <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-2xl text-xs mb-4 font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom du projet ou de la réalisation"
                className="bg-gray-50/50 dark:bg-sky-900/30 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Technologies ou compétences..."
                className="bg-gray-50/50 dark:bg-sky-900/30 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
              />
            </div>
            <textarea
              rows="3"
              placeholder="Décrivez votre projet, vos objectifs..."
              className="w-full bg-gray-50/50 dark:bg-sky-900/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-gray-900 dark:text-zinc-100 resize-none leading-relaxed placeholder-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Lien GitHub / Rapport"
                className="bg-gray-50/50 dark:bg-sky-900/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-gray-700 dark:text-sky-200 placeholder-gray-400"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Lien de démonstration Live"
                className="bg-gray-50/50 dark:bg-sky-900/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-gray-700 dark:text-sky-200 placeholder-gray-400"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
            </div>

            {mediaPreviews.length > 0 && (
              <div className="bg-gray-50/80 dark:bg-sky-900/20 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative bg-white dark:bg-sky-950 rounded-xl overflow-hidden flex flex-col p-2 shadow-sm">
                    <button type="button" onClick={() => removeSelectedFile(index)} className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] z-10">✕</button>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-black/30 flex items-center justify-center mb-2">
                      {preview.type === 'image' && <img src={preview.url} alt="" className="w-full h-full object-cover" />}
                      {preview.type === 'pdf' && <span className="text-2xl">📄</span>}
                      {preview.type === 'video' && <span className="text-2xl">🎥</span>}
                    </div>
                    <span className="text-[10px] text-gray-600 dark:text-sky-200 truncate w-full text-center">{preview.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <label className="group relative flex items-center gap-3 w-full px-4 py-3 rounded-2xl border border-dashed border-gray-300 dark:border-sky-800/60 bg-gray-50/30 dark:bg-sky-900/20 hover:border-sky-500 cursor-pointer transition-all">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Upload size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-200">Ajouter des fichiers</p>
                  <p className="text-[10px] text-gray-400 dark:text-sky-300/70">Images, PDF ou Vidéos · max 6 fichiers</p>
                </div>
                <input type="file" multiple accept="image/*,application/pdf,video/*" onChange={handleFileChange} className="hidden" />
              </label>

              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all">
                <Upload size={14} /> Publier le projet
              </button>
            </div>
          </form>
        </div>

        {/* PROJECT LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/40 dark:bg-sky-950/40 backdrop-blur-sm rounded-3xl">
            <div className="h-6 w-6 border-2 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-400 dark:text-sky-300 text-xs font-bold tracking-widest uppercase">Chargement de la galerie...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {projects.map((project) => {
              const projectMediaList = project.media && project.media.length > 0
                ? project.media
                : project.mediaUrl ? [{ url: project.mediaUrl, type: project.mediaType || 'image' }] : [];

              return (
                <div
                  key={project._id}
                  id={`project-${project._id}`}
                  className="bg-white/60 dark:bg-sky-950/60 backdrop-blur-2xl rounded-3xl shadow-xl transition-all duration-300 flex flex-col p-6 text-left"
                >
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-sky-900/40">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-300 uppercase tracking-widest flex items-center gap-1.5">
                      <GitBranch size={12} /> Projet Étudiant
                    </span>

                    {project.user === loggedInUserId && editingId !== project._id && (
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(project)} className="text-[10px] text-gray-500 dark:text-sky-200 hover:text-gray-800 dark:hover:text-white px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-sky-900/40 transition">Modifier</button>
                        <button onClick={() => handleDelete(project._id)} className="text-[10px] text-gray-400 hover:text-rose-500 px-2 py-1 rounded-lg bg-gray-100 dark:bg-sky-900/40 transition">Supprimer</button>
                      </div>
                    )}
                  </div>

                  {editingId === project._id ? (
                    <div className="space-y-3 mt-2 bg-gray-50/50 dark:bg-sky-900/20 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-widest mb-2">Modifier le projet</h4>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-sky-900/50 px-3 py-2 text-xs rounded-xl text-gray-900 dark:text-zinc-100 focus:outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-sky-900/50 px-3 py-2 text-xs rounded-xl text-gray-900 dark:text-zinc-100 focus:outline-none"
                        value={editTechs}
                        onChange={(e) => setEditTechs(e.target.value)}
                        placeholder="Technologies"
                      />
                      <textarea
                        className="w-full bg-white dark:bg-sky-900/50 px-3 py-2 text-xs rounded-xl text-gray-900 dark:text-zinc-100 focus:outline-none resize-none"
                        rows="2"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />

                      <div className="border-t border-gray-200 dark:border-sky-900/40 pt-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-sky-300/70 block mb-2 uppercase tracking-widest">Fichiers existants</label>
                        {existingMedia.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Aucun fichier joint.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {existingMedia.map((m, idx) => (
                              <div key={idx} className="relative bg-white dark:bg-sky-900/40 rounded-xl p-2 flex items-center justify-between">
                                <span className="text-[10px] text-gray-600 dark:text-sky-200 truncate">{getFileName(m)}</span>
                                <button type="button" onClick={() => removeExistingMediaLocal(m)} className="bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-sky-300/70 block mb-1 uppercase tracking-widest">Ajouter des fichiers</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,application/pdf,video/*"
                          onChange={handleEditFileChange}
                          className="text-xs text-gray-400"
                        />

                        {editMediaPreviews.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {editMediaPreviews.map((p, idx) => (
                              <div key={idx} className="relative bg-white dark:bg-sky-900/40 p-2 rounded-xl flex flex-col items-center justify-between">
                                <button type="button" onClick={() => removeEditSelectedFile(idx)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-10">✕</button>
                                <div className="aspect-video w-full rounded overflow-hidden bg-gray-100 dark:bg-black/30 flex items-center justify-center mb-1">
                                  {p.type === 'image' && <img src={p.url} alt="" className="w-full h-full object-cover" />}
                                  {p.type === 'pdf' && <span className="text-lg">📄</span>}
                                  {p.type === 'video' && <span className="text-lg">🎥</span>}
                                </div>
                                <span className="text-[10px] text-sky-600 dark:text-sky-300 truncate w-full text-center">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end text-xs pt-2">
                        <button type="button" onClick={cancelEditing} className="px-3 py-1.5 rounded-xl text-gray-500 dark:text-sky-200">Annuler</button>
                        <button type="button" onClick={() => handleEditSubmit(project._id)} className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-xl shadow-sm">Sauvegarder</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 dark:text-sky-300/70 mb-2">
                          <span className="inline-flex items-center gap-1"><UserRound size={11} /> {project.firstName} {project.lastName}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {new Date(project.date).toLocaleDateString()}</span>
                        </div>

                        <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">{project.title}</h3>
                        <p className="text-gray-600 dark:text-sky-100 text-xs leading-relaxed mb-4 whitespace-pre-wrap">{project.description}</p>

                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="bg-sky-100/50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-200 text-[10px] px-2.5 py-0.5 rounded-lg font-medium">{tech}</span>
                            ))}
                          </div>
                        )}

                        {projectMediaList.length > 0 && (
                          <PostMediaGallery projectMediaList={projectMediaList} />
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-sky-900/40 mt-auto">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gray-50/80 dark:bg-sky-900/30 text-center text-xs py-2.5 rounded-xl text-gray-700 dark:text-sky-200 font-semibold hover:bg-gray-100 transition truncate px-2">Lien / Rapport</a>
                        )}
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-r from-sky-600 to-blue-600 text-center text-xs py-2.5 rounded-xl font-bold text-white shadow-md shadow-sky-500/20 hover:opacity-95 transition truncate px-2">🌐 Démo Live</a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase;