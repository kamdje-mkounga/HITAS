import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Globe } from 'lucide-react';
import tradPattern from '../assets/tradition.jpg';
import hitasLogo from '../assets/hitas_logo.svg';

// Import des drapeaux pour montrer la dimension internationale
import franceFlag from '../assets/france.svg';
import cameroonFlag from '../assets/cameroon.svg';
import indiaFlag from '../assets/india.svg';
import brazilFlag from '../assets/brazil.svg';
import germanyFlag from '../assets/germany.svg';
import uk from '../assets/uk.svg';
import italia from '../assets/italia.svg';
import introVideo from '../assets/videos/un.mp4';

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    // Lecture automatique sécurisée au chargement
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay bloqué par le navigateur, interaction requise :", error);
            });
        }
    }, []);

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
        navigate('/home');
    };

    return (
        <div
            className="relative w-full min-h-screen text-slate-50 flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden selection:bg-indigo-500 selection:text-white"
            style={{
                backgroundColor: 'var(--bg-color)',
                backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat',
            }}
        >
            <style>{`
                @keyframes ellipticOrbit {
                    0% { transform: translate(140px, 0px) scale(1); z-index: 20; }
                    25% { transform: translate(0px, 30px) scale(0.9); z-index: 20; }
                    50% { transform: translate(-140px, 0px) scale(0.75); z-index: 5; }
                    75% { transform: translate(0px, -30px) scale(0.9); z-index: 5; }
                    100% { transform: translate(140px, 0px) scale(1); z-index: 20; }
                }
                .animate-ellipse-orbit { animation: ellipticOrbit 14s linear infinite; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* Lueur d'arrière-plan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Conteneur principal élargi à max-w-5xl pour laisser plus de place à la vidéo */}
            <div className="relative z-10 max-w-5xl w-full mx-auto text-center space-y-6 animate-fade-in-up">

                {/* Badge d'introduction */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                    <Globe size={14} className="text-indigo-400" />
                    <span>Réseau International HITAS</span>
                </div>

                {/* Titre & Description */}
                <div className="space-y-2 px-2">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text leading-tight drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                        Étudier partout. Réussir ensemble.
                    </h1>
                    <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
                        Plongez au cœur de notre communauté internationale et découvrez l'esprit de l'école.
                    </p>
                </div>

                {/* 🎥 SECTION VIDÉO PLUS LARGE ET SANS BORDURE */}
                <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                    <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                        <video
                            ref={videoRef}
                            src={introVideo}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    </div>
                </div>

                {/* Logo & Drapeaux en orbite */}
                <div className="relative flex items-center justify-center h-28 w-full overflow-hidden select-none">
                    <div className="relative z-10 w-20 h-20 flex items-center justify-center pointer-events-none">
                        <img
                            src={hitasLogo}
                            alt="Logo HITAS"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                    <div className="absolute w-[260px] h-[58px] border border-dashed border-indigo-900/50 rounded-[50%] pointer-events-none"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {flags.map((flag) => (
                            <div
                                key={flag.id}
                                className="absolute w-5 h-5 rounded-full overflow-hidden border border-indigo-500/40 bg-[#0b081e] shadow-md shadow-indigo-500/20 flex items-center justify-center animate-ellipse-orbit"
                                style={{ animationDelay: flag.delay }}
                            >
                                <img src={flag.src} alt={flag.label} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bouton de redirection */}
                <div>
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