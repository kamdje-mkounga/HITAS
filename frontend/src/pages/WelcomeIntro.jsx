import React, { useState, useRef } from 'react';
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

// Import de la vidéo
import globalVideo from '../assets/videos/un.mp4';

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    // État pour gérer les différents campus / pays dynamiquement
    const [activeCountry, setActiveCountry] = useState('global');
    const [currentVideoSrc, setCurrentVideoSrc] = useState(globalVideo);

    const countries = [
        { id: 'global', label: 'Global', flag: hitasLogo, src: globalVideo },
        { id: 'france', label: 'France', flag: franceFlag, src: globalVideo },
        { id: 'allemagne', label: 'Allemagne', flag: germanyFlag, src: globalVideo },
        { id: 'inde', label: 'Inde', flag: indiaFlag, src: globalVideo },
        { id: 'italie', label: 'Italie', flag: italia, src: globalVideo },
        { id: 'cameroun', label: 'Cameroun', flag: cameroonFlag, src: globalVideo },
        { id: 'uk', label: 'UK', flag: uk, src: globalVideo },
        { id: 'bresil', label: 'Brésil', flag: brazilFlag, src: globalVideo },
    ];

    const flags = [
        { id: 1, src: franceFlag, label: 'France', delay: '0s' },
        { id: 2, src: cameroonFlag, label: 'Cameroun', delay: '-2s' },
        { id: 3, src: indiaFlag, label: 'Inde', delay: '-4s' },
        { id: 4, src: brazilFlag, label: 'Brésil', delay: '-6s' },
        { id: 5, src: germanyFlag, label: 'Allemagne', delay: '-8s' },
        { id: 6, src: uk, label: 'UK', delay: '-10s' },
        { id: 7, src: italia, label: 'Italia', delay: '-12s' },
    ];

    const handleCountryChange = (country) => {
        setActiveCountry(country.id);
        setCurrentVideoSrc(country.src);
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(e => console.log("Auto-play bloqué :", e));
        }
    };

    const handleEnterCommunity = () => {
        navigate('/home');
    };

    return (
        <div
            className="relative w-full min-h-screen text-slate-50 flex flex-col items-center justify-center py-6 px-4 overflow-x-hidden selection:bg-indigo-500 selection:text-white"
            style={{
                backgroundColor: 'var(--bg-color)'
            }}
        >
            {/* 🎥 VIDÉO EN ARRIÈRE-PLAN PLEIN ÉCRAN, AUTOMATIQUE ET EN BOUCLE */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <video
                    ref={videoRef}
                    src={currentVideoSrc}
                    className="w-full h-full object-cover transition-opacity duration-700"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {/* Superbe overlay sombre et texturé pour garder le texte parfaitement lisible */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'repeat',
                        opacity: 0.85
                    }}
                ></div>
            </div>

            <style>{`
                @keyframes ellipticOrbit {
                    0% { transform: translate(130px, 0px) scale(1); z-index: 20; }
                    25% { transform: translate(0px, 28px) scale(0.9); z-index: 20; }
                    50% { transform: translate(-130px, 0px) scale(0.75); z-index: 5; }
                    75% { transform: translate(0px, -28px) scale(0.9); z-index: 5; }
                    100% { transform: translate(130px, 0px) scale(1); z-index: 20; }
                }
                .animate-ellipse-orbit { animation: ellipticOrbit 14s linear infinite; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .motion-container-top-right {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 120px;
                    height: 100px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    perspective: 600px;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 30;
                    opacity: 0.8;
                }
                .motion-tunnel-sm {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transform-style: preserve-3d;
                }
                .motion-circle-sm {
                    position: absolute;
                    background: transparent;
                    width: calc(var(--i) * 5px);
                    height: calc(var(--i) * 5px);
                    border-radius: 50%;
                    border: 1.5px solid rgb(99, 102, 241);
                    transform-style: preserve-3d;
                    transform: rotateX(65deg);
                    animation: motionAnimateSm 3s ease-in-out calc(var(--i) * 0.08s) infinite;
                    box-shadow: 0 0 8px rgba(99, 102, 241, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.5);
                }
                @keyframes motionAnimateSm {
                    0%, 100% {
                        transform: rotateX(65deg) translateY(0);
                        filter: hue-rotate(0deg);
                        border-color: rgba(99, 102, 241, 0.8);
                    }
                    50% {
                        transform: rotateX(65deg) translateY(-20px);
                        filter: hue-rotate(90deg);
                        border-color: rgba(168, 85, 247, 1);
                    }
                }
            `}</style>

            {/* Animation Motion de fond en haut à droite */}
            <div className="motion-container-top-right hidden sm:flex">
                <div className="motion-tunnel-sm">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="motion-circle-sm" style={{ '--i': index + 1 }}></div>
                    ))}
                </div>
            </div>

            <div className="relative z-20 max-w-4xl w-full mx-auto text-center space-y-6 animate-fade-in-up">

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                    <Globe size={13} className="text-indigo-400" />
                    <span>Réseau International HITAS</span>
                </div>

                <div className="space-y-2 px-2">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text leading-tight drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                        Étudier partout. Réussir ensemble.
                    </h1>
                    <p className="text-zinc-200 text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed drop-shadow-sm">
                        Sélectionnez un campus pour vous immerger dans l'ambiance de notre communauté internationale.
                    </p>
                </div>

                {/* 🌍 SÉLECTEUR DE PAYS / CAMPUS */}
                <div className="flex flex-wrap items-center justify-center gap-2 px-2 max-w-2xl mx-auto">
                    {countries.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleCountryChange(c)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border backdrop-blur-md ${activeCountry === c.id
                                    ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105'
                                    : 'bg-[#0b081e]/60 border-indigo-900/50 text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-950/60'
                                }`}
                        >
                            <img src={c.flag} alt={c.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span>{c.label}</span>
                        </button>
                    ))}
                </div>

                {/* Logo & Drapeaux en orbite compacts */}
                <div className="relative flex items-center justify-center h-28 w-full overflow-hidden select-none">
                    <div className="relative z-10 w-16 h-16 flex items-center justify-center pointer-events-none">
                        <img
                            src={hitasLogo}
                            alt="Logo HITAS"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                    <div className="absolute w-[220px] h-[48px] border border-dashed border-indigo-900/50 rounded-[50%] pointer-events-none"></div>
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

                {/* Bouton de redirection vers le Hub principal */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleEnterCommunity}
                        className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] cursor-pointer"
                    >
                        <Sparkles size={16} className="text-indigo-200" />
                        <span>Rejoindre la communauté</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WelcomeIntro;