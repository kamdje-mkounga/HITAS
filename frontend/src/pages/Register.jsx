import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, GraduationCap, MapPin } from 'lucide-react';
import API from '../services/api';

const PRESET_PROMOTIONS = ['2030', '2029', '2028', '2027', '2026'];
const PRESET_COUNTRIES = ['Allemagne', 'France', 'Cameroun', 'USA', 'Belgique', 'Italie', 'Angleterre', 'Brésil', 'Inde'];
const PRESET_SPECIALTIES = [
  'Computer Science & Engineering (CSE)',
  'Computer Science & Information Technology (CSIT)',
  'Computer Science & Engineering (AI & ML)',
  'Computer Science & Engineering (Cyber Security)',
  'Computer Science & Engineering (Data Science)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering',
  'Business Administration (BBA)',
  'Management (MBA)',
  'Architecture',
  'Biotechnologie',
];

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    firstName: '',
    lastName: '',
    promotion: '',
    specialty: '',
    currentLocation: '',
    country: '',
    city: '',
    status: 'Étudiant',
    degreeLevel: 'Licence',
    currentCompany: '',
    jobTitle: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    website: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role'
        ? {
          status: value === 'alumni' ? 'En poste' : 'Étudiant',
          degreeLevel: value === 'alumni' ? 'Alumni' : 'Licence',
        }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        promotion: formData.promotion,
        specialty: formData.specialty,
        currentLocation: formData.currentLocation || formData.country,
        country: formData.country,
        city: formData.city,
        status: formData.status,
        degreeLevel: formData.degreeLevel,
        currentCompany: formData.status === 'En poste' ? formData.currentCompany : '',
        jobTitle: formData.status === 'En poste' ? formData.jobTitle : '',
        bio: formData.bio,
        skills: skillsArray,
        socials: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website,
        },
      };

      await API.post('/auth/register', payload);

      setSuccess(
        "Inscription complète enregistrée ! Votre profil est maintenant en attente de validation par l'administrateur."
      );

      setTimeout(() => {
        navigate('/login');
      }, 4500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-900 dark:text-zinc-100 antialiased relative flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-2xl p-7 sm:p-10 bg-white/85 dark:bg-sky-950/85 backdrop-blur-xl border border-gray-200 dark:border-sky-800/40 rounded-[2.5rem] shadow-xl relative z-10">

        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Inscription Complète
          </h2>
          <p className="text-gray-600 dark:text-sky-100 text-xs sm:text-sm mt-2 font-medium">
            Remplissez vos informations en une seule étape
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-medium rounded-xl leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl leading-relaxed">
            🎉 {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Identifiants & Rôle */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> 1. Compte &amp; Sécurité
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Adresse Email *"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="student" className="bg-white dark:bg-sky-950">Étudiant (Student)</option>
                <option value="alumni" className="bg-white dark:bg-sky-950">Alumni (Diplômé)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe (min. 6 caractères) *"
                  className="w-full px-5 py-3 pr-11 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-sky-300/70 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmer le mot de passe *"
                  className="w-full px-5 py-3 pr-11 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-sky-300/70 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Parcours académique */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> 2. Informations du Profil
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Prénoms *"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Noms *"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="promotion"
                  list="reg-promotions"
                  required
                  value={formData.promotion}
                  onChange={handleChange}
                  placeholder="Promotion (ex: 2026) *"
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <datalist id="reg-promotions">
                  {PRESET_PROMOTIONS.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>

              <div>
                <input
                  type="text"
                  name="specialty"
                  list="reg-specialties"
                  required
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Spécialité / Filière *"
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <datalist id="reg-specialties">
                  {PRESET_SPECIALTIES.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Étudiant" className="bg-white dark:bg-sky-950">Étudiant</option>
                <option value="En poste" className="bg-white dark:bg-sky-950">En poste</option>
                <option value="En recherche de stage" className="bg-white dark:bg-sky-950">En recherche de stage</option>
                <option value="Indépendant / Freelance" className="bg-white dark:bg-sky-950">Indépendant / Freelance</option>
                <option value="En poursuite d'études" className="bg-white dark:bg-sky-950">En poursuite d&apos;études</option>
                <option value="Autre" className="bg-white dark:bg-sky-950">Autre</option>
              </select>

              <select
                name="degreeLevel"
                value={formData.degreeLevel}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Licence" className="bg-white dark:bg-sky-950">Licence / Bachelor</option>
                <option value="Master" className="bg-white dark:bg-sky-950">Master / M2</option>
                <option value="Doctorat" className="bg-white dark:bg-sky-950">Doctorat / Ph.D</option>
                <option value="Alumni" className="bg-white dark:bg-sky-950">Alumni</option>
                <option value="Autre" className="bg-white dark:bg-sky-950">Autre</option>
              </select>
            </div>

            {formData.status === 'En poste' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Intitulé du poste"
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="Entreprise ou établissement"
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            )}
          </div>

          {/* 3. Localisation & Compléments */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 3. Localisation &amp; Présentation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  name="country"
                  list="reg-countries"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Pays"
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
                />
                <datalist id="reg-countries">
                  {PRESET_COUNTRIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ville"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
              />

              <input
                type="text"
                name="currentLocation"
                required
                value={formData.currentLocation}
                onChange={handleChange}
                placeholder="Localisation actuelle *"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Compétences (séparées par des virgules : React, Python, SQL...)"
              className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
            />

            <textarea
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Courte présentation / objectifs (optionnel)"
              className="w-full px-5 py-3 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-sm focus:outline-none focus:border-sky-500 resize-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn (optionnel)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-xs focus:outline-none focus:border-sky-500"
              />
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="GitHub (optionnel)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-xs focus:outline-none focus:border-sky-500"
              />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Site web (optionnel)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-sky-900/40 border border-gray-300 dark:border-sky-800/50 rounded-2xl text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-sky-500/20 active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Envoi de la demande...' : 'Soumettre mon inscription (En attente de validation)'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-sky-100 text-xs font-medium">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-white font-semibold hover:underline transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;