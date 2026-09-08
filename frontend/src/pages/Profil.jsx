import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import Navbar from '../components/Navbar';
import API from '../services/api';
import {
  Settings,
  FileText,
  Rocket,
  AlertTriangle,
  Trash2,
  Save,
  Camera,
  User,
  MapPin,
  GraduationCap,
  GitBranch,
  Globe,
  CheckCircle2,
  XCircle,
  Sparkles,
  ZoomIn,
  Check,
  X
} from 'lucide-react';

// Fonction utilitaire pour découper l'image recadrée via un Canvas HTML5
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg', 0.90);
  });
}

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

  // États dédiés au recadrage (Cropper)
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isIncomplete = searchParams.get('reason') === 'incomplete';

  const [activeTab, setActiveTab] = useState('account');
  const [myPosts, setMyPosts] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const BACKEND_URL = 'https://hitas.onrender.com';

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getUserId = (userField) => {
    if (!userField) return '';
    return typeof userField === 'object' ? userField._id : userField;
  };

  const cleanSkillsData = (rawSkills) => {
    if (!rawSkills) return '';

    // Si c'est déjà un tableau (ex: ['React', 'Node'])
    if (Array.isArray(rawSkills)) {
      return rawSkills.flat(Infinity).join(', ');
    }

    if (typeof rawSkills === 'string') {
      // Nettoyage préalable des caractères superflus si c'est une string mal formatée
      let cleaned = rawSkills.trim();

      // Essayer de parser si c'est du JSON (ex: '["React", "Node"]')
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return parsed.flat(Infinity).join(', ');
        }
      } catch (e) {
        // Si ce n'est pas du JSON valide, on nettoie juste les crochets/guillemets restants
        cleaned = cleaned.replace(/^\[+|\]+$/g, '').replace(/["']/g, '');
        return cleaned;
      }
    }

    return '';
  };

  const presetSpecialties = [
    'Agriculture', 'Architecture', 'Biotechnologie', 'Business Administration (BBA)',
    'Computer Applications (BCA/MCA)', 'Computer Science & Engineering (CSE)',
    'Computer Science & Engineering (AI & ML)', 'Computer Science & Engineering (Cyber Security)',
    'Computer Science & Engineering (Data Science)', 'Computer Science & Engineering (Internet of Things)',
    'Computer Science & Information Technology (CSIT)', 'Dentistry', 'Electrical & Electronics Engineering (EEE)',
    'Electrical Engineering (EE)', 'Electronics & Communication Engineering (ECE)',
    'Hospitality & Hotel Management', 'Law', 'Management (MBA)',
    'MBA (Artificial Intelligence & Data Science)', 'MBA (Hospital Administration)',
    'Mathematics', 'Mechanical Engineering', 'Medicine (MBBS)', 'Nursing',
    'Paramedical Sciences', 'Pharmaceutical Sciences', 'Physics', 'Sciences (Chemistry)',
    'Structural Engineering', 'Veterinary Science'
  ];

  const presetCountries = ['Allemagne', 'France', 'Cameroun', 'USA', 'Belgique', 'Italie', 'Angleterre', 'Brésil', 'Inde'];
  const presetPromotions = ['2030', '2029', '2028', '2027', '2026'];

  useEffect(() => {
    const fetchAllProfileData = async () => {
      try {
        setLoading(true);
        const loggedInUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        try {
          const response = await API.get('/profile/me', {
            headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
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
              skills: cleanSkillsData(data.skills)
            });

            if (data.avatar) {
              setAvatarPreview(formatMediaUrl(data.avatar));
            }
          }
        } catch (err) {
          console.log("Aucun profil existant trouvé ou session invalide.", err);
        }

        try {
          const postsRes = await API.get('/posts');
          setMyPosts(postsRes.data.filter(post => getUserId(post.user) === loggedInUserId));
        } catch (err) {
          console.error("Erreur lors de la récupération des publications", err);
        }

        try {
          const projectsRes = await API.get('/project');
          setMyProjects(projectsRes.data.filter(project => getUserId(project.user) === loggedInUserId));
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

  // Intercepte le choix du fichier pour ouvrir la modale de recadrage
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setIsCroppingModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Validation du recadrage : génère le fichier final recadré
  const handleConfirmCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "avatar-cropped.jpg", { type: "image/jpeg" });

      setAvatarFile(croppedFile);
      setAvatarPreview(URL.createObjectURL(croppedFile));
      setIsCroppingModalOpen(false);
    } catch (e) {
      console.error("Erreur lors du recadrage de l'image", e);
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

    if (formData.status === 'En poste') {
      data.append('jobTitle', formData.jobTitle);
      data.append('currentCompany', formData.currentCompany);
    } else {
      data.append('jobTitle', '');
      data.append('currentCompany', '');
    }

    data.append('bio', formData.bio || '');

    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    data.append('skills', JSON.stringify(skillsArray));

    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    try {
      const response = await API.post('/profile', data, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
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
      const errorMsg = err.response?.data?.message || err.response?.data?.error;

      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expirée ou jeton invalide (401). Veuillez vous reconnecter.' });
      } else {
        setMessage({ type: 'error', text: errorMsg || 'Erreur lors de la sauvegarde du profil.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("🛑 Es-tu absolument sûr de vouloir supprimer ton compte ? Cette action est irréversible.");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        await API.delete('/profile', { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } });
        alert("Ton compte a été supprimé avec succès.");
        localStorage.clear();
        navigate('/login');
      } catch (err) {
        alert(err.response?.data?.message || "Une erreur est survenue lors de la suppression.");
      }
    }
  };

  return (
    <div
      className="min-h-screen text-slate-900 dark:text-zinc-50 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white overflow-x-hidden"
    >
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10 overflow-hidden">

        {/* MODALE DE RECADRAGE INTERACTIVE */}
        {isCroppingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-sky-950 border border-gray-200 dark:border-sky-800/50 rounded-3xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-sky-900/40 pb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Cadrer et ajuster votre photo
                </h3>
                <button
                  onClick={() => setIsCroppingModalOpen(false)}
                  className="text-gray-500 dark:text-sky-300/70 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Zone de recadrage */}
              <div className="relative w-full h-72 sm:h-80 bg-black/60 rounded-2xl overflow-hidden border border-gray-200 dark:border-sky-800/40">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // Format carré parfait pour un avatar
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Contrôle du Zoom */}
              <div className="flex items-center gap-3 px-2">
                <ZoomIn className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom de l'image"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-xs text-gray-600 dark:text-sky-200 font-bold w-10 text-right">{Math.round(zoom * 100)}%</span>
              </div>

              {/* Boutons d'action de la modale */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCroppingModalOpen(false)}
                  className="w-1/2 py-3 bg-gray-100 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 hover:bg-gray-200 dark:hover:bg-sky-900 text-gray-700 dark:text-sky-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="w-1/2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Valider le cadre
                </button>
              </div>
            </div>
          </div>
        )}

        {isIncomplete && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 rounded-2xl text-center text-sm shadow-xl font-medium animate-pulse flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <span><strong>Profil incomplet :</strong> Veuillez remplir et sauvegarder vos informations obligatoires.</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-sky-950/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-sky-800/40 shadow-2xl gap-4">
            <div className="w-10 h-10 border-4 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-sky-300 font-bold tracking-widest uppercase text-xs">Chargement de tes données...</p>
          </div>
        ) : (
          <div>
            <div className="bg-white/80 dark:bg-sky-950/85 backdrop-blur-2xl border border-gray-200 dark:border-sky-800/40 rounded-3xl overflow-hidden shadow-2xl mb-8 mt-4 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="h-32 sm:h-40 bg-gradient-to-r from-sky-100 via-blue-50 to-white dark:from-sky-900/40 dark:via-blue-950/40 dark:to-sky-950/60 border-b border-gray-200 dark:border-sky-800/40 relative"></div>

              <div className="px-6 pb-6 sm:px-10 sm:pb-8 relative">
                <div className="absolute -top-16 sm:-top-20 left-6 sm:left-10">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white dark:bg-sky-950 border-4 border-white dark:border-sky-950 flex items-center justify-center text-3xl font-bold uppercase shadow-2xl overflow-hidden text-sky-700 dark:text-sky-200">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center">
                        {formData.firstName ? formData.firstName[0] : 'M'}
                        {formData.lastName ? formData.lastName[0] : 'P'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-20 sm:pt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="overflow-hidden">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-1.5 break-words">
                      {formData.firstName || 'Mon'} {formData.lastName || 'Profil'}
                    </h1>
                    <p className="text-sky-700 dark:text-sky-300 font-semibold text-xs sm:text-sm truncate flex items-center gap-1.5 mb-1">
                      <GraduationCap className="w-4 h-4" /> {formData.specialty || 'Étudiant ITAS'} {formData.promotion && `— Promo ${formData.promotion}`}
                    </p>
                    <p className="text-gray-600 dark:text-sky-100 text-xs font-medium truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-sky-300/70" /> {formData.country || formData.currentLocation || 'Localisation non renseignée'} {formData.status && `• [${formData.status}]`}
                    </p>
                  </div>

                  <div className="flex gap-3 text-xs text-gray-600 dark:text-sky-100 mt-2 sm:mt-0 flex-shrink-0">
                    <div className="bg-gray-50 dark:bg-sky-900/40 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-sky-800 shadow-inner flex flex-col items-center">
                      <span className="text-gray-900 dark:text-white font-black text-lg">{myPosts.length}</span>
                      <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-sky-300/70 font-bold">Posts</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-sky-900/40 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-sky-800 shadow-inner flex flex-col items-center">
                      <span className="text-gray-900 dark:text-white font-black text-lg">{myProjects.length}</span>
                      <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-sky-300/70 font-bold">Projets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-8 border-b border-gray-200 dark:border-sky-800/40 mb-8 pb-3 text-xs font-bold tracking-wider overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`pb-2.5 px-1 transition-all flex items-center gap-2 whitespace-nowrap relative ${activeTab === 'account' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-500 dark:text-sky-100 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Settings className="w-4 h-4" /> Paramètres du Profil
                {activeTab === 'account' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400 shadow-sm"></div>}
              </button>
              <button
                type="button"
                disabled={isIncomplete}
                onClick={() => setActiveTab('posts')}
                className={`pb-2.5 px-1 transition-all flex items-center gap-2 whitespace-nowrap relative disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'posts' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-500 dark:text-sky-100 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <FileText className="w-4 h-4" /> Mes Publications ({myPosts.length})
                {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400 shadow-sm"></div>}
              </button>
              <button
                type="button"
                disabled={isIncomplete}
                onClick={() => setActiveTab('projects')}
                className={`pb-2.5 px-1 transition-all flex items-center gap-2 whitespace-nowrap relative disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'projects' ? 'text-sky-700 dark:text-sky-300' : 'text-gray-500 dark:text-sky-100 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Rocket className="w-4 h-4" /> Mes Projets ({myProjects.length})
                {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400 shadow-sm"></div>}
              </button>
            </div>

            {activeTab === 'account' && (
              <div className="space-y-8">
                <div className="p-6 sm:p-8 bg-white/80 dark:bg-sky-950/85 backdrop-blur-2xl border border-gray-200 dark:border-sky-800/40 rounded-3xl shadow-2xl">

                  <h2 className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Éditer les informations du profil
                  </h2>

                  {message.text && (
                    <div className={`mb-6 p-4 border text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-md ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400'
                      }`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                      <span className="whitespace-pre-wrap">{message.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-5 bg-gray-50 dark:bg-sky-900/40 p-4 border border-gray-200 dark:border-sky-800 rounded-2xl shadow-inner">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-sky-950 border border-gray-200 dark:border-sky-800 overflow-hidden flex items-center justify-center flex-shrink-0 shadow">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300 mb-1.5 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" /> Changer la photo de profil
                        </label>
                        <input
                          type="file" accept="image/*" onChange={handleFileChange}
                          className="w-full text-xs text-gray-500 dark:text-sky-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-100 dark:file:bg-sky-900 file:text-sky-800 dark:file:text-sky-200 hover:file:bg-sky-200 file:cursor-pointer transition-colors"
                        />
                        <p className="text-[10px] text-gray-500 dark:text-sky-300/70 mt-1">Vous pourrez cadrer et zoomer l'image après l'avoir sélectionnée.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Prénoms *</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Noms *</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Promotion *</label>
                        <input type="text" name="promotion" list="promotions-list" required value={formData.promotion} onChange={handleChange} placeholder="Ex: 2026" className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                        <datalist id="promotions-list">
                          {presetPromotions.map((p, i) => <option key={i} value={p} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Spécialité *</label>
                        <input type="text" name="specialty" list="specialties-list" required value={formData.specialty} onChange={handleChange} placeholder="Ex: Développement Web / Fullstack" className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                        <datalist id="specialties-list">
                          {presetSpecialties.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Statut Actuel</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner cursor-pointer">
                          <option value="" className="bg-white dark:bg-sky-950">Sélectionner un statut</option>
                          <option value="Étudiant" className="bg-white dark:bg-sky-950">Étudiant</option>
                          <option value="En poste" className="bg-white dark:bg-sky-950">En poste</option>
                          <option value="En recherche de stage" className="bg-white dark:bg-sky-950">En recherche de stage</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Niveau d'étude</label>
                        <select name="degreeLevel" value={formData.degreeLevel} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner cursor-pointer">
                          <option value="" className="bg-white dark:bg-sky-950">Sélectionner un niveau</option>
                          <option value="Licence" className="bg-white dark:bg-sky-950">Licence / Bachelor</option>
                          <option value="Master" className="bg-white dark:bg-sky-950">Master / M2</option>
                          <option value="Doctorat" className="bg-white dark:bg-sky-950">Doctorat / Ph.D</option>
                          <option value="Alumni" className="bg-white dark:bg-sky-950">Alumni (Diplômé)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Pays *</label>
                        <input type="text" name="country" list="countries-list" required value={formData.country} onChange={handleChange} placeholder="Ex: France, Allemagne..." className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                        <datalist id="countries-list">
                          {presetCountries.map((c, i) => <option key={i} value={c} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Adresse *</label>
                        <input type="text" name="currentLocation" required value={formData.currentLocation} onChange={handleChange} placeholder="Ex: Paris, Lyon, Berlin..." className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                      </div>
                    </div>

                    {formData.status === 'En poste' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Intitulé du Poste</label>
                          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Ex: Développeur Fullstack" className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Entreprise Actuelle</label>
                          <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleChange} placeholder="Ex: Capgemini, Freelance..." className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Biographie / À propos (Ex:Contact, email)</label>
                      <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all resize-none shadow-inner leading-relaxed" placeholder="Une courte description de ton parcours..." />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-sky-300/70 mb-1.5">Compétences (séparées par des virgules)</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 rounded-xl text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner" placeholder="Ex: React, Node.js, Docker, Python..." />
                    </div>

                    <div className="pt-4">
                      <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> {submitting ? 'Enregistrement en cours...' : 'Sauvegarder les modifications'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="p-6 sm:p-8 bg-white/80 dark:bg-sky-950/85 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-sky-100 leading-relaxed">
                        Cette action est définitive et irréversible. Elle supprimera définitivement votre profil, vos posts et vos projets de la plateforme HITAS.
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={handleDeleteAccount} className="w-full sm:w-auto px-5 py-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-red-900/80 transition-colors shadow-md flex items-center justify-center gap-2 flex-shrink-0">
                    <Trash2 className="w-4 h-4" /> Supprimer mon compte
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {myPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white/80 dark:bg-sky-950/80 backdrop-blur-2xl border border-gray-200 dark:border-sky-800/40 rounded-3xl text-gray-500 dark:text-sky-200 text-xs shadow-xl">
                    Aucune publication pour le moment dans l'espace Entraide.
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <div key={post._id} onClick={() => navigate('/blog', { state: { scrollToId: post._id } })} className="bg-white/80 dark:bg-sky-950/80 backdrop-blur-2xl p-6 rounded-3xl border border-gray-200 dark:border-sky-800/40 cursor-pointer hover:border-sky-500 transition-all shadow-xl group overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-sky-300/70">{new Date(post.date).toLocaleDateString('fr-FR')}</span>
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-200 px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-500/30 uppercase font-bold tracking-wider">{post.category}</span>
                      </div>
                      <p className="text-gray-800 dark:text-zinc-200 text-sm whitespace-pre-wrap group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-relaxed break-words">{post.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white/80 dark:bg-sky-950/80 backdrop-blur-2xl border border-gray-200 dark:border-sky-800/40 rounded-3xl text-gray-500 dark:text-sky-200 text-xs shadow-xl">
                    Aucun projet partagé pour le moment dans le Showcase.
                  </div>
                ) : (
                  myProjects.map((project) => (
                    <div key={project._id} onClick={() => navigate('/showcase', { state: { scrollToId: project._id } })} className="bg-white/80 dark:bg-sky-950/80 backdrop-blur-2xl border border-gray-200 dark:border-sky-800/40 rounded-3xl p-6 flex flex-col justify-between cursor-pointer hover:border-sky-500 transition-all shadow-xl group overflow-hidden">
                      <div className="overflow-hidden">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors break-words uppercase tracking-wide">{project.title}</h3>
                        <p className="text-gray-600 dark:text-sky-100 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed break-words">{project.description}</p>
                      </div>

                      <div className="flex gap-3 text-center text-xs mt-4 pt-4 border-t border-gray-200 dark:border-sky-900/40">
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-gray-100 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800 py-2.5 px-3 rounded-xl w-full text-gray-700 dark:text-sky-200 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-sky-900 transition-colors font-semibold truncate flex items-center justify-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 px-3 rounded-xl w-full text-white hover:from-sky-500 hover:to-blue-500 transition-colors font-bold shadow-md shadow-sky-500/20 truncate flex items-center justify-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> Démo
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

Profil.propTypes = {};

export default Profil;