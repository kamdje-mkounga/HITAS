import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Moon,
  Sun,
  LogOut,
  Globe2,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const [avatar, setAvatar] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  // =========================================================
  // 🌐 LANGUAGE
  // =========================================================

  const supportedLanguages = ['fr', 'en', 'de', 'it'];

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('hitasLanguage');

    return supportedLanguages.includes(savedLanguage)
      ? savedLanguage
      : 'fr';
  });

  const [languageOpen, setLanguageOpen] = useState(false);

  const languageRef = useRef(null);

  const navigate = useNavigate();

  const BACKEND_URL = 'https://hitas.onrender.com';

  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  /* =========================================================
     🌐 GOOGLE TRANSLATE INITIALIZATION
     ========================================================= */

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'en,de,fr,it',
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');

      script.id = 'google-translate-script';

      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

      script.async = true;

      document.body.appendChild(script);
    } else if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement
    ) {
      window.googleTranslateElementInit();
    }

    /* =========================================================
       🚫 HIDE GOOGLE TRANSLATE BANNER
       ========================================================= */

    const hideGoogleBanner = () => {
      const banner = document.querySelector(
        'body > .skiptranslate'
      );

      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
        banner.style.height = '0';
        banner.style.width = '0';
        banner.style.overflow = 'hidden';
      }

      const iframe = document.querySelector(
        'iframe.goog-te-banner-frame'
      );

      if (iframe) {
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        iframe.style.height = '0';
        iframe.style.width = '0';
      }

      document.documentElement.style.marginTop = '0';
      document.body.style.marginTop = '0';
      document.body.style.top = '0';
    };

    hideGoogleBanner();

    const firstTimer = setTimeout(() => {
      hideGoogleBanner();
    }, 500);

    const secondTimer = setTimeout(() => {
      hideGoogleBanner();
    }, 1500);

    const observer = new MutationObserver(() => {
      hideGoogleBanner();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     🌐 KEEP LANGUAGE SYNCHRONIZED WITH LOCAL STORAGE
     ========================================================= */

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem('hitasLanguage');

    if (supportedLanguages.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      localStorage.setItem('hitasLanguage', 'fr');
      setLanguage('fr');
    }
  }, []);

  /* =========================================================
     🌐 CHANGE LANGUAGE
     ========================================================= */

  const changeLanguage = (lang) => {
    if (!supportedLanguages.includes(lang)) {
      return;
    }

    // Save selected language
    localStorage.setItem('hitasLanguage', lang);

    // Update Navbar immediately
    setLanguage(lang);
    setLanguageOpen(false);

    /* =======================================================
       🇫🇷 RETURN TO ORIGINAL FRENCH
       ======================================================= */

    if (lang === 'fr') {
      // Remove standard Google Translate cookie
      document.cookie =
        'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Remove host-specific cookie
      document.cookie =
        'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
        window.location.hostname;

      // Reload original French page
      window.location.reload();

      return;
    }

    /* =======================================================
       🌐 TRANSLATE FROM FRENCH
       ======================================================= */

    document.cookie = `googtrans=/fr/${lang}; path=/;`;

    // Reload so Google Translate applies the language
    window.location.reload();
  };

  /* =========================================================
     👆 CLOSE LANGUAGE DROPDOWN WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     🎨 THEME
     ========================================================= */

  useEffect(() => {
    if (theme === 'light') {
      document.body.setAttribute(
        'data-theme',
        'light'
      );

      localStorage.setItem('theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');

      localStorage.setItem('theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  /* =========================================================
     👤 PROFILE
     ========================================================= */

  useEffect(() => {
    const fetchNavbarProfile = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/profile/me`,
          {
            headers: {
              'x-auth-token': token
            }
          }
        );

        if (res.data?.avatar) {
          if (
            res.data.avatar.startsWith('http')
          ) {
            setAvatar(res.data.avatar);
          } else {
            setAvatar(
              `${BACKEND_URL}${res.data.avatar}`
            );
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

    window.addEventListener(
      'avatarUpdated',
      handleAvatarUpdated
    );

    return () => {
      window.removeEventListener(
        'avatarUpdated',
        handleAvatarUpdated
      );
    };
  }, [token]);

  /* =========================================================
     🔔 SOCKET NOTIFICATIONS
     ========================================================= */

  useEffect(() => {
    if (!token || !loggedInUserId) return;

    const socket = io(BACKEND_URL, {
      transports: [
        'websocket',
        'polling'
      ]
    });

    socket.on(
      'article_published',
      (newPost) => {
        if (!newPost || !newPost.user) {
          return;
        }

        const rawAuthorId =
          typeof newPost.user === 'object'
            ? newPost.user._id
            : newPost.user;

        if (
          String(rawAuthorId).trim() !==
          String(loggedInUserId).trim()
        ) {
          setHasNewNotification(true);
        }
      }
    );

    return () => {
      socket.off('article_published');
      socket.disconnect();
    };
  }, [token, loggedInUserId]);

  /* =========================================================
     🚪 LOGOUT
     ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

    navigate('/login');
  };

  /* =========================================================
     🔔 CLEAR NOTIFICATIONS
     ========================================================= */

  const clearNotifications = () => {
    setHasNewNotification(false);
  };

  /* =========================================================
     🌐 LANGUAGE LABELS
     ========================================================= */

  const languageLabels = {
    fr: 'FR',
    en: 'EN',
    de: 'DE',
    it: 'IT'
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-indigo-950/60 bg-white dark:bg-[#0B0F19] backdrop-blur-xl shadow-sm">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 gap-2">

          {/* =====================================================
              🚀 LOGO
              ===================================================== */}

          <div className="flex-shrink-0 flex items-center">

            <Link
              to="/"
              className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 dark:from-indigo-200 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent hover:opacity-100 transition-opacity"
            >
              HITAS{' '}

              <span className="font-light text-gray-700 dark:text-slate-200">
                Connect
              </span>

              <span className="text-indigo-600 dark:text-indigo-400">
                .
              </span>
            </Link>

          </div>

          {/* =====================================================
              🗺️ DESKTOP NAVIGATION
              ===================================================== */}

          <div className="hidden md:flex items-center space-x-2">

            <NavLink
              to="/annuaire"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900/60'
                }`
              }
            >
              Annuaire
            </NavLink>

            <NavLink
              to="/blog"
              onClick={clearNotifications}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900/60'
                }`
              }
            >
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

            <NavLink
              to="/showcase"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                  : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900/60'
                }`
              }
            >
              Showcase
            </NavLink>

            {token &&
              userRole === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-black border transition-all ${isActive
                      ? 'bg-indigo-600/40 text-indigo-900 dark:text-indigo-100 border-indigo-400 shadow-sm'
                      : 'text-indigo-600 dark:text-indigo-300 border-indigo-500/40'
                    }`
                  }
                >
                  Admin 🛠️
                </NavLink>
              )}

          </div>

          {/* =====================================================
              🔐 RIGHT SIDE
              ===================================================== */}

          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* =================================================
                🌐 LANGUAGE SELECTOR
                ================================================* */}

            <div
              ref={languageRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setLanguageOpen(
                    (prev) => !prev
                  )
                }
                className="
                  group
                  flex items-center gap-1.5
                  px-2.5 sm:px-3
                  py-2
                  rounded-xl
                  border border-gray-200 dark:border-indigo-500/30
                  bg-gray-50 dark:bg-slate-900/70
                  backdrop-blur-md
                  text-gray-700 dark:text-slate-200
                  hover:border-indigo-500 dark:hover:border-indigo-400/60
                  hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                  transition-all duration-200
                  shadow-sm
                "
                aria-label="Choose language"
                aria-expanded={languageOpen}
              >

                <Globe2 className="w-4 h-4 text-indigo-600 dark:text-indigo-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-200 transition-colors" />

                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  {languageLabels[language]}
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${languageOpen
                    ? 'rotate-180'
                    : ''
                    }`}
                />

              </button>

              {/* =============================================
                  LANGUAGE DROPDOWN
                  ============================================= */}

              {languageOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-full
                    mt-2
                    w-36
                    overflow-hidden
                    rounded-xl
                    border border-gray-200 dark:border-indigo-500/30
                    bg-white dark:bg-[#0B0F19]/95
                    backdrop-blur-xl
                    shadow-xl
                    z-[100]
                    animate-in
                    fade-in
                    slide-in-from-top-1
                    duration-150
                  "
                >

                  {/* 🇫🇷 FRENCH */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('fr')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === 'fr'
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="text-base">
                      🇫🇷
                    </span>

                    <span className="font-medium">
                      Français
                    </span>

                    {language === 'fr' && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 🇬🇧 ENGLISH */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('en')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === 'en'
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="text-base">
                      🇬🇧
                    </span>

                    <span className="font-medium">
                      English
                    </span>

                    {language === 'en' && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 🇩🇪 GERMAN */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('de')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === 'de'
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="text-base">
                      🇩🇪
                    </span>

                    <span className="font-medium">
                      Deutsch
                    </span>

                    {language === 'de' && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 🇮🇹 ITALIAN */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('it')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === 'it'
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="text-base">
                      🇮🇹
                    </span>

                    <span className="font-medium">
                      Italiano
                    </span>

                    {language === 'it' && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                </div>
              )}

            </div>

            {/* =================================================
                🌐 GOOGLE TRANSLATE ENGINE
                ================================================* */}

            <div
              id="google_translate_element"
              className="absolute left-[-9999px] top-[-9999px] w-[1px] h-[1px] overflow-hidden opacity-0"
              aria-hidden="true"
            />

            {/* =================================================
                👤 USER
                ================================================= */}

            {token ? (

              <div className="flex items-center gap-2">

                <Link
                  to="/profil"
                  className="flex items-center p-1 rounded-full border border-gray-200 dark:border-indigo-500/60 bg-gray-50 dark:bg-slate-900/60 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm"
                  title="Mon Profil"
                >

                  <img
                    src={
                      avatar ||
                      'https://via.placeholder.com/150'
                    }
                    alt="Profil"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500 dark:ring-indigo-400"
                  />

                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-red-500/50 transition-all shadow-sm"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>

            ) : (

              <Link
                to="/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/30 hover:opacity-95 transition-all"
              >
                Connexion
              </Link>

            )}

          </div>

        </div>

      </div>

      {/* =======================================================
          📱 MOBILE SUB-NAVBAR
          ======================================================= */}

      <div className="md:hidden border-t border-gray-200 dark:border-indigo-950/40 bg-white dark:bg-[#0B0F19] px-2 py-2 flex items-center justify-around text-xs font-bold gap-1 shadow-sm">

        <NavLink
          to="/annuaire"
          className={({ isActive }) =>
            `py-1.5 px-3 rounded-lg transition-all ${isActive
              ? 'bg-indigo-50 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/50 shadow-sm'
              : 'text-gray-600 dark:text-slate-300'
            }`
          }
        >
          Annuaire
        </NavLink>

        <NavLink
          to="/blog"
          onClick={clearNotifications}
          className={({ isActive }) =>
            `py-1.5 px-3 rounded-lg relative transition-all ${isActive
              ? 'bg-indigo-50 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/50 shadow-sm'
              : 'text-gray-600 dark:text-slate-300'
            }`
          }
        >
          Blog

          {hasNewNotification && (
            <span className="absolute top-1.5 right-0.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          )}

        </NavLink>

        <NavLink
          to="/showcase"
          className={({ isActive }) =>
            `py-1.5 px-3 rounded-lg transition-all ${isActive
              ? 'bg-indigo-50 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/50 shadow-sm'
              : 'text-gray-600 dark:text-slate-300'
            }`
          }
        >
          Showcase
        </NavLink>

        {token &&
          userRole === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `py-1.5 px-2.5 rounded-lg font-black border ${isActive
                  ? 'bg-indigo-600/40 text-indigo-950 dark:text-indigo-100 border-indigo-400'
                  : 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30'
                }`
              }
            >
              Admin
            </NavLink>
          )}

      </div>

    </nav>
  );
};

export default Navbar;