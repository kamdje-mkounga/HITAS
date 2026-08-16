import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client'; 
import { Users, MessageSquareText, Rocket, Moon, Sun, LogOut } from 'lucide-react';

const Navbar = () => {
  const [avatar, setAvatar] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false); 
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const navigate = useNavigate();
  const BACKEND_URL = "https://hitas.onrender.com";
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId'); 
  const userRole = localStorage.getItem('userRole'); 

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
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-950/40 bg-[#0B0F19]/85 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* 🚀 LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 bg-clip-text text-transparent hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">
              HITAS <span className="font-light text-slate-300">Connect</span><span className="text-indigo-400">.</span>
            </Link>
          </div>

          {/* 🗺️ LIENS DE NAVIGATION (PC) */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/annuaire" className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              Annuaire
            </NavLink>
            <NavLink to="/blog" onClick={clearNotifications} className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              <span className="relative inline-block">
                Blog & Entraide
                {hasNewNotification && (
                  <span className="absolute -top-1 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </span>
            </NavLink>
            <NavLink to="/showcase" className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.25)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              Showcase
            </NavLink>
            {token && userRole === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${isActive ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60' : 'text-indigo-300 border-indigo-500/30'}`}>
                Admin 🛠️
              </NavLink>
            )}
          </div>
          
          {/* 🔐 ESPACE UTILISATEUR & SWITCH ÉPURÉ */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
           
           {/* SWITCH THEME */}
           <button 
              onClick={toggleTheme}
              className="relative w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer border border-slate-700/60 bg-slate-900/80 shadow-inner transition-colors"
              aria-label="Toggle Theme"
            >
              <div 
                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out"
                style={{
                  transform: theme === 'light' ? 'translateX(24px)' : 'translateX(0px)',
                  backgroundColor: theme === 'light' ? '#f59e0b' : '#312e81'
                }}
              >
                {theme === 'dark' ? <Moon className="w-3 h-3 text-indigo-200" /> : <Sun className="w-3 h-3 text-white" />}
              </div>
            </button>

            {token ? (
              <div className="flex items-center gap-2">
                {/* Profil sans bloc encombrant : juste l'avatar */}
                <Link to="/profil" className="flex items-center p-1 rounded-full border border-indigo-500/40 bg-slate-900/40 hover:border-indigo-400 transition-all shadow-[0_0_10px_rgba(99,102,241,0.2)]" title="Mon Profil">
                  <img 
                    src={avatar || 'https://via.placeholder.com/150'} 
                    alt="Profil" 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-400/60"
                  />
                </Link>
                
                {/* Déconnexion en icône stylée */}
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-red-500/40 transition-all shadow-sm" 
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg hover:opacity-90 transition-opacity">
                Connexion
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 📱 MENU SUB-BARRE MOBILE (Ajusté, compact et sans chevauchement) */}
      <div className="md:hidden border-t border-indigo-950/40 bg-[#0B0F19]/95 px-2 py-2 flex items-center justify-around text-xs font-semibold gap-1">
        <NavLink to="/annuaire" className={({ isActive }) => `py-1 px-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'}`}>Annuaire</NavLink>
        <NavLink to="/blog" onClick={clearNotifications} className={({ isActive }) => `py-1 px-3 rounded-lg relative transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'}`}>
          Blog {hasNewNotification && <span className="absolute top-1 right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />}
        </NavLink>
        <NavLink to="/showcase" className={({ isActive }) => `py-1 px-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'}`}>Showcase</NavLink>
        {token && userRole === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `py-1 px-2.5 rounded-lg font-bold border ${isActive ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'}`}>Admin</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;