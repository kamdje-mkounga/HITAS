import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  const messages = [
    "Here we are here to connect. 🤝",
    "Welcome to the family HITAS ! 🚀",
    "Partagez vos réussites, vos stages, votre quotidien.",
    "L'entraide étudiante n'a pas de frontières. 🌍"
  ];

  // Gestionnaire des messages éphémères (Toutes les 2.5 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. On lance le fondu de sortie (fade out)
      setFadeClass('opacity-0 scale-95');
      
      setTimeout(() => {
        // 2. On change de texte à l'abri des regards
        setCurrentMsgIndex((prevIndex) => (prevIndex + 1) % messages.length);
        // 3. On relance le fondu d'entrée (fade in)
        setFadeClass('opacity-100 scale-100');
      }, 400); // Temps de la transition d'effacement

    }, 2500); // Reste visible 2.5 secondes

    return () => clearInterval(interval);
  }, []);

  // Liste des drapeaux (Exemple à adapter selon la communauté de ton école)
  const flags = ['🇨🇲', '🇨🇮', '🇬🇦', '🇹🇬', '🇫🇷', '🇨🇦', '🇳🇬', '🇸🇳'];

  return (
    <div className="relative w-full bg-black text-white py-16 flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
      
      {/* 🌌 L'animation du Logo et des Drapeaux (Système Solaire) */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-6">
        
        {/* Le Logo Central (HITAS) avec un léger effet de halo blanc */}
        <div className="z-10 w-24 h-24 bg-[#1a1a1a] border-2 border-white rounded-full flex items-center justify-center font-extrabold text-xl tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.15)] select-none">
          HITAS
        </div>

        {/* L'anneau orbital invisible qui tourne */}
        <div className="absolute w-full h-full animate-[spin_25s_linear_infinite]">
          {flags.map((flag, index) => {
            // Calcul de l'angle pour répartir les drapeaux de manière égale autour du cercle
            const angle = (index * 360) / flags.length;
            return (
              <div
                key={index}
                className="absolute w-8 h-8 text-xl flex items-center justify-center"
                style={{
                  top: '50%',
                  left: '50%',
                  // Décale le drapeau vers l'extérieur du cercle (110px) et applique l'angle
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translate(110px) rotate(-${angle}deg)`,
                }}
              >
                {/* Une seconde animation inverse pour que le drapeau reste vertical pendant sa révolution */}
                <div className="animate-[spin_25s_linear_infinite] reverse-spin">
                  {flag}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💬 Section des Messages Éphémères */}
      <div className="h-12 flex items-center justify-center px-4">
        <p className={`text-base md:text-lg font-medium text-gray-300 tracking-wide text-center transition-all duration-300 ease-in-out ${fadeClass}`}>
          {messages[currentMsgIndex]}
        </p>
      </div>

      {/* Code CSS injecté à la volée pour forcer la rotation inverse des drapeaux */}
      <style>{`
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .reverse-spin {
          animation-direction: reverse !important;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;