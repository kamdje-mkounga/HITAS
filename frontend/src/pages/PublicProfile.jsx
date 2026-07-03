import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gestion de l'onglet actif : 'compte' ou 'projets'
  const [activeTab, setActiveTab] = useState('compte');

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

        // 1. Récupérer les infos du profil ciblé
        const profileRes = await API.get(`/profile/${id}`, headers);
        setUserProfile(profileRes.data);

        // 2. Récupérer les projets et filtrer par utilisateur
        try {
          const projectsRes = await API.get(`/project`, headers);
          const filteredProjects = projectsRes.data.filter(
            project => (typeof project.user === 'object' ? project.user._id : project.user) === id
          );
          setUserProjects(filteredProjects);
        } catch (pErr) {
          console.error("Impossible de charger les projets de cet utilisateur", pErr);
        }

      } catch (err) {
        console.error("Erreur lors du chargement du profil public :", err);
        setError("Impossible de charger le profil de cet étudiant.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPublicData();
  }, [id]);

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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

  return (
    <div className="w-full min-h-screen bg-[#0d0d0e] text-zinc-100 antialiased py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Bouton Retour */}
        <button onClick={() => navigate(-1)} className="mb-6 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all">
          ← Retour
        </button>

        {/* En-tête du Profil Principal (Identique à ton screenshot original) */}
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
            
            {/* Badges Compteurs */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="bg-[#0d0d0e] border border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                🚀 {userProjects.length} {userProjects.length > 1 ? 'Projets partagés' : 'Projet partagé'}
              </span>
            </div>
          </div>
        </div>

        {/* Système d'onglets (Tabs) - Sans l'onglet Publications */}
        <div className="flex border-b border-zinc-800 mb-6 gap-6 text-xs font-bold tracking-wide">
          <button 
            onClick={() => setActiveTab('compte')}
            className={`pb-3 flex items-center gap-1.5 transition-all ${activeTab === 'compte' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            👤 L'Étudiant
          </button>
          <button 
            onClick={() => setActiveTab('projets')}
            className={`pb-3 flex items-center gap-1.5 transition-all ${activeTab === 'projets' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            🚀 Ses Projets ({userProjects.length})
          </button>
        </div>

        {/* Contenu Onglet 1 : Informations Générales en lecture seule */}
        {activeTab === 'compte' && (
          <div className="space-y-6 animate-fadeIn">
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
                <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-line">
                  {userProfile.bio || "Cet étudiant n'a pas encore rédigé de biographie."}
                </p>
              </div>

              <div className="bg-[#0d0d0e] p-3.5 rounded-xl border border-zinc-800/60 text-xs">
                <span className="text-zinc-500 block mb-1 uppercase text-[10px] tracking-wider">Compétences</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {userProfile.skills && (Array.isArray(userProfile.skills) ? userProfile.skills : userProfile.skills.split(',')).map((skill, index) => (
                    <span key={index} className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px]">
                      {skill.trim()}
                    </span>
                  ))}
                  {(!userProfile.skills || userProfile.skills.length === 0) && (
                    <span className="text-zinc-500 italic text-xs">Aucune compétence renseignée.</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Contenu Onglet 2 : Liste des Projets Showcase (Avec intégration des fichiers et visuels) */}
        {activeTab === 'projets' && (
          <div className="space-y-4 animate-fadeIn">
            {userProjects.length === 0 ? (
              <p className="text-zinc-500 text-xs italic bg-[#161618] border border-zinc-800/60 p-8 rounded-xl text-center">
                Cet étudiant n'a pas encore publié de projet dans son espace Showcase.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userProjects.map((project) => (
                  <div key={project._id} className="bg-[#161618] p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700/80 transition-all flex flex-col md:flex-row gap-6">
                    
                    {/* Gestion du fichier média s'il existe dans le projet */}
                    {project.media && (
                      <div className="w-full md:w-48 h-32 bg-[#0d0d0e] rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0">
                        {project.media.endsWith('.mp4') || project.media.endsWith('.webm') ? (
                          <video src={formatMediaUrl(project.media)} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={formatMediaUrl(project.media)} alt={project.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-zinc-100 mb-1.5">{project.title}</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-4 whitespace-pre-line">{project.description}</p>
                      </div>
                      
                      {/* Liens externes vers GitHub ou Démo en ligne */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.githubLink && (
                          <a 
                            href={project.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[11px] font-bold bg-[#0d0d0e] border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
                          >
                            📦 GitHub ↗
                          </a>
                        )}
                        {project.demoLink && (
                          <a 
                            href={project.demoLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[11px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-500 transition-colors"
                          >
                            🌐 Visiter le projet ↗
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicProfile;