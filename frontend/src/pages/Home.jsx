import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

// 📦 IMPORTS DES IMAGES DEPUIS LE DOSSIER ASSETS
import hitasLogo from '../assets/hitas_logo.svg';
import franceFlag from '../assets/france.svg';
import cameroonFlag from '../assets/cameroon.svg';
import indiaFlag from '../assets/india.svg';
import brazilFlag from '../assets/brazil.svg';
import germanyFlag from '../assets/germany.svg';

const OrbitingLogo = () => {
  const flags = [
    { id: 1, src: franceFlag, label: 'France', delay: '0s' },
    { id: 2, src: cameroonFlag, label: 'Cameroun', delay: '-2.4s' },
    { id: 3, src: indiaFlag, label: 'Inde', delay: '-4.8s' },
    { id: 4, src: brazilFlag, label: 'Brésil', delay: '-7.2s' },
    { id: 5, src: germanyFlag, label: 'Allemagne', delay: '-9.6s' },
  ];

  return (
    <div className="relative flex items-center justify-center my-6 h-44 w-full overflow-hidden select-none">
      
      {/* Injection directe des keyframes CSS pour garantir l'orbite fluide */}
      <style>{`
        @keyframes customOrbit {
          0% {
            transform: rotate(0deg) translateX(145px) rotate(0deg) scale(1);
            z-index: 20;
          }
          25% {
            transform: rotate(90deg) translateX(145px) rotate(-90deg) scale(0.8);
            z-index: 5;
          }
          50% {
            transform: rotate(180deg) translateX(145px) rotate(-180deg) scale(0.7);
            z-index: 5;
          }
          75% {
            transform: rotate(270deg) translateX(145px) rotate(-270deg) scale(0.9);
            z-index: 20;
          }
          100% {
            transform: rotate(360deg) translateX(145px) rotate(-360deg) scale(1);
            z-index: 20;
          }
        }
        .animate-custom-orbit {
          animation: customOrbit 10s linear infinite;
        }
      `}</style>

      {/* 1. Le Logo central "H" d'HITAS */}
      <div className="relative z-10 w-24 h-24 flex items-center justify-center bg-[#161618] rounded-full border border-zinc-800/80 shadow-2xl p-4">
        <img 
          src={hitasLogo} 
          alt="Logo HITAS" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* 2. L'anneau d'orbite elliptique en arrière-plan */}
      <div className="absolute w-[290px] h-[75px] border border-dashed border-zinc-800/60 rounded-[50%] pointer-events-none"></div>

      {/* 3. Les drapeaux SVG en orbite autour du H */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="absolute w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-[#161618] shadow-md flex items-center justify-center animate-custom-orbit"
            style={{
              animationDelay: flag.delay,
            }}
          >
            <img 
              src={flag.src} 
              alt={flag.label} 
              className="w-[70%] h-[70%] object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL HOME
function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Le hub de la communauté étudiante d'HITAS
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-400 text-lg mt-4">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

        {/* Grille des modules principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Annuaire */}
          <Link to="/annuaire" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">👤</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Annuaire</h3>
              <p className="text-zinc-400 text-sm">Trouve et contacte les étudiants basés en Inde, en France ou au Cameroun.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Explorer l'annuaire →
            </span>
          </Link>

          {/* Carte Blog */}
          <Link to="/blog" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">📝</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Blog d'Entraide</h3>
              <p className="text-zinc-400 text-sm">Découvre les guides d'installation, astuces pour les visas et partages d'expériences.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Lire les articles →
            </span>
          </Link>

          {/* Carte Showcase */}
          <Link to="/showcase" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">🚀</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Showcase</h3>
              <p className="text-zinc-400 text-sm">Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Voir les projets →
            </span>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Home;