import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import tradPattern from '../assets/traditional.jpg';
import { GraduationCap, MapPin, Briefcase } from 'lucide-react';

function Annuaire({ hasNewNotification, clearNotifications }) {
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

  const presetCountries = [
    'Allemagne', 'France', 'Cameroun', 'USA', 'Belgique', 'Italie', 'Angleterre', 'Brésil', 'Inde'
  ];

  const presetPromotions = ['2030', '2029', '2028', '2027', '2026'];

  const uniqueSpecialties = Array.from(
    new Set([...presetSpecialties, ...profiles.map(p => p.specialty).filter(Boolean)])
  );

  const uniqueCountries = Array.from(
    new Set([...presetCountries, ...profiles.map(p => p.country).filter(Boolean)])
  );

  const uniquePromotions = Array.from(
    new Set([...presetPromotions, ...profiles.map(p => String(p.promotion)).filter(Boolean)])
  )
    .filter(promo => /^20\d{2}$/.test(promo))
    .sort((a, b) => b - a);

  const filteredProfiles = profiles.filter((profile) => {
    const search = searchTerm.toLowerCase().trim();
    
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const specialty = (profile.specialty || '').toLowerCase();
    const country = (profile.country || '').toLowerCase();
    const city = (profile.city || profile.currentLocation || '').toLowerCase();
    const company = (profile.currentCompany || '').toLowerCase();
    const job = (profile.jobTitle || '').toLowerCase();
    const bio = (profile.bio || '').toLowerCase();

    const matchesSearch = 
      !search ||
      fullName.includes(search) || 
      specialty.includes(search) || 
      country.includes(search) ||
      city.includes(search) ||
      company.includes(search) ||
      job.includes(search) ||
      bio.includes(search);

    const matchesSpecialty = selectedSpecialty === '' || profile.specialty === selectedSpecialty;
    const matchesPromotion = selectedPromotion === '' || String(profile.promotion) === selectedPromotion;
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
      className="min-h-screen text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-card-fade {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <Navbar hasNewNotification={hasNewNotification} clearNotifications={clearNotifications} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 relative z-10">
        
        <div className="mb-10 border-b border-indigo-900/40 pb-5 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">
            Annuaire de la Diaspora
          </h1>
          <p className="text-zinc-300 text-sm font-medium">Connecte-toi avec les étudiants et alumni de HITAS à travers le monde.</p>
        </div>

        {!loading && !error && profiles.length > 0 && (
          <div className="bg-[#0b081e]/85 backdrop-blur-xl p-6 border border-indigo-500/30 rounded-3xl shadow-2xl mb-10 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">
                Recherche globale
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, entreprise, poste, mots-clés..."
                className="w-full px-4 py-2.5 bg-[#030014]/80 border border-indigo-500/30 rounded-2xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-400 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">Spécialité</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-500/30 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0b081e]">Toutes</option>
                  {uniqueSpecialties.map((spec, idx) => (
                    <option key={idx} value={spec} className="bg-[#0b081e]">{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">Promotion</label>
                <select
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-500/30 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0b081e]">Toutes</option>
                  {uniquePromotions.map((promo, idx) => (
                    <option key={idx} value={promo} className="bg-[#0b081e]">Promo {promo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">Pays</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-500/30 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0b081e]">Tous les pays</option>
                  {uniqueCountries.map((country, idx) => (
                    <option key={idx} value={country} className="bg-[#0b081e]">{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-500/30 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0b081e]">Tous</option>
                  <option value="Étudiant" className="bg-[#0b081e]">Étudiant</option>
                  <option value="En poste" className="bg-[#0b081e]">En poste</option>
                  <option value="En recherche de stage" className="bg-[#0b081e]">En recherche de stage</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1.5">Niveau</label>
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full px-3 py-2 bg-[#030014]/80 border border-indigo-500/30 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
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

        {loading && <p className="text-zinc-300 text-sm font-semibold tracking-wide animate-pulse py-6 bg-[#0b081e]/80 backdrop-blur-md rounded-2xl text-center border border-indigo-500/30">Recherche des profils...</p>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl mb-6 text-sm font-medium">{error}</div>}

        {!loading && !error && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-16 bg-[#0b081e]/80 backdrop-blur-md border border-indigo-500/30 rounded-3xl shadow-xl">
                <p className="text-zinc-300 text-sm font-medium">Aucun membre ne correspond à tes critères de recherche.</p>
                {(searchTerm || selectedSpecialty || selectedPromotion || selectedCountry || selectedStatus || selectedDegree) && (
                  <button 
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-bold text-indigo-300 hover:text-white px-4 py-2 border border-indigo-500/40 rounded-xl hover:bg-indigo-950/60 transition-all"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                
                {/* LIGNES DE CONNEXION EXTÉRIEURES (STRENGTH LINES - Entre les boîtes de profil en arrière-plan) */}
                <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
                  {/* Lignes horizontales reliant les rangées */}
                  <div className="w-full h-full absolute inset-0 flex flex-col justify-around">
                    <div className="w-full h-[1px] bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="w-full h-[1px] bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  </div>
                  {/* Lignes verticales reliant les colonnes */}
                  <div className="w-full h-full absolute inset-0 flex justify-around">
                    <div className="h-full w-[1px] bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="h-full w-[1px] bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  </div>
                </div>

                {/* Grille de cartes compactes et interconnectées */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {filteredProfiles.map((profile, index) => {
                    const skillsArray = profile.skills 
                      ? (Array.isArray(profile.skills) ? profile.skills : typeof profile.skills === 'string' ? profile.skills.replace(/[\[\]"'\\]/g, '').split(',').map(s => s.trim()) : [])
                      : [];

                    return (
                      <div 
                        key={profile._id} 
                        onClick={() => navigate(`/profile/${profile.user?._id || profile.user}`)}
                        className="relative bg-[#0b081e]/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-xl hover:border-indigo-400 cursor-pointer transition-all duration-300 group opacity-0 animate-card-fade hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] flex flex-col overflow-hidden text-center"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Bannière supérieure de la carte */}
                        <div className="h-16 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-indigo-950/80 relative border-b border-indigo-500/20"></div>

                        {/* Photo de profil clairement visible (fond opaque et bordure nette) */}
                        <div className="flex justify-center -mt-8 mb-2 px-4 relative z-10">
                          <div className="w-16 h-16 rounded-full bg-[#0b081e] border-2 border-indigo-400 overflow-hidden flex items-center justify-center shadow-2xl ring-4 ring-[#030014]">
                            {profile.avatar ? (
                              <img 
                                src={formatMediaUrl(profile.avatar)} 
                                alt={`${profile.firstName} ${profile.lastName}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentNode.innerHTML = `<span class="text-indigo-200 font-bold text-xs uppercase">${(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-indigo-200 font-bold text-xs uppercase">
                                {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Corps de la carte compact */}
                        <div className="px-5 pb-5 flex-1 flex flex-col items-center">
                          <h2 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight mb-0.5">
                            {profile.firstName} {profile.lastName}
                          </h2>
                          
                          {profile.status && (
                            <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                              {profile.status}
                            </span>
                          )}

                          <div className="w-full space-y-1.5 text-left text-xs mb-3">
                            <div className="bg-[#030014]/60 px-3 py-2 rounded-xl border border-indigo-900/30 flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Formation</p>
                                <p className="text-zinc-200 text-[11px] font-medium truncate">{profile.specialty || 'Informatique'} ({profile.promotion || '-'})</p>
                              </div>
                            </div>

                            <div className="bg-[#030014]/60 px-3 py-2 rounded-xl border border-indigo-900/30 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Localisation</p>
                                <p className="text-zinc-200 text-[11px] font-medium truncate">{profile.country || 'Non renseigné'} {profile.currentLocation ? `- ${profile.currentLocation}` : ''}</p>
                              </div>
                            </div>

                            {(profile.jobTitle || profile.currentCompany) && (
                              <div className="bg-[#030014]/60 px-3 py-2 rounded-xl border border-indigo-900/30 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Poste</p>
                                  <p className="text-zinc-200 text-[11px] font-medium truncate">{profile.jobTitle || 'Poste'} {profile.currentCompany ? `chez ${profile.currentCompany}` : ''}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Compétences compactes */}
                          {skillsArray.length > 0 && (
                            <div className="w-full pt-2.5 border-t border-indigo-900/30 mt-auto">
                              <div className="flex flex-wrap justify-center gap-1">
                                {skillsArray.slice(0, 3).map((skill, sIdx) => (
                                  <span key={sIdx} className="bg-indigo-500/10 text-indigo-200 border border-indigo-500/20 px-2 py-0.5 rounded-lg text-[9px] font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {skillsArray.length > 3 && (
                                  <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-lg text-[9px] font-bold">
                                    +{skillsArray.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Annuaire;