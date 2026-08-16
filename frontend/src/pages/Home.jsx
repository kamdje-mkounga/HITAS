import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client';
import { Users, MessageSquareText, Rocket, Bell } from 'lucide-react';
import tradPattern from '../assets/traditional.jpg';

// 🌐 CONFIGURATION DE L'URL DU BACKEND
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://hitas.onrender.com'; 

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
import uk from '../assets/uk.svg';
import italia from '../assets/italia.svg';

const OrbitingLogo = () => {
  const flags = [
    { id: 1, src: franceFlag, label: 'France', delay: '0s' },
    { id: 2, src: cameroonFlag, label: 'Cameroun', delay: '-2s' },
    { id: 3, src: indiaFlag, label: 'Inde', delay: '-4s' },
    { id: 4, src: brazilFlag, label: 'Brésil', delay: '-6s' },
    { id: 5, src: germanyFlag, label: 'Allemagne', delay: '-8s' },
    { id: 6, src: uk, label: 'uk', delay: '-10s' },
    { id: 7, src: italia, label: 'italia', delay: '-12s' },
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

      {/* 🔮 Lueur indigo diffuse harmonisée */}
      <div className="relative z-10 w-36 h-36 flex items-center justify-center pointer-events-none">
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
  );
};

function Home() {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem('userId'); 
  
  // 🍏 État pour suivre la permission de notification native
  const [permissionStatus, setPermissionStatus] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  // 🔔 Fonction d'activation au clic pour contourner les blocages iOS
  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted' && 'serviceWorker' in navigator) {
          await navigator.serviceWorker.ready;
          console.log("iOS PWA : Autorisation validée !");
        }
      } catch (err) {
        console.error("Erreur demande de permission :", err);
      }
    }
  };

  // 🔴 Gestion et synchronisation en temps réel du badge sur l'écran d'accueil
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch((err) => console.log(err));
      } else {
        navigator.clearAppBadge().catch((err) => console.log(err));
      }
    }
  }, [unreadCount]);

  useEffect(() => {
    const fetchArticlesAndCalculateUnread = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/posts`); 
        const articles = response.data || [];
        const lastViewedBlog = localStorage.getItem('last_viewed_blog');
        
        if (!lastViewedBlog) {
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
 
    fetchArticlesAndCalculateUnread();

    const handlePageShow = (event) => {
      fetchArticlesAndCalculateUnread();
    };

    window.addEventListener('pageshow', handlePageShow);
 
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [currentUserId]);

  useEffect(() => {
    socket.on('article_published', (newArticle) => {
      const authorId = typeof newArticle.user === 'object' ? newArticle.user._id : newArticle.user;
      if (String(authorId).trim() === String(currentUserId).trim()) return; 
      setUnreadCount(prev => prev + 1);
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
    <div 
      className="min-h-screen text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        backgroundImage: `linear-gradient(to bottom, var(--home-overlay-1), var(--home-overlay-2)), url(${tradPattern})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <Navbar />

      {/* 🔔 COMPOSANT DE SUGGESTION DESIGN DES NOTIFICATIONS */}
      {permissionStatus !== 'granted' ? (
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_20px_rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-2 text-indigo-200 font-medium">
            <Bell className="h-4 w-4 text-indigo-400 animate-bounce" />
            <span>Activez les notifications pour recevoir les alertes du blog en temps réel.</span>
          </div>
          <button 
            onClick={handleEnableNotifications}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/30 hover:shadow-[0_0_12px_rgba(99,102,241,0.5)] active:scale-95"
          >
            Activer
          </button>
        </div>
      ) : (
        <div className="absolute right-4 top-20 z-50 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold select-none bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(52,211,153,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          {/*<span>Notifications actives</span> */}
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-12 pb-24 md:pb-12 flex flex-col justify-center relative z-10">
        
        {/* En-tête principal animé avec titres lumineux */}
        <div className="text-center max-w-2xl mx-auto mb-14 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight drop-shadow-[0_0_25px_rgba(129,140,248,0.35)]">
            Le hub de la communauté étudiante de HITAS
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-300 text-base md:text-lg mt-4 px-4 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-sm">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

        {/* Grille des fonctionnalités principales avec effets de cartes lumineuses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Annuaire */}
          <Link 
            to="/annuaire" 
            className="group p-6 bg-[#0b081e]/70 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/60 rounded-3xl transition-all duration-300 shadow-2xl shadow-indigo-950/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:-translate-y-1"
            style={{ animationDelay: '0.2s' }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:bg-indigo-500/25 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Users className="h-5 w-5 text-indigo-300 drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
              </div>
              <h3 className="font-black text-white text-lg mb-1.5 group-hover:text-indigo-300 transition-colors duration-300 drop-shadow-sm">Annuaire</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Trouve et contacte les étudiants basés en Inde, en France et encore plus.</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 mt-6 flex items-center gap-1 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">
              Explorer l'annuaire →
            </span>
          </Link>

          {/* Carte Blog d'Entraide */}
          <Link 
            to="/blog" 
            onClick={handleBlogClick}
            className="group p-6 bg-[#0b081e]/70 backdrop-blur-xl border border-indigo-500/20 hover:border-purple-500/60 rounded-3xl transition-all duration-300 shadow-2xl shadow-purple-950/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:-translate-y-1"
            style={{ animationDelay: '0.3s' }}
          >
            <div>
              <div className="relative w-12 h-12 mb-5">
                <div className="w-full h-full rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/25 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <MessageSquareText className="h-5 w-5 text-purple-300 drop-shadow-[0_0_6px_rgba(216,180,254,0.8)]" />
                </div>
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)] border-2 border-[#030014]">
                    {unreadCount}
                  </span>
                )}
              </div>

              <h3 className="font-black text-white text-lg mb-1.5 group-hover:text-purple-300 transition-colors duration-300 drop-shadow-sm">Blog d'Entraide</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Découvre les guides d'installation, astuces pour les visas et partages d'expériences.</p>
            </div>
            <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 mt-6 flex items-center gap-1 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              Lire les articles →
            </span>
          </Link>

          {/* Carte Showcase */}
          <Link 
            to="/showcase" 
            className="group p-6 bg-[#0b081e]/70 backdrop-blur-xl border border-indigo-500/20 hover:border-pink-500/60 rounded-3xl transition-all duration-300 shadow-2xl shadow-pink-950/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:-translate-y-1"
            style={{ animationDelay: '0.4s' }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mb-5 group-hover:bg-pink-500/25 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                <Rocket className="h-5 w-5 text-pink-300 drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
              </div>
              <h3 className="font-black text-white text-lg mb-1.5 group-hover:text-pink-300 transition-colors duration-300 drop-shadow-sm">Showcase</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.</p>
            </div>
            <span className="text-xs font-bold text-pink-400 group-hover:text-pink-300 mt-6 flex items-center gap-1 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]">
              Voir les projets →
            </span>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Home;