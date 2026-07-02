import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 👈 Import pour la traduction

// 📦 IMPORTS DES IMAGES DEPUIS LE DOSSIER ASSETS
import hitasLogo from '../assets/hitas_logo.svg';
import franceFlag from '../assets/france.svg';
import cameroonFlag from '../assets/cameroon.svg';
import indiaFlag from '../assets/india.svg';
import brazilFlag from '../assets/brazil.svg';
import germanyFlag from '../assets/germany.svg';

const OrbitingLogo = () => {
  const { i18n } = useTranslation(); // 👈 Permet de changer la langue au clic

  // Ajout du code langue associé à chaque drapeau
  const flags = [
    { id: 1, src: franceFlag, label: 'France', lang: 'fr', delay: '0s' },
    { id: 2, src: cameroonFlag, label: 'Cameroun', lang: 'fr', delay: '-2.4s' },
    { id: 3, src: indiaFlag, label: 'Inde', lang: 'en', delay: '-4.8s' },
    { id: 4, src: brazilFlag, label: 'Brésil', lang: 'en', delay: '-7.2s' },
    { id: 5, src: germanyFlag, label: 'Allemagne', lang: 'en', delay: '-9.6s' },
  ];

  return (
    <div className="relative flex items-center justify-center my-2 h-40 md:h-52 w-full overflow-hidden select-none transform scale-65 sm:scale-85 md:scale-100 transition-transform duration-300">
      
      <style>{`
        @keyframes ellipticOrbit {
          0% {
            transform: translate(160px, 0px) scale(1);
            z-index: 20;
          }
          25% {
            transform: translate(0px, 38px) scale(0.9);
            z-index: 20;
          }
          50% {
            transform: translate(-160px, 0px) scale(0.75);
            z-index: 5;
          }
          75% {
            transform: translate(0px, -38px) scale(0.9);
            z-index: 5;
          }
          100% {
            transform: translate(160px, 0px) scale(1);
            z-index: 20;
          }
        }
        .animate-ellipse-orbit {
          animation: ellipticOrbit 14s linear infinite;
        }
      `}</style>

      {/* 1. Le Logo central "H" d'HITAS */}
      <div className="relative z-10 w-36 h-36 flex items-center justify-center pointer-events-none">
        <img 
          src={hitasLogo} 
          alt="Logo HITAS" 
          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        />
      </div>

      {/* 2. L'anneau d'orbite elliptique en arrière-plan */}
      <div className="absolute w-[320px] h-[76px] border border-dashed border-zinc-800/80 rounded-[50%] pointer-events-none"></div>

      {/* 3. Les drapeaux en orbite (Rendus cliquables pour changer de langue) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {flags.map((flag) => (
          <button
            key={flag.id}
            onClick={() => i18n.changeLanguage(flag.lang)} // 👈 Change la langue à la volée !
            title={`Changer la langue (${flag.label})`}
            className="absolute w-7 h-7 rounded-full overflow-hidden border border-zinc-800/50 bg-zinc-900 shadow-lg flex items-center justify-center animate-ellipse-orbit cursor-pointer hover:scale-125 hover:border-violet-500 transition-transform pointer-events-auto"
            style={{
              animationDelay: flag.delay,
            }}
          >
            <img 
              src={flag.src} 
              alt={flag.label} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL HOME
function Home() {
  const { t } = useTranslation(); // 👈 Hook de traduction des textes

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2">
            {t('home.title')} {/* 👈 Traduction du titre */}
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-400 text-lg mt-4 px-4">
            {t('home.subtitle')} {/* 👈 Traduction du sous-titre */}
          </p>
        </div>

        {/* Grille des modules principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Annuaire */}
          <Link to="/annuaire" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">👤</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">
                {t('home.modules.annuaire.title')}
              </h3>
              <p className="text-zinc-400 text-sm">
                {t('home.modules.annuaire.desc')}
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              {t('home.modules.annuaire.link')} →
            </span>
          </Link>

          {/* Carte Blog */}
          <Link to="/blog" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">📝</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">
                {t('home.modules.blog.title')}
              </h3>
              <p className="text-zinc-400 text-sm">
                {t('home.modules.blog.desc')}
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              {t('home.modules.blog.link')} →
            </span>
          </Link>

          {/* Carte Showcase */}
          <Link to="/showcase" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">🚀</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">
                {t('home.modules.showcase.title')}
              </h3>
              <p className="text-zinc-400 text-sm">
                {t('home.modules.showcase.desc')}
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              {t('home.modules.showcase.link')} →
            </span>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Home;