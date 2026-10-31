import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Users, MessageSquareText, Rocket, Bell } from 'lucide-react';
import Navbar from '../components/Navbar';

// 🌐 CONFIGURATION & SOCKET
const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://hitas.onrender.com';
const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'], withCredentials: true });

// 📦 ASSETS IMPORTS
import hitasLogo from '../assets/hitas_logo.svg';
import franceFlag from '../assets/france.svg';
import cameroonFlag from '../assets/cameroon.svg';
import indiaFlag from '../assets/india.svg';
import brazilFlag from '../assets/brazil.svg';
import germanyFlag from '../assets/germany.svg';
import uk from '../assets/uk.svg';
import italia from '../assets/italia.svg';

const FLAGS = [
  { id: 1, src: franceFlag, label: 'France', delay: '0s' },
  { id: 2, src: cameroonFlag, label: 'Cameroun', delay: '-2s' },
  { id: 3, src: indiaFlag, label: 'Inde', delay: '-4s' },
  { id: 4, src: brazilFlag, label: 'Brésil', delay: '-6s' },
  { id: 5, src: germanyFlag, label: 'Allemagne', delay: '-8s' },
  { id: 6, src: uk, label: 'uk', delay: '-10s' },
  { id: 7, src: italia, label: 'italia', delay: '-12s' },
];

const OrbitingLogo = () => (
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

    {/* Glow Effect */}
    <div className="relative z-10 w-36 h-36 flex items-center justify-center pointer-events-none">
      <img src={hitasLogo} alt="Logo HITAS" className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
    </div>

    <div className="absolute w-[320px] h-[76px] border border-dashed border-indigo-900/50 rounded-[50%] pointer-events-none"></div>

    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {FLAGS.map((flag) => (
        <div
          key={flag.id}
          className="absolute w-7 h-7 rounded-full overflow-hidden border border-indigo-500/40 bg-gray-900 shadow-lg shadow-indigo-500/20 flex items-center justify-center animate-ellipse-orbit"
          style={{ animationDelay: flag.delay }}
        >
          <img src={flag.src} alt={flag.label} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  </div>
);

function Home() {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = localStorage.getItem('userId');
  const [permissionStatus, setPermissionStatus] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission === 'granted' && 'serviceWorker' in navigator) {
          await navigator.serviceWorker.ready;
        }
      } catch (err) {
        console.error("Erreur demande de permission :", err);
      }
    }
  };

  // Badge Sync
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(() => { });
      } else {
        navigator.clearAppBadge().catch(() => { });
      }
    }
  }, [unreadCount]);

  // Fetch Unread Blog Posts
  useEffect(() => {
    const fetchArticlesAndCalculateUnread = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/posts`);
        const articles = response.data || [];
        const lastViewedBlog = localStorage.getItem('last_viewed_blog');

        const unreadArticles = articles.filter(article => {
          if (!article.date) return false;
          const authorId = typeof article.user === 'object' ? article.user._id : article.user;
          if (String(authorId).trim() === String(currentUserId).trim()) return false;

          if (!lastViewedBlog) return true;
          return new Date(article.date) > new Date(lastViewedBlog);
        });

        setUnreadCount(unreadArticles.length);
      } catch (error) {
        console.error("Erreur initialisation des notifications:", error);
      }
    };

    fetchArticlesAndCalculateUnread();
    const handlePageShow = () => fetchArticlesAndCalculateUnread();
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [currentUserId]);

  // Socket Listener
  useEffect(() => {
    socket.on('article_published', (newArticle) => {
      const authorId = typeof newArticle.user === 'object' ? newArticle.user._id : newArticle.user;
      if (String(authorId).trim() === String(currentUserId).trim()) return;
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.off('article_published');
  }, [currentUserId]);

  const handleBlogClick = () => {
    localStorage.setItem('last_viewed_blog', new Date().toISOString());
    setUnreadCount(0);
  };

  const featureCards = [
    {
      to: '/annuaire',
      title: 'Annuaire',
      description: 'Trouve et contacte les étudiants basés en Inde, en France et encore plus.',
      actionText: "Explorer l'annuaire",
      icon: <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />,
      bgIcon: 'bg-indigo-500/15 border-indigo-500/30',
      hoverBorder: 'hover:border-indigo-500',
      shadowHover: 'hover:shadow-indigo-500/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      delay: '0.2s',
    },
    {
      to: '/blog',
      onClick: handleBlogClick,
      title: "Blog d'Entraide",
      description: "Découvre les guides d'installation, astuces pour les visas et partages d'expériences.",
      actionText: 'Lire les articles',
      icon: <MessageSquareText className="h-5 w-5 text-purple-600 dark:text-purple-300" />,
      bgIcon: 'bg-purple-500/15 border-purple-500/30',
      hoverBorder: 'hover:border-purple-500',
      shadowHover: 'hover:shadow-purple-500/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      badge: unreadCount,
      delay: '0.3s',
    },
    {
      to: '/showcase',
      title: 'Showcase',
      description: "Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.",
      actionText: 'Voir les projets',
      icon: <Rocket className="h-5 w-5 text-pink-600 dark:text-pink-300" />,
      bgIcon: 'bg-pink-500/15 border-pink-500/30',
      hoverBorder: 'hover:border-pink-500',
      shadowHover: 'hover:shadow-pink-500/20',
      textColor: 'text-pink-600 dark:text-pink-400',
      delay: '0.4s',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <style>{`
        body, html {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <Navbar />

      {/* Notification Prompt */}
      {permissionStatus !== 'granted' ? (
        <div className="bg-white/90 dark:bg-gray-900/95 border-b border-indigo-500/30 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm backdrop-blur-md sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200 font-medium">
            <Bell className="h-4 w-4 text-indigo-500 dark:text-indigo-400 animate-bounce" />
            <span>Activez les notifications pour recevoir les alertes du blog en temps réel.</span>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/30 active:scale-95"
          >
            Activer
          </button>
        </div>
      ) : (
        <div className="absolute right-4 top-20 z-50 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold select-none px-2.5 py-1 rounded-full border border-emerald-800/40 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-12 pb-24 md:pb-12 flex flex-col justify-center relative z-10">

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-14 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2 text-gray-900 dark:text-white leading-tight drop-shadow-sm">
            Le Hub de la Communauté Estudiantine de HITAS.
          </h1>
          <OrbitingLogo />
          <p className="text-gray-900 dark:text-zinc-100 text-base md:text-lg mt-4 px-4 max-w-xl mx-auto font-bold leading-relaxed">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.to}
              onClick={card.onClick}
              className={`group relative p-7 bg-white/70 dark:bg-[#0b0f19]/80 backdrop-blur-xl border border-white/40 dark:border-indigo-500/30 ${card.hoverBorder} rounded-3xl transition-all duration-300 shadow-lg hover:shadow-2xl ${card.shadowHover} flex flex-col justify-between opacity-0 animate-fade-in-up hover:-translate-y-1.5 cursor-pointer`}
              style={{ animationDelay: card.delay }}
            >
              <div>
                <div className={`relative w-12 h-12 rounded-2xl ${card.bgIcon} border flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                  {card.icon}
                  {card.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse border-2 border-white dark:border-[#030014]">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-xl mb-2 transition-colors tracking-tight">{card.title}</h3>
                <p className="text-gray-700 dark:text-zinc-300 text-sm leading-relaxed font-medium">{card.description}</p>
              </div>
              <span className={`text-xs font-bold ${card.textColor} mt-6 flex items-center gap-1.5 transition-colors duration-300`}>
                {card.actionText} <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}

export default Home;