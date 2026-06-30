import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api'; // On utilise uniquement ton instance API configurée

function Profil() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    promotion: '',
    specialty: '',
    currentLocation: '',
    bio: '',
    skills: ''
  });
  const [avatarFile, setAvatarFile] = useState(null); 
  const [avatarPreview, setAvatarPreview] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account'); 
  const [myPosts, setMyPosts] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const BACKEND_URL = 'https://hitas.onrender.com';

  // Fonction pour formater correctement l'URL des médias distants
  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  useEffect(() => {
    const fetchAllProfileData = async () => {
      try {
        setLoading(true);
        const loggedInUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token'); 

        // 1. Récupération des informations du profil
        try {
          const response = await API.get('/profile/me', {
            headers: {
              'Authorization': `Bearer ${token}`, // Version standardisée
              'x-auth-token': token // Conservé au cas où ton middleware l'impose
            }
          });

          if (response.data) {
            setFormData({
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              promotion: response.data.promotion || '',
              specialty: response.data.specialty || '',
              currentLocation: response.data.currentLocation || '',
              bio: response.data.bio || '',
              skills: response.data.skills ? response.data.skills.join(', ') : ''
            });
            
            if (response.data.avatar) {
              console.log("🔗 [F5] AVATAR TROUVÉ :", response.data.avatar);
              setAvatarPreview(formatMediaUrl(response.data.avatar));
            } else {
              console.log("⚠️ [F5] AUCUN CHAMP AVATAR DANS LE PROFIL DU BACKEND.");
              setAvatarPreview('');
            }
          }
        } catch (err) {
          console.log("Aucun profil existant trouvé ou jeton absent.", err);
        }

        // 2. Récupération des publications
        try {
          const postsRes = await API.get('/posts');
          const userPosts = postsRes.data.filter(post => getUserId(post.user) === loggedInUserId);
          setMyPosts(userPosts);
        } catch (err) {
          console.error("Erreur lors de la récupération des publications", err);
        }

        // 3. Récupération des projets
        try {
          const projectsRes = await API.get('/project');
          const userProjects = projectsRes.data.filter(project => getUserId(project.user) === loggedInUserId);
          setMyProjects(userProjects);
        } catch (err) {
          console.error("Erreur lors de la récupération des projets", err);
        }

      } catch (globalErr) {
        console.error("Erreur générale de chargement", globalErr);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProfileData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token'); // Récupération essentielle ici
    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('promotion', formData.promotion);
    data.append('specialty', formData.specialty);
    data.append('currentLocation', formData.currentLocation);
    data.append('bio', formData.bio);
    data.append('skills', formData.skills);
    
    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    try {
      console.log("📤 ENVOI DU FORMULAIRE AU BACKEND...");
      const response = await API.post('/profile', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token 
        }
      });

      console.log("📥 RÉPONSE DU SERVEUR APRÈS SAUVEGARDE :", response.data);

      if (response.data && response.data.avatar) {
        setAvatarPreview(formatMediaUrl(response.data.avatar));
        setAvatarFile(null); 
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la sauvegarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {loading ? (
          <p className="text-zinc-500 animate-pulse text-center py-20">Chargement de tes données...</p>
        ) : (
          <div>
            {/* CARTE D'EN-TÊTE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-inner overflow-hidden border border-zinc-700 flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {formData.firstName ? formData.firstName[0] : 'M'}
                    {formData.lastName ? formData.lastName[0] : 'P'}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formData.firstName || 'Mon'} {formData.lastName || 'Profil'}
                </h1>
                <p className="text-indigo-400 text-sm font-medium mt-1">
                  ✨ {formData.specialty || 'Étudiant ITAS'} {formData.promotion && `• Promo ${formData.promotion}`}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-xs text-zinc-400">
                  <div className="bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800">
                    📝 <span className="text-white font-bold">{myPosts.length}</span> Publications
                  </div>
                  <div className="bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800">
                    🚀 <span className="text-white font-bold">{myProjects.length}</span> Projets partagés
                  </div>
                </div>
              </div>
            </div>

            {/* ONGLETS */}
            <div className="flex gap-6 border-b border-zinc-800 mb-8 pb-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`pb-2 px-1 transition-all border-b-2 ${
                  activeTab === 'account' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                👤 Mon Compte
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`pb-2 px-1 transition-all border-b-2 ${
                  activeTab === 'posts' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                📝 Mes Publications ({myPosts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`pb-2 px-1 transition-all border-b-2 ${
                  activeTab === 'projects' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 border-transparent'
                }`}
              >
                🚀 Mes Projets ({myProjects.length})
              </button>
            </div>

            {/* CONTENU DYNAMIQUE */}
            {activeTab === 'account' && (
              <div className="max-w-2xl mx-auto p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-md">
                {message.text && (
                  <div className={`mb-6 p-3 border text-xs font-medium rounded-lg ${
                    message.type === 'success' ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400' : 'bg-red-950/40 border-red-900 text-red-400'
                  }`}>
                    {message.type === 'success' ? '🎉' : '⚠️'} {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-5 bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Photo de profil</label>
                      <input 
                        type="file" accept="image/*" onChange={handleFileChange}
                        className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 file:cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Prénom</label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Nom de famille</label>
                      <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Promotion</label>
                      <input type="text" name="promotion" required value={formData.promotion} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Spécialité</label>
                      <input type="text" name="specialty" required value={formData.specialty} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Localisation Actuelle</label>
                    <input type="text" name="currentLocation" required value={formData.currentLocation} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Biographie</label>
                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors resize-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Compétences (séparées par des virgules)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-700 transition-colors" />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
                    {submitting ? 'Enregistrement...' : 'Enregistrer mon profil'}
                  </button>
                </form>
              </div>
            )}

            {/* ONGLET POSTS */}
            {activeTab === 'posts' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {myPosts.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                    Aucune publication pour le moment dans l'espace Entraide.
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <div 
                      key={post._id} 
                      onClick={() => navigate('/blog', { state: { scrollToId: post._id } })}
                      className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-all shadow-md group"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-500">{new Date(post.date).toLocaleDateString('fr-FR')}</span>
                        <span className="text-xs bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 uppercase font-bold tracking-wider">
                          {post.category}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap group-hover:text-zinc-100 transition-colors">{post.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ONGLET PROJECTS */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                    Aucun projet partagé pour le moment dans le Showcase.
                  </div>
                ) : (
                  myProjects.map((project) => (
                    <div 
                      key={project._id} 
                      onClick={() => navigate('/showcase', { state: { scrollToId: project._id } })}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-600 transition-all shadow-lg group"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{project.description}</p>
                      </div>
                      
                      <div className="flex gap-2 text-center text-xs mt-4">
                        {project.githubLink && (
                          <a 
                            href={project.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl w-full text-zinc-300 hover:bg-zinc-800 transition-colors"
                          >
                            📦 GitHub
                          </a>
                        )}
                        {project.demoLink && (
                          <a 
                            href={project.demoLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-indigo-600 p-2 rounded-xl w-full text-white hover:bg-indigo-500 transition-colors"
                          >
                            🌐 Démo
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Profil;