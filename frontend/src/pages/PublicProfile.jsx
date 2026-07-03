import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api'; // On utilise ton instance configurée

const PublicProfile = () => {
  const { id } = useParams(); // Récupère l'ID de l'étudiant depuis l'URL
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL = 'https://hitas.onrender.com';
  const loggedInUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    // Si l'utilisateur clique sur son propre profil public, on peut le rediriger vers son espace perso éditable
    if (id === loggedInUserId) {
      // navigate('/profile'); 
    }

    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Configuration des en-têtes (à conserver si ton instance API ne les injecte pas par défaut)
        const headers = { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          } 
        };

        // 1. Récupérer les infos du profil ciblé (Correction de la route 404)
       // Remplace cette ligne dans le useEffect de PublicProfile.jsx :
const profileRes = await API.get(`/api/profile/${id}`, headers);
        setUserProfile(profileRes.data);

        // 2. Récupérer uniquement les projets Showcase de cet utilisateur
        try {
          const projectsRes = await API.get(`/project`, headers);
          // Si ton backend n'a pas de route filtrée par utilisateur (/project/user/:id),
          // on filtre les projets côté front en comparant l'ID utilisateur.
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
  }, [id, loggedInUserId]);

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
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Bouton Retour */}
        <button onClick={() => navigate(-1)} className="mb-6 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-all">
          ← Retour
        </button>

        {/* En-tête du Profil Public */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-2xl mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-inner overflow-hidden border border-zinc-700 flex-shrink-0">
            {userProfile.avatar ? (
              <img 
                src={formatMediaUrl(userProfile.avatar)} 
                alt={`${userProfile.firstName} ${userProfile.lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>
                {userProfile.firstName ? userProfile.firstName[0] : 'M'}
                {userProfile.lastName ? userProfile.lastName[0] : 'P'}
              </span>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
              {userProfile.firstName || 'Étudiant'} {userProfile.lastName || 'ITAS'}
            </h1>
            <p className="text-indigo-400 text-sm font-medium mt-1">
              ✨ {userProfile.specialty || 'Étudiant ITAS'} {userProfile.promotion && `• Promo ${userProfile.promotion}`}
            </p>
            
            {userProfile.bio && (
              <p className="text-zinc-300 text-xs bg-[#0d0d0e] border border-zinc-800 p-3 rounded-xl max-w-xl leading-relaxed mt-3">
                {userProfile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Section Informations Complémentaires */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-lg mb-8">
          <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Informations Générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0d0d0e] p-3 rounded-xl border border-zinc-800/40">
              <span className="text-zinc-500 block mb-0.5">Localisation</span>
              <span className="text-zinc-200 font-medium">{userProfile.currentLocation || 'Non renseignée'}</span>
            </div>
            {userProfile.skills && (
              <div className="bg-[#0d0d0e] p-3 rounded-xl border border-zinc-800/40">
                <span className="text-zinc-500 block mb-0.5">Compétences</span>
                <span className="text-zinc-200 font-medium">
                  {Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section Showcase (Projets) */}
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-lg">
          <h2 className="text-xs font-bold mb-4 text-zinc-400 uppercase tracking-widest">Projets réalisés (Showcase)</h2>
          
          {userProjects.length === 0 ? (
            <p className="text-zinc-500 text-xs italic bg-[#0d0d0e] border border-zinc-800/40 p-4 rounded-xl text-center">
              Cet étudiant n'a pas encore publié de projet dans le Showcase.
            </p>
          ) : (
            <div className="space-y-4">
              {userProjects.map((project) => (
                <div key={project._id} className="bg-[#0d0d0e] p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                  <h3 className="font-bold text-sm text-zinc-200 mb-1">{project.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3">{project.description}</p>
                  
                  <div className="flex gap-2">
                    {project.githubLink && (
                      <a 
                        href={project.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        📦 GitHub ↗
                      </a>
                    )}
                    {project.demoLink && (
                      <a 
                        href={project.demoLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-500 transition-colors"
                      >
                        🌐 Démo ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;