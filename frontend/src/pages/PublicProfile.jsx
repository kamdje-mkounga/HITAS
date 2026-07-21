import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFileIndex] = useState(0);
  
  const [activeTab, setActiveTab] = useState('compte');
  const [selectedProject, setSelectedProject] = useState(null);

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

  const formatMediaUrl = (urlData) => {
    if (!urlData) return '';
    
    let cleanUrl = '';
    
    if (Array.isArray(urlData) && urlData.length > 0) {
      return formatMediaUrl(urlData[0]);
    }
    
    if (typeof urlData === 'object' && urlData !== null) {
      cleanUrl = urlData.url || urlData.path || urlData.secure_url || '';
    } else if (typeof urlData === 'string') {
      cleanUrl = urlData;
    }

    if (!cleanUrl || typeof cleanUrl !== 'string') return '';
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    return `${BACKEND_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  if (loading) {
    return <div className="text-center text-zinc-500 py-16 text-xs font-bold tracking-widest animate-pulse bg-[#0d0d0e] min-h-screen flex items-center justify-center">CHARGEMENT DU PROFIL...</div>;
  }

  if (error || !userProfile) {
    return (
      <div className="w-full min-h-screen bg-[#0d0d0e] text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800 text-center max-w-sm w-full">
          <p className="text-red-400 text-sm mb-4">{error || "Profil introuvable."}</p>
          <button onClick={() => navigate(-1)} className="bg-zinc-100 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-zinc-200 transition-colors">Retour</button>
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
      <span key={index} className="bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 px-2.5 py-1 rounded-lg text-[11px] font-medium break-all max-w-full">
        {skill}
      </span>
    ));
  };

  return (
    <div 
      className="w-full min-h-screen bg-[#030014] text-zinc-100 antialiased py-12 relative overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 overflow-hidden">
        
        <button onClick={() => navigate(-1)} className="mb-6 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all">
          ← Retour
        </button>

        {/* Profil Header */}
        <div className="bg-[#0b081e]/85 backdrop-blur-xl p-8 rounded-2xl border border-indigo-900/60 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-inner overflow-hidden border border-indigo-900/50 flex-shrink-0">
            {userProfile.avatar ? (
              <img 
                src={formatMediaUrl(userProfile.avatar)} 
                alt={`${userProfile.firstName} ${userProfile.lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-950 to-zinc-800 flex items-center justify-center text-indigo-300">
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase break-words">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              {userProfile.status && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  ● {userProfile.status}
                </span>
              )}
            </div>

            <p className="text-indigo-400 text-xs font-medium truncate">
              🎓 {userProfile.specialty || 'Informatique'} • Promo {userProfile.promotion || 'Non renseignée'}
            </p>
            
            <p className="text-zinc-400 text-[11px] font-semibold mt-1 truncate">
              📍 {userProfile.country || userProfile.currentLocation || 'Localisation non renseignée'}
              {userProfile.degreeLevel && ` • ${userProfile.degreeLevel}`}
            </p>

            {(userProfile.jobTitle || userProfile.currentCompany) && (
              <p className="text-zinc-300 text-xs mt-2 font-medium truncate">
                💼 {userProfile.jobTitle || 'Poste'} {userProfile.currentCompany ? `chez ${userProfile.currentCompany}` : ''}
              </p>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="bg-[#030014]/60 border border-indigo-900/40 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                🚀 {userProjects.length} {userProjects.length > 1 ? 'Projets partagés' : 'Projet partagé'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-indigo-900/40 mb-6 gap-6 text-xs font-bold tracking-wide overflow-x-auto scrollbar-none">
          <button 
            type="button"
            onClick={() => setActiveTab('compte')}
            className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'compte' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            👤 L'Étudiant
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('projets')}
            className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'projets' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🚀 Ses Projets ({userProjects.length})
          </button>
        </div>

        {/* Onglet Compte */}
        {activeTab === 'compte' && (
          <div className="space-y-6">
            <div className="bg-[#0b081e]/85 backdrop-blur-xl p-6 rounded-2xl border border-indigo-900/60 shadow-lg overflow-hidden">
              <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Informations Générales</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Prénom</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.firstName || '-'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Nom de famille</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.lastName || '-'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Promotion</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.promotion || '-'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Spécialité</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.specialty || '-'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Statut Actuel</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.status || 'Non renseigné'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Niveau d'étude</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.degreeLevel || 'Non renseigné'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Pays</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.country || '-'}</span>
                </div>
                <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Ville / Emplacement</span>
                  <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.currentLocation || '-'}</span>
                </div>
              </div>

              {(userProfile.jobTitle || userProfile.currentCompany) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                  <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                    <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Intitulé du Poste</span>
                    <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.jobTitle || '-'}</span>
                  </div>
                  <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 overflow-hidden">
                    <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Entreprise</span>
                    <span className="text-zinc-200 font-medium text-sm break-words">{userProfile.currentCompany || '-'}</span>
                  </div>
                </div>
              )}

              <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 text-xs mb-4 overflow-hidden">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Biographie</span>
                <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-line break-words">{userProfile.bio || "Cet étudiant n'a pas encore rédigé de biographie."}</p>
              </div>

              <div className="bg-[#030014]/60 p-3.5 rounded-xl border border-indigo-900/40 text-xs overflow-hidden">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Compétences</span>
                <div className="flex flex-wrap gap-1.5 mt-2 overflow-hidden">
                  {renderSkills() || <span className="text-zinc-500 italic text-xs">Aucune compétence renseignée.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Projets */}
        {activeTab === 'projets' && (
          <div className="space-y-4">
            {userProjects.length === 0 ? (
              <p className="text-zinc-500 text-xs italic bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/60 p-8 rounded-2xl text-center">
                Cet étudiant n'a pas encore publié de projet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userProjects.map((project) => (
                  <div 
                    key={project._id} 
                    onClick={() => setSelectedProject(project)}
                    className="bg-[#0b081e]/85 backdrop-blur-xl p-6 rounded-2xl border border-indigo-900/60 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col md:flex-row gap-6 group shadow-lg overflow-hidden"
                  >
                    <div className="w-full md:w-48 h-32 bg-[#030014]/60 rounded-xl border border-indigo-900/40 flex-shrink-0 flex flex-col items-center justify-center gap-2 transition-colors">
                      <span className="text-3xl text-amber-500">📁</span>
                      <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Fichier</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-indigo-400 transition-colors uppercase tracking-wide break-words">{project.title}</h3>
                          <span className="text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-md font-bold whitespace-nowrap">Voir détails →</span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed mt-2 line-clamp-2 break-words">{project.description}</p>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-medium mt-4">
                        Cliquez n'importe où sur ce bloc pour approfondir et ouvrir les détails.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODALE REVISEE ET MULTI-MEDIA DETECTEUR */}
      {selectedProject && (() => {
        const potentialMedia = selectedProject.media || selectedProject.file || selectedProject.pdf || selectedProject.image || selectedProject.attachments;
        const mediaList = Array.isArray(potentialMedia) ? potentialMedia : (potentialMedia ? [potentialMedia] : []);
        const rawMedia = mediaList[currentFileIndex] || '';
        const fullMediaUrl = formatMediaUrl(rawMedia);
        const mediaStringUrl = typeof rawMedia === 'object' && rawMedia !== null ? (rawMedia.url || rawMedia.path || '') : (typeof rawMedia === 'string' ? rawMedia : '');
        const urlLower = mediaStringUrl.toLowerCase();
        const isVideo = urlLower && (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.mov'));
        const isImage = urlLower && (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') || urlLower.endsWith('.png') || urlLower.endsWith('.gif') || urlLower.endsWith('.webp') || urlLower.includes('/uploads/'));
        const isPdf = urlLower && urlLower.endsWith('.pdf');

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedProject(null)}>
            <div className="bg-[#0b081e] border border-indigo-900/60 w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              
              <div className="p-6 border-b border-indigo-900/80 flex justify-between items-center bg-[#0b081e]">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Détails</span>
                  <h2 className="text-lg font-black text-white mt-1 uppercase tracking-wide break-words">{selectedProject.title}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="w-8 h-8 rounded-full bg-[#030014] border border-indigo-900 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors flex-shrink-0">✕</button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Description complète</h4>
                  <div className="bg-[#030014]/60 border border-indigo-900/60 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line break-words">
                    {selectedProject.description || "Aucune description fournie."}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Fichiers</h4>
                  {fullMediaUrl ? (
                    <div className="bg-[#030014]/60 border border-indigo-900/60 rounded-xl p-4 space-y-4">
                      <div className="w-full bg-[#030014] rounded-lg border border-indigo-900/60 overflow-hidden flex items-center justify-center min-h-[180px] max-h-[350px]">
                        {isImage ? <img src={fullMediaUrl} alt={selectedProject.title} className="w-full max-h-[350px] object-contain" /> : 
                         isVideo ? <video src={fullMediaUrl} className="w-full max-h-[350px] object-contain" controls /> : 
                         isPdf ? <iframe src={`${fullMediaUrl}#toolbar=0`} className="w-full h-[320px] rounded border-0" title="PDF" /> : 
                         <div className="text-center p-6"><span className="text-4xl">📄</span></div>}
                      </div>
                      <a href={fullMediaUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                        📥 Télécharger ↗
                      </a>
                    </div>
                  ) : (
                    <div className="bg-[#030014]/60 border border-indigo-900/60 rounded-xl p-4 text-center text-xs text-zinc-500 italic">Aucun fichier joint.</div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-indigo-900/80 bg-[#0b081e] text-right">
                <button onClick={() => setSelectedProject(null)} className="bg-zinc-100 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-200 transition-all">Fermer</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PublicProfile;