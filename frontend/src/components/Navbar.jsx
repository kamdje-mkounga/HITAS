import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client'; 
import { Moon, Sun, LogOut } from 'lucide-react';

const Navbar = () => {
  const [avatar, setAvatar] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const navigate = useNavigate();
  const BACKEND_URL = "https://hitas.onrender.com";
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId'); 
  const userRole = localStorage.getItem('userRole'); 

  // 🌐 Initialize Google Translate widget dynamically inside React
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'en,de,fr',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

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
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-950/60 bg-[#0B0F19]/90 backdrop-blur-xl shadow-lg shadow-indigo-950/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* 🚀 LOGO BRILLANT */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-400 bg-clip-text text-transparent hover:opacity-100 transition-opacity drop-shadow-[0_0_20px_rgba(129,140,248,0.6)]">
              HITAS <span className="font-light text-slate-200">Connect</span><span className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.9)]">.</span>
            </Link>
          </div>

          {/* 🗺️ LIENS DE NAVIGATION (PC) */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/annuaire" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              Annuaire
            </NavLink>
            <NavLink to="/blog" onClick={clearNotifications} className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              <span className="relative inline-block">
                Blog & Entraide
                {hasNewNotification && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"></span>
                  </span>
                )}
              </span>
            </NavLink>
            <NavLink to="/showcase" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'}`}>
              Showcase
            </NavLink>
            {token && userRole === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-black border transition-all ${isActive ? 'bg-indigo-600/40 text-indigo-100 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]' : 'text-indigo-300 border-indigo-500/40'}`}>
                Admin 🛠️
              </NavLink>
            )}
          </div>
          
          {/* 🔐 ESPACE UTILISATEUR & TRANSLATE & SWITCH */}
          <div className="flex items-center space-x-2 sm:space-x-3">
           
           {/* 🌐 Compact Google Translate with Google Branding */}
           <div className="flex items-center gap-1.5 bg-slate-900/60 border border-indigo-500/30 px-2 py-1 rounded-xl">
             <span className="flex items-center" title="Powered by Google Translate">
               <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
             </span>
             <div id="google_translate_element"></div>
           </div>

           {/* SWITCH THEME LUMINEUX */}
           <button 
              onClick={toggleTheme}
              className="relative w-10 sm:w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer border border-indigo-500/40 bg-slate-900/90 shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-colors"
              aria-label="Toggle Theme"
            >
              <div 
                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out"
                style={{
                  transform: theme === 'light' ? 'translateX(20px)' : 'translateX(0px)',
                  backgroundColor: theme === 'light' ? '#f59e0b' : '#312e81'
                }}
              >
                {theme === 'dark' ? <Moon className="w-3 h-3 text-indigo-200" /> : <Sun className="w-3 h-3 text-white" />}
              </div>
            </button>

            {token ? (
              <div className="flex items-center gap-2">
                <Link to="/profil" className="flex items-center p-1 rounded-full border border-indigo-500/60 bg-slate-900/60 hover:border-indigo-400 transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]" title="Mon Profil">
                  <img 
                    src={avatar || 'https://via.placeholder.com/150'} 
                    alt="Profil" 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-400"
                  />
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-slate-300 hover:text-red-400 bg-slate-900/80 border border-slate-700 rounded-xl hover:border-red-500/50 transition-all shadow-sm" 
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all">
                Connexion
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 📱 MENU SUB-BARRE MOBILE */}
      <div className="md:hidden border-t border-indigo-950/40 bg-[#0B0F19]/95 px-2 py-2 flex items-center justify-around text-xs font-bold gap-1">
        <NavLink to="/annuaire" className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-all ${isActive ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-300'}`}>Annuaire</NavLink>
        <NavLink to="/blog" onClick={clearNotifications} className={({ isActive }) => `py-1.5 px-3 rounded-lg relative transition-all ${isActive ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-300'}`}>
          Blog {hasNewNotification && <span className="absolute top-1.5 right-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />}
        </NavLink>
        <NavLink to="/showcase" className={({ isActive }) => `py-1.5 px-3 rounded-lg transition-all ${isActive ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-300'}`}>Showcase</NavLink>
        {token && userRole === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `py-1.5 px-2.5 rounded-lg font-black border ${isActive ? 'bg-indigo-600/40 text-indigo-100 border-indigo-400' : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'}`}>Admin</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;