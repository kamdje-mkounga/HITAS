import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

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

  const BACKEND_URL = 'http://localhost:5000';
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
      setProjects(res.data);
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
            element.classList.add('border-white/40', 'bg-white/[0.02]');
            setTimeout(() => element.classList.remove('border-white/40', 'bg-white/[0.02]'), 3000);
          }
        }, 100);
      }
    });
  }, [location]);

  const processFiles = (files, currentFilesCount, setFilesTarget, setPreviewsTarget) => {
    if (files.length === 0) return;
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
    // On calcule la limite sur la somme des fichiers restants + les nouveaux ajoutés
    processFiles(files, existingMedia.length + editMediaFiles.length, setEditMediaFiles, setEditMediaPreviews);
  };

  const removeSelectedFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditSelectedFile = (index) => {
    setEditMediaFiles(prev => prev.filter((_, i) => i !== index));
    setEditMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 🗑️ Retirer un fichier existant de l'affichage local et le marquer pour suppression
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
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('technologies', editTechs);
      formData.append('githubUrl', editGithub);
      formData.append('demoUrl', editDemo);
      
      // On envoie la liste des URLs à supprimer du dossier serveur et de Mongo
      formData.append('mediaToDelete', JSON.stringify(mediaToDelete));

      // On ajoute les nouveaux fichiers téléversés
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
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Showcase des Projets</h1>
      <p className="text-gray-400 mb-8 text-sm">Découvrez et gérez les créations et applications codées par les étudiants ITAS.</p>

      {/* Formulaire de création */}
      <div className="bg-[#141414] p-6 rounded-xl border border-white/5 mb-8">
        <h2 className="text-sm font-semibold mb-4 text-gray-300 uppercase tracking-wider">Partager un projet</h2>
        {error && <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-950/30 border border-green-900/50 text-green-400 p-3 rounded-lg text-sm mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du projet" className="bg-black border border-white/10 rounded-lg p-2.5 text-sm w-full focus:outline-none focus:border-white" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="text" placeholder="Technologies (React, Node)" className="bg-black border border-white/10 rounded-lg p-2.5 text-sm w-full focus:outline-none focus:border-white" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
          </div>
          <textarea rows="3" placeholder="Description..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white resize-none" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Lien GitHub" className="bg-black border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-white" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
            <input type="text" placeholder="Lien Démo Live" className="bg-black border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-white" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
          </div>

          {mediaPreviews.length > 0 && (
            <div className="bg-black/50 border border-white/5 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-white/10 bg-black flex items-center justify-center group">
                  <button type="button" onClick={() => removeSelectedFile(index)} className="absolute top-1 right-1 bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] z-10">✕</button>
                  {preview.type === 'image' && <img src={preview.url} alt="" className="w-full h-full object-cover" />}
                  {preview.type === 'video' && <div className="text-[10px] text-gray-400">🎥 Vidéo</div>}
                  {preview.type === 'pdf' && <div className="text-[10px] text-gray-400">📄 PDF : {preview.name}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileChange} className="text-xs text-gray-400 file:bg-black file:text-white file:border file:border-white/10 file:px-3 file:py-1.5 file:rounded-md cursor-pointer" />
            <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">Soumettre</button>
          </div>
        </form>
      </div>

      {/* Liste des cartes */}
      {loading ? (
        <div className="text-center text-gray-500 py-10 text-xs tracking-widest animate-pulse">CHARGEMENT...</div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const activeIndex = selectedMediaIndex[project._id] ?? 0;
            const hasMultipleMedia = project.media && project.media.length > 0;
            const currentMedia = hasMultipleMedia ? project.media[activeIndex] : null;

            return (
              <div key={project._id} id={`project-${project._id}`} className="bg-[#141414] p-6 rounded-xl border border-white/5 relative group">
                
                {project.user === loggedInUserId && editingId !== project._id && (
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button 
                      onClick={() => {
                        setEditingId(project._id);
                        setEditTitle(project.title);
                        setEditDescription(project.description);
                        setEditTechs(project.technologies ? project.technologies.join(', ') : '');
                        setEditGithub(project.githubUrl);
                        setEditDemo(project.demoUrl);
                        setExistingMedia(project.media || []); // 👈 On charge les médias actuels
                        setMediaToDelete([]);                  // Réinitialisation
                        setEditMediaFiles([]);
                        setEditMediaPreviews([]);
                      }}
                      className="text-xs text-gray-400 hover:text-white bg-black/60 px-2 py-1 rounded border border-white/5"
                    >
                      ✏️ Modifier
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="text-xs text-gray-400 hover:text-rose-400 bg-black/60 px-2 py-1 rounded border border-white/5">🗑️ Supprimer</button>
                  </div>
                )}

                {editingId === project._id ? (
                  <div className="space-y-4 mt-2 bg-black/30 p-4 rounded-xl border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">Titre</label>
                        <input type="text" className="w-full bg-black border border-white/20 p-2 text-sm rounded text-white" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)}/>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 block mb-1">Technologies</label>
                        <input type="text" className="w-full bg-black border border-white/20 p-2 text-sm rounded text-white" value={editTechs} onChange={(e)=>setEditTechs(e.target.value)}/>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 block mb-1">Description</label>
                      <textarea className="w-full bg-black border border-white/20 p-2 text-sm rounded text-white resize-none" rows="3" value={editDescription} onChange={(e)=>setEditDescription(e.target.value)}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input type="text" className="w-full bg-black border border-white/20 p-2 text-xs rounded text-white" value={editGithub} onChange={(e)=>setEditGithub(e.target.value)} placeholder="GitHub"/>
                      <input type="text" className="w-full bg-black border border-white/20 p-2 text-xs rounded text-white" value={editDemo} onChange={(e)=>setEditDemo(e.target.value)} placeholder="Démo"/>
                    </div>

                    {/* 🔥 GESTION INDIVIDUELLE ET EN DIRECT DES MÉDIAS */}
                    <div className="border-t border-white/5 pt-3">
                      <label className="text-[11px] text-gray-400 block mb-2 font-medium uppercase tracking-wider">📁 Gestion Fine des Fichiers</label>
                      
                      {/* 1. Liste des fichiers conservés / Bouton de suppression individuelle */}
                      <div className="mb-3 bg-zinc-950 p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-400 mb-2">Fichiers actuellement sauvegardés (clique sur ✕ pour retirer de la galerie) :</p>
                        {existingMedia.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">Aucun fichier restant dans ce portfolio.</p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {existingMedia.map((mediaItem, idx) => (
                              <div key={idx} className="relative aspect-video bg-black rounded border border-white/10 overflow-hidden flex items-center justify-center group">
                                <button 
                                  type="button" 
                                  onClick={() => removeExistingMediaLocal(mediaItem)} 
                                  className="absolute top-0.5 right-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-20"
                                  title="Supprimer ce fichier"
                                >
                                  ✕
                                </button>
                                {mediaItem.type === 'image' && <img src={`${BACKEND_URL}${mediaItem.url}`} className="w-full h-full object-cover" alt="" />}
                                {mediaItem.type === 'video' && <span className="text-xs">🎥</span>}
                                {mediaItem.type === 'pdf' && <span className="text-xs">📄 PDF</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Ajout simultané de nouveaux fichiers de complétion */}
                      <div className="bg-black p-3 rounded-lg border border-white/10 flex flex-col gap-2">
                        <span className="text-[10px] text-gray-400">Ajouter de nouveaux médias à ce projet :</span>
                        <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleEditFileChange} className="text-xs text-gray-400 file:bg-zinc-900 file:text-white file:border file:border-white/10 file:px-2 file:py-1 file:rounded cursor-pointer" />
                        
                        {editMediaPreviews.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2 rounded border border-white/5">
                            {editMediaPreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-video bg-black border border-white/10 rounded overflow-hidden flex items-center justify-center">
                                <button type="button" onClick={() => removeEditSelectedFile(idx)} className="absolute top-0.5 right-0.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] z-10">✕</button>
                                {preview.type === 'image' && <img src={preview.url} className="w-full h-full object-cover" alt="" />}
                                {preview.type === 'video' && <span className="text-[10px]">🎥</span>}
                                {preview.type === 'pdf' && <span className="text-[10px]">📄</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end text-xs pt-2 border-t border-white/5">
                      <button onClick={() => { setEditingId(null); setEditMediaFiles([]); setEditMediaPreviews([]); setMediaToDelete([]); }} className="px-4 py-2 bg-zinc-900 border border-white/10 text-gray-400 rounded-lg">Annuler</button>
                      <button onClick={() => handleEditSubmit(project._id)} className="px-4 py-2 bg-white text-black font-semibold rounded-lg">Sauvegarder le Portfolio</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold tracking-wide text-white mb-1 pr-24">{project.title}</h3>
                    <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-wider">Par {project.firstName} {project.lastName}</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{project.description}</p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.technologies.map((tech, i) => <span key={i} className="bg-zinc-900 text-zinc-400 text-[10px] px-2.5 py-1 rounded border border-white/5">{tech}</span>)}
                      </div>
                    )}

                    {currentMedia && currentMedia.url && (
                      <div className="mb-4">
                        <div className="rounded-lg overflow-hidden border border-white/5 bg-black/60 h-[380px] w-full flex items-center justify-center p-1 relative">
                          {currentMedia.type === 'video' ? (
                            <video src={`${BACKEND_URL}${currentMedia.url}`} controls className="w-full h-full object-contain" />
                          ) : currentMedia.type === 'pdf' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
                              <span className="text-5xl mb-3">📄</span>
                              <a href={`${BACKEND_URL}${currentMedia.url}`} target="_blank" rel="noreferrer" className="bg-white text-black px-4 py-2 rounded-md text-xs font-semibold">Ouvrir le document PDF</a>
                            </div>
                          ) : (
                            <img src={`${BACKEND_URL}${currentMedia.url}`} alt="" className="w-full h-full object-contain" />
                          )}
                        </div>

                        {hasMultipleMedia && project.media.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-none">
                            {project.media.map((mediaItem, index) => (
                              <button key={index} onClick={() => setSelectedMediaIndex(prev => ({ ...prev, [project._id]: index }))} className={`w-16 h-10 rounded border overflow-hidden bg-black shrink-0 flex items-center justify-center ${activeIndex === index ? 'border-white opacity-100' : 'border-white/10 opacity-50'}`}>
                                {mediaItem.type === 'image' && <img src={`${BACKEND_URL}${mediaItem.url}`} alt="" className="w-full h-full object-cover" />}
                                {mediaItem.type === 'video' && <span className="text-xs">🎥</span>}
                                {mediaItem.type === 'pdf' && <span className="text-xs">📄</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex-1 bg-white/5 border border-white/10 text-center text-xs py-2 rounded-lg text-gray-300 font-medium">📦 Code Source</a>}
                      {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-xs py-2 rounded-lg font-semibold text-white">🌐 Visiter l'application</a>}
                    </div>
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

export default Showcase;