import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

function Annuaire() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('');

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

  const uniqueSpecialties = [...new Set(profiles.map(p => p.specialty).filter(Boolean))];
  const uniquePromotions = [...new Set(profiles.map(p => p.promotion).filter(Boolean))].sort((a, b) => b - a);

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
    <div className="min-h-screen bg-[#030014] text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        
        {/* En-tête */}
        <div className="mb-10 border-b border-indigo-950/40 pb-5">
          <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-indigo-100 to-purple-400 bg-clip-text text-transparent">
            Annuaire de la Diaspora
          </h1>
          <p className="text-zinc-400 text-sm">Connecte-toi avec les étudiants de HITAS à travers le monde.</p>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES */}
        {!loading && !error && profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-[#0b081e]/40 backdrop-blur-md p-5 border border-indigo-950/60 rounded-2xl shadow-xl">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">Rechercher un membre</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, spécialité, ville..."
                className="w-full px-3 py-2 bg-[#030014]/60 border border-indigo-950 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">Spécialité</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-[#030014]/60 border border-indigo-950 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0b081e]">Toutes</option>
                {uniqueSpecialties.map((spec, idx) => (
                  <option key={idx} value={spec} className="bg-[#0b081e]">{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-1.5">Promotion</label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full px-3 py-2 bg-[#030014]/60 border border-indigo-950 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="" className="bg-[#0b081e]">Toutes</option>
                {uniquePromotions.map((promo, idx) => (
                  <option key={idx} value={promo} className="bg-[#0b081e]">Promo {promo}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading && <p className="text-zinc-500 text-sm font-semibold tracking-wide animate-pulse py-6">Recherche des profils...</p>}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm font-medium">{error}</div>}

        {/* LISTE DES CARTES FILTRÉES */}
        {!loading && !error && (
          <div>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-16 bg-[#0b081e]/20 border border-dashed border-indigo-950/60 rounded-2xl">
                <p className="text-zinc-500 text-sm">Aucun membre ne correspond à tes critères de recherche.</p>
                {(searchTerm || selectedSpecialty || selectedPromotion) && (
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedSpecialty(''); setSelectedPromotion(''); }}
                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
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
                    className="p-6 bg-[#0b081e]/40 border border-indigo-950/60 rounded-2xl shadow-xl shadow-black/20 flex flex-col justify-between hover:border-indigo-500/40 cursor-pointer transition-all duration-300 group opacity-0 animate-card-fade hover:shadow-indigo-500/5"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div>
                      {/* EN-TÊTE DE LA CARTE AVEC AVATAR */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#030014] border border-indigo-950 overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner group-hover:border-indigo-500/30 transition-colors">
                          {profile.avatar ? (
                            <img 
                              src={formatMediaUrl(profile.avatar)} 
                              alt={`${profile.firstName} ${profile.lastName}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = `<span class="text-indigo-400 text-xs font-bold uppercase">${(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
                              {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors truncate leading-snug">
                            {profile.firstName} {profile.lastName}
                          </h2>
                          <p className="text-zinc-400 text-xs font-medium truncate mt-0.5">
                            🎓 {profile.specialty || 'Computer Science'} — Promo {profile.promotion || 'Non renseignée'}
                          </p>
                          <p className="text-zinc-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                            📍 {profile.currentLocation || 'Non renseignée'}
                          </p>
                        </div>
                      </div>

                      {/* BIOGRAPHIE */}
                      {profile.bio && (
                        <p className="text-zinc-400 text-xs leading-relaxed mb-6 line-clamp-3 bg-[#030014]/60 p-3 rounded-xl border border-indigo-950/40 font-normal">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* COMPÉTENCES */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-indigo-950/40">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-[#030014] text-zinc-400 text-[11px] font-mono rounded border border-indigo-950/80">
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