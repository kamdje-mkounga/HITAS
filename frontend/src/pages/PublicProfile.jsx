import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      // navigate('/profile'); // Décommente si tu as une route pour son propre profil
    }

    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { headers: { 'x-auth-token': token } };

        // 1. Récupérer les infos de profil de l'utilisateur ciblé
        const profileRes = await axios.get(`${BACKEND_URL}/api/users/${id}`, headers);
        setUserProfile(profileRes.data);

        // 2. Récupérer uniquement les projets Showcase de cet utilisateur
        // Note: Adapte cette URL selon la structure de ton API Showcase (ex: /api/showcase/user/:id)
        try {
          const projectsRes = await axios.get(`${BACKEND_URL}/api/showcase/user/${id}`, headers);
          setUserProjects(projectsRes.data);
        } catch (pErr) {
          console.error("Impossible de charger les projets de cet utilisateur", pErr);
        }

        setLoading(false);
      } catch (err) {
        setError("Impossible de charger le profil de cet étudiant.");
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
    return <div className="text-center text-zinc-500 py-16 text-xs font-bold tracking-widest animate-pulse bg-[#0d0d0e] min-h-screen">CHARGEMENT DU PROFIL...</div>;
  }

  if (error || !userProfile) {
    return (
      <div className="w-full min-h-screen bg-[#0d0d0e] text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800 text-center max-w-sm">
          <p className="text-red-400 text-sm mb-4">{error || "Profil introuvable."}</p>
          <button onClick={() => navigate(-1)} className="bg-zinc-100 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs">Retour</button>
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
        <div className="bg-[#161618] p-6 rounded-2xl border border-zinc-800/60 shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center shadow-md">
            {userProfile.avatar ? (
              <img 
                src={formatMediaUrl(userProfile.avatar)} 
                alt={userProfile.firstName} 
                className="absolute inset-0 w-full h-full rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200 rounded-full flex items-center justify-center font-bold text-2xl border border-zinc-700 select-none">
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="text-zinc-400 text-sm mb-3">Étudiant(e) HITAS</p>
            
            {userProfile.bio && (
              <p className="text-zinc-300 text-xs bg-[#0d0d0e] border border-zinc-800 p-3 rounded-xl max-w-xl leading-relaxed">
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
              <span className="text-zinc-500 block mb-0.5">Adresse Email</span>
              <span className="text-zinc-200 font-medium">{userProfile.email}</span>
            </div>
            {userProfile.promotion && (
              <div className="bg-[#0d0d0e] p-3 rounded-xl border border-zinc-800/40">
                <span className="text-zinc-500 block mb-0.5">Promotion / Classe</span>
                <span className="text-zinc-200 font-medium">{userProfile.promotion}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section Showcase (Projets) - UNIQUEMENT EN LECTURE SEULE */}
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
                  <p className="text-zinc-400 text-xs leading-relaxed mb-2">{project.description}</p>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Voir le projet en ligne ↗
                    </a>
                  )}
                  {/* Note: Aucun bouton "Modifier" ou "Supprimer" ici, c'est purement visuel ! */}
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