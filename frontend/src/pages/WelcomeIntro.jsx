import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Globe } from 'lucide-react';
import tradPattern from '../assets/traditional.jpg';
import hitasLogo from '../assets/hitas_logo.svg';

// Import des drapeaux pour montrer la dimension internationale
import franceFlag from '../assets/france.svg';
import cameroonFlag from '../assets/cameroon.svg';
import indiaFlag from '../assets/india.svg';
import brazilFlag from '../assets/brazil.svg';
import germanyFlag from '../assets/germany.svg';
import uk from '../assets/uk.svg';
import italia from '../assets/italia.svg';

const WelcomeIntro = () => {
    const navigate = useNavigate();

    const flags = [
        { id: 1, src: franceFlag, label: 'France', delay: '0s' },
        { id: 2, src: cameroonFlag, label: 'Cameroun', delay: '-2s' },
        { id: 3, src: indiaFlag, label: 'Inde', delay: '-4s' },
        { id: 4, src: brazilFlag, label: 'Brésil', delay: '-6s' },
        { id: 5, src: germanyFlag, label: 'Allemagne', delay: '-8s' },
        { id: 6, src: uk, label: 'UK', delay: '-10s' },
        { id: 7, src: italia, label: 'Italia', delay: '-12s' },
    ];

    const handleEnterCommunity = () => {
        // Redirige vers la page d'accueil principale (le Hub / Home)
        navigate('/home');
    };

    return (
        <div
            className="relative w-full min-h-screen text-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-indigo-500 selection:text-white"
            style={{
                backgroundColor: 'var(--bg-color)',
                backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat',
            }}
        >
            <style>{`
        @keyframes ellipticOrbit {
          0% { transform: translate(160px, 0px) scale(1); z-index: 20; }
          25% { transform: translate(0px, 38px) scale(0.9); z-index: 20; }
          50% { transform: translate(-160px, 0px) scale(0.75); z-index: 5; }
          75% { transform: translate(0px, -38px) scale(0.9); z-index: 5; }
          100% { transform: translate(160px, 0px) scale(1); z-index: 20; }
        }
        .animate-ellipse-orbit { animation: ellipticOrbit 14s linear infinite; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

            {/* Effet de lueur d'arrière-plan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl w-full mx-auto text-center space-y-8 animate-fade-in-up px-4">

                {/* Badge d'introduction */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                    <Globe size={14} className="text-indigo-400" />
                    <span>Réseau International HITAS</span>
                </div>

                {/* Titre & Animation des drapeaux orbitaux (rappelant l'identité globale) */}
                <div className="space-y-4">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text leading-tight drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        Étudier partout. Réussir ensemble.
                    </h1>
                    <p className="text-zinc-300 text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed">
                        Bienvenue sur la plateforme qui connecte les étudiants de HITAS à travers le monde entier. Partagez, entraidez-vous et propulsez vos projets.
                    </p>
                </div>

                {/* Animation visuelle du Logo avec les drapeaux en orbite */}
                <div className="relative flex items-center justify-center my-4 h-48 w-full overflow-hidden select-none">
                    <div className="relative z-10 w-32 h-32 flex items-center justify-center pointer-events-none">
                        <img
                            src={hitasLogo}
                            alt="Logo HITAS"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                    <div className="absolute w-[320px] h-[76px] border border-dashed border-indigo-900/50 rounded-[50%] pointer-events-none"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {flags.map((flag) => (
                            <div
                                key={flag.id}
                                className="absolute w-7 h-7 rounded-full overflow-hidden border border-indigo-500/40 bg-[#0b081e] shadow-lg shadow-indigo-500/20 flex items-center justify-center animate-ellipse-orbit"
                                style={{ animationDelay: flag.delay }}
                            >
                                <img src={flag.src} alt={flag.label} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bouton pour Rejoindre la Communauté (Demandé par le président) */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleEnterCommunity}
                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer"
                    >
                        <Sparkles size={18} className="text-indigo-200" />
                        <span>Rejoindre la communauté</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WelcomeIntro;