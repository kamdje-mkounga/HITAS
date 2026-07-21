import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';

function Profil() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    promotion: '',
    specialty: '',
    currentLocation: '',
    country: '',
    status: '',
    degreeLevel: '',
    jobTitle: '',
    currentCompany: '',
    bio: '',
    skills: ''
  });
  const [avatarFile, setAvatarFile] = useState(null); 
  const [avatarPreview, setAvatarPreview] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isIncomplete = searchParams.get('reason') === 'incomplete';

  const [activeTab, setActiveTab] = useState('account'); 
  const [myPosts, setMyPosts] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const BACKEND_URL = 'https://hitas.onrender.com';

  // Formatage URL des médias
  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  // Listes prédéfinies pour correspondre aux filtres de l'Annuaire
  const presetSpecialties = [
    'Développement Web / Fullstack',
    'Génie Logiciel',
    'Data Science & IA',
    'Cybersécurité',
    'Cloud & DevOps',
    'Réseaux & Systèmes',
    'Informatique Décisionnelle (BI)',
    'UI/UX Design',
    'IoT / Systèmes Embarqués'
  ];

  const presetCountries = [
    'Allemagne',
    'France',
    'Cameroun',
    'USA',
    'Belgique',
    'Italie',
    'Angleterre'
  ];

  const presetPromotions = ['2030', '2029', '2028', '2027', '2026'];

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
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            }
          });

          if (response.data) {
            const data = response.data;
            setFormData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              promotion: data.promotion || '',
              specialty: data.specialty || '',
              currentLocation: data.currentLocation || '',
              country: data.country || data.currentLocation || '',
              status: data.status || '',
              degreeLevel: data.degreeLevel || '',
              jobTitle: data.jobTitle || '',
              currentCompany: data.currentCompany || '',
              bio: data.bio || '',
              skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '')
            });
            
            if (data.avatar) {
              setAvatarPreview(formatMediaUrl(data.avatar));
            } else {
              setAvatarPreview('');
            }
          }
        } catch (err) {
          console.log("Aucun profil existant trouvé ou session invalide.", err);
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

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage({ type: 'error', text: 'Votre session a expiré. Veuillez vous reconnecter.' });
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('promotion', formData.promotion);
    data.append('specialty', formData.specialty);
    data.append('currentLocation', formData.currentLocation || formData.country);
    data.append('country', formData.country);
    data.append('status', formData.status);
    data.append('degreeLevel', formData.degreeLevel);
    data.append('jobTitle', formData.jobTitle);
    data.append('currentCompany', formData.currentCompany);
    data.append('bio', formData.bio);

    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    data.append('skills', JSON.stringify(skillsArray));

    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    try {
      const response = await API.post('/profile', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (response.data && response.data.avatar) {
        setAvatarPreview(formatMediaUrl(response.data.avatar));
        setAvatarFile(null);
      }

      localStorage.setItem('isProfileComplete', 'true');
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès ! Redirection...' });

      setTimeout(() => {
        navigate('/');
      }, 1200);

    } catch (err) {
      console.error("Erreur détaillée lors de la sauvegarde :", err);

      if (err.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Session expirée ou jeton invalide (401). Essaye de te déconnecter et de te reconnecter.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || 'Erreur lors de la sauvegarde du profil.' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
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
        
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isProfileComplete');
        
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
        
        {/* Banner Profil Incomplet */}
        {isIncomplete && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-2xl text-center text-sm shadow-xl font-medium animate-pulse">
            🚀 <strong>Profil incomplet :</strong> Veuillez remplir et sauvegarder vos informations obligatoires pour débloquer l'accès à l'Accueil, au Blog et à l'Annuaire.
          </div>
        )}

        {loading ? (
          <p className="text-zinc-400 font-bold tracking-widest uppercase text-xs animate-pulse text-center py-20 bg-[#0b081e]/80 backdrop-blur-md rounded-2xl border border-indigo-900/60 shadow-xl">
            Chargement de tes données...
          </p>
        ) : (
          <div>
            {/* CARTE D'EN-TÊTE PRINCIPALE */}
            <div className="bg-[#0b081e]/85 backdrop-blur-xl border border-indigo-900/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 mb-10 mt-8">
              <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#030014] border-b border-indigo-900/50 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>

              <div className="px-6 pb-6 sm:px-10 sm:pb-8 relative">
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

                <div className="pt-20 sm:pt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">
                      {formData.firstName || 'Mon'} {formData.lastName || 'Profil'}
                    </h1>
                    <p className="text-indigo-400 font-medium text-sm">
                      🎓 {formData.specialty || 'Étudiant ITAS'} {formData.promotion && `— Promo ${formData.promotion}`}
                    </p>
                    <p className="text-zinc-400 text-[11px] font-semibold mt-1">
                      📍 {formData.country || formData.currentLocation || 'Localisation non renseignée'} {formData.status && `• [${formData.status}]`}
                    </p>
                  </div>

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
                disabled={isIncomplete}
                onClick={() => setActiveTab('posts')}
                className={`pb-2 px-1 transition-all border-b-2 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === 'posts' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                📝 Mes Publications ({myPosts.length})
              </button>
              <button
                type="button"
                disabled={isIncomplete}
                onClick={() => setActiveTab('projects')}
                className={`pb-2 px-1 transition-all border-b-2 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
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
                      Éditer les informations du profil
                    </h2>

                    {message.text && (
                      <div className={`mb-6 p-4 border text-xs font-bold rounded-xl flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Avatar */}
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

                      {/* Prénom & Nom */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Prénom *</label>
                          <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Nom de famille *</label>
                          <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                      </div>

                      {/* Promotion & Spécialité */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Promotion *</label>
                          <input 
                            type="text" 
                            name="promotion" 
                            list="promotions-list"
                            required 
                            value={formData.promotion} 
                            onChange={handleChange} 
                            placeholder="Ex: 2026"
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
                          />
                          <datalist id="promotions-list">
                            {presetPromotions.map((p, i) => <option key={i} value={p} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Spécialité *</label>
                          <input 
                            type="text" 
                            name="specialty" 
                            list="specialties-list"
                            required 
                            value={formData.specialty} 
                            onChange={handleChange} 
                            placeholder="Ex: Développement Web / Fullstack"
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
                          />
                          <datalist id="specialties-list">
                            {presetSpecialties.map((s, i) => <option key={i} value={s} />)}
                          </datalist>
                        </div>
                      </div>

                      {/* Statut & Niveau d'étude */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Statut Actuel</label>
                          <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner cursor-pointer"
                          >
                            <option value="" className="bg-[#0b081e]">Sélectionner un statut</option>
                            <option value="Étudiant" className="bg-[#0b081e]">Étudiant</option>
                            <option value="En poste" className="bg-[#0b081e]">En poste</option>
                            <option value="En recherche de stage" className="bg-[#0b081e]">En recherche de stage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Niveau d'étude</label>
                          <select 
                            name="degreeLevel" 
                            value={formData.degreeLevel} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner cursor-pointer"
                          >
                            <option value="" className="bg-[#0b081e]">Sélectionner un niveau</option>
                            <option value="Licence" className="bg-[#0b081e]">Licence / Bachelor</option>
                            <option value="Master" className="bg-[#0b081e]">Master / M2</option>
                            <option value="Doctorat" className="bg-[#0b081e]">Doctorat / Ph.D</option>
                            <option value="Alumni" className="bg-[#0b081e]">Alumni (Diplômé)</option>
                          </select>
                        </div>
                      </div>

                      {/* Pays / Localisation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Pays *</label>
                          <input 
                            type="text" 
                            name="country" 
                            list="countries-list"
                            required
                            value={formData.country} 
                            onChange={handleChange} 
                            placeholder="Ex: France, Allemagne..."
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
                          />
                          <datalist id="countries-list">
                            {presetCountries.map((c, i) => <option key={i} value={c} />)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Ville / Emplacement précis *</label>
                          <input 
                            type="text" 
                            name="currentLocation" 
                            required 
                            value={formData.currentLocation} 
                            onChange={handleChange} 
                            placeholder="Ex: Paris, Lyon, Berlin..." 
                            className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
                          />
                        </div>
                      </div>

                      {/* Poste & Entreprise (Si en poste) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Intitulé du Poste</label>
                          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Ex: Développeur Fullstack" className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Entreprise Actuelle</label>
                          <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Ex: Capgemini, Freelance..." className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Biographie / À propos</label>
                        <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner leading-relaxed" placeholder="Une courte description de ton parcours..." />
                      </div>

                      {/* Compétences */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Compétences (séparées par des virgules)</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-[#030014]/60 border border-indigo-950/60 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" placeholder="Ex: React, Node.js, Docker, Python..." />
                      </div>

                      <div className="pt-4">
                        <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50">
                          {submitting ? 'Enregistrement en cours...' : 'Sauvegarder les modifications'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* COLONNE DROITE : Zone de Danger */}
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