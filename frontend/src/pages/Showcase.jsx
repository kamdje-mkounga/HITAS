import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  FileText,
  FolderOpen,
  CalendarDays,
  UserRound,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import tradPattern from '../assets/traditional.jpg';
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

const Showcase = ({ hasNewNotification, clearNotifications }) => {
  const [projects, setProjects] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // ==============================
  // CREATE MEDIA
  // ==============================
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // ==============================
  // EDIT MEDIA
  // ==============================
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaToDelete, setMediaToDelete] = useState([]);

  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState([]);

  // ==============================
  // CAROUSEL
  // ==============================
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});

  // ==============================
  // STATUS
  // ==============================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==============================
  // EDIT FIELDS
  // ==============================
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTechs, setEditTechs] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editDemo, setEditDemo] = useState('');

  const BACKEND_URL = 'https://hitas.onrender.com';
  const loggedInUserId = localStorage.getItem('userId') || '';

  const location = useLocation();

  // ==============================
  // AUTH HEADER
  // ==============================
  const getAuthHeader = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        'x-auth-token': token || '',
        'Content-Type': contentType
      }
    };
  };

  // ==============================
  // FETCH PROJECTS
  // ==============================
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

            element.classList.add(
              'border-indigo-500/40',
              'bg-indigo-500/[0.03]',
              'shadow-2xl',
              'shadow-indigo-500/10'
            );

            setTimeout(() => {
              element.classList.remove(
                'border-indigo-500/40',
                'bg-indigo-500/[0.03]',
                'shadow-2xl',
                'shadow-indigo-500/10'
              );
            }, 3000);
          }
        }, 100);
      }
    });
  }, [location]);

  // ==============================
  // FILE PROCESSING
  // ONLY IMAGE + PDF
  // ==============================
  const processFiles = (
    files,
    currentFilesCount,
    setFilesTarget,
    setPreviewsTarget
  ) => {
    if (!files.length) return;

    if (files.length + currentFilesCount > 6) {
      setError(
        'Vous pouvez téléverser un maximum de 6 fichiers par projet.'
      );
      return false;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      const isImage = fileType.startsWith('image/');
      const isPdf =
        fileType === 'application/pdf' || fileName.endsWith('.pdf');

      // ❌ VIDEOS COMPLETELY REJECTED
      if (fileType.startsWith('video/')) {
        setError(
          'Les vidéos ne sont pas autorisées. Vous pouvez uniquement ajouter des images ou des fichiers PDF.'
        );
        return;
      }

      // ❌ Unsupported file
      if (!isImage && !isPdf) {
        setError(
          'Format non supporté. Seules les images et les fichiers PDF sont autorisés.'
        );
        return;
      }

      validFiles.push(file);

      newPreviews.push({
        url: URL.createObjectURL(file),
        type: isImage ? 'image' : 'pdf',
        name: file.name
      });
    });

    if (validFiles.length > 0) {
      setFilesTarget((prev) => [...prev, ...validFiles]);
      setPreviewsTarget((prev) => [...prev, ...newPreviews]);
    }

    return true;
  };

  // ==============================
  // CREATE FILE CHANGE
  // ==============================
  const handleFileChange = (e) => {
    setError('');

    const files = Array.from(e.target.files || []);

    processFiles(
      files,
      mediaFiles.length,
      setMediaFiles,
      setMediaPreviews
    );

    // Allow selecting the same file again
    e.target.value = '';
  };

  // ==============================
  // EDIT FILE CHANGE
  // ==============================
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

  // ==============================
  // REMOVE CREATE FILE
  // ==============================
  const removeSelectedFile = (index) => {
    if (mediaPreviews[index]) {
      URL.revokeObjectURL(mediaPreviews[index].url);
    }

    setMediaFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setMediaPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==============================
  // REMOVE EDIT FILE
  // ==============================
  const removeEditSelectedFile = (index) => {
    if (editMediaPreviews[index]) {
      URL.revokeObjectURL(editMediaPreviews[index].url);
    }

    setEditMediaFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setEditMediaPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==============================
  // REMOVE EXISTING MEDIA
  // ==============================
  const removeExistingMediaLocal = (mediaItem) => {
    setExistingMedia((prev) =>
      prev.filter((item) => item.url !== mediaItem.url)
    );

    setMediaToDelete((prev) => [
      ...prev,
      mediaItem.url
    ]);
  };

  // ==============================
  // CREATE PROJECT
  // ==============================
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

      setError(
        err.response?.data?.message ||
          'Erreur lors de la publication.'
      );
    }
  };

  // ==============================
  // EDIT PROJECT
  // ==============================
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

      formData.append(
        'mediaToDelete',
        JSON.stringify(mediaToDelete)
      );

      editMediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const res = await axios.put(
        `${BACKEND_URL}/api/project/${projectId}`,
        formData,
        getAuthHeader('multipart/form-data')
      );

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? res.data : p
        )
      );

      editMediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });

      setEditingId(null);
      setEditMediaFiles([]);
      setEditMediaPreviews([]);
      setMediaToDelete([]);

      setSelectedMediaIndex((prev) => ({
        ...prev,
        [projectId]: 0
      }));

      setSuccess(
        'Portfolio mis à jour avec succès !'
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Erreur lors de la modification.'
      );
    }
  };

  // ==============================
  // DELETE PROJECT
  // ==============================
  const handleDelete = async (projectId) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce projet ?')) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/project/${projectId}`,
        getAuthHeader()
      );

      setProjects((prev) =>
        prev.filter((p) => p._id !== projectId)
      );

      setSuccess('Projet supprimé avec succès.');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression.');
    }
  };

  // ==============================
  // START EDIT
  // ==============================
  const startEditing = (project) => {
    setEditingId(project._id);

    setEditTitle(project.title);
    setEditDescription(project.description);

    setEditTechs(
      Array.isArray(project.technologies)
        ? project.technologies.join(', ')
        : project.technologies || ''
    );

    setEditGithub(project.githubUrl || '');
    setEditDemo(project.demoUrl || '');

    if (project.media && project.media.length > 0) {
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

  // ==============================
  // CANCEL EDIT
  // ==============================
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
    <div
      className="min-h-screen text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        backgroundImage: `
          linear-gradient(
            to bottom,
            var(--home-overlay-1),
            var(--home-overlay-2)
          ),
          url(${tradPattern})
        `,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat'
      }}
    >
      <Navbar
        hasNewNotification={hasNewNotification}
        clearNotifications={clearNotifications}
      />

      <div className="max-w-5xl mx-auto px-4 py-10 w-full overflow-hidden flex-1">

        {/* ==============================
            PAGE HEADER
        ============================== */}
        <div className="mb-10 relative overflow-hidden">

          <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="absolute -top-10 right-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-[0.18em]">
              <Sparkles size={12} />
              Student Showcase
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Showcase des projets

              <span className="block sm:inline bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                {' '}et expériences
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
              Découvrez, présentez et partagez vos projets,
              recherches, réalisations et compétences avec la
              communauté HITAS.
            </p>

          </div>
        </div>

        {/* ==============================
            CREATE PROJECT
        ============================== */}
        <div className="bg-white/80 dark:bg-[#0b081e]/85 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-indigo-900/60 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 mb-12 transition-all duration-300 overflow-hidden">

          <div className="flex items-start justify-between gap-4 mb-7">

            <div className="flex items-start gap-3">

              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <Plus size={19} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Partager un projet
                </h2>

                <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                  Ajoutez une réalisation à votre portfolio étudiant.
                </p>
              </div>

            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-500">
              <FolderOpen size={12} />
              Portfolio
            </div>

          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                placeholder="Nom du projet, de la recherche ou de la réalisation"
                className="bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-zinc-100 shadow-inner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="Outils, matières, technologies ou compétences..."
                className="bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-zinc-100 shadow-inner"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
              />

            </div>

            <textarea
              rows="3"
              placeholder="Décrivez votre projet, vos objectifs ou votre accomplissement..."
              className="w-full bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-zinc-100 resize-none leading-relaxed shadow-inner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                placeholder="Lien du projet / Rapport / Documentation"
                className="bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:placeholder-zinc-500 text-slate-700 dark:text-zinc-300 shadow-inner"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />

              <input
                type="text"
                placeholder="Lien de démonstration ou portfolio externe"
                className="bg-slate-50 dark:bg-[#030014]/80 border border-slate-200 dark:border-indigo-950/80 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:placeholder-zinc-500 text-slate-700 dark:text-zinc-300 shadow-inner"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />

            </div>

            {/* ==============================
                CREATE PREVIEWS
            ============================== */}
            {mediaPreviews.length > 0 && (
              <div className="bg-slate-100 dark:bg-[#030014]/60 border border-slate-200 dark:border-indigo-950/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-inner">

                {mediaPreviews.map((preview, index) => (

                  <div
                    key={index}
                    className="relative bg-white dark:bg-[#030014] rounded-xl border border-slate-200 dark:border-indigo-950 overflow-hidden flex flex-col p-2 shadow-md"
                  >

                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute top-2 right-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] z-10 transition shadow-lg active:scale-90"
                    >
                      ✕
                    </button>

                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/40 flex items-center justify-center mb-2">

                      {preview.type === 'image' && (
                        <img
                          src={preview.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}

                      {preview.type === 'pdf' && (
                        <span className="text-3xl">
                          📄
                        </span>
                      )}

                    </div>

                    <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-medium truncate w-full px-1 text-center">
                      {preview.name}
                    </span>

                  </div>

                ))}

              </div>
            )}

            {/* ==============================
                FILE UPLOAD
            ============================== */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-200 dark:border-indigo-950/60">

              <label className="group relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full min-h-[100px] px-5 py-5 rounded-2xl border border-dashed border-slate-300 dark:border-indigo-900/70 bg-slate-50/70 dark:bg-[#030014]/50 hover:border-indigo-500/60 hover:bg-indigo-500/[0.04] cursor-pointer transition-all duration-300">

                <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>

                <div className="text-center sm:text-left">

                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Ajouter des fichiers
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1">
                    Images ou PDF · maximum 6 fichiers
                  </p>

                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                <Upload size={14} />
                Publier le projet
              </button>

            </div>

          </form>

        </div>

        {/* ==============================
            PROJECT LIST
        ============================== */}
        {loading ? (

          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white/40 dark:bg-[#0b081e]/40 backdrop-blur-sm rounded-2xl">

            <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />

            <div className="text-slate-500 dark:text-zinc-400 text-xs font-bold tracking-widest uppercase animate-pulse">
              Chargement de la galerie...
            </div>

          </div>

        ) : (

          <div className="space-y-8">

            {projects.map((project) => {

              const activeIndex =
                selectedMediaIndex[project._id] ?? 0;

              const hasMultipleMedia =
                project.media &&
                project.media.length > 0;

              const currentMedia =
                hasMultipleMedia
                  ? project.media[activeIndex]
                  : null;

              const currentFileName =
                getFileName(currentMedia);

              return (

                <div
                  key={project._id}
                  id={`project-${project._id}`}
                  className="group relative overflow-hidden bg-white/80 dark:bg-[#090719]/85 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/[0.07] shadow-xl shadow-slate-200/40 dark:shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/[0.06] p-5 sm:p-7 lg:p-8"
                >

                  {/* META */}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500 dark:text-zinc-500 mb-5">

                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={11} />
                      {project.firstName} {project.lastName}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={11} />
                      {new Date(project.date).toLocaleDateString()}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  {project.user === loggedInUserId &&
                    editingId !== project._id && (

                      <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">

                        <button
                          onClick={() => startEditing(project)}
                          className="text-[11px] text-slate-700 dark:text-zinc-300 hover:text-white bg-slate-100 dark:bg-[#0b081e]/80 hover:bg-indigo-600 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-indigo-900/60 transition-all font-medium backdrop-blur shadow-md"
                        >
                          ✏️ Modifier
                        </button>

                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-[11px] text-slate-700 dark:text-zinc-400 hover:text-rose-400 bg-slate-100 dark:bg-[#0b081e]/80 hover:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-indigo-900/60 transition-all font-medium backdrop-blur shadow-md"
                        >
                          🗑️ Supprimer
                        </button>

                      </div>
                    )}

                  {/* ==============================
                      EDIT MODE
                  ============================== */}

                  {editingId === project._id ? (

                    <div className="space-y-5 mt-2 bg-slate-50 dark:bg-[#030014]/60 backdrop-blur-sm p-5 rounded-xl border border-slate-200 dark:border-indigo-950/80 overflow-hidden">

                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
                        Modifier votre Portfolio
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>

                          <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1 uppercase tracking-wider">
                            Titre du projet
                          </label>

                          <input
                            type="text"
                            className="w-full bg-white dark:bg-[#0b081e]/80 border border-slate-200 dark:border-indigo-900/60 px-3 py-2 text-sm rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                            value={editTitle}
                            onChange={(e) =>
                              setEditTitle(e.target.value)
                            }
                          />

                        </div>

                        <div>

                          <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1 uppercase tracking-wider">
                            Technologies
                          </label>

                          <input
                            type="text"
                            className="w-full bg-white dark:bg-[#0b081e]/80 border border-slate-200 dark:border-indigo-900/60 px-3 py-2 text-sm rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                            value={editTechs}
                            onChange={(e) =>
                              setEditTechs(e.target.value)
                            }
                          />

                        </div>

                      </div>

                      <div>

                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-1 uppercase tracking-wider">
                          Description
                        </label>

                        <textarea
                          className="w-full bg-white dark:bg-[#0b081e]/80 border border-slate-200 dark:border-indigo-900/60 px-3 py-2 text-sm rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed shadow-inner"
                          rows="3"
                          value={editDescription}
                          onChange={(e) =>
                            setEditDescription(e.target.value)
                          }
                        />

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                        <input
                          type="text"
                          className="w-full bg-white dark:bg-[#0b081e]/80 border border-slate-200 dark:border-indigo-900/60 px-3 py-2 text-xs rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                          value={editGithub}
                          onChange={(e) =>
                            setEditGithub(e.target.value)
                          }
                          placeholder="GitHub URL"
                        />

                        <input
                          type="text"
                          className="w-full bg-white dark:bg-[#0b081e]/80 border border-slate-200 dark:border-indigo-900/60 px-3 py-2 text-xs rounded-xl text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                          value={editDemo}
                          onChange={(e) =>
                            setEditDemo(e.target.value)
                          }
                          placeholder="Démo Live URL"
                        />

                      </div>

                      {/* ==============================
                          EXISTING MEDIA
                      ============================== */}

                      <div className="border-t border-slate-200 dark:border-indigo-950/60 pt-4">

                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-2 uppercase tracking-widest">
                          📁 Gestion des fichiers
                        </label>

                        <div className="mb-4 bg-white dark:bg-[#030014] p-4 rounded-xl border border-slate-200 dark:border-indigo-950/60 shadow-inner">

                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mb-2.5">
                            Fichiers sauvegardés :
                          </p>

                          {existingMedia.length === 0 ? (

                            <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                              Aucun fichier persistant.
                            </p>

                          ) : (

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                              {existingMedia.map(
                                (mediaItem, idx) => (

                                  <div
                                    key={idx}
                                    className="relative bg-slate-50 dark:bg-[#0b081e] rounded-lg border border-slate-200 dark:border-indigo-900/50 overflow-hidden flex flex-col p-2"
                                  >

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeExistingMediaLocal(
                                          mediaItem
                                        )
                                      }
                                      className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-20 shadow hover:bg-rose-700 transition"
                                    >
                                      ✕
                                    </button>

                                    <div className="aspect-video w-full rounded bg-black/40 flex items-center justify-center mb-1 overflow-hidden">

                                      {mediaItem.type === 'image' && (
                                        <img
                                          src={formatMediaUrl(
                                            mediaItem.url
                                          )}
                                          className="w-full h-full object-cover"
                                          alt=""
                                        />
                                      )}

                                      {mediaItem.type === 'pdf' && (
                                        <span className="text-xl">
                                          📄
                                        </span>
                                      )}

                                    </div>

                                    <span className="text-[9px] text-slate-700 dark:text-zinc-300 truncate text-center">
                                      {getFileName(mediaItem)}
                                    </span>

                                  </div>

                                )
                              )}

                            </div>
                          )}

                        </div>

                        {/* ==============================
                            ADD NEW MEDIA
                        ============================== */}

                        <div className="bg-slate-100 dark:bg-[#0b081e]/80 p-4 rounded-xl border border-slate-200 dark:border-indigo-900/60 flex flex-col gap-3 shadow-inner">

                          <span className="text-[10px] text-slate-600 dark:text-zinc-400">
                            Ajouter de nouveaux fichiers :
                          </span>

                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleEditFileChange}
                            className="text-xs text-slate-600 dark:text-zinc-400 file:bg-white dark:file:bg-[#030014] file:text-slate-700 dark:file:text-zinc-300 file:border file:border-slate-300 dark:file:border-indigo-950 file:px-2.5 file:py-1 file:rounded-lg cursor-pointer hover:file:border-indigo-800 transition"
                          />

                          {editMediaPreviews.length > 0 && (

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white dark:bg-[#030014] p-2 rounded-lg border border-indigo-500/20 mt-1">

                              {editMediaPreviews.map(
                                (preview, idx) => (

                                  <div
                                    key={idx}
                                    className="relative bg-slate-50 dark:bg-[#0b081e] border border-amber-500/40 rounded-lg overflow-hidden flex flex-col p-2"
                                  >

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeEditSelectedFile(
                                          idx
                                        )
                                      }
                                      className="absolute top-1.5 right-1.5 bg-zinc-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-10 hover:bg-rose-600 transition"
                                    >
                                      ✕
                                    </button>

                                    <div className="aspect-video w-full rounded bg-black/40 flex items-center justify-center mb-1 overflow-hidden">

                                      {preview.type === 'image' && (
                                        <img
                                          src={preview.url}
                                          className="w-full h-full object-cover"
                                          alt=""
                                        />
                                      )}

                                      {preview.type === 'pdf' && (
                                        <span className="text-xl">
                                          📄
                                        </span>
                                      )}

                                    </div>

                                    <span className="text-[9px] text-amber-600 dark:text-amber-300 truncate text-center">
                                      {preview.name}
                                    </span>

                                  </div>

                                )
                              )}

                            </div>
                          )}

                        </div>

                      </div>

                      {/* EDIT BUTTONS */}

                      <div className="flex gap-2 justify-end text-xs pt-3 border-t border-slate-200 dark:border-indigo-950/60">

                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-transparent border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-zinc-400 rounded-xl hover:text-slate-900 dark:hover:text-white transition"
                        >
                          Annuler
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditSubmit(project._id)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-md transition hover:scale-[1.01] active:scale-95"
                        >
                          Sauvegarder
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* ==============================
                        NORMAL PROJECT VIEW
                    ============================== */

                    <div className="overflow-hidden">

                      <div className="pr-0 sm:pr-24 overflow-hidden">

                        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">
                          {project.title}
                        </h3>

                        <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-1.5 truncate">
                          <span>
                            Par {project.firstName}{' '}
                            {project.lastName}
                          </span>

                          <span>•</span>

                          <span>
                            {new Date(
                              project.date
                            ).toLocaleDateString()}
                          </span>
                        </p>

                      </div>

                      <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed mb-5 whitespace-pre-wrap font-normal break-words">
                        {project.description}
                      </p>

                      {/* TECHNOLOGIES */}

                      {project.technologies &&
                        project.technologies.length > 0 && (

                          <div className="flex flex-wrap gap-1.5 mb-5 overflow-hidden">

                            {project.technologies.map(
                              (tech, i) => (

                                <span
                                  key={i}
                                  className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-md font-medium break-all"
                                >
                                  {tech}
                                </span>

                              )
                            )}

                          </div>
                        )}

                      {/* ==============================
                          MEDIA
                      ============================== */}

                      {currentMedia &&
                        currentMedia.url && (

                          <div className="mb-6 overflow-hidden">

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
                                {activeIndex + 1} /{' '}
                                {project.media.length}
                              </span>

                            </div>

                            <div className="rounded-b-xl overflow-hidden border border-slate-200 dark:border-indigo-900/40 bg-slate-100 dark:bg-[#030014]/60 h-[260px] sm:h-[400px] w-full flex items-center justify-center relative shadow-inner">

                              {currentMedia.type === 'pdf' ? (

                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/40 dark:bg-[#0b081e]/40 p-6 text-center">

                                  <span className="text-5xl mb-4">
                                    📄
                                  </span>

                                  <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4 font-medium truncate max-w-xs">
                                    {currentFileName}
                                  </p>

                                  <a
                                    href={formatMediaUrl(
                                      currentMedia.url
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition active:scale-95"
                                  >
                                    Ouvrir le document PDF
                                  </a>

                                </div>

                              ) : (

                                <img
                                  src={formatMediaUrl(
                                    currentMedia.url
                                  )}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />

                              )}

                            </div>

                            {/* THUMBNAILS */}

                            {hasMultipleMedia &&
                              project.media.length > 1 && (

                                <div className="flex gap-2.5 overflow-x-auto pb-2 mt-3 scrollbar-none">

                                  {project.media.map(
                                    (mediaItem, index) => (

                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                          setSelectedMediaIndex(
                                            (prev) => ({
                                              ...prev,
                                              [project._id]:
                                                index
                                            })
                                          )
                                        }
                                        className={`w-16 h-11 rounded-lg border overflow-hidden bg-white dark:bg-[#030014] shrink-0 flex items-center justify-center transition-all ${
                                          activeIndex === index
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 opacity-100 scale-102 shadow-md'
                                            : 'border-slate-300 dark:border-indigo-950 opacity-40 hover:opacity-70'
                                        }`}
                                      >

                                        {mediaItem.type ===
                                          'image' && (
                                          <img
                                            src={formatMediaUrl(
                                              mediaItem.url
                                            )}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        )}

                                        {mediaItem.type ===
                                          'pdf' && (
                                          <span className="text-xs">
                                            📄
                                          </span>
                                        )}

                                      </button>

                                    )
                                  )}

                                </div>
                              )}

                          </div>
                        )}

                      {/* LINKS */}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">

                        {project.githubUrl && (

                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-slate-100 dark:bg-[#0b081e]/60 hover:bg-slate-200 dark:hover:bg-[#0b081e] border border-slate-200 dark:border-indigo-900/60 text-center text-xs py-2.5 rounded-xl text-slate-700 dark:text-zinc-300 font-bold transition shadow-sm hover:text-slate-900 dark:hover:text-white truncate px-2"
                          >
                            Lien du projet / Rapport
                          </a>

                        )}

                        {project.demoUrl && (

                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-center text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/10 hover:opacity-95 hover:scale-[1.01] active:scale-98 transition truncate px-2"
                          >
                            🌐 Lien externe
                          </a>

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