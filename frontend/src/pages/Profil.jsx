import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api'; // On utilise uniquement ton instance API configurée
import tradPattern from '../assets/traditional.jpg';

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
  //
  // NOUVELLE FONCTION : Gestion de la suppression du compte
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "🛑 Es-tu absolument sûr de vouloir supprimer ton compte ? Cette action est irréversible et effacera ton profil, tes publications et tes projets."
    );

    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        
        await API.delete('/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        });

        alert("Ton compte a été supprimé avec succès.");
        
        // Nettoyage complet du stockage local
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Redirection vers l'écran de connexion
        navigate('/login');
      } catch (err) {
        console.error("Erreur lors de la suppression du compte :", err);
        alert(err.response?.data?.message || "Une erreur est survenue lors de la suppression.");
      }
    }
  };
  return (
    <div 
      className="min-h-screen bg-[#030014] text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10">
        {loading ? (
          <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs animate-pulse text-center py-20 bg-[#0b081e]/80 backdrop-blur-md rounded-2xl border border-indigo-900/60 shadow-xl">
            Chargement de tes données...
          </p>
        ) : (
          <div>
            {/* CARTE D'EN-TÊTE PRINCIPALE (STYLE BANNIÈRE) */}
            <div className="bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 mb-10 mt-8">
              
              {/* Bannière décorative */}
              <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#030014] border-b border-indigo-900/50 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>

              <div className="px-6 pb-6 sm:px-10 sm:pb-8 relative">
                {/* Avatar superposé */}
                <div className="absolute -top-16 sm:-top-20 left-6 sm:left-10">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#030014] border-4 border-[#0b081e] flex items-center justify-center text-3xl font-bold uppercase shadow-xl shadow-indigo-500/10 overflow-hidden text-indigo-300">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>
                        {formData.firstName ? formData.firstName[0] : 'M'}
                        {formData.lastName ? formData.lastName[0] : 'P'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Infos principales */}
                <div className="pt-20 sm:pt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">
                      {formData.firstName || 'Mon'} {formData.lastName || 'Profil'}
                    </h1>
                    <p className="text-indigo-400 font-medium text-sm">
                      🎓 {formData.specialty || 'Étudiant ITAS'} {formData.promotion && `— Promo ${formData.promotion}`}
                    </p>
                    <p className="text-zinc-400 text-[11px] font-semibold mt-1">
                      📍 {formData.currentLocation || 'Localisation non renseignée'}
                    </p>
                  </div>

                  {/* Statistiques alignées à droite */}
                  <div className="flex gap-3 text-xs text-zinc-400 mt-2 sm:mt-0">
                    <div className="bg-[#030014]/60 px-4 py-2 rounded-xl border border-indigo-900/40 shadow-inner flex flex-col items-center">
                      <span className="text-white font-black text-lg">{myPosts.length}</span>
                      <span className="text-[9px] uppercase tracking-widest">Posts</span>
                    </div>
                    <div className="bg-[#030014]/60 px-4 py-2 rounded-xl border border-indigo-900/40 shadow-inner flex flex-col items-center">
                      <span className="text-white font-black text-lg">{myProjects.length}</span>
                      <span className="text-[9px] uppercase tracking-widest">Projets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ONGLETS */}
            <div className="flex gap-6 border-b border-indigo-900/40 mb-8 pb-3 text-sm font-bold tracking-wide overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`pb-2 px-1 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'account' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                ⚙️ Paramètres du Profil
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`pb-2 px-1 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'posts' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                📝 Mes Publications ({myPosts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`pb-2 px-1 transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'projects' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                🚀 Mes Projets ({myProjects.length})
              </button>
            </div>

            {/* CONTENU DYNAMIQUE */}
            {activeTab === 'account' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLONNE GAUCHE : Formulaire */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 sm:p-8 bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/60 rounded-3xl shadow-xl shadow-black/40">
                    
                    <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      Éditer les informations
                    </h2>

                    {message.text && (
                      <div className={`mb-6 p-4 border text-xs font-bold rounded-xl flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Update Avatar Input */}
                      <div className="flex items-center gap-5 bg-[#030014]/60 p-4 border border-indigo-950/60 rounded-2xl shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-[#0b081e] border border-indigo-900/60 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">👤</span>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Changer la photo</label>
                          <input 
                            type="file" accept="image/*" onChange={handleFileChange}
                            className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0b081e] file:text-indigo-300 hover:file:bg-indigo-950/50 file:cursor-pointer transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Prénom</label>
                          <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Nom de famille</label>
                          <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Promotion</label>
                          <input type="text" name="promotion" required value={formData.promotion} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Spécialité</label>
                          <input type="text" name="specialty" required value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Localisation Actuelle</label>
                        <input type="text" name="currentLocation" required value={formData.currentLocation} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Biographie / À propos</label>
                        <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner leading-relaxed" placeholder="Une courte description de ton parcours..." />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Compétences (séparées par des virgules)</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" placeholder="Ex: React, Node.js, Réseaux..." />
                      </div>

                      <div className="pt-4">
                        <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50">
                          {submitting ? 'Enregistrement en cours...' : 'Sauvegarder les modifications'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* COLONNE DROITE : Danger Zone */}
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 bg-[#0b081e]/85 backdrop-blur-xl border border-red-900/30 rounded-3xl shadow-xl flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <h4 className="text-base font-bold text-red-400 mb-2">Zone de Danger</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      La suppression supprimera définitivement votre profil, vos posts et vos projets de la plateforme HITAS. Cette action est irréversible.
                    </p>
                    <button 
                      type="button"
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold text-xs rounded-xl border border-red-900/60 transition-colors shadow-sm"
                    >
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET POSTS */}
            {activeTab === 'posts' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {myPosts.length === 0 ? (
                  <div className="text-center py-16 bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/40 rounded-3xl text-zinc-500 text-sm shadow-xl">
                    Aucune publication pour le moment dans l'espace Entraide.
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <div 
                      key={post._id} 
                      onClick={() => navigate('/blog', { state: { scrollToId: post._id } })}
                      className="bg-[#0b081e]/85 backdrop-blur-md p-6 rounded-2xl border border-indigo-900/60 cursor-pointer hover:border-indigo-600/50 hover:bg-[#0b081e] transition-all shadow-lg group"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-medium text-zinc-500">{new Date(post.date).toLocaleDateString('fr-FR')}</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 uppercase font-bold tracking-wider">
                          {post.category}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap group-hover:text-zinc-100 transition-colors leading-relaxed">{post.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ONGLET PROJECTS */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/40 rounded-3xl text-zinc-500 text-sm shadow-xl">
                    Aucun projet partagé pour le moment dans le Showcase.
                  </div>
                ) : (
                  myProjects.map((project) => (
                    <div 
                      key={project._id} 
                      onClick={() => navigate('/showcase', { state: { scrollToId: project._id } })}
                      className="bg-[#0b081e]/85 backdrop-blur-md border border-indigo-900/60 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-indigo-600/50 hover:bg-[#0b081e] transition-all shadow-lg group"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                        <p className="text-zinc-400 text-sm mb-4 line-clamp-3 leading-relaxed">{project.description}</p>
                      </div>
                      
                      <div className="flex gap-3 text-center text-xs mt-4 pt-4 border-t border-indigo-950/60">
                        {project.githubLink && (
                          <a 
                            href={project.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-[#030014]/80 border border-indigo-900/40 p-2.5 rounded-xl w-full text-zinc-300 hover:text-white hover:bg-[#030014] transition-colors font-semibold"
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
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2.5 rounded-xl w-full text-white hover:from-indigo-500 hover:to-purple-500 transition-colors font-bold shadow-md shadow-indigo-500/20"
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