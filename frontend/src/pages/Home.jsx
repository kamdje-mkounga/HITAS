import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client';

// 🌐 CONFIGURATION DE L'URL DU BACKEND (Local vs Render)
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://hitas.onrender.com'; 

// Initialisation unique du socket connecté à ton serveur distant Render
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

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
    <div className="relative flex items-center justify-center my-2 h-40 md:h-52 w-full overflow-hidden select-none transform scale-65 sm:scale-85 md:scale-100 transition-transform duration-300">
      <style>{`
        @keyframes ellipticOrbit {
          0% { transform: translate(160px, 0px) scale(1); z-index: 20; }
          25% { transform: translate(0px, 38px) scale(0.9); z-index: 20; }
          50% { transform: translate(-160px, 0px) scale(0.75); z-index: 5; }
          75% { transform: translate(0px, -38px) scale(0.9); z-index: 5; }
          100% { transform: translate(160px, 0px) scale(1); z-index: 20; }
        }
        .animate-ellipse-orbit { animation: ellipticOrbit 14s linear infinite; }
      `}</style>

      <div className="relative z-10 w-36 h-36 flex items-center justify-center pointer-events-none">
        <img 
          src={hitasLogo} 
          alt="Logo HITAS" 
          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        />
      </div>

      <div className="absolute w-[320px] h-[76px] border border-dashed border-zinc-800/80 rounded-[50%] pointer-events-none"></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="absolute w-7 h-7 rounded-full overflow-hidden border border-zinc-800/50 bg-zinc-900 shadow-lg flex items-center justify-center animate-ellipse-orbit"
            style={{ animationDelay: flag.delay }}
          >
            <img src={flag.src} alt={flag.label} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL HOME
function Home() {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem('userId'); // 🟢 Remplacé : on utilise userId pour être cohérent !

  // --- CHARGEMENT INITIAL & GESTION DU BOUTON RETOUR MOBILE ---
  useEffect(() => {
    const fetchArticlesAndCalculateUnread = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/posts`); 
        const articles = response.data || [];
        const lastViewedBlog = localStorage.getItem('last_viewed_blog');
        
        if (!lastViewedBlog) {
          // Si jamais visité, on compte tous les articles SAUF les nôtres
          const othersArticles = articles.filter(article => {
            const authorId = typeof article.user === 'object' ? article.user._id : article.user;
            return String(authorId).trim() !== String(currentUserId).trim();
          });
          setUnreadCount(othersArticles.length);
          return;
        }
  
        const lastViewedDate = new Date(lastViewedBlog);
        
        const unreadArticles = articles.filter(article => {
          if (!article.date) return false;
          
          // 🛡️ FILTRE MAGIQUE 1 : Si c'est mon post, je ne le compte PAS comme non lu !
          const authorId = typeof article.user === 'object' ? article.user._id : article.user;
          if (String(authorId).trim() === String(currentUserId).trim()) {
            return false;
          }

          const articleDate = new Date(article.date);
          return articleDate > lastViewedDate;
        });
  
        setUnreadCount(unreadArticles.length);
      } catch (error) {
        console.error("Erreur initialisation des notifications:", error);
      }
    };
  
    // 1. Exécution immédiate au montage du composant
    fetchArticlesAndCalculateUnread();

    // 2. 📱 Forcer le recalcul si l'utilisateur revient en arrière (Mobile Back-Forward Cache)
    const handlePageShow = (event) => {
      fetchArticlesAndCalculateUnread();
    };

    window.addEventListener('pageshow', handlePageShow);
  
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [currentUserId]);

  // --- ÉCOUTE TEMPS RÉEL VIA SOCKET.IO DISTANT ---
  useEffect(() => {
    socket.on('article_published', (newArticle) => {
      console.log("Flux direct reçu du serveur Render :", newArticle);
      
      // 🛡️ FILTRE MAGIQUE 2 : On vérifie l'auteur proprement en forçant en String
      const authorId = typeof newArticle.user === 'object' ? newArticle.user._id : newArticle.user;
      
      // 🛑 SI LE MESSAGE VIENT DE MOI, ON ARRÊTE TOUT
      if (String(authorId).trim() === String(currentUserId).trim()) {
        console.log("Bloqué : C'est ma propre publication.");
        return; 
      }

      // ⏱️ GESTION DU TEMPS DE LECTURE
      const lastViewedBlog = localStorage.getItem('last_viewed_blog');
      if (!lastViewedBlog) {
        setUnreadCount(prev => prev + 1);
        return;
      }

      const lastViewedDate = new Date(lastViewedBlog);
      const articleDate = new Date(newArticle.date);

      // On ajoute une marge de 10 secondes
      if (articleDate.getTime() - 10000 > lastViewedDate.getTime()) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('article_published');
    };
  }, [currentUserId]);

  const handleBlogClick = () => {
    localStorage.setItem('last_viewed_blog', new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2">
            Le hub de la communauté étudiante de HITAS
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-400 text-lg mt-4 px-4">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

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

          {/* Carte Blog d'Entraide */}
          <Link 
            to="/blog" 
            onClick={handleBlogClick}
            className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative w-12 h-12 mb-4">
                <div className="w-full h-full text-3xl bg-zinc-950 flex items-center justify-center rounded-xl border border-zinc-800">
                  📝
                </div>
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse shadow-md border-2 border-zinc-900">
                    {unreadCount}
                  </span>
                )}
              </div>

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