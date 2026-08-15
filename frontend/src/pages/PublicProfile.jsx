import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';
import { 
  ArrowLeft, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  Rocket, 
  User, 
  FolderKanban, 
  FileText, 
  Sparkles, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileCode, 
  AlertTriangle 
} from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('compte');
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const BACKEND_URL = 'https://hitas.onrender.com';

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          } 
        };

        const profileRes = await API.get(`/profile/${id}`, headers);
        setUserProfile(profileRes.data);

        try {
          const projectsRes = await API.get(`/project`, headers);
          const filteredProjects = projectsRes.data.filter(
            project => (typeof project.user === 'object' ? project.user._id : project.user) === id
          );
          setUserProjects(filteredProjects);
        } catch (pErr) {
          console.error("Impossible de charger les projets", pErr);
        }

      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger le profil de cet étudiant.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicData();
  }, [id]);

  const handleOpenProject = (project) => {
    setSelectedProject(project);
    setCurrentFileIndex(0);
  };

  const formatMediaUrl = (urlData) => {
    if (!urlData) return '';
    let cleanUrl = '';
    
    if (typeof urlData === 'object' && urlData !== null) {
      cleanUrl = urlData.url || urlData.path || urlData.secure_url || '';
    } else if (typeof urlData === 'string') {
      cleanUrl = urlData;
    }

    if (!cleanUrl || typeof cleanUrl !== 'string') return '';
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    return `${BACKEND_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  const getFileName = (rawMedia) => {
    if (!rawMedia) return 'Fichier sans nom';
    if (typeof rawMedia === 'object' && rawMedia !== null) {
      if (rawMedia.originalName) return rawMedia.originalName;
      if (rawMedia.name) return rawMedia.name;
    }
    const urlStr = typeof rawMedia === 'string' ? rawMedia : (rawMedia.url || rawMedia.path || '');
    if (!urlStr) return 'Fichier joint';
    const parts = urlStr.split('/');
    const fullName = parts[parts.length - 1];
    return decodeURIComponent(fullName.split('?')[0]) || 'Fichier joint';
  };

  if (loading) {
    return (
      <div className="bg-[#030014] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="w-full min-h-screen bg-[#030014] text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-[#0b081e]/90 backdrop-blur-xl p-8 rounded-3xl border border-indigo-900/60 text-center max-w-sm w-full shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-red-300 text-xs mb-6 font-medium">{error || "Profil introuvable."}</p>
          <button onClick={() => navigate(-1)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20">Retour</button>
        </div>
      </div>
    );
  }

  const renderSkills = () => {
    if (!userProfile.skills) return null;
    const skillsArray = Array.isArray(userProfile.skills) 
      ? userProfile.skills 
      : typeof userProfile.skills === 'string'
        ? userProfile.skills.replace(/[\[\]"'\\]/g, '').split(',').map(s => s.trim())
        : [];
    
    return skillsArray.filter(Boolean).map((skill, index) => (
      <span key={index} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all hover:bg-indigo-500/20 flex items-center gap-1.5 w-fit">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {skill}
      </span>
    ));
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#030014] text-zinc-100 antialiased py-10 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white"
      style={{
        // Lowered opacity values (e.g., 0.45 and 0.55) make the background pattern brighter and clearer
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.45), rgba(3, 0, 20, 0.55)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="mb-6 group text-xs text-zinc-400 hover:text-white flex items-center gap-2 transition-all bg-[#0b081e]/60 backdrop-blur-md border border-indigo-900/40 px-3.5 py-2 rounded-xl w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Retour
        </button>

        {/* Profil Header */}
        <div className="bg-[#0b081e]/80 backdrop-blur-2xl p-8 rounded-3xl border border-indigo-500/20 shadow-2xl mb-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-extrabold uppercase shadow-xl overflow-hidden border-2 border-indigo-500/30 flex-shrink-0 bg-gradient-to-tr from-indigo-950 to-indigo-900/50">
            {userProfile.avatar ? (
              <img 
                src={formatMediaUrl(userProfile.avatar)} 
                alt={`${userProfile.firstName} ${userProfile.lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-300">
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase break-words bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              {userProfile.status && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm shadow-emerald-500/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {userProfile.status}
                </span>
              )}
            </div>

            <p className="text-indigo-400 text-xs font-semibold tracking-wide mb-1 flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap className="w-4 h-4" /> {userProfile.specialty || 'Informatique'} <span className="text-indigo-600">•</span> Promo {userProfile.promotion || 'Non renseignée'}
            </p>
            
            <p className="text-zinc-400 text-xs font-medium mb-3 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-500" /> {userProfile.country || userProfile.currentLocation || 'Localisation non renseignée'}
              {userProfile.degreeLevel && <span className="text-zinc-600">• <span className="text-zinc-300">{userProfile.degreeLevel}</span></span>}
            </p>

            {(userProfile.jobTitle || userProfile.currentCompany) && (
              <p className="text-zinc-300 text-xs font-medium mb-4 flex items-center justify-center sm:justify-start gap-1.5 bg-[#030014]/50 border border-indigo-900/30 px-3 py-1.5 rounded-xl w-fit mx-auto sm:mx-0">
                <Briefcase className="w-4 h-4 text-indigo-400" /> {userProfile.jobTitle || 'Poste'} {userProfile.currentCompany ? `chez ${userProfile.currentCompany}` : ''}
              </p>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
                <Rocket className="w-4 h-4 text-indigo-400" /> {userProjects.length} {userProjects.length > 1 ? 'Projets partagés' : 'Projet partagé'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-indigo-900/40 mb-8 gap-8 text-xs font-bold tracking-wider overflow-x-auto scrollbar-none">
          <button 
            type="button"
            onClick={() => setActiveTab('compte')}
            className={`pb-4 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${activeTab === 'compte' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <User className="w-4 h-4" /> L'Étudiant
            {activeTab === 'compte' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('projets')}
            className={`pb-4 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${activeTab === 'projets' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Rocket className="w-4 h-4" /> Ses Projets ({userProjects.length})
            {activeTab === 'projets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>}
          </button>
        </div>

        {/* Tab: Compte */}
        {activeTab === 'compte' && (
          <div className="space-y-6">
            <div className="bg-[#0b081e]/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl overflow-hidden">
              <h2 className="text-xs font-bold mb-6 text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Informations Générales
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Prénom</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.firstName || '-'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Nom de famille</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.lastName || '-'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Promotion</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.promotion || '-'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Spécialité</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.specialty || '-'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Statut Actuel</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.status || 'Non renseigné'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Niveau d'étude</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.degreeLevel || 'Non renseigné'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Pays</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.country || '-'}</span>
                </div>
                <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Ville / Emplacement</span>
                  <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.currentLocation || '-'}</span>
                </div>
              </div>

              {(userProfile.jobTitle || userProfile.currentCompany) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                  <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                    <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Intitulé du Poste</span>
                    <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.jobTitle || '-'}</span>
                  </div>
                  <div className="bg-[#030014]/70 p-4 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/30 transition-all">
                    <span className="text-zinc-500 block mb-1 uppercase text-[10px] font-bold tracking-wider">Entreprise</span>
                    <span className="text-zinc-100 font-semibold text-sm break-words">{userProfile.currentCompany || '-'}</span>
                  </div>
                </div>
              )}

              <div className="bg-[#030014]/70 p-4 sm:p-5 rounded-2xl border border-indigo-900/40 text-xs mb-4">
                <span className="text-zinc-500 block mb-2 uppercase text-[10px] font-bold tracking-wider">Biographie</span>
                <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-line break-words">{userProfile.bio || "Cet étudiant n'a pas encore rédigé de biographie."}</p>
              </div>

              <div className="bg-[#030014]/70 p-4 sm:p-5 rounded-2xl border border-indigo-900/40 text-xs">
                <span className="text-zinc-500 block mb-3 uppercase text-[10px] font-bold tracking-wider">Compétences</span>
                <div className="flex flex-wrap gap-2">
                  {renderSkills() || <span className="text-zinc-500 italic text-xs">Aucune compétence renseignée.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Projets */}
        {activeTab === 'projets' && (
          <div className="space-y-4">
            {userProjects.length === 0 ? (
              <div className="bg-[#0b081e]/80 backdrop-blur-2xl border border-indigo-500/20 p-12 rounded-3xl text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <p className="text-zinc-400 text-xs italic">Cet étudiant n'a pas encore publié de projet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userProjects.map((project) => {
                  const potentialMedia = project.media || project.file || project.pdf || project.image || project.attachments;
                  const mediaCount = Array.isArray(potentialMedia) ? potentialMedia.length : (potentialMedia ? 1 : 0);

                  return (
                    <div 
                      key={project._id} 
                      onClick={() => handleOpenProject(project)}
                      className="bg-[#0b081e]/80 backdrop-blur-2xl p-6 rounded-3xl border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all duration-300 flex flex-col md:flex-row gap-6 group shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                    >
                      <div className="w-full md:w-52 h-36 bg-[#030014]/80 rounded-2xl border border-indigo-900/50 flex-shrink-0 flex flex-col items-center justify-center gap-2 group-hover:border-indigo-500/40 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <FolderKanban className="w-8 h-8 text-amber-400" />
                        <span className="text-[11px] text-zinc-300 font-bold tracking-wider uppercase bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/50">
                          {mediaCount > 1 ? `${mediaCount} Fichiers` : '1 Fichier'}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <h3 className="font-black text-base sm:text-lg text-white group-hover:text-indigo-400 transition-colors uppercase tracking-wide break-words">{project.title}</h3>
                            <span className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl font-bold whitespace-nowrap shadow-sm flex items-center gap-1">Voir détails <ChevronRight className="w-3.5 h-3.5" /></span>
                          </div>
                          <p className="text-zinc-400 text-xs leading-relaxed mt-2.5 line-clamp-2 break-words">{project.description}</p>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium mt-4 flex items-center gap-1.5">
                          <span>💡</span> Cliquez n'importe où sur ce bloc pour approfondir et ouvrir les détails.
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedProject && (() => {
        const potentialMedia = selectedProject.media || selectedProject.file || selectedProject.pdf || selectedProject.image || selectedProject.attachments;
        const mediaList = Array.isArray(potentialMedia) ? potentialMedia : (potentialMedia ? [potentialMedia] : []);
        const rawMedia = mediaList[currentFileIndex] || '';
        const fullMediaUrl = formatMediaUrl(rawMedia);
        const fileName = getFileName(rawMedia);
        
        const mediaStringUrl = typeof rawMedia === 'object' && rawMedia !== null ? (rawMedia.url || rawMedia.path || '') : (typeof rawMedia === 'string' ? rawMedia : '');
        const urlLower = mediaStringUrl.toLowerCase();
        const isVideo = urlLower && (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.mov'));
        const isImage = urlLower && (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') || urlLower.endsWith('.png') || urlLower.endsWith('.gif') || urlLower.endsWith('.webp') || urlLower.includes('/uploads/'));
        const isPdf = urlLower && urlLower.endsWith('.pdf');

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" onClick={() => setSelectedProject(null)}>
            <div className="bg-[#0b081e] border border-indigo-500/30 w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              
              <div className="p-6 border-b border-indigo-900/60 flex justify-between items-center bg-[#0b081e]/90 sticky top-0 z-20 backdrop-blur-xl">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">Détails du projet</span>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 uppercase tracking-wide break-words">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="w-9 h-9 rounded-2xl bg-[#030014] border border-indigo-900 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors flex-shrink-0 shadow-md">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Description complète</h4>
                  <div className="bg-[#030014]/70 border border-indigo-900/50 rounded-2xl p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-line break-words">
                    {selectedProject.description || "Aucune description fournie."}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fichiers joints</h4>
                    {mediaList.length > 1 && (
                      <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        Fichier {currentFileIndex + 1} sur {mediaList.length}
                      </span>
                    )}
                  </div>

                  {fullMediaUrl ? (
                    <div className="bg-[#030014]/70 border border-indigo-900/50 rounded-2xl p-4 space-y-4">
                      
                      <div className="flex items-center gap-2.5 bg-[#030014] px-3.5 py-2.5 rounded-xl border border-indigo-900/40 text-xs text-indigo-200 shadow-inner">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate font-medium">{fileName}</span>
                      </div>

                      <div className="w-full bg-[#030014] rounded-xl border border-indigo-900/60 overflow-hidden flex items-center justify-center min-h-[180px] max-h-[350px] relative shadow-inner">
                        {isImage ? <img src={fullMediaUrl} alt={fileName} className="w-full max-h-[350px] object-contain" /> : 
                         isVideo ? <video src={fullMediaUrl} className="w-full max-h-[350px] object-contain" controls /> : 
                         isPdf ? <iframe src={`${fullMediaUrl}#toolbar=0`} className="w-full h-[320px] rounded border-0" title="PDF" /> : 
                         <div className="text-center p-6"><FileCode className="w-12 h-12 text-indigo-400 mx-auto" /></div>}
                      </div>

                      {mediaList.length > 1 && (
                        <div className="flex justify-between items-center pt-2">
                          <button 
                            type="button"
                            disabled={currentFileIndex === 0}
                            onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                            className="px-3.5 py-2 bg-indigo-950/80 border border-indigo-900 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                          </button>
                          <span className="text-xs text-zinc-400 font-mono">
                            {currentFileIndex + 1} / {mediaList.length}
                          </span>
                          <button 
                            type="button"
                            disabled={currentFileIndex === mediaList.length - 1}
                            onClick={() => setCurrentFileIndex(prev => Math.min(mediaList.length - 1, prev + 1))}
                            className="px-3.5 py-2 bg-indigo-950/80 border border-indigo-900 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow flex items-center gap-1"
                          >
                            Suivant <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <a href={fullMediaUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                        <Download className="w-4 h-4" /> Télécharger <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-[#030014]/70 border border-indigo-900/50 rounded-2xl p-6 text-center text-xs text-zinc-500 italic">Aucun fichier joint.</div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-indigo-900/60 bg-[#0b081e]/90 text-right backdrop-blur-xl rounded-b-3xl">
                <button onClick={() => setSelectedProject(null)} className="bg-zinc-100 text-zinc-950 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all shadow-md">Fermer</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PublicProfile;