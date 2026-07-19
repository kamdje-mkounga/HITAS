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
          className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(99,102,241,0.35)]"
        />
      </div>

      <div className="absolute w-[320px] h-[76px] border border-dashed border-indigo-950/60 rounded-[50%] pointer-events-none"></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="absolute w-7 h-7 rounded-full overflow-hidden border border-indigo-950 bg-[#0b081e] shadow-lg flex items-center justify-center animate-ellipse-orbit"
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
          // Réveille le Service Worker pour l'enregistrement du token FCM
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
      className="min-h-screen bg-[#030014] text-zinc-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(3, 0, 20, 0.40), rgba(3, 0, 20, 0.50)), url(${tradPattern})`,
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
        <div className="bg-indigo-950/30 border-b border-indigo-500/10 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 text-zinc-300">
            <Bell className="h-4 w-4 text-indigo-400 animate-bounce" />
            <span>Activez les notifications pour recevoir les alertes du blog en temps réel.</span>
          </div>
          <button 
            onClick={handleEnableNotifications}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-semibold text-xs transition-all shadow-md shadow-indigo-600/10 active:scale-95"
          >
            Activer
          </button>
        </div>
      ) : (
        /* Micro-message super discret quand c'est actif */
        <div className="absolute right-4 top-16 z-50 flex items-center gap-1 text-[10px] text-emerald-400/70 font-medium select-none">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Notifications actives</span>
        </div>
      )}

      {/* Ajout de pb-24 sur mobile pour éviter que le sous-menu ne chevauche le contenu */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-12 pb-24 md:pb-12 flex flex-col justify-center relative z-10">
        
        {/* En-tête principal animé */}
        <div className="text-center max-w-2xl mx-auto mb-14 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2 bg-gradient-to-r from-white via-indigo-100 to-purple-300 bg-clip-text text-transparent leading-tight">
            Le hub de la communauté étudiante de HITAS
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-400 text-base md:text-lg mt-4 px-4 max-w-xl mx-auto font-normal leading-relaxed">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

        {/* Grille des fonctionnalités principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Annuaire */}
          <Link 
            to="/annuaire" 
            className="group p-6 bg-[#0b081e]/40 backdrop-blur-md border border-indigo-950/60 hover:border-indigo-500/30 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-indigo-500/5"
            style={{ animationDelay: '0.2s' }}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1.5 group-hover:text-indigo-400 transition-colors duration-300">Annuaire</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Trouve et contacte les étudiants basés en Inde, en France et encore plus.</p>
            </div>
            <span className="text-xs font-semibold text-indigo-400/80 group-hover:text-indigo-300 mt-6 flex items-center gap-1 transition-colors duration-300">
              Explorer l'annuaire →
            </span>
          </Link>

          {/* Carte Blog d'Entraide */}
          <Link 
            to="/blog" 
            onClick={handleBlogClick}
            className="group p-6 bg-[#0b081e]/40 backdrop-blur-md border border-indigo-950/60 hover:border-purple-500/30 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-purple-500/5"
            style={{ animationDelay: '0.3s' }}
          >
            <div>
              <div className="relative w-12 h-12 mb-5">
                <div className="w-full h-full rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all duration-300">
                  <MessageSquareText className="h-5 w-5 text-purple-400" />
                </div>
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse shadow-md border-2 border-[#030014]">
                    {unreadCount}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-zinc-100 text-lg mb-1.5 group-hover:text-purple-400 transition-colors duration-300">Blog d'Entraide</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Découvre les guides d'installation, astuces pour les visas et partages d'expériences.</p>
            </div>
            <span className="text-xs font-semibold text-purple-400/80 group-hover:text-purple-300 mt-6 flex items-center gap-1 transition-colors duration-300">
              Lire les articles →
            </span>
          </Link>

          {/* Carte Showcase */}
          <Link 
            to="/showcase" 
            className="group p-6 bg-[#0b081e]/40 backdrop-blur-md border border-indigo-950/60 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/30 flex flex-col justify-between opacity-0 animate-fade-in-up hover:shadow-pink-500/5"
            style={{ animationDelay: '0.4s' }}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5 group-hover:bg-pink-500/20 transition-all duration-300">
                <Rocket className="h-5 w-5 text-pink-400" />
              </div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1.5 group-hover:text-pink-400 transition-colors duration-300">Showcase</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.</p>
            </div>
            <span className="text-xs font-semibold text-pink-400/80 group-hover:text-pink-300 mt-6 flex items-center gap-1 transition-colors duration-300">
              Voir les projets →
            </span>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Home;