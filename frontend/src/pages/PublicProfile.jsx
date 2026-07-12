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
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  
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

  // Fonction de formatage d'URL adaptative et tolérante aux structures complexes
  const formatMediaUrl = (urlData) => {
    if (!urlData) return '';
    
    let cleanUrl = '';
    
    // Si c'est un tableau, on extrait le premier élément
    if (Array.isArray(urlData) && urlData.length > 0) {
      return formatMediaUrl(urlData[0]);
    }
    
    // Si c'est un objet, on cherche les propriétés classiques (url, path, secure_url)
    if (typeof urlData === 'object' && urlData !== null) {
      cleanUrl = urlData.url || urlData.path || urlData.secure_url || '';
    } else if (typeof urlData === 'string') {
      cleanUrl = urlData;
    }

    if (!cleanUrl || typeof cleanUrl !== 'string') return '';
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
    return `${BACKEND_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  // Fonction pour extraire intelligemment n'importe quelle source de média du projet
  const extractMediaRaw = (project) => {
    if (!project) return '';
    // On inspecte toutes les clés potentielles utilisées dans le modèle de données
    const potentialMedia = project.media || project.file || project.pdf || project.image || project.attachments;
    
    if (Array.isArray(potentialMedia) && potentialMedia.length > 0) {
      return potentialMedia[0];
    }
    return potentialMedia || '';
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
      : userProfile.skills.split(',').map(s => s.trim());
    
    return skillsArray.filter(Boolean).map((skill, index) => (
      <span key={index} className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px]">
        {skill}
      </span>
    ));
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0d0e] text-zinc-100 antialiased py-12 relative">
      <div className="max-w-4xl mx-auto px-4">
        
        <button onClick={() => navigate(-1)} className="mb-6 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all">
          ← Retour
        </button>

        {/* Profil Header */}
        <div className="bg-[#161618] p-8 rounded-2xl border border-zinc-800/80 shadow-2xl mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-inner overflow-hidden border border-zinc-700 flex-shrink-0">
            {userProfile.avatar ? (
              <img 
                src={formatMediaUrl(userProfile.avatar)} 
                alt={`${userProfile.firstName} ${userProfile.lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-zinc-700 to-zinc-800 flex items-center justify-center">
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="text-indigo-400 text-xs font-medium mt-1">
              ✨ {userProfile.specialty || 'computer science'} • Promo {userProfile.promotion || 'Non renseignée'}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="bg-[#0d0d0e] border border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                🚀 {userProjects.length} {userProjects.length > 1 ? 'Projets partagés' : 'Projet partagé'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-zinc-800 mb-6 gap-6 text-xs font-bold tracking-wide">
          <button 
            type="button"
            onClick={() => setActiveTab('compte')}
            className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'compte' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            👤 L'Étudiant
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('projets')}
            className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'projets' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🚀 Ses Projets ({userProjects.length})
          </button>
        </div>

        {/* Onglet Compte */}
        {activeTab === 'compte' && (
          <div className="space-y-6">
            <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
              <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Informations Générales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Prénom</span>
                  <span className="text-zinc-200 font-medium text-sm">{userProfile.firstName || '-'}</span>
                </div>
                <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Nom de famille</span>
                  <span className="text-zinc-200 font-medium text-sm">{userProfile.lastName || '-'}</span>
                </div>
                <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Promotion</span>
                  <span className="text-zinc-200 font-medium text-sm">{userProfile.promotion || '-'}</span>
                </div>
                <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60">
                  <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Spécialité</span>
                  <span className="text-zinc-200 font-medium text-sm">{userProfile.specialty || '-'}</span>
                </div>
              </div>
              <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60 text-xs mb-4">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Localisation Actuelle</span>
                <span className="text-zinc-200 font-medium text-sm">{userProfile.currentLocation || 'Non renseignée'}</span>
              </div>
              <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60 text-xs mb-4">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Biographie</span>
                <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-line">{userProfile.bio || "Cet étudiant n'a pas encore rédigé de biographie."}</p>
              </div>
              <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60 text-xs">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Compétences</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
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
              <p className="text-zinc-500 text-xs italic bg-[#161618] border border-zinc-800/60 p-8 rounded-xl text-center">
                Cet étudiant n'a pas encore publié de projet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userProjects.map((project) => (
                  <div 
                    key={project._id} 
                    onClick={() => setSelectedProject(project)}
                    className="bg-[#161618] p-6 rounded-2xl border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col md:flex-row gap-6 group"
                  >
                    <div className="w-full md:w-48 h-32 bg-[#0d0d0e] rounded-xl border border-zinc-800 flex-shrink-0 flex flex-col items-center justify-center gap-2 group-hover:bg-[#111113] transition-colors">
                      <span className="text-3xl text-amber-500">📁</span>
                      <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Fichier</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-base text-zinc-100 group-hover:text-indigo-400 transition-colors uppercase tracking-wide">{project.title}</h3>
                          <span className="text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-md font-bold">Voir détails →</span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed mt-2 line-clamp-2">{project.description}</p>
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
    {/* MODALE REVISEE AVEC MULTI-MEDIA ET ONGLES DE SELECTION */}
{selectedProject && (() => {
  // 1. Récupération de la liste brute de tous les médias potentiels
  const potentialMedia = selectedProject.media || selectedProject.file || selectedProject.pdf || selectedProject.image || selectedProject.attachments;
  
  // 2. Normalisation en tableau pour gérer un ou plusieurs fichiers de manière identique
  const mediaList = Array.isArray(potentialMedia) 
    ? potentialMedia 
    : (potentialMedia ? [potentialMedia] : []);

  // 3. Extraction du média actuellement sélectionné par l'utilisateur
  const rawMedia = mediaList[currentFileIndex] || '';
  const fullMediaUrl = formatMediaUrl(rawMedia);
  
  const mediaStringUrl = typeof rawMedia === 'object' && rawMedia !== null ? (rawMedia.url || rawMedia.path || '') : (typeof rawMedia === 'string' ? rawMedia : '');
  const urlLower = mediaStringUrl.toLowerCase();
  
  const isVideo = urlLower && (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.mov'));
  const isImage = urlLower && (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') || urlLower.endsWith('.png') || urlLower.endsWith('.gif') || urlLower.endsWith('.webp') || urlLower.includes('/uploads/'));
  const isPdf = urlLower && urlLower.endsWith('.pdf');

  return (
    <div 
      className="w-full min-h-screen bg-[#030014] text-zinc-100 antialiased py-12 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        
        <button onClick={() => navigate(-1)} className="mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-all">
          ← Retour
        </button>

        {/* Profil Header avec Bannière et Avatar superposé */}
        <div className="bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 mb-8">
          <div className="h-32 bg-gradient-to-r from-indigo-900/40 to-[#030014] border-b border-indigo-900/50"></div>
          
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-16 w-32 h-32 rounded-full bg-[#030014] border-4 border-[#0b081e] flex items-center justify-center text-3xl font-bold uppercase shadow-xl overflow-hidden text-indigo-300">
              {userProfile.avatar ? (
                <img src={formatMediaUrl(userProfile.avatar)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{userProfile.firstName?.[0]}{userProfile.lastName?.[0]}</span>
              )}
            </div>
            
            <div className="pt-20">
              <h1 className="text-3xl font-black text-white">{userProfile.firstName} {userProfile.lastName}</h1>
              <p className="text-indigo-400 text-sm font-medium mt-1">
                🎓 {userProfile.specialty || 'Étudiant ITAS'} • Promo {userProfile.promotion || 'Non renseignée'}
              </p>
              <p className="text-zinc-400 text-[11px] font-semibold mt-1">📍 {userProfile.currentLocation || 'Localisation non renseignée'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex border-b border-indigo-900/40 mb-8 gap-8 text-xs font-bold tracking-widest uppercase">
          <button onClick={() => setActiveTab('compte')} className={`pb-3 transition-all border-b-2 ${activeTab === 'compte' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
            👤 Profil
          </button>
          <button onClick={() => setActiveTab('projets')} className={`pb-3 transition-all border-b-2 ${activeTab === 'projets' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
            🚀 Projets ({userProjects.length})
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'compte' && (
          <div className="space-y-6">
            <div className="bg-[#0b081e]/85 backdrop-blur-xl p-6 rounded-2xl border border-indigo-900/60 shadow-xl">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Biographie</h2>
              <p className="text-zinc-300 text-sm leading-relaxed italic bg-[#030014]/60 p-4 rounded-xl border border-indigo-900/30">
                {userProfile.bio || "Aucune biographie disponible."}
              </p>
            </div>
            
            <div className="bg-[#0b081e]/85 backdrop-blur-xl p-6 rounded-2xl border border-indigo-900/60 shadow-xl">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Compétences</h2>
              <div className="flex flex-wrap gap-2">
                {renderSkills() || <span className="text-zinc-500 italic text-xs">Aucune compétence renseignée.</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProjects.map((project) => (
              <div key={project._id} onClick={() => setSelectedProject(project)} className="bg-[#0b081e]/85 backdrop-blur-xl p-6 rounded-2xl border border-indigo-900/60 cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl group">
                <h3 className="font-bold text-white mb-2 group-hover:text-indigo-400">{project.title}</h3>
                <p className="text-zinc-400 text-xs line-clamp-2">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* (Garde ta logique de Modal ici, elle est très bien faite !) */}
    </div>
  );
})()}
    </div>
  );
};

export default PublicProfile;