import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';

function Annuaire() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');

  const BACKEND_URL = 'https://hitas.onrender.com';

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await API.get('/profile');
        setProfiles(response.data);
      } catch (err) {
        setError("Impossible de charger les membres de l'annuaire.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Listes dynamiques pour les dropdowns de filtres
  const uniqueSpecialties = [...new Set(profiles.map(p => p.specialty).filter(Boolean))];
  const uniquePromotions = [...new Set(profiles.map(p => p.promotion).filter(Boolean))].sort((a, b) => b - a);
  const uniqueCountries = [...new Set(profiles.map(p => p.country || p.currentLocation).filter(Boolean))];

  // Logique de filtrage complète
  const filteredProfiles = profiles.filter((profile) => {
    const search = searchTerm.toLowerCase();
    
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const specialty = (profile.specialty || '').toLowerCase();
    const location = (profile.country || profile.currentLocation || '').toLowerCase();
    const company = (profile.currentCompany || '').toLowerCase();
    const job = (profile.jobTitle || '').toLowerCase();

    // Recherche globale par mot-clé
    const matchesSearch = 
      fullName.includes(search) || 
      specialty.includes(search) || 
      location.includes(search) ||
      company.includes(search) ||
      job.includes(search);

    // Filtres sélectifs
    const matchesSpecialty = selectedSpecialty === '' || profile.specialty === selectedSpecialty;
    const matchesPromotion = selectedPromotion === '' || profile.promotion === selectedPromotion;
    const matchesCountry = selectedCountry === '' || (profile.country || profile.currentLocation) === selectedCountry;
    const matchesStatus = selectedStatus === '' || profile.status === selectedStatus;
    const matchesDegree = selectedDegree === '' || profile.degreeLevel === selectedDegree;

    return matchesSearch && matchesSpecialty && matchesPromotion && matchesCountry && matchesStatus && matchesDegree;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedPromotion('');
    setSelectedCountry('');
    setSelectedStatus('');
    setSelectedDegree('');
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
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-card-fade {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10">
        
        {/* En-tête */}
        <div className="mb-10 border-b border-indigo-900/40 pb-5">
          <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-indigo-100 to-purple-400 bg-clip-text text-transparent">
            Annuaire de la Diaspora
          </h1>
          <p className="text-zinc-400 text-sm">Connecte-toi avec les étudiants et alumni de HITAS à travers le monde.</p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES ENRICHIS */}
        {!loading && !error && profiles.length > 0 && (
          <div className="bg-[#0b081e]/85 backdrop-blur-xl p-6 border border-indigo-900/60 rounded-2xl shadow-2xl shadow-black/40 mb-8 space-y-4">
            
            {/* Ligne 1 : Barre de recherche globale */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                Recherche globale
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, entreprise, poste, mots-clés..."
                className="w-full px-4 py-2.5 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
              />
            </div>

            {/* Ligne 2 : Filtres structurés en grille */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Filtre : Spécialité */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                  Spécialité
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#0b081e]">Toutes</option>
                  {uniqueSpecialties.map((spec, idx) => (
                    <option key={idx} value={spec} className="bg-[#0b081e]">{spec}</option>
                  ))}
                </select>
              </div>

              {/* Filtre : Promotion */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                  Promotion
                </label>
                <select
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#0b081e]">Toutes</option>
                  {uniquePromotions.map((promo, idx) => (
                    <option key={idx} value={promo} className="bg-[#0b081e]">Promo {promo}</option>
                  ))}
                </select>
              </div>

              {/* Filtre : Pays / Localisation */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                  Pays / Localisation
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#0b081e]">Tous les pays</option>
                  {uniqueCountries.map((country, idx) => (
                    <option key={idx} value={country} className="bg-[#0b081e]">{country}</option>
                  ))}
                </select>
              </div>

              {/* Filtre : Statut actuel */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                  Statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#0b081e]">Tous</option>
                  <option value="Étudiant" className="bg-[#0b081e]">Étudiant</option>
                  <option value="En poste" className="bg-[#0b081e]">En poste</option>
                  <option value="En recherche de stage" className="bg-[#0b081e]">Recherche de stage</option>
                  <option value="Indépendant / Freelance" className="bg-[#0b081e]">Indépendant</option>
                </select>
              </div>

              {/* Filtre : Niveau d'étude */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">
                  Niveau d'étude
                </label>
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-900/60 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#0b081e]">Tous les niveaux</option>
                  <option value="Licence" className="bg-[#0b081e]">Licence / Bachelor</option>
                  <option value="Master" className="bg-[#0b081e]">Master / M2</option>
                  <option value="Doctorat" className="bg-[#0b081e]">Doctorat / Ph.D</option>
                  <option value="Alumni" className="bg-[#0b081e]">Alumni (Diplômé)</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {loading && <p className="text-zinc-400 text-sm font-semibold tracking-wide animate-pulse py-6 bg-[#0b081e]/80 backdrop-blur-md rounded-xl text-center shadow-xl border border-indigo-900/60">Recherche des profils...</p>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm font-medium backdrop-blur-md">{error}</div>}

        {/* LISTE DES CARTES FILTRÉES */}
        {!loading && !error && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-16 bg-[#0b081e]/80 backdrop-blur-md border border-indigo-900/60 rounded-2xl shadow-xl">
                <p className="text-zinc-400 text-sm font-medium">Aucun membre ne correspond à tes critères de recherche.</p>
                {(searchTerm || selectedSpecialty || selectedPromotion || selectedCountry || selectedStatus || selectedDegree) && (
                  <button 
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-bold text-indigo-400 hover:text-white px-4 py-2 border border-indigo-900/60 rounded-xl hover:bg-indigo-900/40 transition-all shadow-sm"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile, index) => (
                  <div 
                    key={profile._id} 
                    onClick={() => navigate(`/profile/${profile.user?._id || profile.user}`)}
                    className="p-6 bg-[#0b081e]/50 backdrop-blur-md border border-indigo-900/50 rounded-2xl shadow-lg shadow-black/30 flex flex-col justify-between hover:bg-[#0b081e]/70 hover:border-indigo-600/60 cursor-pointer transition-all duration-300 group opacity-0 animate-card-fade hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div>
                      {/* EN-TÊTE DE LA CARTE AVEC AVATAR */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#030014]/80 border border-indigo-900/60 overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner group-hover:border-indigo-400/60 transition-colors backdrop-blur-sm">
                          {profile.avatar ? (
                            <img 
                              src={formatMediaUrl(profile.avatar)} 
                              alt={`${profile.firstName} ${profile.lastName}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<span class="text-indigo-300 text-xs font-bold uppercase">${(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
                              {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate leading-snug">
                            {profile.firstName} {profile.lastName}
                          </h2>
                          <p className="text-zinc-300 text-xs font-medium truncate mt-0.5">
                            🎓 {profile.specialty || 'Computer Science'} — Promo {profile.promotion || 'N/A'}
                          </p>
                          <p className="text-zinc-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                            📍 {profile.country || profile.currentLocation || 'Non renseigné'} {profile.city ? `(${profile.city})` : ''}
                          </p>
                        </div>
                      </div>

                      {/* STATUT ET POSTE DE L'UTILISATEUR */}
                      {(profile.status || profile.currentCompany || profile.jobTitle) && (
                        <div className="mb-4 text-xs bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-900/40 text-indigo-200">
                          {profile.jobTitle && <p className="font-semibold text-zinc-200 truncate">{profile.jobTitle}</p>}
                          {profile.currentCompany && <p className="text-[11px] text-indigo-300 truncate">🏢 {profile.currentCompany}</p>}
                          {profile.status && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 font-bold uppercase">{profile.status}</span>}
                        </div>
                      )}

                      {/* BIOGRAPHIE */}
                      {profile.bio && (
                        <p className="text-zinc-300 text-xs leading-relaxed mb-6 line-clamp-3 bg-[#030014]/40 p-3 rounded-xl border border-indigo-900/30 font-normal shadow-inner">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* COMPÉTENCES */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-indigo-900/30 mt-auto">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-[#030014]/60 text-zinc-300 text-[11px] font-mono rounded border border-indigo-900/40 shadow-sm group-hover:border-indigo-600/40 transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Annuaire;