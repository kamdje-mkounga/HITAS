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

  // 🌐 Language selector
  const [language, setLanguage] = useState(
    localStorage.getItem('hitasLanguage') || 'fr'
  );
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
      // Google's top banner container
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

      // Google's banner iframe
      const iframe = document.querySelector(
        'iframe.goog-te-banner-frame'
      );

      if (iframe) {
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        iframe.style.height = '0';
        iframe.style.width = '0';
      }

      // Google moves the page down when the banner appears.
      document.documentElement.style.marginTop = '0';
      document.body.style.marginTop = '0';
      document.body.style.top = '0';
    };

    // Run immediately
    hideGoogleBanner();

    // Run again after Google loads
    const firstTimer = setTimeout(() => {
      hideGoogleBanner();
    }, 500);

    const secondTimer = setTimeout(() => {
      hideGoogleBanner();
    }, 1500);

    /*
      Google dynamically injects the banner.
      MutationObserver makes sure it stays hidden.
    */
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
     🌐 DETECT CURRENT LANGUAGE
     ========================================================= */

     useEffect(() => {
      const savedLanguage =
        localStorage.getItem('hitasLanguage');
    
      if (savedLanguage === 'en' || savedLanguage === 'de' || savedLanguage === 'fr' || savedLanguage==='it') {
        setLanguage(savedLanguage);
      } else {
        setLanguage('fr');
        localStorage.setItem('hitasLanguage', 'fr');
      }
    }, []);

  /* =========================================================
     🌐 CHANGE LANGUAGE
     ========================================================= */

     const changeLanguage = (lang) => {
      // Save selected language for the Navbar
      localStorage.setItem('hitasLanguage', lang);
    
      // Update Navbar immediately
      setLanguage(lang);
      setLanguageOpen(false);
    
      if (lang === 'fr') {
        // Remove Google Translate cookies
        document.cookie =
          'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
        document.cookie =
          'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
          window.location.hostname;
    
        // Reload original French page
        window.location.reload();
    
        return;
      }
    
      // Set Google Translate language
      document.cookie = `googtrans=/fr/${lang}; path=/;`;
    
      // Reload so Google Translate applies the translation
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
    de: 'DE'
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-indigo-950/60 bg-[#0B0F19]/90 backdrop-blur-xl shadow-lg shadow-indigo-950/30">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 gap-2">

          {/* =====================================================
              🚀 LOGO
              ===================================================== */}

          <div className="flex-shrink-0 flex items-center">

            <Link
              to="/"
              className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-400 bg-clip-text text-transparent hover:opacity-100 transition-opacity drop-shadow-[0_0_20px_rgba(129,140,248,0.6)]"
            >
              HITAS{' '}

              <span className="font-light text-slate-200">
                Connect
              </span>

              <span className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.9)]">
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
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`
              }
            >
              Annuaire
            </NavLink>

            <NavLink
              to="/blog"
              onClick={clearNotifications}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
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
                `px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
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
                    `px-4 py-2 rounded-xl text-sm font-black border transition-all ${
                      isActive
                        ? 'bg-indigo-600/40 text-indigo-100 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                        : 'text-indigo-300 border-indigo-500/40'
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
                🌐 MODERN LANGUAGE SELECTOR
                ================================================= */}

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
                  border border-indigo-500/30
                  bg-slate-900/70
                  backdrop-blur-md
                  text-slate-200
                  hover:border-indigo-400/60
                  hover:bg-indigo-500/10
                  transition-all duration-200
                  shadow-[0_0_12px_rgba(99,102,241,0.12)]
                "
                aria-label="Choose language"
                aria-expanded={languageOpen}
              >

                <Globe2 className="w-4 h-4 text-indigo-300 group-hover:text-indigo-200 transition-colors" />

                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  {languageLabels[language]}
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    languageOpen
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
                    border border-indigo-500/30
                    bg-[#0B0F19]/95
                    backdrop-blur-xl
                    shadow-[0_15px_45px_rgba(0,0,0,0.55)]
                    z-[100]
                    animate-in
                    fade-in
                    slide-in-from-top-1
                    duration-150
                  "
                >

                  {/* 🇫🇷 French */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('fr')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      language === 'fr'
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="text-base">
                      🇫🇷
                    </span>

                    <span className="font-medium">
                      Français
                    </span>

                    {language === 'fr' && (
                      <span className="ml-auto text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 🇬🇧 English */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('en')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="text-base">
                      🇬🇧
                    </span>

                    <span className="font-medium">
                      English
                    </span>

                    {language === 'en' && (
                      <span className="ml-auto text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* 🇩🇪 German */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('de')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      language === 'de'
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="text-base">
                      🇩🇪
                    </span>

                    <span className="font-medium">
                      Deutsch
                    </span>

                    {language === 'de' && (
                      <span className="ml-auto text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* IT ITALIA */}

                  <button
                    type="button"
                    onClick={() =>
                      changeLanguage('en')
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-500/15 text-indigo-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="text-base">
                      IT
                    </span>

                    <span className="font-medium">
                      ITALIA
                    </span>

                    {language === 'it' && (
                      <span className="ml-auto text-indigo-400">
                        ✓
                      </span>
                    )}
                  </button>


                </div>
              )}

            </div>

            {/* =================================================
                🌐 GOOGLE TRANSLATE ENGINE
                Hidden visually but still functional
                ================================================= */}

            <div
              id="google_translate_element"
              className="absolute left-[-9999px] top-[-9999px] w-[1px] h-[1px] overflow-hidden opacity-0"
              aria-hidden="true"
            />

            {/* =================================================
                🌙 THEME SWITCH
                ================================================= */}

            <button
              onClick={toggleTheme}
              className="relative w-10 sm:w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer border border-indigo-500/40 bg-slate-900/90 shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-colors"
              aria-label="Toggle Theme"
            >

              <div
                className="w-5 h-5 rounded-full shadow-md flex items-center justify-center transform transition-transform duration-300 ease-in-out"
                style={{
                  transform:
                    theme === 'light'
                      ? 'translateX(20px)'
                      : 'translateX(0px)',

                  backgroundColor:
                    theme === 'light'
                      ? '#f59e0b'
                      : '#312e81'
                }}
              >

                {theme === 'dark' ? (
                  <Moon className="w-3 h-3 text-indigo-200" />
                ) : (
                  <Sun className="w-3 h-3 text-white" />
                )}

              </div>

            </button>

            {/* =================================================
                👤 USER
                ================================================= */}

            {token ? (

              <div className="flex items-center gap-2">

                <Link
                  to="/profil"
                  className="flex items-center p-1 rounded-full border border-indigo-500/60 bg-slate-900/60 hover:border-indigo-400 transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  title="Mon Profil"
                >

                  <img
                    src={
                      avatar ||
                      'https://via.placeholder.com/150'
                    }
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

              <Link
                to="/login"
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all"
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

      <div className="md:hidden border-t border-indigo-950/40 bg-[#0B0F19]/95 px-2 py-2 flex items-center justify-around text-xs font-bold gap-1">

        <NavLink
          to="/annuaire"
          className={({ isActive }) =>
            `py-1.5 px-3 rounded-lg transition-all ${
              isActive
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-slate-300'
            }`
          }
        >
          Annuaire
        </NavLink>

        <NavLink
          to="/blog"
          onClick={clearNotifications}
          className={({ isActive }) =>
            `py-1.5 px-3 rounded-lg relative transition-all ${
              isActive
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-slate-300'
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
            `py-1.5 px-3 rounded-lg transition-all ${
              isActive
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'text-slate-300'
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
                `py-1.5 px-2.5 rounded-lg font-black border ${
                  isActive
                    ? 'bg-indigo-600/40 text-indigo-100 border-indigo-400'
                    : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'
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