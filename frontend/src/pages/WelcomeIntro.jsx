import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import tradPattern from '../assets/tradition.jpg';
import gwm1 from '../assets/gem1.jpg';
import gem2 from '../assets/gem2.jpg';
import gem3 from '../assets/gem3.jpg';

// Import de la vidéo
import globalVideo from '../assets/videos/un.mp4';

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    // État pour gérer les différents campus / pays dynamiquement
    const [activeCountry, setActiveCountry] = useState('global');
    const [currentVideoSrc, setCurrentVideoSrc] = useState(globalVideo);

    const countries = [
        { id: 'global', label: 'Global', src: globalVideo },
        { id: 'france', label: 'France', src: globalVideo },
        { id: 'allemagne', label: 'Allemagne', src: globalVideo },
        { id: 'inde', label: 'Inde', src: globalVideo },
        { id: 'italie', label: 'Italie', src: globalVideo },
        { id: 'cameroun', label: 'Cameroun', src: globalVideo },
        { id: 'uk', label: 'UK', src: globalVideo },
        { id: 'bresil', label: 'Brésil', src: globalVideo },
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
                    <ShieldCheck size={13} className="text-indigo-400" />
                    <span>Espace Réservé • Étudiants HITAS</span>
                </div>

                <div className="space-y-3 px-2">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text leading-tight drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                        Portail Officiel de la Communauté
                    </h1>
                    <p className="text-zinc-200 text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed drop-shadow-sm">
                        Accédez à votre espace d'échange, suivez l'actualité des campus à travers le monde et connectez-vous avec vos pairs.
                    </p>
                </div>

                {/* 🌍 SÉLECTEUR DE CAMPUS / PAYS SIMPLIFIÉ */}
                <div className="flex flex-wrap items-center justify-center gap-2 px-2 max-w-2xl mx-auto pt-2">
                    {countries.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleCountryChange(c)}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border backdrop-blur-md ${activeCountry === c.id
                                ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105'
                                : 'bg-[#0b081e]/60 border-indigo-900/50 text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-950/60'
                                }`}
                        >
                            <span>{c.label}</span>
                        </button>
                    ))}
                </div>

                {/* Bouton de redirection vers le Hub principal */}
                <div className="pt-6">
                    <button
                        type="button"
                        onClick={handleEnterCommunity}
                        className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] cursor-pointer"
                    >
                        <Sparkles size={16} className="text-indigo-200" />
                        <span>Entrer sur la plateforme</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WelcomeIntro;