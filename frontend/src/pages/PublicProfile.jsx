import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
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
        setError("Impossible de charger le profil de cet utilisateur.");
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
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
          <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase animate-pulse">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="w-full min-h-screen bg-[#030014] text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-[#0b081e]/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-indigo-500/30 text-center max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <p className="text-red-300 text-xs mb-6 font-medium">{error || "Profil introuvable."}</p>
          <button onClick={() => navigate(-1)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30">Retour</button>
        </div>
      </div>
    );
  }

  const renderSkills = () => {
    if (!userProfile.skills) return null;
    
    let skillsArray = [];

    try {
      if (Array.isArray(userProfile.skills)) {
        skillsArray = userProfile.skills;
      } else if (typeof userProfile.skills === 'string') {
        let raw = userProfile.skills.trim();

        if (raw.startsWith('[') && raw.endsWith(']')) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              skillsArray = parsed.flat();
            }
          } catch (e) {
            skillsArray = raw.replace(/[\[\]"'\\]/g, '').split(',');
          }
        } else {
          skillsArray = raw.replace(/[\[\]"'\\]/g, '').split(',');
        }
      }
    } catch (err) {
      skillsArray = [];
    }

    return skillsArray
      .map(s => typeof s === 'string' ? s.replace(/[\/\\]/g, '').trim() : String(s))
      .filter(Boolean)
      .map((skill, index) => (
        <span key={index} className="group/skill bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-200 border border-indigo-500/20 px-3.5 py-2 rounded-2xl text-xs font-medium tracking-wide transition-all duration-300 hover:border-indigo-400/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 flex items-center gap-2 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover/skill:rotate-12 transition-transform" /> {skill}
        </span>
      ));
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#030014] text-zinc-100 antialiased relative overflow-x-hidden selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.45), rgba(3, 0, 20, 0.55)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <style>{`
        @keyframes cascadeTopLeft {
          from { opacity: 0; transform: translate(-30px, -20px); filter: blur(4px); }
          to { opacity: 1; transform: translate(0, 0); filter: blur(0); }
        }
        @keyframes cascadeTopRight {
          from { opacity: 0; transform: translate(30px, -20px); filter: blur(4px); }
          to { opacity: 1; transform: translate(0, 0); filter: blur(0); }
        }
        @keyframes cascadeBottomLeft {
          from { opacity: 0; transform: translate(-30px, 20px); filter: blur(4px); }
          to { opacity: 1; transform: translate(0, 0); filter: blur(0); }
        }
        @keyframes cascadeBottomRight {
          from { opacity: 0; transform: translate(30px, 20px); filter: blur(4px); }
          to { opacity: 1; transform: translate(0, 0); filter: blur(0); }
        }
        @keyframes fadeInUpCenter {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        .animate-cascade-tl { animation: cascadeTopLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-cascade-tr { animation: cascadeTopRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-cascade-bl { animation: cascadeBottomLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-cascade-br { animation: cascadeBottomRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-center { animation: fadeInUpCenter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <Navbar />

      {/* Orbes lumineux d'ambiance */}
      <div className="absolute top-20 left-1/4 w-[450px] h-[450px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute top-96 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="mb-6 group text-xs text-zinc-400 hover:text-white flex items-center gap-2 transition-all bg-[#0b081e]/80 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/40 px-4 py-2.5 rounded-2xl w-fit shadow-lg shadow-indigo-950/20 opacity-0 animate-fade-center" style={{ animationDelay: '0.1s' }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour
        </button>

        {/* Navigation Tabs - Style pilule moderne */}
        <div className="flex p-1.5 bg-[#0b081e]/70 backdrop-blur-xl border border-indigo-500/20 rounded-2xl mb-8 gap-2 text-xs font-bold tracking-wider opacity-0 animate-fade-center" style={{ animationDelay: '0.2s' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('compte')}
            className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'compte' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" /> Le Membre
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('projets')}
            className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'projets' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rocket className="w-4 h-4" /> Réalisations ({userProjects.length})
          </button>
        </div>

        {/* =========================================================
            TAB: COMPTE - STRUCTURE EN ARBRE / BRANCHES (MIND-MAP)
        ========================================================= */}
        {activeTab === 'compte' && (
          <div className="relative py-8 flex flex-col items-center">
            
            {/* Titre de section stylisé */}
            <h2 className="text-xs font-bold mb-12 text-indigo-300 uppercase tracking-widest flex items-center gap-2.5 bg-[#0b081e]/90 px-5 py-2 rounded-full border border-indigo-500/30 shadow-lg relative z-20 opacity-0 animate-fade-center" style={{ animationDelay: '0.3s' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"></span> Arbre de Profil & Compétences
            </h2>

            {/* Racine de l'arbre (Avatar et Nom) */}
            <div className="relative z-20 flex flex-col items-center mb-16 opacity-0 animate-fade-center" style={{ animationDelay: '0.4s' }}>
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-400 bg-[#030014] shadow-2xl">
                {userProfile.avatar ? (
                  <img src={formatMediaUrl(userProfile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold text-xl">
                    {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="mt-3 text-center bg-[#0b081e]/90 backdrop-blur-md px-5 py-2 rounded-2xl border border-indigo-500/30 shadow-xl">
                <span className="text-white font-black text-sm uppercase">{userProfile.firstName} {userProfile.lastName}</span>
              </div>
            </div>

            {/* Ligne verticale centrale principale de l'arbre */}
            <div className="absolute top-36 bottom-20 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent pointer-events-none"></div>

            {/* Les Branches de l'Arbre (Apparition en cascade : Left-Up, Right-Up, Left-Down, Right-Down) */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10 px-4">
              
              {/* 1. Left Up (Identité) */}
              <div className="relative bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-5 rounded-3xl shadow-2xl hover:border-indigo-400 transition-all sm:translate-x-[-15px] group opacity-0 animate-cascade-tl" style={{ animationDelay: '0.5s' }}>
                <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-indigo-500/60 hidden sm:block"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">👤 Identité</span>
                <p className="text-zinc-100 text-xs font-semibold">Prénom : <span className="text-indigo-200 font-normal">{userProfile.firstName || '-'}</span></p>
                <p className="text-zinc-100 text-xs font-semibold mt-1">Nom : <span className="text-indigo-200 font-normal">{userProfile.lastName || '-'}</span></p>
              </div>

              {/* 2. Right Up (Formation & Promo) */}
              <div className="relative bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-5 rounded-3xl shadow-2xl hover:border-indigo-400 transition-all sm:translate-x-[15px] group opacity-0 animate-cascade-tr" style={{ animationDelay: '0.6s' }}>
                <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-indigo-500/60 hidden sm:block"></div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">📚 Formation & Promo</span>
                <p className="text-zinc-100 text-xs font-semibold">{userProfile.specialty || 'Spécialité non renseignée'}</p>
                <p className="text-zinc-400 text-[11px] mt-1">Promo {userProfile.promotion || '-'} • {userProfile.degreeLevel || ''}</p>
              </div>

              {/* 3. Left Down (Localisation) */}
              <div className="relative bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-5 rounded-3xl shadow-2xl hover:border-indigo-400 transition-all sm:translate-x-[-15px] group opacity-0 animate-cascade-bl" style={{ animationDelay: '0.7s' }}>
                <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-indigo-500/60 hidden sm:block"></div>
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">🌍 Localisation</span>
                <p className="text-zinc-100 text-xs font-semibold">{userProfile.country || 'Pays non renseigné'}</p>
                <p className="text-zinc-400 text-[11px] mt-1">{userProfile.currentLocation || 'Ville non renseignée'}</p>
              </div>

              {/* 4. Right Down (Situation Professionnelle) */}
              <div className="relative bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-5 rounded-3xl shadow-2xl hover:border-indigo-400 transition-all sm:translate-x-[15px] group opacity-0 animate-cascade-br" style={{ animationDelay: '0.8s' }}>
                <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-indigo-500/60 hidden sm:block"></div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">💼 Situation Pro</span>
                <p className="text-zinc-100 text-xs font-semibold">{userProfile.jobTitle || 'Statut / Poste non renseigné'}</p>
                <p className="text-zinc-400 text-[11px] mt-1">{userProfile.currentCompany ? `chez ${userProfile.currentCompany}` : userProfile.status || ''}</p>
              </div>

              {/* Biographie (Pleine largeur - Apparition douce) */}
              <div className="sm:col-span-2 relative bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-5 rounded-3xl shadow-2xl hover:border-indigo-400 transition-all opacity-0 animate-fade-center" style={{ animationDelay: '0.9s' }}>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">📝 Biographie</span>
                <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line">{userProfile.bio || "Ce membre n'a pas encore rédigé de biographie."}</p>
              </div>

            </div>

            {/* Feuille finale de l'arbre : Compétences Clés */}
            <div className="mt-12 relative z-10 w-full max-w-lg bg-[#0b081e]/90 backdrop-blur-2xl border border-indigo-500/30 p-6 rounded-[2.5rem] shadow-2xl text-center opacity-0 animate-fade-center" style={{ animationDelay: '1.0s' }}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-indigo-500"></div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-4">⚡ Compétences & Domaines</span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {renderSkills() || <span className="text-zinc-500 italic text-xs">Aucune compétence renseignée.</span>}
              </div>
            </div>

          </div>
        )}

        {/* Tab: Projets */}
        {activeTab === 'projets' && (
          <div className="space-y-4 opacity-0 animate-fade-center" style={{ animationDelay: '0.3s' }}>
            {userProjects.length === 0 ? (
              <div className="bg-[#0b081e]/80 backdrop-blur-2xl border border-indigo-500/20 p-12 rounded-[2.5rem] text-center shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <FolderKanban className="w-7 h-7" />
                </div>
                <p className="text-zinc-400 text-xs italic">Ce membre n'a pas encore partagé de réalisation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {userProjects.map((project) => {
                  const potentialMedia = project.media || project.file || project.pdf || project.image || project.attachments;
                  const mediaCount = Array.isArray(potentialMedia) ? potentialMedia.length : (potentialMedia ? 1 : 0);

                  return (
                    <div 
                      key={project._id} 
                      onClick={() => handleOpenProject(project)}
                      className="bg-[#0b081e]/85 backdrop-blur-3xl p-6 sm:p-7 rounded-[2.2rem] border border-indigo-500/20 hover:border-indigo-500/60 cursor-pointer transition-all duration-300 flex flex-col md:flex-row gap-6 group shadow-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:-translate-y-1"
                    >
                      <div className="w-full md:w-48 h-36 bg-gradient-to-br from-[#030014] to-[#120e2e] rounded-2xl border border-indigo-900/40 flex-shrink-0 flex flex-col items-center justify-center gap-2 group-hover:border-indigo-500/50 transition-colors relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <FolderKanban className="w-9 h-9 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[10px] text-indigo-200 font-bold tracking-wider uppercase bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-500/30 backdrop-blur-md">
                          {mediaCount > 1 ? `${mediaCount} Fichiers` : '1 Fichier'}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <h3 className="font-black text-base sm:text-lg text-white group-hover:text-indigo-300 transition-colors tracking-wide break-words">{project.title}</h3>
                            <span className="text-[11px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-1.5 rounded-2xl font-bold whitespace-nowrap shadow-sm flex items-center gap-1.5 group-hover:bg-indigo-500/25 transition-all">Voir détails <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
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

      {/* Modal - Style moderne et épuré */}
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
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" onClick={() => setSelectedProject(null)}>
            <div className="bg-[#0b081e] border border-indigo-500/30 w-full max-w-2xl rounded-[2.5rem] max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.9)]" onClick={(e) => e.stopPropagation()}>
              
              <div className="p-6 border-b border-indigo-900/40 flex justify-between items-center bg-[#0b081e]/90 sticky top-0 z-20 backdrop-blur-2xl">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-xl font-bold uppercase tracking-widest">Détails du projet</span>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-2 tracking-wide break-words">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="w-10 h-10 rounded-2xl bg-[#030014] border border-indigo-500/30 text-zinc-400 hover:text-white flex items-center justify-center transition-all hover:border-indigo-400 flex-shrink-0 shadow-md">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Description complète</h4>
                  <div className="bg-[#030014]/80 border border-indigo-900/40 rounded-2xl p-5 text-sm text-zinc-200 leading-relaxed whitespace-pre-line break-words shadow-inner">
                    {selectedProject.description || "Aucune description fournie."}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fichiers joints</h4>
                    {mediaList.length > 1 && (
                      <span className="text-xs text-indigo-300 font-semibold bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
                        Fichier {currentFileIndex + 1} sur {mediaList.length}
                      </span>
                    )}
                  </div>

                  {fullMediaUrl ? (
                    <div className="bg-[#030014]/80 border border-indigo-900/40 rounded-2xl p-5 space-y-4 shadow-inner">
                      
                      <div className="flex items-center gap-3 bg-[#030014] px-4 py-3 rounded-xl border border-indigo-500/20 text-xs text-indigo-200 shadow-inner">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate font-medium">{fileName}</span>
                      </div>

                      <div className="w-full bg-[#030014] rounded-2xl border border-indigo-900/50 overflow-hidden flex items-center justify-center min-h-[200px] max-h-[380px] relative shadow-inner">
                        {isImage ? <img src={fullMediaUrl} alt={fileName} className="w-full max-h-[380px] object-contain" /> : 
                         isVideo ? <video src={fullMediaUrl} className="w-full max-h-[380px] object-contain" controls /> : 
                         isPdf ? <iframe src={`${fullMediaUrl}#toolbar=0`} className="w-full h-[340px] rounded border-0" title="PDF" /> : 
                         <div className="text-center p-6"><FileCode className="w-12 h-12 text-indigo-400 mx-auto" /></div>}
                      </div>

                      {mediaList.length > 1 && (
                        <div className="flex justify-between items-center pt-2">
                          <button 
                            type="button"
                            disabled={currentFileIndex === 0}
                            onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                            className="px-4 py-2 bg-indigo-950/80 border border-indigo-500/30 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow flex items-center gap-1.5"
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
                            className="px-4 py-2 bg-indigo-950/80 border border-indigo-500/30 text-zinc-200 text-xs font-semibold rounded-xl hover:bg-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow flex items-center gap-1.5"
                          >
                            Suivant <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <a href={fullMediaUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30">
                        <Download className="w-4 h-4" /> Ouvrir <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-[#030014]/80 border border-indigo-900/40 rounded-2xl p-6 text-center text-xs text-zinc-500 italic">Aucun fichier joint.</div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-indigo-900/40 bg-[#0b081e]/90 text-right backdrop-blur-2xl rounded-b-[2.5rem]">
                <button onClick={() => setSelectedProject(null)} className="bg-zinc-100 text-zinc-950 text-xs font-bold px-6 py-3 rounded-2xl hover:bg-white transition-all shadow-lg">Fermer</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PublicProfile;

