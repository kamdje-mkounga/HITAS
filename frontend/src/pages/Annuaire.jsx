import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import de useNavigate pour la redirection
import Navbar from '../components/Navbar';
import API from '../services/api';

function Annuaire() {
  const navigate = useNavigate(); // Initialisation du hook de navigation
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');

  const BACKEND_URL = 'https://hitas.onrender.com';

  // Fonction utilitaire de nettoyage des URLs
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

  // Extraction dynamique des options uniques pour les dropdowns
  const uniqueSpecialties = [...new Set(profiles.map(p => p.specialty).filter(Boolean))];
  const uniquePromotions = [...new Set(profiles.map(p => p.promotion).filter(Boolean))].sort((a, b) => b - a);

  // Logique de filtrage combinée
  const filteredProfiles = profiles.filter((profile) => {
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const specialty = (profile.specialty || '').toLowerCase();
    const location = (profile.currentLocation || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      fullName.includes(search) || 
      specialty.includes(search) || 
      location.includes(search);

    const matchesSpecialty = selectedSpecialty === '' || profile.specialty === selectedSpecialty;
    const matchesPromotion = selectedPromotion === '' || profile.promotion === selectedPromotion;

    return matchesSearch && matchesSpecialty && matchesPromotion;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-black tracking-tight mb-2">Annuaire de la Diaspora</h1>
          <p className="text-zinc-400">Connecte-toi avec les étudiants de HITAS à travers le monde.</p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES */}
        {!loading && !error && profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-zinc-900/50 p-4 border border-zinc-800/80 rounded-2xl">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Rechercher un membre</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, spécialité, ville..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-700 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Spécialité</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer appearance-none"
              >
                <option value="">Toutes</option>
                {uniqueSpecialties.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Promotion</label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
              >
                <option value="">Toutes</option>
                {uniquePromotions.map((promo, idx) => (
                  <option key={idx} value={promo}>Promo {promo}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading && <p className="text-zinc-500 animate-pulse">Recherche des profils...</p>}
        {error && <div className="p-4 bg-red-950/30 border border-red-900 text-red-400 rounded-xl mb-6">{error}</div>}

        {/* LISTE DES CARTES FILTRÉES */}
        {!loading && !error && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-sm">Aucun membre ne correspond à tes critères de recherche.</p>
                {(searchTerm || selectedSpecialty || selectedPromotion) && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedSpecialty(''); setSelectedPromotion(''); }}
                    className="mt-3 text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <div 
                    key={profile._id} 
                    onClick={() => navigate(`/profile/${profile.user?._id || profile.user}`)} // Redirection dynamique sur toute la boîte
                    className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-500/50 cursor-pointer transition-all group"
                  >
                    <div>
                      {/* EN-TÊTE DE LA CARTE AVEC AVATAR */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                          {profile.avatar ? (
                            <img 
                              src={formatMediaUrl(profile.avatar)} 
                              alt={`${profile.firstName} ${profile.lastName}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback si l'image distante échoue
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<span class="text-zinc-500 text-xs font-mono font-bold uppercase">${(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
                              {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Le titre passe en violet/indigo subtil au survol global de la carte */}
                          <h2 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors truncate leading-snug">
                            {profile.firstName} {profile.lastName}
                          </h2>
                          <p className="text-zinc-400 text-xs font-medium truncate mt-0.5">
                            🎓 {profile.specialty || 'computer science'} — Promo {profile.promotion || 'Non renseignée'}
                          </p>
                          <p className="text-zinc-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                            📍 {profile.currentLocation || 'Non renseignée'}
                          </p>
                        </div>
                      </div>

                      {/* BIOGRAPHIE */}
                      {profile.bio && (
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* COMPÉTENCES */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-800/60">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-zinc-950 text-zinc-400 text-xs font-mono rounded border border-zinc-800">
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