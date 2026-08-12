import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client'; 

const Navbar = () => {
  const [avatar, setAvatar] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false); 
  
  // 🌓 État du thème (Dark/Light) initialisé depuis le localStorage
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const navigate = useNavigate();
  const BACKEND_URL = "https://hitas.onrender.com";
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId'); 
  const userRole = localStorage.getItem('userRole'); 

  // 🌓 Effet pour appliquer ou retirer l'attribut data-theme du body
  useEffect(() => {
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [theme]);

  // Fonction de bascule du thème
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const fetchNavbarProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/profile/me`, {
          headers: { 'x-auth-token': token }
        });
        if (res.data?.avatar) {
          if (res.data.avatar.startsWith("http")) {
            setAvatar(res.data.avatar);
          } else {
            setAvatar(`${BACKEND_URL}${res.data.avatar}`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNavbarProfile();

    const handleAvatarUpdated = () => {
      fetchNavbarProfile();
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdated);

    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdated);
    };
  }, [token]);

  useEffect(() => {
    if (!token || !loggedInUserId) return; 

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('article_published', (newPost) => {
      if (!newPost || !newPost.user) return;

      const rawAuthorId = typeof newPost.user === 'object' ? newPost.user._id : newPost.user;
      const postAuthorId = String(rawAuthorId).trim();
      const myId = String(loggedInUserId).trim();

      if (postAuthorId !== myId) {
        setHasNewNotification(true); 
      }
    });

    return () => {
      socket.off('article_published');
      socket.disconnect();
    };
  }, [token, loggedInUserId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole'); 
    navigate('/login');
  };

  const clearNotifications = () => {
    setHasNewNotification(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0B0F19]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🚀 LOGO MODERNE */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              HITAS <span className="font-light text-slate-400">Connect</span><span className="text-indigo-500">.</span>
            </Link>
          </div>

          {/* 🗺️ LIENS DE NAVIGATION (PC) */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink 
              to="/annuaire" 
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              Annuaire
            </NavLink>

            <NavLink 
              to="/blog" 
              onClick={clearNotifications}
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <span className="relative inline-block">
                Blog & Entraide
                {hasNewNotification && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </span>
            </NavLink>

            <NavLink 
              to="/showcase" 
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-indigo-500/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              Showcase
            </NavLink>

            {token && userRole === 'admin' && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border border-indigo-500/20 ${
                  isActive 
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                    : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30'
                }`}
              >
                Panel Admin 🛠️
              </NavLink>
            )}
          </div>
          
          {/* 🔐 ESPACE UTILISATEUR & BOUTON TOGGLE */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* 🌓 Bouton Toggle Thème (Clair / Sombre) */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-200 hover:bg-slate-800 transition-all duration-200 text-sm flex items-center justify-center shadow-sm cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {token ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link 
                  to="/profil" 
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <img 
                    src={avatar || 'https://via.placeholder.com/150'} 
                    alt="Profil" 
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <span className="hidden sm:inline">Mon Profil</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="text-xs bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-2 rounded-xl hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-all duration-200 font-medium"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                Connexion
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 📱 MENU SUB-BARRE MOBILE */}
      <div className="md:hidden border-t border-slate-800/40 bg-[#0B0F19]/90 px-4 py-2 flex items-center justify-around text-xs font-medium overflow-x-auto gap-2">
        <NavLink 
          to="/annuaire" 
          className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-colors ${
            isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Annuaire
        </NavLink>
        
        <NavLink 
          to="/blog" 
          onClick={clearNotifications} 
          className={({ isActive }) => `py-1.5 px-3 rounded-lg relative transition-colors ${
            isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Blog
          {hasNewNotification && (
            <span className="absolute top-1.5 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          )}
        </NavLink>

        <NavLink 
          to="/showcase" 
          className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-colors ${
            isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Showcase
        </NavLink>
        
        {token && userRole === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `py-1.5 px-3 rounded-lg font-bold border transition-colors ${
              isActive 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                : 'text-indigo-400 bg-indigo-500/5 border-indigo-500/20 hover:text-indigo-300'
            }`}
          >
            Admin 🛠️
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;