import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client'; 
import { Users, MessageSquareText, Rocket, Bell, Moon, Sun } from 'lucide-react';

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
    const handleAvatarUpdated = () => fetchNavbarProfile();
    window.addEventListener("avatarUpdated", handleAvatarUpdated);
    return () => window.removeEventListener("avatarUpdated", handleAvatarUpdated);
  }, [token]);

  useEffect(() => {
    if (!token || !loggedInUserId) return; 
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

    socket.on('article_published', (newPost) => {
      if (!newPost || !newPost.user) return;
      const rawAuthorId = typeof newPost.user === 'object' ? newPost.user._id : newPost.user;
      if (String(rawAuthorId).trim() !== String(loggedInUserId).trim()) {
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

  const clearNotifications = () => setHasNewNotification(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-950/60 bg-[#0B0F19]/80 backdrop-blur-xl shadow-lg shadow-indigo-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🚀 LOGO STYLÉ & BRILLANT */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-black tracking-wider bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 bg-clip-text text-transparent hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">
              HITAS <span className="font-light text-slate-300">Connect</span><span className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">.</span>
            </Link>
          </div>

          {/* 🗺️ LIENS DE NAVIGATION (PC) AVEC EFFETS LUMINEUX */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink 
              to="/annuaire" 
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Annuaire
            </NavLink>

            <NavLink 
              to="/blog" 
              onClick={clearNotifications}
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span className="relative inline-block">
                Blog & Entraide
                {hasNewNotification && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  </span>
                )}
              </span>
            </NavLink>

            <NavLink 
              to="/showcase" 
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Showcase
            </NavLink>

            {token && userRole === 'admin' && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                  isActive 
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                    : 'text-indigo-300 border-indigo-500/30 hover:bg-indigo-950/40 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                }`}
              >
                Panel Admin 🛠️
              </NavLink>
            )}
          </div>
          
          {/* 🔐 ESPACE UTILISATEUR & SWITCH ANIMÉ */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
           {/* 🌟 SLIDING THEME SWITCH PROFESSIONNEL */}
           <button 
              onClick={toggleTheme}
              className="relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none border border-slate-700/80 shadow-inner bg-slate-900/90"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              <div 
                className="w-6 h-6 rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out"
                style={{
                  transform: theme === 'light' ? 'translateX(32px)' : 'translateX(0px)',
                  backgroundColor: theme === 'light' ? '#f59e0b' : '#312e81'
                }}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-200" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-white animate-spin-slow" />
                )}
              </div>
            </button>

            {token ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link 
                  to="/profil" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-slate-900/60 text-slate-200 hover:text-white hover:border-indigo-500/60 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all duration-200 text-sm font-semibold shadow-sm"
                >
                  <img 
                    src={avatar || 'https://via.placeholder.com/150'} 
                    alt="Profil" 
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-400/50 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  />
                  <span className="hidden sm:inline">Mon Profil</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="text-xs bg-slate-900 text-slate-300 border border-slate-700/80 px-3 py-2 rounded-xl hover:bg-red-950/40 hover:text-red-300 hover:border-red-800/80 transition-all duration-200 font-semibold"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.6)]"
              >
                Connexion
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 📱 MENU SUB-BARRE MOBILE (Corrigé avec un espacement et retour à la ligne si besoin pour éviter la superposition) */}
      <div className="md:hidden border-t border-indigo-950/40 bg-[#0B0F19]/95 px-3 py-2.5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
        <NavLink to="/annuaire" className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white'}`}>Annuaire</NavLink>
        <NavLink to="/blog" onClick={clearNotifications} className={({ isActive }) => `py-1.5 px-3 rounded-lg relative transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white'}`}>
          Blog {hasNewNotification && <span className="absolute top-1.5 right-1 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />}
        </NavLink>
        <NavLink to="/showcase" className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white'}`}>Showcase</NavLink>
        {token && userRole === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `py-1.5 px-3 rounded-lg font-bold border transition-colors ${isActive ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:text-indigo-200'}`}>Admin 🛠️</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;