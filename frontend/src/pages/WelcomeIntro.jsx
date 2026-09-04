import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Globe, Play, Pause, Film } from 'lucide-react';
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
    const [isPlaying, setIsPlaying] = useState(false);

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

    const togglePlayVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    return (
        <div
            className="relative w-full min-h-screen text-slate-50 flex flex-col items-center justify-center py-6 px-4 overflow-x-hidden selection:bg-indigo-500 selection:text-white"
            style={{
                backgroundColor: 'var(--bg-color)',
                backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat',
            }}
        >
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
            `}</style>

            {/* Lueur d'arrière-plan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl w-full mx-auto text-center space-y-5 animate-fade-in-up">

                {/* Badge d'introduction */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                    <Globe size={13} className="text-indigo-400" />
                    <span>Réseau International HITAS</span>
                </div>

                {/* Titre & Description */}
                <div className="space-y-2 px-2">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text leading-tight drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        Étudier partout. Réussir ensemble.
                    </h1>
                    <p className="text-zinc-300 text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed">
                        Découvrez l'ambiance de notre communauté internationale à travers cette présentation.
                    </p>
                </div>

                {/* 🎥 SECTION VIDÉO LOCALE INTÉGRÉE */}
                <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-indigo-500/30 bg-[#0b081e]/90 shadow-[0_15px_40px_rgba(0,0,0,0.5)] group">
                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-semibold text-indigo-300">
                        <Film size={12} />
                        <span>Présentation de l'École & Étudiants</span>
                    </div>

                    <div className="relative aspect-video w-full max-h-[280px] bg-black flex items-center justify-center overflow-hidden">
                        <video
                            ref={videoRef}
                            src={introVideo}
                            className="w-full h-full object-cover"
                            playsInline
                            onEnded={() => setIsPlaying(false)}
                        />

                        {!isPlaying && (
                            <div
                                onClick={togglePlayVideo}
                                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group-hover:bg-black/30 transition-all"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transform group-hover:scale-105 transition-all border border-indigo-400/30">
                                    <Play size={24} className="ml-0.5 fill-white" />
                                </div>
                            </div>
                        )}

                        {isPlaying && (
                            <div className="absolute bottom-2.5 right-2.5 z-20">
                                <button
                                    onClick={togglePlayVideo}
                                    className="bg-black/70 hover:bg-black text-white px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                >
                                    <Pause size={12} /> Pause
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logo & Drapeaux en orbite compacts */}
                <div className="relative flex items-center justify-center h-28 w-full overflow-hidden select-none">
                    <div className="relative z-10 w-20 h-20 flex items-center justify-center pointer-events-none">
                        <img
                            src={hitasLogo}
                            alt="Logo HITAS"
                            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                    <div className="absolute w-[240px] h-[54px] border border-dashed border-indigo-900/50 rounded-[50%] pointer-events-none"></div>
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
                        className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-7 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
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