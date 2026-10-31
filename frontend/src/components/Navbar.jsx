import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogOut, Globe2, ChevronDown } from 'lucide-react';

const SUPPORTED_LANGUAGES = ['fr', 'en', 'de', 'it'];
const BACKEND_URL = 'https://hitas.onrender.com';
const LANGUAGE_LABELS = { fr: 'FR', en: 'EN', de: 'DE', it: 'IT' };

const Navbar = () => {
  const navigate = useNavigate();
  const languageRef = useRef(null);

  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const [avatar, setAvatar] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('hitasLanguage');
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'fr';
  });

  // ==========================================
  // 🌐 GOOGLE TRANSLATE SETUP & BANNER HIDING
  // ==========================================
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'en,de,fr,it',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    const hideGoogleBanner = () => {
      const banner = document.querySelector('body > .skiptranslate');
      const iframe = document.querySelector('iframe.goog-te-banner-frame');
      if (banner) banner.style.cssText = 'display:none;visibility:hidden;height:0;width:0;overflow:hidden;';
      if (iframe) iframe.style.cssText = 'display:none;visibility:hidden;height:0;width:0;';
      document.documentElement.style.marginTop = '0';
      document.body.style.marginTop = '0';
      document.body.style.top = '0';
    };

    hideGoogleBanner();
    const t1 = setTimeout(hideGoogleBanner, 500);
    const t2 = setTimeout(hideGoogleBanner, 1500);
    const observer = new MutationObserver(hideGoogleBanner);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, []);

  // ==========================================
  // 🌐 LANGUAGE SWITCHER
  // ==========================================
  const changeLanguage = (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    localStorage.setItem('hitasLanguage', lang);
    setLanguage(lang);
    setLanguageOpen(false);

    if (lang === 'fr') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/fr/${lang}; path=/;`;
    }
    window.location.reload();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // 👤 PROFILE & 🔔 NOTIFICATIONS
  // ==========================================
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/profile/me`, {
          headers: { 'x-auth-token': token },
        });
        if (res.data?.avatar) {
          setAvatar(
            res.data.avatar.startsWith('http')
              ? res.data.avatar
              : `${BACKEND_URL}${res.data.avatar}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    const handleAvatarUpdate = () => fetchProfile();
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, [token]);

  useEffect(() => {
    if (!token || !loggedInUserId) return;

    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socket.on('article_published', (newPost) => {
      if (!newPost?.user) return;
      const authorId = typeof newPost.user === 'object' ? newPost.user._id : newPost.user;
      if (String(authorId).trim() !== String(loggedInUserId).trim()) {
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

  // Navigation Links Config
  const navLinks = [
    { to: '/annuaire', label: 'Annuaire' },
    { to: '/blog', label: 'Blog & Entraide', mobileLabel: 'Blog', notification: hasNewNotification, onClick: () => setHasNewNotification(false) },
    { to: '/showcase', label: 'Showcase' },
    ...(token && userRole === 'admin' ? [{ to: '/admin', label: 'Admin 🛠️', mobileLabel: 'Admin', isAdmin: true }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-sky-800/40 bg-white/80 dark:bg-sky-950/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-black tracking-wider text-gray-900 dark:text-white hover:opacity-90 transition-opacity">
              HITAS <span className="font-light text-gray-700 dark:text-sky-200">Connect</span>
              <span className="text-sky-600 dark:text-sky-400">.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={link.onClick}
                className={({ isActive }) =>
                  link.isAdmin
                    ? `px-4 py-2 rounded-xl text-sm font-black border transition-all ${isActive ? 'bg-sky-600/40 text-sky-950 dark:text-sky-100 border-sky-400 shadow-sm' : 'text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/40'}`
                    : `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/40 shadow-sm' : 'text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-sky-900/40'}`
                }
              >
                <span className="relative inline-block">
                  {link.label}
                  {link.notification && (
                    <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"></span>
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Right Side: Language & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Language Selector */}
            <div ref={languageRef} className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-gray-200 dark:border-sky-500/30 bg-gray-50 dark:bg-sky-950/70 backdrop-blur-md text-gray-700 dark:text-slate-200 hover:border-sky-500 dark:hover:border-sky-400/60 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all duration-200 shadow-sm"
                aria-label="Choose language"
                aria-expanded={languageOpen}
              >
                <Globe2 className="w-4 h-4 text-sky-600 dark:text-sky-300 transition-colors" />
                <span className="text-xs sm:text-sm font-bold tracking-wide">{LANGUAGE_LABELS[language]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${languageOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown */}
              {languageOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border border-gray-200 dark:border-sky-500/30 bg-white dark:bg-sky-950/95 backdrop-blur-xl shadow-xl z-[100]">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const flags = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪', it: '🇮🇹' };
                    const names = { fr: 'Français', en: 'English', de: 'Deutsch', it: 'Italiano' };
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => changeLanguage(lang)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === lang ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-200' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-sky-900/70'}`}
                      >
                        <span className="text-base">{flags[lang]}</span>
                        <span className="font-medium">{names[lang]}</span>
                        {language === lang && <span className="ml-auto text-sky-600 dark:text-sky-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hidden Google Translate Engine Element */}
            <div id="google_translate_element" className="absolute left-[-9999px] top-[-9999px] w-[1px] h-[1px] overflow-hidden opacity-0" aria-hidden="true" />

            {/* User Profile / Auth */}
            {token ? (
              <div className="flex items-center gap-2">
                <Link to="/profil" className="flex items-center p-1 rounded-full border border-gray-200 dark:border-sky-500/60 bg-gray-50 dark:bg-sky-950/60 hover:border-sky-500 transition-all shadow-sm" title="Mon Profil">
                  <img src={avatar || 'https://via.placeholder.com/150'} alt="Profil" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-sky-500 dark:ring-sky-400" />
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-700 dark:text-slate-200 hover:text-red-500 dark:hover:text-red-400 bg-gray-50 dark:bg-sky-950/80 border border-gray-200 dark:border-sky-900 rounded-xl hover:border-red-500/50 transition-all shadow-sm" title="Déconnexion">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navbar */}
      <div className="md:hidden border-t border-gray-200 dark:border-sky-950/40 bg-white/95 dark:bg-sky-950/95 px-2 py-2 flex items-center justify-around text-xs font-bold gap-1 shadow-sm">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={link.onClick}
            className={({ isActive }) =>
              link.isAdmin
                ? `py-1.5 px-2.5 rounded-lg font-black border ${isActive ? 'bg-sky-600/40 text-sky-950 dark:text-sky-100 border-sky-400' : 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30'}`
                : `py-1.5 px-3 rounded-lg relative transition-all ${isActive ? 'bg-sky-100 dark:bg-sky-500/25 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/50 shadow-sm' : 'text-gray-700 dark:text-slate-200'}`
            }
          >
            {link.mobileLabel || link.label}
            {link.notification && <span className="absolute top-1.5 right-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;