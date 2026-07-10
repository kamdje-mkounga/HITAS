import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
// Fonction pour nettoyer et formater les URLs absolues ou relatives
const formatMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = 'https://hitas.onrender.com';
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Showcase = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  
  // Gestion multi-fichiers (Création)
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  
  // 🛠️ Gestion fine des fichiers existants lors de la modification
  const [existingMedia, setExistingMedia] = useState([]); // Fichiers restants du projet
  const [mediaToDelete, setMediaToDelete] = useState([]);   // URLs des fichiers à retirer du serveur
  
  // Gestion des nouveaux fichiers ajoutés durant la modification
  const [editMediaFiles, setEditMediaFiles] = useState([]);
  const [editMediaPreviews, setEditMediaPreviews] = useState([]);
  
  const [selectedMediaIndex, setSelectedMediaIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour les champs d'édition
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
      // 🛠️ Filtrer pour ne garder que les projets de l'utilisateur connecté
      const userProjects = res.data.filter(project => project.user === loggedInUserId);
      setProjects(userProjects);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des projets.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects().then(() => {
      if (location.state?.scrollToId) {
        setTimeout(() => {
          const element = document.getElementById(`project-${location.state.scrollToId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('border-indigo-500/40', 'bg-indigo-500/[0.03]', 'shadow-2xl', 'shadow-indigo-500/10');
            setTimeout(() => element.classList.remove('border-indigo-500/40', 'bg-indigo-500/[0.03]', 'shadow-2xl', 'shadow-indigo-500/10'), 3000);
          }
        }, 100);
      }
    });
  }, [location]);

  const processFiles = (files, currentFilesCount, setFilesTarget, setPreviewsTarget) => {
    if (files.length === 0) return false;
    if (files.length + currentFilesCount > 6) {
      setError('Vous pouvez téléverser un maximum de 6 fichiers par projet.');
      return false;
    }

    const newPreviews = [];
    const validFiles = [];

    files.forEach((file) => {
      const fileType = file.type.toLowerCase();
      const isPdf = fileType === 'application/pdf' || file.name.endsWith('.pdf');

      if (fileType.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 180) {
            setError('L’une de vos vidéos dépasse la limite autorisée de 3 minutes.');
          } else {
            setFilesTarget(prev => [...prev, file]);
            setPreviewsTarget(prev => [...prev, { url: URL.createObjectURL(file), type: 'video', name: file.name }]);
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (fileType.startsWith('image/')) {
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'image', name: file.name });
      } else if (isPdf) {
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'pdf', name: file.name });
      } else {
        setError('Format de fichier non supporté.');
      }
    });

    if (validFiles.length > 0) {
      setFilesTarget(prev => [...prev, ...validFiles]);
      setPreviewsTarget(prev => [...prev, ...newPreviews]);
    }
    return true;
  };

  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    processFiles(files, mediaFiles.length, setMediaFiles, setMediaPreviews);
  };

  const handleEditFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    processFiles(files, existingMedia.length + editMediaFiles.length, setEditMediaFiles, setEditMediaPreviews);
  };

  const removeSelectedFile = (index) => {
    if (mediaPreviews[index]) URL.revokeObjectURL(mediaPreviews[index].url);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditSelectedFile = (index) => {
    if (editMediaPreviews[index]) URL.revokeObjectURL(editMediaPreviews[index].url);
    setEditMediaFiles(prev => prev.filter((_, i) => i !== index));
    setEditMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMediaLocal = (mediaItem) => {
    setExistingMedia(prev => prev.filter(item => item.url !== mediaItem.url));
    setMediaToDelete(prev => [...prev, mediaItem.url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!title.trim() || !description.trim()) return setError('Champs obligatoires.');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('technologies', technologies);
      formData.append('githubUrl', githubUrl);
      formData.append('demoUrl', demoUrl);
      mediaFiles.forEach(file => formData.append('media', file));

      const res = await axios.post(`${BACKEND_URL}/api/project`, formData, getAuthHeader('multipart/form-data'));
      setProjects([res.data, ...projects]);
      setTitle(''); setDescription(''); setTechnologies(''); setGithubUrl(''); setDemoUrl('');
      setMediaFiles([]); setMediaPreviews([]);
      setSuccess('Projet partagé avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    }
  };

  const handleEditSubmit = async (projectId) => {
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('technologies', editTechs);
      formData.append('githubUrl', editGithub);
      formData.append('demoUrl', editDemo);
      formData.append('mediaToDelete', JSON.stringify(mediaToDelete));

      if (editMediaFiles.length > 0) {
        editMediaFiles.forEach(file => formData.append('media', file));
      }

      const res = await axios.put(`${BACKEND_URL}/api/project/${projectId}`, formData, getAuthHeader('multipart/form-data'));

      setProjects(projects.map(p => p._id === projectId ? res.data : p));
      setEditingId(null);
      setEditMediaFiles([]);
      setEditMediaPreviews([]);
      setMediaToDelete([]);
      setSelectedMediaIndex(prev => ({ ...prev, [projectId]: 0 }));
      setSuccess('Portfolio mis à jour avec succès !');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification.');
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Voulez-vous vraiment retirer ce projet ?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/project/${projectId}`, getAuthHeader());
        setProjects(projects.filter(p => p._id !== projectId));
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-zinc-950 to-black text-slate-100 antialiased">
    <div className="max-w-5xl mx-auto px-4 py-10 text-slate-100 ">
      
      {/* HEADER DE PAGE */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
          Showcase des Projets et Expériences
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Découvrez et gérez les créations et applications codées par les étudiants de HITAS.
        </p>
      </div>

      {/* FORMULAIRE DE CRÉATION DE PROJET */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-xl shadow-black/30 mb-12">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partager un projet ou une experience</h2>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input 
              type="text" 
              placeholder="Nom du projet ou de l'expérience" 
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-500 text-slate-200" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Technologies , Outils , poste, etc... " 
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-500 text-slate-200" 
              value={technologies} 
              onChange={(e) => setTechnologies(e.target.value)} 
            />
          </div>
          
          <textarea 
            rows="3" 
            placeholder="Décrivez votre application, vos objectifs et votre accomplissement..." 
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-500 text-slate-200 resize-none leading-relaxed" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input 
              type="text" 
              placeholder="Lien GitHub" 
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-500 text-slate-300" 
              value={githubUrl} 
              onChange={(e) => setGithubUrl(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Lien Démo Live" 
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-500 text-slate-300" 
              value={demoUrl} 
              onChange={(e) => setDemoUrl(e.target.value)} 
            />
          </div>

          {/* PREVIEWS COMPOSANTE STYLE WHATSAPP MODERNE */}
          {mediaPreviews.length > 0 && (
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group shadow-md shadow-black/20">
                  <button 
                    type="button" 
                    onClick={() => removeSelectedFile(index)} 
                    className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] z-10 transition shadow-lg active:scale-90"
                  >
                    ✕
                  </button>
                  {preview.type === 'image' && <img src={preview.url} alt="" className="w-full h-full object-cover" />}
                  {preview.type === 'video' && <video src={preview.url} className="w-full h-full object-cover" />}
                  {preview.type === 'pdf' && (
                    <div className="text-[10px] text-rose-400 font-bold p-2 text-center truncate w-full flex flex-col items-center gap-1">
                      <span className="text-xl">📄</span>
                      <span className="text-[9px] text-slate-400 font-normal truncate w-full">{preview.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ACTIONS ACTIONS DU FORMULAIRE */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-800/60">
            <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="bg-slate-950/80 border border-slate-800 group-hover:border-indigo-500/50 px-3 py-2 rounded-xl transition-all font-medium text-slate-300">
                Choisir des fichiers
              </span>
              <span className="text-slate-500 group-hover:text-slate-400 transition-colors">Images, PDF ou Vidéos (max 3 min)</span>
              <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10"
            >
              Soumettre le projet
            </button>
          </div>
        </form>
      </div>

      {/* GRILLE / LISTE DES CARTES PROJETS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-xs font-bold tracking-widest uppercase animate-pulse">Chargement de la galerie...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => {
            const activeIndex = selectedMediaIndex[project._id] ?? 0;
            const hasMultipleMedia = project.media && project.media.length > 0;
            const currentMedia = hasMultipleMedia ? project.media[activeIndex] : null;

            return (
              <div 
                key={project._id} 
                id={`project-${project._id}`} 
                className="bg-slate-900/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800/60 relative group transition-all duration-300 hover:border-slate-700/60 shadow-xl shadow-black/10"
              >
                
                {/* ACTIONS EDIT/DELETE POUR PROPRIÉTAIRE */}
                {project.user === loggedInUserId && editingId !== project._id && (
                  <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => {
                        setEditingId(project._id);
                        setEditTitle(project.title);
                        setEditDescription(project.description);
                        setEditTechs(project.technologies ? project.technologies.join(', ') : '');
                        setEditGithub(project.githubUrl || '');
                        setEditDemo(project.demoUrl || '');
                        
                        if (project.media && project.media.length > 0) {
                          setExistingMedia(project.media);
                        } else if (project.mediaUrl) {
                          setExistingMedia([{ url: project.mediaUrl, type: project.mediaType || 'image' }]);
                        } else {
                          setExistingMedia([]);
                        }
                        setMediaToDelete([]);
                        setEditMediaFiles([]);
                        setEditMediaPreviews([]);
                      }}
                      className="text-[11px] text-slate-300 hover:text-white bg-slate-950/80 hover:bg-indigo-600 px-3 py-1.5 rounded-xl border border-slate-800/80 transition-all font-medium backdrop-blur shadow-md"
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(project._id)} 
                      className="text-[11px] text-slate-400 hover:text-rose-400 bg-slate-950/80 hover:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-slate-800/80 transition-all font-medium backdrop-blur shadow-md"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}

                {/* ZONE RENDU : MODE ÉDITION ACTIF */}
                {editingId === project._id ? (
                  <div className="space-y-5 mt-2 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Modifier votre Portfolio</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Titre du projet</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-sm rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)}/>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Technologies (Séparées par virgules)</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-sm rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500" value={editTechs} onChange={(e)=>setEditTechs(e.target.value)}/>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Description</label>
                      <textarea className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-sm rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed" rows="3" value={editDescription} onChange={(e)=>setEditDescription(e.target.value)}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500" value={editGithub} onChange={(e)=>setEditGithub(e.target.value)} placeholder="GitHub URL"/>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500" value={editDemo} onChange={(e)=>setEditDemo(e.target.value)} placeholder="Démo Live URL"/>
                    </div>

                    {/* FINE MANAGEMENT WHATSAPP STYLE EN ÉDITION */}
                    <div className="border-t border-slate-800/60 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">📁 Gestion Fine des Fichiers</label>
                      
                      {/* 1. Fichiers stockés sur le serveur */}
                      <div className="mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                        <p className="text-[10px] text-slate-400 mb-2.5">Fichiers sauvegardés (Cliquez sur ✕ pour supprimer) :</p>
                        {existingMedia.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Aucun fichier persistant.</p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {existingMedia.map((mediaItem, idx) => (
                              <div key={idx} className="relative aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                                <button 
                                  type="button" 
                                  onClick={() => removeExistingMediaLocal(mediaItem)} 
                                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-20 shadow hover:bg-rose-700 transition"
                                >
                                  ✕
                                </button>
                                {mediaItem.type === 'image' && <img src={`${BACKEND_URL}${mediaItem.url}`} className="w-full h-full object-cover" alt="" />}
                                {mediaItem.type === 'video' && <video src={`${BACKEND_URL}${mediaItem.url}`} className="w-full h-full object-cover" />}
                                {mediaItem.type === 'pdf' && <span className="text-[9px] text-rose-400 font-bold">📄 PDF</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Ajout de nouveaux éléments */}
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/60 flex flex-col gap-3">
                        <span className="text-[10px] text-slate-400">Ajouter de nouveaux médias :</span>
                        <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleEditFileChange} className="text-xs text-slate-400 file:bg-slate-900 file:text-slate-300 file:border file:border-slate-800 file:px-2.5 file:py-1 file:rounded-lg cursor-pointer" />
                        
                        {editMediaPreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-slate-950 p-2 rounded-lg border border-indigo-500/20 mt-1">
                            {editMediaPreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-video bg-slate-900 border border-amber-500/40 rounded-lg overflow-hidden flex items-center justify-center">
                                <button type="button" onClick={() => removeEditSelectedFile(idx)} className="absolute top-1 right-1 bg-slate-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-10 hover:bg-rose-600 transition">✕</button>
                                {preview.type === 'image' && <img src={preview.url} className="w-full h-full object-cover" alt="" />}
                                {preview.type === 'video' && <video src={preview.url} className="w-full h-full object-cover" />}
                                {preview.type === 'pdf' && <span className="text-[9px] text-amber-400 font-medium">📄 PDF</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end text-xs pt-3 border-t border-slate-800/60">
                      <button onClick={() => { setEditingId(null); setEditMediaFiles([]); setEditMediaPreviews([]); setMediaToDelete([]); }} className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition">Annuler</button>
                      <button onClick={() => handleEditSubmit(project._id)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-md transition hover:scale-[1.01] active:scale-95">Sauvegarder</button>
                    </div>
                  </div>
                ) : (
                  
                  /* ZONE RENDU : VISIONNAGE DU PORTFOLIO STANDARD */
                  <>
                    <div className="pr-0 sm:pr-24">
                      <h3 className="text-xl font-bold tracking-tight text-slate-50 mb-1 group-hover:text-indigo-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest flex items-center gap-1.5">
                        <span>Par {project.firstName} {project.lastName}</span>
                        <span>•</span>
                        <span>{new Date(project.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed mb-5 whitespace-pre-wrap font-normal">
                      {project.description}
                    </p>

                    {/* BADGES TECHNOLOGIES */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 text-[10px] px-2.5 py-0.5 rounded-md font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CONTENEUR MÉDIA PRINCIPAL ASYMETRIQUE */}
            {/* CONTENEUR MÉDIA PRINCIPAL ASYMETRIQUE */}
{currentMedia && currentMedia.url && (
  <div className="mb-6">
    <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/80 h-[260px] sm:h-[400px] w-full flex items-center justify-center relative shadow-inner">
      
      {currentMedia.type === 'video' ? (
        <video src={formatMediaUrl(currentMedia.url)} controls className="w-full h-full object-contain bg-slate-950" />
      ) : currentMedia.type === 'pdf' ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/40 p-6 text-center">
          <span className="text-5xl mb-4 animate-bounce">📄</span>
          <p className="text-xs text-slate-400 mb-4 font-medium">Document d'accompagnement ou cahier des charges PDF</p>
          <a 
            href={formatMediaUrl(currentMedia.url)} 
            target="_blank" 
            rel="noreferrer" 
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition active:scale-95"
          >
            Ouvrir le document PDF
          </a>
        </div>
      ) : (
        <img src={formatMediaUrl(currentMedia.url)} alt="" className="w-full h-full object-contain" />
      )}
    </div>

    {/* CAROUSEL WHATSAPP DE MINIATURES DES PIÈCES JOINTES */}
    {hasMultipleMedia && project.media.length > 1 && (
      <div className="flex gap-2.5 overflow-x-auto pb-2 mt-3 scrollbar-none">
        {project.media.map((mediaItem, index) => (
          <button 
            key={index} 
            onClick={() => setSelectedMediaIndex(prev => ({ ...prev, [project._id]: index }))} 
            className={`w-16 h-11 rounded-lg border overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center transition-all ${
              activeIndex === index 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 opacity-100 scale-102 shadow-md' 
                : 'border-slate-800 opacity-40 hover:opacity-70'
            }`}
          >
            {mediaItem.type === 'image' && <img src={formatMediaUrl(mediaItem.url)} alt="" className="w-full h-full object-cover" />}
            {mediaItem.type === 'video' && <span className="text-xs">🎥</span>}
            {mediaItem.type === 'pdf' && <span className="text-xs">📄</span>}
          </button>
        ))}
      </div>
    )}
  </div>
)}

                    {/* LIENS INTERACTIFS VERS CODE ET SITES */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-center text-xs py-2.5 rounded-xl text-slate-300 font-bold transition shadow-sm hover:text-white"
                        >
                          📦 Explorer le Code Source
                        </a>
                      )}
                      {project.demoUrl && (
                        <a 
                          href={project.demoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-center text-xs py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/10 hover:opacity-95 hover:scale-[1.01] active:scale-98 transition"
                        >
                          🌐 Visiter l'Application Live
                        </a>
                      )}
                    </div>
                  </>
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